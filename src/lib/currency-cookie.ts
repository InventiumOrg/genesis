/**
 * The reader's currency choice, read on the server.
 *
 * It lives in a cookie rather than `localStorage` because the screens that show
 * money are Server Components. A choice the server cannot see would render
 * every amount in dollars first and correct itself after hydration — a visible
 * flip of every figure on the page, on every navigation.
 *
 * Server-only: it reads `next/headers`. The client writes the cookie from
 * `CurrencyContext`.
 */

import { cookies } from 'next/headers';

import { CURRENCY_COOKIE, DEFAULT_CURRENCY, isCurrency, type Currency } from './currency';

export async function readCurrency(): Promise<Currency> {
  const store = await cookies();
  const value = store.get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
}
