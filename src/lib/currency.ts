/**
 * Money: one stored currency, two ways to read it.
 *
 * **Everything is stored as whole US cents.** `recipes.cost`, `sales.price` and
 * `orders.price` are integers in cents, so $1.14 is `114`. Cents rather than
 * dollars because the columns are integers: storing dollars would round every
 * price to the nearest dollar, and storing a float would make two sales of the
 * same cup disagree about what was taken.
 *
 * A reader can view either USD or VND. VND is a **conversion for display only**
 * — no đồng figure is ever stored, and converting back and forth cannot move a
 * stored amount. Every screen showing đồng also shows the rate it used, because
 * a converted number is not the same kind of fact as a recorded one.
 *
 * ## The cost of storing cents, stated plainly
 *
 * One US cent is about ₫257 at the current rate, so a đồng price cannot be
 * represented exactly. A cup priced at ₫35,000 is stored as 136 cents and reads
 * back as ₫34,987. The step between two storable prices is roughly ₫257, which
 * is fine for a ₫35,000 cup and would not be for anything priced in tens of
 * đồng. This is inherent to choosing dollars as the stored currency; it is not
 * a rounding bug to be fixed in the formatter.
 */

export type Currency = 'USD' | 'VND';

export const CURRENCIES: Currency[] = ['USD', 'VND'];

/** The cookie the reader's choice lives in, so the server renders it directly. */
export const CURRENCY_COOKIE = 'inventium-currency';

export const DEFAULT_CURRENCY: Currency = 'USD';

export function isCurrency(value: unknown): value is Currency {
  return value === 'USD' || value === 'VND';
}

/**
 * A rate, where it came from, and when it was true.
 *
 * `source` is not decoration. A figure converted from a number typed into
 * configuration months ago is a weaker claim than one quoted this morning, and
 * the interface says which it is rather than letting both read alike.
 *
 * Resolving a rate lives in `exchange-rate.ts`, which is the seam a live
 * provider plugs into. Nothing in this module fetches anything.
 */
export type Rate = {
  vndPerUsd: number;
  /** ISO date, or `null` when nothing recorded when the rate was true. */
  asOf: string | null;
  source: 'configured' | 'fallback' | 'live';
  /** Named when `source` is `live`, so a screen can say who quoted it. */
  provider?: string;
};

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * đồng is grouped and prefixed by hand rather than through `style: 'currency'`.
 *
 * `vi-VN` renders 35000 as `35.987 ₫` — dots for thousands, symbol trailing.
 * That is correct Vietnamese typography, but the landing record and the rest of
 * this product already write `₫35,000`, and one app with two đồng conventions
 * reads like a bug. The house style wins.
 */
const dongDigits = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const vnd = { format: (dong: number) => `₫${dongDigits.format(dong)}` };

/**
 * Format an amount held in US cents.
 *
 * đồng has no minor unit, so a converted amount is rounded to a whole đồng.
 * That rounding is the only arithmetic applied: the cents are the record and
 * are never themselves rounded.
 */
export function formatMoney(cents: number, currency: Currency, r: Rate): string {
  if (currency === 'VND') {
    return vnd.format(Math.round((cents / 100) * r.vndPerUsd));
  }
  return usd.format(cents / 100);
}

/**
 * A shortened reading for an axis or a narrow cell, where the exact amount is
 * not the point. Never use it where a figure must be checkable.
 */
export function formatMoneyShort(cents: number, currency: Currency, r: Rate): string {
  if (currency === 'VND') {
    const dong = Math.round((cents / 100) * r.vndPerUsd);
    const abs = Math.abs(dong);
    if (abs >= 1_000_000_000) return `₫${(dong / 1_000_000_000).toFixed(1)} tỷ`;
    if (abs >= 1_000_000) return `₫${(dong / 1_000_000).toFixed(1)} tr`;
    if (abs >= 1_000) return `₫${Math.round(dong / 1_000)}k`;
    return `₫${dong}`;
  }

  const dollars = cents / 100;
  const abs = Math.abs(dollars);
  if (abs >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(dollars / 1_000).toFixed(1)}k`;
  return usd.format(dollars);
}

/**
 * One line naming the conversion, for a screen showing đồng.
 *
 * Returns `null` for USD, which needs no note: a dollar figure is the stored
 * record, not a conversion of one.
 */
export function rateNote(currency: Currency, r: Rate): string | null {
  if (currency === 'USD') return null;

  const amount = `₫${r.vndPerUsd.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} to $1`;

  if (r.source === 'fallback') {
    return `converted at ${amount} — a placeholder, no rate configured`;
  }
  if (r.source === 'live') {
    return `converted at ${amount}, quoted by ${r.provider ?? 'a rate service'}${
      r.asOf ? ` at ${r.asOf}` : ''
    }`;
  }
  return `converted at ${amount}${r.asOf ? `, the rate recorded on ${r.asOf}` : ', no date recorded'}`;
}

/**
 * Read what a person typed into cents.
 *
 * Entry is always in USD, because that is what is stored; letting someone type
 * đồng would store a figure that drifts the moment the rate moves. Returns
 * `null` for anything that is not a number, so a caller must decide what to do
 * rather than banking a silent zero.
 */
export function parseUsdToCents(input: string): number | null {
  const cleaned = input.replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return null;
  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars)) return null;
  return Math.round(dollars * 100);
}

/** `1.480` — a quantity, grouped, with no currency and no invented precision. */
export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(n);
}
