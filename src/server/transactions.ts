/**
 * Inventory import and export.
 *
 * Unlike an order, a transaction moves real stock, so each one writes its
 * movement in the same transaction that records it: an import adds, an export
 * takes away. The list is cursor-paginated by id, which is what the existing
 * transaction screens expect.
 */

import { and, desc, eq, lt, sql } from 'drizzle-orm';

import { db } from '@/db';
import { inventoryItems, inventoryTransactions, stockMovements } from '@/db/schema';

import { q } from './shared';

export type BackendTransactionRow = {
  id: string;
  type: 'IMPORT' | 'EXPORT';
  source: string;
  destination: string;
  createdAt: string;
  inventoryId: string;
  inventoryMeasure: string;
  inventoryCategory: string;
  inventoryUnit: string;
  quantity: number;
  status: string;
};

export type TransactionInput = {
  type: 'IMPORT' | 'EXPORT';
  inventoryId: number | string;
  quantity: number;
  source?: string;
  destination?: string;
  status?: string;
};

const selection = {
  id: inventoryTransactions.id,
  type: inventoryTransactions.type,
  source: inventoryTransactions.source,
  destination: inventoryTransactions.destination,
  createdAt: inventoryTransactions.createdAt,
  inventoryId: inventoryTransactions.inventoryItemId,
  quantity: inventoryTransactions.quantity,
  status: inventoryTransactions.status,
  inventoryMeasure: inventoryItems.measure,
  inventoryCategory: inventoryItems.category,
  inventoryUnit: inventoryItems.unit,
};

function row(r: Record<string, unknown>): BackendTransactionRow {
  return {
    id: String(r.id),
    type: String(r.type).toUpperCase() === 'EXPORT' ? 'EXPORT' : 'IMPORT',
    source: String(r.source ?? ''),
    destination: String(r.destination ?? ''),
    createdAt: (r.createdAt instanceof Date ? r.createdAt : new Date()).toISOString(),
    inventoryId: String(r.inventoryId ?? ''),
    inventoryMeasure: String(r.inventoryMeasure ?? ''),
    inventoryCategory: String(r.inventoryCategory ?? ''),
    inventoryUnit: String(r.inventoryUnit ?? ''),
    quantity: q(Number(r.quantity ?? 0)),
    status: String(r.status ?? ''),
  };
}

export async function listTransactions(params: {
  inventoryId: number;
  type?: 'IMPORT' | 'EXPORT';
  limit?: number;
  cursor?: string;
}): Promise<{ transactions: BackendTransactionRow[]; count: number; nextCursor?: string }> {
  const limit = Math.min(Math.max(1, params.limit ?? 20), 100);
  const cursorId = params.cursor ? Number(params.cursor) : undefined;

  const where = and(
    eq(inventoryTransactions.inventoryItemId, params.inventoryId),
    params.type ? eq(inventoryTransactions.type, params.type) : undefined,
    cursorId ? lt(inventoryTransactions.id, cursorId) : undefined,
  );

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(inventoryTransactions)
    .where(
      and(
        eq(inventoryTransactions.inventoryItemId, params.inventoryId),
        params.type ? eq(inventoryTransactions.type, params.type) : undefined,
      ),
    );

  const rows = await db
    .select(selection)
    .from(inventoryTransactions)
    .leftJoin(inventoryItems, eq(inventoryTransactions.inventoryItemId, inventoryItems.id))
    .where(where)
    .orderBy(desc(inventoryTransactions.id))
    .limit(limit + 1);

  const page = rows.slice(0, limit).map(row);
  const nextCursor = rows.length > limit ? String(rows[limit - 1].id) : undefined;

  return { transactions: page, count: Number(count), nextCursor };
}

export async function createTransaction(input: TransactionInput): Promise<BackendTransactionRow> {
  const inventoryItemId = Number(input.inventoryId);
  const type = String(input.type).toUpperCase() === 'EXPORT' ? 'EXPORT' : 'IMPORT';
  const quantity = Math.abs(Number(input.quantity));

  const id = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(inventoryTransactions)
      .values({
        type,
        inventoryItemId,
        source: input.source ?? '',
        destination: input.destination ?? '',
        quantity,
        status: input.status ?? 'COMPLETED',
      })
      .returning();

    await tx.insert(stockMovements).values({
      inventoryItemId,
      delta: q(type === 'IMPORT' ? quantity : -quantity),
      reason: type.toLowerCase(),
      refType: 'transaction',
      refId: created.id,
      note: `${type === 'IMPORT' ? 'Imported from' : 'Exported to'} ${
        (type === 'IMPORT' ? input.source : input.destination) || 'unspecified'
      }`,
      occurredAt: created.createdAt,
    });

    return created.id;
  });

  const [found] = await db
    .select(selection)
    .from(inventoryTransactions)
    .leftJoin(inventoryItems, eq(inventoryTransactions.inventoryItemId, inventoryItems.id))
    .where(eq(inventoryTransactions.id, id));

  return row(found);
}

export async function getTransaction(id: number): Promise<BackendTransactionRow | null> {
  const [found] = await db
    .select(selection)
    .from(inventoryTransactions)
    .leftJoin(inventoryItems, eq(inventoryTransactions.inventoryItemId, inventoryItems.id))
    .where(eq(inventoryTransactions.id, id));
  return found ? row(found) : null;
}
