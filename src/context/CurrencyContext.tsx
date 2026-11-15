'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  CURRENCY_COOKIE,
  formatMoney,
  formatMoneyShort,
  rateNote,
  type Currency,
  type Rate,
} from '@/lib/currency';

type CurrencyContextValue = {
  currency: Currency;
  rate: Rate;
  setCurrency: (next: Currency) => void;
  /** Format an amount held in US cents, in the currency being viewed. */
  money: (cents: number) => string;
  /** The same, shortened for an axis or a narrow cell. */
  moneyShort: (cents: number) => string;
  /** One line naming the conversion, or `null` when viewing dollars. */
  note: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

/**
 * Holds the currency being viewed, and the rate the server resolved.
 *
 * Both arrive as props from the root layout: the currency from the cookie and
 * the rate from `getRate()`. Nothing is resolved here, which is what keeps the
 * first paint correct — a client that had to look either of them up would show
 * dollars for one frame and then flip every figure on the page.
 *
 * The choice is written straight to `document.cookie` rather than through a
 * server action, because the only thing that needs it is the next server
 * render. Local state flips the client tree at once, so the toggle answers
 * immediately; `router.refresh()` then re-renders the server tree so figures
 * formatted on the server agree with it.
 */
export function CurrencyProvider({
  children,
  initialCurrency,
  rate,
}: {
  children: ReactNode;
  initialCurrency: Currency;
  rate: Rate;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);
  const router = useRouter();

  const setCurrency = useCallback(
    (next: Currency) => {
      setCurrencyState(next);
      // A year, so the choice survives; `SameSite=Lax` because nothing
      // cross-site needs it and a display preference is not worth a wider
      // cookie. No `Secure` flag: that would drop it on plain-HTTP localhost.
      document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      rate,
      setCurrency,
      money: (cents: number) => formatMoney(cents, currency, rate),
      moneyShort: (cents: number) => formatMoneyShort(cents, currency, rate),
      note: rateNote(currency, rate),
    }),
    [currency, rate, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const found = useContext(CurrencyContext);
  if (!found) {
    throw new Error('useCurrency must be used inside a CurrencyProvider');
  }
  return found;
}
