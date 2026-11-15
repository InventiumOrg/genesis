import { useApiClient } from './api-client';
import {
  InventoryTransaction,
  TransactionListFilters,
  TransactionListResult,
  TRANSACTIONS_PER_PAGE,
  mapBackendTransaction,
  parseTransactionListResponse,
} from './transactions';

/** Editable fields for a transaction update (full-replace semantics). */
export interface TransactionUpdateInput {
  type: string;
  source: string;
  destination: string;
  inventoryId: string;
  inventoryMeasure: string;
  inventoryCategory: string;
  inventoryUnit: string;
  quantity: number;
  status?: string;
}

/** Fields for creating a transaction (status is set server-side to "In Progress"). */
export interface TransactionCreateInput {
  type: string;
  source: string;
  destination: string;
  inventoryId: string;
  inventoryMeasure: string;
  inventoryCategory: string;
  inventoryUnit: string;
  quantity: number;
}

export function useTransactionsClient() {
  const { apiRequest } = useApiClient('transactions');

  const fetchTransactions = async (
    filters: TransactionListFilters
  ): Promise<TransactionListResult> => {
    const { inventoryId, type, limit = TRANSACTIONS_PER_PAGE, cursor } = filters;
    if (!inventoryId) return { transactions: [], count: 0 };

    const params = new URLSearchParams();
    if (limit !== TRANSACTIONS_PER_PAGE) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);
    const qs = params.toString();

    const response = await apiRequest<any>(
      `/${encodeURIComponent(inventoryId)}${qs ? `?${qs}` : ''}`
    );
    return parseTransactionListResponse(response, type);
  };

  /**
   * Updates a transaction. PUT /api/v1/transactions/:inventoryId/:id
   * Completed records are read-only and must not be edited.
   */
  const updateTransaction = async (
    inventoryId: string,
    id: string,
    input: TransactionUpdateInput
  ): Promise<InventoryTransaction> => {
    const response = await apiRequest<any>(
      `/${encodeURIComponent(inventoryId)}/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(input),
      }
    );
    if (response?.data) {
      return mapBackendTransaction(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('id' in response || 'Id' in response)) {
      return mapBackendTransaction(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  /**
   * Creates a transaction. POST /api/v1/transactions/create
   * The backend assigns the id and sets status to "In Progress".
   */
  const createTransaction = async (
    input: TransactionCreateInput
  ): Promise<InventoryTransaction> => {
    const response = await apiRequest<any>('/create', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    // POST returns the record directly (not wrapped in { data }).
    if (response?.data && typeof response.data === 'object') {
      return mapBackendTransaction(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('id' in response || 'Id' in response)) {
      return mapBackendTransaction(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  return { fetchTransactions, updateTransaction, createTransaction };
}
