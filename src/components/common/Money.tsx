'use client';

import { useCurrency } from '@/context/CurrencyContext';

/**
 * An amount held in US cents, shown in whichever currency the reader chose.
 *
 * A Client Component on purpose, even though most callers are Server
 * Components. Rendering one inside a server page is ordinary, and it means the
 * choice does not have to be threaded as a prop through every page, board and
 * table that happens to show money — a thread that would be forgotten exactly
 * once and leave one figure in the wrong currency.
 *
 * `title` carries the conversion note when viewing đồng, so a converted figure
 * can always be traced back to the rate that produced it.
 */
export function Money({
  cents,
  short = false,
  className,
}: {
  cents: number;
  /** Shorten for an axis or a narrow cell. Never where the exact figure matters. */
  short?: boolean;
  className?: string;
}) {
  const { money, moneyShort, note } = useCurrency();
  return (
    <span className={className} title={note ?? undefined}>
      {short ? moneyShort(cents) : money(cents)}
    </span>
  );
}

export default Money;
