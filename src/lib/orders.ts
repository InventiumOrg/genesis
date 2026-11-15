/** Matches backend order JSON, e.g. {"ID":1,"PosID":23456,"Price":235,"RecipeID":12432,"CreatedAt":"..."} */
export interface Order {
  id: number;
  posId: number;
  price: number;
  recipeId: number;
  createdAt: string;
}

export interface OrderFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const ORDERS_PER_PAGE = 10;

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
  }
  return undefined;
}

export function mapBackendOrder(raw: Record<string, unknown>): Order {
  const id = Number(pick(raw, 'ID', 'id') ?? 0);
  const priceRaw = pick(raw, 'Price', 'price');
  const created = pick(raw, 'CreatedAt', 'createdAt', 'Created', 'created');

  return {
    id,
    posId: Number(pick(raw, 'PosID', 'posId') ?? 0),
    price: typeof priceRaw === 'number' ? priceRaw : Number(priceRaw ?? 0),
    recipeId: Number(pick(raw, 'RecipeID', 'recipeId') ?? 0),
    createdAt:
      typeof created === 'string'
        ? created
        : new Date().toISOString(),
  };
}

/** JSON body for create/update (PascalCase matches backend). */
export function orderToBackendPayload(order: Partial<Order>): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  if (order.posId !== undefined) o.PosID = order.posId;
  if (order.price !== undefined) o.Price = order.price;
  if (order.recipeId !== undefined) o.RecipeID = order.recipeId;
  return o;
}

export function formatOrderDate(dateString: string) {
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
