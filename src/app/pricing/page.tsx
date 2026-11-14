import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';

import PricingSchedule from '@/components/landing/PricingSchedule';

export const metadata: Metadata = {
  title: 'Inventium — rate schedule',
  description:
    'Free, Business and Enterprise plans for Inventium, written as a rate schedule: four stated limits per plan and the capacity envelope that shows when you outgrow one. Sample amounts — nothing is billed yet.',
};

/**
 * The rate schedule stays visible to a signed-in owner.
 *
 * Unlike the landing record, which redirects an authenticated visitor to the
 * dashboard, someone already using the app is exactly who reads a pricing
 * page next — so the session is resolved only to swap the chrome's two doors
 * for one into the app.
 */
export default async function PricingPage() {
  const { userId } = await auth();
  return <PricingSchedule authed={Boolean(userId)} />;
}
