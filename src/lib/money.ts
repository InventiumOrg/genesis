/**
 * Money, in the currency the database actually stores.
 *
 * `recipes.cost` and `sales.price` are integers, and the schema says why:
 * "Cost in đồng; VND has no minor unit, so this is an integer." So 105000 is
 * ₫105,000 — not $105,000, and not ₫1,050.00. There are no cents to carry.
 *
 * Three older call sites format these same integers with `currency: "USD"`
 * (`inventory.ts`, `recipes.ts`, `InventoryTable.tsx`). They are wrong about
 * the unit, not merely styled differently, and they are left alone here rather
 * than changed in passing.
 */

const dong = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/** `₫105,000`. */
export function money(amount: number): string {
  return dong.format(Math.round(amount));
}

/**
 * `₫3,2 tr` — a shortened reading for an axis or a tile where the full figure
 * does not fit. Never use it where the exact amount is the point.
 */
export function moneyShort(amount: number): string {
  const n = Math.round(amount);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `₫${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (abs >= 1_000_000) return `₫${(n / 1_000_000).toFixed(1)} tr`;
  if (abs >= 1_000) return `₫${(n / 1_000).toFixed(0)}k`;
  return `₫${n}`;
}

/** `1.480` — a quantity, grouped, with no currency and no invented precision. */
export function count(n: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(n);
}
