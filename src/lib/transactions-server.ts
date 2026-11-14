/** Import/export reads for Server Components, straight from Postgres. */

import { getTransaction, listTransactions } from '@/server/transactions';

import {
  InventoryTransaction,
  TransactionListFilters,
  TransactionListResult,
  TRANSACTIONS_PER_PAGE,
  mapBackendTransaction,
} from './transactions';

export async function fetchTransactionsServer(
  filters: TransactionListFilters,
): Promise<TransactionListResult> {
  const inventoryId = Number.parseInt(String(filters.inventoryId), 10);
  if (!Number.isFinite(inventoryId)) {
    return { transactions: [], count: 0 };
  }

  const { transactions, count, nextCursor } = await listTransactions({
    inventoryId,
    type: filters.type,
    limit: filters.limit ?? TRANSACTIONS_PER_PAGE,
    cursor: filters.cursor,
  });

  return {
    transactions: transactions.map((t) =>
      mapBackendTransaction(t as unknown as Record<string, unknown>),
    ),
    count,
    nextCursor,
  };
}

export async function fetchTransactionServer(
  inventoryId: string,
  id: string,
): Promise<InventoryTransaction> {
  const found = await getTransaction(Number.parseInt(id, 10));
  if (!found) throw new Error(`Transaction ${id} not found`);
  return mapBackendTransaction(found as unknown as Record<string, unknown>);
}
