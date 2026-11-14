/**
 * Orders.
 *
 * An order records what a point of sale asked for. It does not move stock:
 * only a recorded sale, a transfer, logged waste or an import/export does.
 * Keeping orders out of the ledger means on-hand never double-counts an
 * order that later became a sale.
 */

import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import { orders, pointsOfSale, recipes } from '@/db/schema';

import { paginate, type Pagination } from './shared';

export type BackendOrderRow = {
  ID: number;
  PosID: number;
  RecipeID: number;
  Price: number;
  CreatedAt: string;
};

export type OrderInput = { posId: number; recipeId: number; price?: number };

const selection = {
  ID: orders.id,
  PosID: orders.posId,
  RecipeID: orders.recipeId,
  Price: orders.price,
  CreatedAt: orders.createdAt,
};

function row(r: Record<string, unknown>): BackendOrderRow {
  return {
    ID: Number(r.ID),
    PosID: Number(r.PosID),
    RecipeID: Number(r.RecipeID),
    Price: Number(r.Price ?? 0),
    CreatedAt: (r.CreatedAt instanceof Date ? r.CreatedAt : new Date()).toISOString(),
  };
}

export async function listOrders(
  filters: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: BackendOrderRow[]; pagination: Pagination }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const needle = filters.search?.trim();
  const where = needle
    ? sql`exists (
        select 1 from ${recipes} r where r.id = ${orders.recipeId} and r.name ilike ${'%' + needle + '%'}
      ) or exists (
        select 1 from ${pointsOfSale} p where p.id = ${orders.posId} and (p.name ilike ${'%' + needle + '%'} or p.location ilike ${'%' + needle + '%'})
      )`
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where);

  const rows = await db
    .select(selection)
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items: rows.map(row), pagination: paginate(Number(count), page, limit) };
}

export async function getOrder(id: number): Promise<BackendOrderRow | null> {
  const [found] = await db.select(selection).from(orders).where(eq(orders.id, id));
  return found ? row(found) : null;
}

export async function createOrder(input: OrderInput): Promise<BackendOrderRow> {
  const [created] = await db
    .insert(orders)
    .values({
      posId: Number(input.posId),
      recipeId: Number(input.recipeId),
      price: Math.round(Number(input.price ?? 0)),
    })
    .returning();
  return row({ ID: created.id, PosID: created.posId, RecipeID: created.recipeId, Price: created.price, CreatedAt: created.createdAt });
}

export async function updateOrder(id: number, input: Partial<OrderInput>): Promise<BackendOrderRow | null> {
  const [existing] = await db.select().from(orders).where(eq(orders.id, id));
  if (!existing) return null;
  await db
    .update(orders)
    .set({
      posId: input.posId !== undefined ? Number(input.posId) : existing.posId,
      recipeId: input.recipeId !== undefined ? Number(input.recipeId) : existing.recipeId,
      price: input.price !== undefined ? Math.round(Number(input.price)) : existing.price,
    })
    .where(eq(orders.id, id));
  return getOrder(id);
}

export async function deleteOrder(id: number): Promise<boolean> {
  const gone = await db.delete(orders).where(eq(orders.id, id)).returning({ id: orders.id });
  return gone.length > 0;
}
