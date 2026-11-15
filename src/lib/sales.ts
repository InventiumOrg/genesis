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

