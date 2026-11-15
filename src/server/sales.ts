/**
 * Sales — and the drawdown that is the whole product.
 *
 * Recording a sale writes the sale row and, in the same transaction, one
 * negative movement per recipe ingredient that maps to a stock item. Nobody
 * types the grams: the recipe says what a cup consumes, the quantity sold
 * multiplies it, and the ledger carries the result. A sale is never recorded
 * without its consequences, which is why this is one transaction.
 */

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import { pointsOfSale, recipeIngredients, recipes, sales, stockMovements } from '@/db/schema';

import { paginate, q, type Pagination } from './shared';

export type BackendSaleRow = {
  ID: number;
  PosID: number;
  RecipeID: number;
  Price: number;
  Quantity: number;
  CreatedAt: string;
};

export type SaleInput = {
  posId: number;
  recipeId: number;
  price?: number;
  quantity?: number;
};

const selection = {
  ID: sales.id,
  PosID: sales.posId,
  RecipeID: sales.recipeId,
  Price: sales.price,
  Quantity: sales.quantity,
  CreatedAt: sales.createdAt,
};

function row(r: Record<string, unknown>): BackendSaleRow {
  return {
    ID: Number(r.ID),
    PosID: Number(r.PosID),
    RecipeID: Number(r.RecipeID),
    Price: Number(r.Price ?? 0),
    Quantity: Number(r.Quantity ?? 0),
    CreatedAt: (r.CreatedAt instanceof Date ? r.CreatedAt : new Date()).toISOString(),
  };
}

export async function listSales(
  filters: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: BackendSaleRow[]; pagination: Pagination }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);

  // Search reaches through to the recipe and the point of sale, which is what
  // the operator means by "find the cà phê sữa đá sales at Thảo Điền".
  const needle = filters.search?.trim();
  const where = needle
    ? sql`exists (
        select 1 from ${recipes} r where r.id = ${sales.recipeId} and r.name ilike ${'%' + needle + '%'}
      ) or exists (
        select 1 from ${pointsOfSale} p where p.id = ${sales.posId} and (p.name ilike ${'%' + needle + '%'} or p.location ilike ${'%' + needle + '%'})
      )`
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sales)
    .where(where);

  const rows = await db
    .select(selection)
    .from(sales)
    .where(where)
    .orderBy(desc(sales.createdAt), desc(sales.id))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items: rows.map(row), pagination: paginate(Number(count), page, limit) };
}

export async function getSale(id: number): Promise<BackendSaleRow | null> {
  const [found] = await db.select(selection).from(sales).where(eq(sales.id, id));
  return found ? row(found) : null;
}

export async function createSale(input: SaleInput): Promise<BackendSaleRow> {
  const quantity = Math.max(1, Math.round(Number(input.quantity ?? 1)));

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(sales)
      .values({
        posId: Number(input.posId),
        recipeId: Number(input.recipeId),
        price: Math.round(Number(input.price ?? 0)),
        quantity,
      })
      .returning();

    const lines = await tx
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, created.recipeId));

    for (const line of lines) {
      // An ingredient the stockroom does not carry is recorded on the recipe
      // but draws nothing; it is not an error and it is not invented stock.
      if (!line.inventoryItemId || !line.quantity) continue;
      await tx.insert(stockMovements).values({
        inventoryItemId: line.inventoryItemId,
        delta: q(-line.quantity * quantity),
        reason: 'sale',
        refType: 'sale',
        refId: created.id,
        note: `Drawn by sale #${created.id}`,
        occurredAt: created.createdAt,
      });
    }

    return row({ ...created, ID: created.id, PosID: created.posId, RecipeID: created.recipeId, Price: created.price, Quantity: created.quantity, CreatedAt: created.createdAt });
  });
}

export async function updateSale(id: number, input: Partial<SaleInput>): Promise<BackendSaleRow | null> {
  const [existing] = await db.select().from(sales).where(eq(sales.id, id));
  if (!existing) return null;

  return db.transaction(async (tx) => {
    const quantity =
      input.quantity !== undefined ? Math.max(1, Math.round(Number(input.quantity))) : existing.quantity;
    const recipeId = input.recipeId !== undefined ? Number(input.recipeId) : existing.recipeId;

    await tx
      .update(sales)
      .set({
        posId: input.posId !== undefined ? Number(input.posId) : existing.posId,
        recipeId,
        price: input.price !== undefined ? Math.round(Number(input.price)) : existing.price,
        quantity,
      })
      .where(eq(sales.id, id));

    // The old drawdown is reversed and re-drawn rather than edited, so the
    // ledger keeps both facts: what was taken, and what corrected it.
    if (quantity !== existing.quantity || recipeId !== existing.recipeId) {
      const previous = await tx
        .select()
        .from(stockMovements)
        .where(sql`${stockMovements.refType} = 'sale' and ${stockMovements.refId} = ${id}`);

      for (const p of previous) {
        await tx.insert(stockMovements).values({
          inventoryItemId: p.inventoryItemId,
          delta: q(-p.delta),
          reason: 'adjustment',
          refType: 'sale',
          refId: id,
          note: `Reversal of sale #${id} before it was corrected`,
        });
      }

      const lines = await tx
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, recipeId));

      for (const line of lines) {
        if (!line.inventoryItemId || !line.quantity) continue;
        await tx.insert(stockMovements).values({
          inventoryItemId: line.inventoryItemId,
          delta: q(-line.quantity * quantity),
          reason: 'sale',
          refType: 'sale',
          refId: id,
          note: `Redrawn after sale #${id} was corrected`,
        });
      }
    }

    const [updated] = await tx.select(selection).from(sales).where(eq(sales.id, id));
    return updated ? row(updated) : null;
  });
}

