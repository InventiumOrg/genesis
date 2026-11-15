/** Sale reads for Server Components, straight from Postgres. */

import {
  getSale,
  listSales,
  revenueByDay,
  revenueByPos,
  revenueByRecipe,
  revenueTotals,
  type RevenueByPos,
  type RevenueByRecipe,
} from '@/server/sales';

import { uiPagination, type UiPagination } from './pagination';
import { Sale, SaleFilters, SALES_PER_PAGE, mapBackendSale } from './sales';

export type { RevenueByPos, RevenueByRecipe };

/** Everything the revenue screen reads, in one call and one window. */
export async function fetchRevenueServer(days = 14): Promise<{
  days: number;
  revenue: number;
  units: number;
  sales: number;
  byDay: { t: string; v: number }[];
  byPos: RevenueByPos[];
  byRecipe: RevenueByRecipe[];
}> {
  // Independent reads over the same window; one slow group-by should not wait
  // on another, and none of them depends on another's result.
  const [totals, byDay, byPos, byRecipe] = await Promise.all([
    revenueTotals(days),
    revenueByDay(days),
    revenueByPos(days),
    revenueByRecipe(days),
  ]);

  return {
    days: totals.days,
    revenue: totals.revenue,
    units: totals.units,
    sales: totals.sales,
    byDay,
    byPos,
    byRecipe,
  };
}

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
