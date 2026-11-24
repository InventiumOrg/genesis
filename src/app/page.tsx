import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import LandingRecord from '@/components/landing/LandingRecord';
import FlagTestBanner from '@/components/launchdarkly/FlagTestBanner';

export const metadata: Metadata = {
  title: 'Inventium — sell a coffee, stock goes down by itself',
  description:
    'Sell a coffee and your stock goes down by itself. Inventium draws a recipe’s ingredients out of stock as it sells, and reports what the sale took in.',
};

/**
 * The landing record is the only public surface of this app.
 *
 * An authenticated visitor never sees it: the session resolves on the server
 * and redirects to the dashboard before any HTML is sent, which also means an
 * anonymous visitor gets the record itself in the first response rather than a
 * spinner waiting for Clerk to load on the client.
 */
export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');
  return (
    <>
      <FlagTestBanner />
      <LandingRecord />
    </>
  );
}
