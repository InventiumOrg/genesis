/** Order reads for Server Components, straight from Postgres. */

import { getOrder, listOrders } from '@/server/orders';

import { Order, OrderFilters, ORDERS_PER_PAGE, mapBackendOrder } from './orders';
import { uiPagination, type UiPagination } from './pagination';

export async function fetchOrdersServer(
  filters: OrderFilters = {},
): Promise<{ orders: Order[]; pagination: UiPagination }> {
  const { search = '', page = 1, limit = ORDERS_PER_PAGE } = filters;
  const { items, pagination } = await listOrders({ search, page, limit });
  return {
    orders: items.map((o) => mapBackendOrder(o as unknown as Record<string, unknown>)),
    pagination: uiPagination(pagination),
  };
}

export async function fetchOrderServer(id: number): Promise<Order> {
  const found = await getOrder(id);
  if (!found) throw new Error(`Order ${id} not found`);
  return mapBackendOrder(found as unknown as Record<string, unknown>);
}
