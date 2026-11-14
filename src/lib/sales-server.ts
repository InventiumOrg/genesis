/** Sale reads for Server Components, straight from Postgres. */

import { getSale, listSales } from '@/server/sales';

import { uiPagination, type UiPagination } from './pagination';
import { Sale, SaleFilters, SALES_PER_PAGE, mapBackendSale } from './sales';

export async function fetchSalesServer(
  filters: SaleFilters = {},
): Promise<{ sales: Sale[]; pagination: UiPagination }> {
  const { search = '', page = 1, limit = SALES_PER_PAGE } = filters;
  const { items, pagination } = await listSales({ search, page, limit });
  return {
    sales: items.map((s) => mapBackendSale(s as unknown as Record<string, unknown>)),
    pagination: uiPagination(pagination),
  };
}

export async function fetchSaleServer(id: number): Promise<Sale> {
  const found = await getSale(id);
  if (!found) throw new Error(`Sale ${id} not found`);
  return mapBackendSale(found as unknown as Record<string, unknown>);
}