export async function deleteSale(id: number): Promise<boolean> {
  return db.transaction(async (tx) => {
    const previous = await tx
      .select()
      .from(stockMovements)
      .where(sql`${stockMovements.refType} = 'sale' and ${stockMovements.refId} = ${id}`);

    for (const p of previous) {
      await tx.insert(stockMovements).values({
        inventoryItemId: p.inventoryItemId,
        delta: q(-p.delta),
        reason: 'adjustment',
        refType: 'sale',
        refId: id,
        note: `Returned to stock when sale #${id} was deleted`,
      });
    }

    const gone = await tx.delete(sales).where(eq(sales.id, id)).returning({ id: sales.id });
    return gone.length > 0;
  });
}

/** Midnight, `days - 1` days back, so a window of 14 includes today. */
function windowStart(days: number): Date {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (Math.max(1, days) - 1));
  return since;
}

/**
 * Revenue is `price × quantity` summed, never `price` alone.
 *
 * `price` on a sale row is the unit price, so a row for four cups holds the
 * price of one. Summing the column reports a quarter of the money for that
 * row, which is why the product is formed in SQL and not in a reducer.
 */
const revenueSum = sql<number>`coalesce(sum(${sales.price} * ${sales.quantity}), 0)::bigint`;
const unitsSum = sql<number>`coalesce(sum(${sales.quantity}), 0)::int`;

export async function revenueTotals(
  days = 14,
): Promise<{ revenue: number; units: number; sales: number; days: number }> {
  const [found] = await db
    .select({
      revenue: revenueSum,
      units: unitsSum,
      count: sql<number>`count(*)::int`,
    })
    .from(sales)
    .where(sql`${sales.createdAt} >= ${windowStart(days)}`);

  return {
    revenue: Number(found?.revenue ?? 0),
    units: Number(found?.units ?? 0),
    sales: Number(found?.count ?? 0),
    days,
  };
}

export type RevenueByPos = {
  posId: number;
  name: string;
  location: string;
  status: string;
  revenue: number;
  units: number;
  sales: number;
};

/**
 * Revenue per point of sale over the window, biggest earner first.
 *
 * Every point of sale is listed, including one that sold nothing: a terminal
 * at zero for a fortnight is the reading the owner most needs, and dropping it
 * for having no sales rows would hide exactly that.
 */
export async function revenueByPos(days = 14): Promise<RevenueByPos[]> {
  const since = windowStart(days);

  const rows = await db
    .select({
      posId: pointsOfSale.id,
      name: pointsOfSale.name,
      location: pointsOfSale.location,
      status: pointsOfSale.status,
      revenue: revenueSum,
      units: unitsSum,
      count: sql<number>`count(${sales.id})::int`,
    })
    .from(pointsOfSale)
    .leftJoin(sales, sql`${sales.posId} = ${pointsOfSale.id} and ${sales.createdAt} >= ${since}`)
    .groupBy(pointsOfSale.id, pointsOfSale.name, pointsOfSale.location, pointsOfSale.status)
    .orderBy(desc(revenueSum), pointsOfSale.name);

  return rows.map((r) => ({
    posId: Number(r.posId),
    name: String(r.name ?? ''),
    location: String(r.location ?? ''),
    status: String(r.status ?? ''),
    revenue: Number(r.revenue ?? 0),
    units: Number(r.units ?? 0),
    sales: Number(r.count ?? 0),
  }));
}

export type RevenueByRecipe = {
  recipeId: number;
  name: string;
  revenue: number;
  units: number;
  sales: number;
  cost: number;
};

/**
 * Revenue per recipe over the window, biggest earner first.
 *
 * `cost` is the recipe's own recorded cost per unit, carried through so the
 * screen can place takings beside it. It is not multiplied out into a margin
 * here: that would be this layer deciding what the number means.
 */
export async function revenueByRecipe(days = 14, limit = 10): Promise<RevenueByRecipe[]> {
  const rows = await db
    .select({
      recipeId: recipes.id,
      name: recipes.name,
      cost: recipes.cost,
      revenue: revenueSum,
      units: unitsSum,
      count: sql<number>`count(${sales.id})::int`,
    })
    .from(sales)
    .innerJoin(recipes, eq(recipes.id, sales.recipeId))
    .where(sql`${sales.createdAt} >= ${windowStart(days)}`)
    .groupBy(recipes.id, recipes.name, recipes.cost)
    .orderBy(desc(revenueSum), recipes.name)
    .limit(Math.max(1, limit));

  return rows.map((r) => ({
    recipeId: Number(r.recipeId),
    name: String(r.name ?? ''),
    revenue: Number(r.revenue ?? 0),
    units: Number(r.units ?? 0),
    sales: Number(r.count ?? 0),
    cost: Number(r.cost ?? 0),
  }));
}

/**
 * Revenue per day across the window, oldest first, with empty days present.
 *
 * A day with no sales is a real reading of zero and must occupy its slot, or
 * the trace closes the gap and draws a fortnight of trading as if it were
 * continuous.
 */
export async function revenueByDay(days = 14): Promise<{ t: string; v: number }[]> {
  const since = windowStart(days);

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${sales.createdAt}), 'YYYY-MM-DD')`,
      revenue: revenueSum,
    })
    .from(sales)
    .where(sql`${sales.createdAt} >= ${since}`)
    .groupBy(sql`date_trunc('day', ${sales.createdAt})`);

  const byDay = new Map(rows.map((r) => [String(r.day), Number(r.revenue ?? 0)]));

  const out: { t: string; v: number }[] = [];
  for (let i = 0; i < Math.max(1, days); i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    out.push({ t: key, v: byDay.get(key) ?? 0 });
  }
  return out;
}
