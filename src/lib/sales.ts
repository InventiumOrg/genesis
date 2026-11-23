import type { TracePoint } from "@/components/trace/EnvelopeTrace";

export interface Sale {
  id: number;
  posId: number;
  recipeId: number;
  price: number;
  quantity: number;
  createdAt: string;
}

export interface SaleFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const SALES_PER_PAGE = 10;

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
  }
  return undefined;
}

export function mapBackendSale(raw: Record<string, unknown>): Sale {
  const id = Number(pick(raw, 'ID', 'id') ?? 0);
  const priceRaw = pick(raw, 'Price', 'price', 'Total', 'total');
  const qtyRaw = pick(raw, 'Quantity', 'quantity', 'Qty', 'qty');
  const created = pick(raw, 'CreatedAt', 'createdAt', 'Created', 'created');

  return {
    id,
    posId: Number(pick(raw, 'PosID', 'posId') ?? 0),
    recipeId: Number(pick(raw, 'RecipeID', 'recipeId') ?? 0),
    price: typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0),
    quantity: typeof qtyRaw === 'number' ? qtyRaw : Number(qtyRaw ?? 0),
    createdAt:
      typeof created === 'string' ? created : new Date().toISOString(),
  };
}

export function saleToBackendPayload(s: Partial<Sale>): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  if (s.posId !== undefined) o.PosID = s.posId;
  if (s.recipeId !== undefined) o.RecipeID = s.recipeId;
  if (s.price !== undefined) o.Price = s.price;
  if (s.quantity !== undefined) o.Quantity = s.quantity;
  return o;
}

export function formatSaleDate(dateString: string) {
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

/**
 * Aggregate real sales into one revenue reading per day, oldest first.
 *
 * It lives here rather than in `DashboardBoard` because that board is a Client
 * Component and the dashboard page is a Server Component that calls this
 * directly. Exported across that boundary it is not a function at all, only a
 * client reference, and calling it fails at request time with "Attempted to
 * call dailyRevenue() from the server but dailyRevenue is on the client".
 *
 * The `TracePoint` import is type-only, so it is erased and crosses nothing.
 */
export function dailyRevenue(sales: Sale[], days = 14): TracePoint[] {
  const byDay = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const localKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    byDay.set(localKey(d), 0);
  }

  for (const sale of sales) {
    if (!sale.createdAt) continue;
    const when = new Date(sale.createdAt);
    if (Number.isNaN(when.getTime())) continue;
    const key = localKey(when);
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) || 0) + sale.price * (sale.quantity || 1));
    }
  }

  return Array.from(byDay.entries()).map(([t, v]) => ({ t, v }));
}
