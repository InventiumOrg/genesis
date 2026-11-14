export type TransactionType = 'IMPORT' | 'EXPORT';

/**
 * Mirrors TransactionRecordResponse from inventory-transaction-service
 * (GET /api/v1/transactions/:inventoryId).
 */
export interface InventoryTransaction {
  id: string;
  type: TransactionType;
  source: string;
  destination: string;
  createdAt: string;
  inventoryId: string;
  inventoryMeasure: string;
  inventoryCategory: string;
  inventoryUnit: string;
  quantity: number;
  status: string;
}

export interface TransactionListFilters {
  inventoryId: string;
  /** Optional client-side filter; the backend returns all types for an item. */
  type?: TransactionType;
  limit?: number;
  cursor?: string;
}

export interface TransactionListResult {
  transactions: InventoryTransaction[];
  count: number;
  nextCursor?: string;
}

/** Backend default page size (max 100). */
export const TRANSACTIONS_PER_PAGE = 20;

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
  }
  return undefined;
}

export function mapBackendTransaction(
  raw: Record<string, unknown>
): InventoryTransaction {
  const typeRaw = String(pick(raw, 'type', 'Type') ?? 'IMPORT').toUpperCase();
  const type: TransactionType = typeRaw === 'EXPORT' ? 'EXPORT' : 'IMPORT';

  const qtyRaw = pick(raw, 'quantity', 'Quantity');
  const created = pick(raw, 'createdAt', 'CreatedAt');

  return {
    id: String(pick(raw, 'id', 'Id', 'ID') ?? ''),
    type,
    source: String(pick(raw, 'source', 'Source') ?? ''),
    destination: String(pick(raw, 'destination', 'Destination') ?? ''),
    createdAt:
      typeof created === 'string' ? created : new Date().toISOString(),
    inventoryId: String(pick(raw, 'inventoryId', 'InventoryId') ?? ''),
    inventoryMeasure: String(pick(raw, 'inventoryMeasure', 'InventoryMeasure') ?? ''),
    inventoryCategory: String(pick(raw, 'inventoryCategory', 'InventoryCategory') ?? ''),
    inventoryUnit: String(pick(raw, 'inventoryUnit', 'InventoryUnit') ?? ''),
    quantity: typeof qtyRaw === 'number' ? qtyRaw : Number(qtyRaw ?? 0),
    status: String(pick(raw, 'status', 'Status') ?? ''),
  };
}

/**
 * Parses the `{ data, count, nextCursor }` list envelope. Falls back to a bare
 * array if the backend returns one. When `type` is provided, records are
 * filtered client-side (the endpoint itself is not type-aware).
 */
export function parseTransactionListResponse(
  response: unknown,
  type?: TransactionType
): TransactionListResult {
  let rawList: unknown[] = [];
  let nextCursor: string | undefined;

  if (Array.isArray(response)) {
    rawList = response;
  } else if (response && typeof response === 'object') {
    const r = response as Record<string, any>;
    if (Array.isArray(r.data)) rawList = r.data;
    else if (Array.isArray(r.items)) rawList = r.items;
    else if (Array.isArray(r.transactions)) rawList = r.transactions;
    if (typeof r.nextCursor === 'string' && r.nextCursor) nextCursor = r.nextCursor;
  }

  let transactions = rawList.map((item) =>
    mapBackendTransaction(item as Record<string, unknown>)
  );

  if (type) {
    transactions = transactions.filter((t) => t.type === type);
  }

  return { transactions, count: transactions.length, nextCursor };
}

export const TRANSACTION_STATUS_COMPLETED = 'Completed';

/** Completed transactions are immutable; everything else can be edited. */
export function isTransactionEditable(status: string): boolean {
  return status.trim().toLowerCase() !== TRANSACTION_STATUS_COMPLETED.toLowerCase();
}

export function transactionTypeLabel(type: TransactionType): string {
  return type === 'IMPORT' ? 'Import' : 'Export';
}

export function transactionStatusColor(
  status: string
): 'success' | 'warning' | 'light' {
  const s = status.toLowerCase();
  if (s === 'completed') return 'success';
  if (s === 'in progress') return 'warning';
  return 'light';
}

export function formatTransactionDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
