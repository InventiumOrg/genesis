/**
 * Inventory: items and the quantity derived from their movements.
 *
 * Nothing here writes a stored quantity. A new item opens with a counted
 * movement; an edit that changes the quantity records the difference as an
 * adjustment, so the figure on screen always has a row behind it.
 */

import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import { inventoryItems, parLevels, stockMovements } from '@/db/schema';

import { paginate, q, STOCK_LOW_AT, STOCK_OK_AT, type Pagination } from './shared';

/**
 * On hand is the ledger summed. Expressed as a join plus a group-by rather
 * than a correlated subquery: `stock_movements` also has an `id`, so an
 * unqualified correlation silently matched the wrong column and every item
 * reported the grand total.
 */
const onHand = sql<number>`coalesce(sum(${stockMovements.delta}), 0)`;

export type BackendInventoryRow = {
  ID: number;
  Name: string;
  Unit: string;
  Quantity: number;
  Category: string;
  Measure: string;
  Location: string;
  CreatedAt: string;
};

export type InventoryListFilters = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

const selection = {
  ID: inventoryItems.id,
  Name: inventoryItems.name,
  Unit: inventoryItems.unit,
  Category: inventoryItems.category,
  Measure: inventoryItems.measure,
  Location: inventoryItems.location,
  CreatedAt: inventoryItems.createdAt,
  Quantity: onHand,
};

/** Status is a property of the summed ledger, so it filters in HAVING. */
function statusHaving(status?: string) {
  if (!status || status === 'All') return undefined;
  if (status === 'In Stock') return sql`${onHand} > ${STOCK_OK_AT}`;
  if (status === 'Low Stock')
    return sql`${onHand} > ${STOCK_LOW_AT} and ${onHand} <= ${STOCK_OK_AT}`;
  if (status === 'Out of Stock') return sql`${onHand} <= ${STOCK_LOW_AT}`;
  return undefined;
}

function searchCondition(search?: string) {
  if (!search?.trim()) return undefined;
  const needle = `%${search.trim()}%`;
  return or(
    ilike(inventoryItems.name, needle),
    ilike(inventoryItems.category, needle),
    ilike(inventoryItems.location, needle),
  );
}

function row(r: Record<string, unknown>): BackendInventoryRow {
  return {
    ID: Number(r.ID),
    Name: String(r.Name ?? ''),
    Unit: String(r.Unit ?? ''),
    Quantity: q(Number(r.Quantity ?? 0)),
    Category: String(r.Category ?? ''),
    Measure: String(r.Measure ?? ''),
    Location: String(r.Location ?? ''),
    CreatedAt: (r.CreatedAt instanceof Date ? r.CreatedAt : new Date()).toISOString(),
  };
}

export async function listInventory(
  filters: InventoryListFilters = {},
): Promise<{ items: BackendInventoryRow[]; pagination: Pagination }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 5);
  const where = searchCondition(filters.search);
  const having = statusHaving(filters.status);

  const matching = db
    .select({ id: inventoryItems.id })
    .from(inventoryItems)
    .leftJoin(stockMovements, eq(stockMovements.inventoryItemId, inventoryItems.id))
    .where(where)
    .groupBy(inventoryItems.id)
    .having(having)
    .as('matching');

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(matching);

  const rows = await db
    .select(selection)
    .from(inventoryItems)
    .leftJoin(stockMovements, eq(stockMovements.inventoryItemId, inventoryItems.id))
    .where(where)
    .groupBy(inventoryItems.id)
    .having(having)
    .orderBy(desc(inventoryItems.id))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items: rows.map(row), pagination: paginate(Number(count), page, limit) };
}

export async function getInventoryItem(id: number): Promise<BackendInventoryRow | null> {
  const [found] = await db
    .select(selection)
    .from(inventoryItems)
    .leftJoin(stockMovements, eq(stockMovements.inventoryItemId, inventoryItems.id))
    .where(eq(inventoryItems.id, id))
    .groupBy(inventoryItems.id);
  return found ? row(found) : null;
}

export type InventoryInput = {
  name: string;
  unit?: string;
  measure?: string;
  category?: string;
  location?: string;
  quantity?: number;
};

