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
