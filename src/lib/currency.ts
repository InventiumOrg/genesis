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
 * The rate, and the date it was true.
 *
 * It is configuration, not a live quote: nothing here calls a rate service, so
 * a figure in đồng is only as current as `NEXT_PUBLIC_USD_VND_RATE_AS_OF` says.
 * The interface prints that date beside the amount rather than implying the
 * conversion is live. Set both variables together when you update the rate.
 */
export type Rate = {
  vndPerUsd: number;
  asOf: string;
  /** False when the rate came from the built-in fallback, not configuration. */
  configured: boolean;
};

/**
 * A fallback, used only when nothing is configured. Deliberately a round
 * number: it is an order of magnitude, not a quote, and reads as one.
 */
const FALLBACK_VND_PER_USD = 26_000;

export function rate(): Rate {
  const raw = process.env.NEXT_PUBLIC_USD_VND_RATE?.trim();
  const parsed = raw ? Number(raw) : NaN;
  const configured = Number.isFinite(parsed) && parsed > 0;

  return {
    vndPerUsd: configured ? parsed : FALLBACK_VND_PER_USD,
    asOf: process.env.NEXT_PUBLIC_USD_VND_RATE_AS_OF?.trim() || 'no date recorded',
    configured,
  };
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

/**
 * Format an amount held in US cents.
 *
 * đồng has no minor unit, so a converted amount is rounded to a whole đồng.
 * That rounding is the only arithmetic applied: the cents are the record and
 * are never themselves rounded.
 */
export function formatMoney(cents: number, currency: Currency, r: Rate = rate()): string {
  if (currency === 'VND') {
    return vnd.format(Math.round((cents / 100) * r.vndPerUsd));
  }
  return usd.format(cents / 100);
}

/**
 * A shortened reading for an axis or a narrow cell, where the exact amount is
 * not the point. Never use it where a figure must be checkable.
 */
export function formatMoneyShort(
  cents: number,
  currency: Currency,
  r: Rate = rate(),
): string {
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

/** One line naming the conversion, for a screen showing đồng. */
export function rateNote(currency: Currency, r: Rate = rate()): string | null {
  if (currency === 'USD') return null;
  return `converted at ₫${r.vndPerUsd.toLocaleString('vi-VN')} to $1${
    r.configured ? `, as of ${r.asOf}` : ' (no rate configured — this is a placeholder)'
  }`;
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
