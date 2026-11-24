'use client';

import dynamic from 'next/dynamic';

import { PRECISION_WORD } from '@/lib/places';

import type { Pin } from './LocationMap';

/**
 * The map, its key, and what it cannot tell you.
 *
 * Leaflet touches `window` as it loads, so the map is imported with
 * `ssr: false` — this wrapper exists to hold that boundary, and to hold the
 * two things that belong beside a map rather than inside it: the key, and the
 * count of rows that could not be placed.
 *
 * Unplaced rows are named, not hidden. A warehouse missing from a map of
 * warehouses is the kind of absence that reads as "we have three", so the
 * panel says how many are off the map and why.
 */

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] items-center justify-center bg-gray-50 dark:bg-white/[0.03]">
      <span className="label-cap">Loading map</span>
    </div>
  ),
});

export default function LocationPanel({
  pins,
  unplaced,
  height,
}: {
  pins: Pin[];
  /** Names of rows with no address this map can place. */
  unplaced: string[];
  height?: number;
}) {
  const warehouses = pins.filter((p) => p.kind === 'warehouse').length;
  const tills = pins.filter((p) => p.kind === 'pos').length;
  // The loosest pin on the map sets what the whole map can claim.
  const loosest = pins.some((p) => p.place.as === 'city')
    ? 'city'
    : pins.some((p) => p.place.as === 'district')
      ? 'district'
      : pins.some((p) => p.place.as === 'ward')
        ? 'ward'
        : 'exact';

  if (pins.length === 0) {
    return (
      <div className="border border-gray-200 bg-white px-5 py-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-theme-sm font-semibold text-gray-900 dark:text-white">
          Nothing to put on a map yet
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-600 dark:text-gray-400">
          {unplaced.length > 0
            ? `${unplaced.length} on record, none with an address this map recognises.`
            : 'Add a warehouse or a till and it appears here.'}
        </p>
      </div>
    );
  }

  return (
    <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {warehouses > 0 && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-brand-500" />
              <span className="label-cap">
                {warehouses} {warehouses === 1 ? 'warehouse' : 'warehouses'}
              </span>
            </span>
          )}
          {tills > 0 && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-warning-500" />
              <span className="label-cap">
                {tills} {tills === 1 ? 'till' : 'tills'}
              </span>
            </span>
          )}
        </div>
        <span className="label-cap">
          {loosest === 'exact'
            ? 'Pins at recorded coordinates'
            : `Pins at ${PRECISION_WORD[loosest]}, not street level`}
        </span>
      </div>

      <LocationMap pins={pins} height={height} />

      {unplaced.length > 0 && (
        <p className="border-t border-gray-200 px-5 py-3 font-mono text-[11px] text-gray-600 dark:border-gray-800 dark:text-gray-400">
          Not on the map: {unplaced.join(', ')} — no ward or district this map
          knows. Nothing is guessed in its place.
        </p>
      )}
    </section>
  );
}