export async function createInventoryItem(input: InventoryInput): Promise<BackendInventoryRow> {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(inventoryItems)
      .values({
        name: input.name,
        unit: input.unit ?? '',
        measure: input.measure ?? '',
        category: input.category ?? '',
        location: input.location ?? '',
      })
      .returning();

    const opening = Number(input.quantity ?? 0);
    if (opening !== 0) {
      await tx.insert(stockMovements).values({
        inventoryItemId: created.id,
        delta: opening,
        reason: 'opening',
        note: 'Opening count recorded when the item was added',
      });
    }

    return {
      ID: created.id,
      Name: created.name,
      Unit: created.unit,
      Quantity: q(opening),
      Category: created.category,
      Measure: created.measure,
      Location: created.location,
      CreatedAt: created.createdAt.toISOString(),
    };
  });
}

export async function updateInventoryItem(
  id: number,
  input: Partial<InventoryInput>,
): Promise<BackendInventoryRow | null> {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    if (!existing) return null;

    await tx
      .update(inventoryItems)
      .set({
        name: input.name ?? existing.name,
        unit: input.unit ?? existing.unit,
        measure: input.measure ?? existing.measure,
        category: input.category ?? existing.category,
        location: input.location ?? existing.location,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id));

    // A quantity edit is a correction, not an overwrite: record the difference.
    if (input.quantity !== undefined) {
      const [{ onHand }] = await tx
        .select({ onHand: sql<number>`coalesce(sum(${stockMovements.delta}), 0)` })
        .from(stockMovements)
        .where(eq(stockMovements.inventoryItemId, id));
      const delta = q(Number(input.quantity) - Number(onHand ?? 0));
      if (delta !== 0) {
        await tx.insert(stockMovements).values({
          inventoryItemId: id,
          delta,
          reason: 'adjustment',
          note: 'Counted correction from the inventory edit screen',
        });
      }
    }

    const [updated] = await tx
      .select(selection)
      .from(inventoryItems)
      .leftJoin(stockMovements, eq(stockMovements.inventoryItemId, inventoryItems.id))
      .where(eq(inventoryItems.id, id))
      .groupBy(inventoryItems.id);
    return updated ? row(updated) : null;
  });
}

export async function deleteInventoryItem(id: number): Promise<boolean> {
  const deleted = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning({
    id: inventoryItems.id,
  });
  return deleted.length > 0;
}

/** The readings behind one item's trace, oldest first, as running on-hand. */
export async function inventoryHistory(
  id: number,
  limit = 60,
): Promise<{ t: string; v: number }[]> {
  const rows = await db
    .select({ delta: stockMovements.delta, at: stockMovements.occurredAt })
    .from(stockMovements)
    .where(eq(stockMovements.inventoryItemId, id))
    .orderBy(stockMovements.occurredAt)
    .limit(limit);

  let running = 0;
  return rows.map((r) => {
    running = q(running + Number(r.delta));
    return { t: r.at.toISOString(), v: running };
  });
}

/** The envelope the reading is judged against, or null when no par is set. */
export async function getPar(id: number): Promise<{ min: number; max: number } | null> {
  const [found] = await db.select().from(parLevels).where(eq(parLevels.inventoryItemId, id));
  return found ? { min: found.minQty, max: found.maxQty } : null;
}

/**
 * How many items sit in each stock state, counted once over the whole table.
 *
 * The state is a property of the summed ledger, so the sum happens in a
 * subquery and the counting happens over its result. Three `listInventory`
 * calls with a status filter would return the same numbers; this is one pass.
 */
export async function inventoryStatusCounts(): Promise<{
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}> {
  const perItem = db
    .select({ onHand: onHand.as('on_hand') })
    .from(inventoryItems)
    .leftJoin(stockMovements, eq(stockMovements.inventoryItemId, inventoryItems.id))
    .groupBy(inventoryItems.id)
    .as('per_item');

  const [found] = await db
    .select({
      total: sql<number>`count(*)::int`,
      inStock: sql<number>`count(*) filter (where ${perItem.onHand} > ${STOCK_OK_AT})::int`,
      lowStock: sql<number>`count(*) filter (where ${perItem.onHand} > ${STOCK_LOW_AT} and ${perItem.onHand} <= ${STOCK_OK_AT})::int`,
      outOfStock: sql<number>`count(*) filter (where ${perItem.onHand} <= ${STOCK_LOW_AT})::int`,
    })
    .from(perItem);

  return {
    total: Number(found?.total ?? 0),
    inStock: Number(found?.inStock ?? 0),
    lowStock: Number(found?.lowStock ?? 0),
    outOfStock: Number(found?.outOfStock ?? 0),
  };
}

