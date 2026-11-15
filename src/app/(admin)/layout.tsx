import React from 'react';

import { CurrencyProvider } from '@/context/CurrencyContext';
import { readCurrency } from '@/lib/currency-cookie';
import { getRate } from '@/lib/exchange-rate';

import AdminShell from './AdminShell';

/**
 * Resolves the currency and the rate for every signed-in screen.
 *
 * It sits here and not in the root layout on purpose. Reading `cookies()` opts
 * a subtree out of static rendering, and in the root layout that was the whole
 * app — the landing page, pricing and the sign-in screens all became
 * server-rendered on demand for a preference none of them shows. These screens
 * are behind a session and dynamic regardless, so the cost lands where it was
 * already being paid.
 *
 * Both are resolved here rather than in the client, so the first paint is
 * already in the right currency; a client that looked either up would render
 * dollars for one frame and then flip every figure on the page.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currency, rate] = await Promise.all([readCurrency(), getRate()]);

  return (
    <CurrencyProvider initialCurrency={currency} rate={rate}>
      <AdminShell>{children}</AdminShell>
    </CurrencyProvider>
  );
}
