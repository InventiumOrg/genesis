import type { POS } from '@/lib/pos';
import { placeOf, placeOfText } from '@/lib/places';
import type { Warehouse } from '@/lib/warehouse';

import type { Pin } from './LocationMap';

/**
 * Turn rows into pins, and say which rows could not become one.
 *
 * Returned as a pair rather than a filtered list, because the rows that drop
 * out are the interesting ones: a warehouse absent from a map of warehouses
 * reads as "we have three", and the panel needs the names to say otherwise.
 */
export function warehousePins(warehouses: Warehouse[]): {
  pins: Pin[];
  unplaced: string[];
} {
  const pins: Pin[] = [];
  const unplaced: string[] = [];

  for (const w of warehouses) {
    const place = placeOf(w);
    if (!place) {
      unplaced.push(w.name);
      continue;
    }
    pins.push({
      id: `w-${w.id}`,
      name: w.name,
      address: [w.address, w.ward, w.district, w.city].filter(Boolean).join(', '),
      place,
      kind: 'warehouse',
    });
  }

  return { pins, unplaced };
}

/** A point of sale carries one free-text `location`, so it is searched. */
export function posPins(points: POS[]): { pins: Pin[]; unplaced: string[] } {
  const pins: Pin[] = [];
  const unplaced: string[] = [];

  for (const p of points) {
    const place = placeOfText(p.location);
    if (!place) {
      unplaced.push(p.name);
      continue;
    }
    pins.push({
      id: `p-${p.id}`,
      name: p.name,
      address: [p.location, p.warehouseName && `draws from ${p.warehouseName}`]
        .filter(Boolean)
        .join(' · '),
      place,
      kind: 'pos',
      active: p.status === 'active',
    });
  }

  return { pins, unplaced };
}
