import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import LandingRecord from '@/components/landing/LandingRecord';

export const metadata: Metadata = {
  title: 'Inventium — a sale draws its ingredients out of stock',
  description:
    'Inventium keeps stock and revenue in agreement for a multi-outlet food and beverage business: a sale rung up at a point of sale draws its recipe’s ingredients down from stock, and reports the revenue it returned.',
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
  return <LandingRecord />;
}