export type LocationStock = {
  location: string;
  items: number;
  onHand: number;
  lowStock: number;
  outOfStock: number;
};

/**
 * Stock grouped by the warehouse the item records, worst first.
 *
 * "Multi-outlet by default": a stock question has a which-warehouse answer, and
 * the ordering puts the location with the most empty lines at the top, because
 * that is the one being asked about.
 */
export async function inventoryByLocation(): Promise<LocationStock[]> {
  const perItem = db
    .select({
      location: inventoryItems.location,
      onHand: onHand.as('on_hand'),
    })
    .from(inventoryItems)
    .leftJoin(stockMovements, eq(stockMovements.inventoryItemId, inventoryItems.id))
    .groupBy(inventoryItems.id, inventoryItems.location)
    .as('per_item');

  const rows = await db
    .select({
      location: perItem.location,
      items: sql<number>`count(*)::int`,
      onHand: sql<number>`coalesce(sum(${perItem.onHand}), 0)`,
      lowStock: sql<number>`count(*) filter (where ${perItem.onHand} > ${STOCK_LOW_AT} and ${perItem.onHand} <= ${STOCK_OK_AT})::int`,
      outOfStock: sql<number>`count(*) filter (where ${perItem.onHand} <= ${STOCK_LOW_AT})::int`,
    })
    .from(perItem)
    .groupBy(perItem.location)
    .orderBy(
      desc(sql`count(*) filter (where ${perItem.onHand} <= ${STOCK_LOW_AT})`),
      desc(sql`count(*)`),
    );

  return rows.map((r) => ({
    // An item with no warehouse recorded is still stock. It is named as
    // unplaced rather than dropped from the total.
    location: String(r.location ?? '').trim() || 'No warehouse recorded',
    items: Number(r.items ?? 0),
    onHand: q(Number(r.onHand ?? 0)),
    lowStock: Number(r.lowStock ?? 0),
    outOfStock: Number(r.outOfStock ?? 0),
  }));
}

export type MovementReason = {
  reason: string;
  events: number;
  added: number;
  removed: number;
  net: number;
};

/**
 * What actually moved stock over a window, grouped by why.
 *
 * This is the ledger's own account of itself and the one reading no other
 * screen offers: a sale drawing a recipe down, an import landing, waste
 * logged. `added` and `removed` are kept apart because a reason that both
 * gives and takes — an adjustment — says nothing useful as a single net
 * figure.
 */
export async function movementsByReason(days = 14): Promise<MovementReason[]> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (Math.max(1, days) - 1));

  const rows = await db
    .select({
      reason: stockMovements.reason,
      events: sql<number>`count(*)::int`,
      added: sql<number>`coalesce(sum(${stockMovements.delta}) filter (where ${stockMovements.delta} > 0), 0)`,
      removed: sql<number>`coalesce(sum(${stockMovements.delta}) filter (where ${stockMovements.delta} < 0), 0)`,
      net: sql<number>`coalesce(sum(${stockMovements.delta}), 0)`,
    })
    .from(stockMovements)
    .where(sql`${stockMovements.occurredAt} >= ${since}`)
    .groupBy(stockMovements.reason)
    .orderBy(desc(sql`count(*)`));

  return rows.map((r) => ({
    reason: String(r.reason ?? ''),
    events: Number(r.events ?? 0),
    added: q(Number(r.added ?? 0)),
    // Stored negative; reported as the size of the draw, which is how the
    // interface reads it ("382 taken out"), not as a negative number.
    removed: q(Math.abs(Number(r.removed ?? 0))),
    net: q(Number(r.net ?? 0)),
  }));
}
