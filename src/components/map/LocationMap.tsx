'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from 'react-leaflet';

import { PRECISION_WORD, type Place } from '@/lib/places';

/**
 * Recorded locations on a real map.
 *
 * Pins are circles drawn by Leaflet rather than image markers, so there is no
 * icon asset to load and nothing to break when Leaflet cannot find its default
 * marker sprite — a standard failure of Leaflet under a bundler.
 *
 * Two kinds of place sit on one map and have to stay apart at a glance:
 * a warehouse holds stock, a point of sale rings sales out of it. Warehouse is
 * the brand teal and the larger circle; a till is amber and smaller, and an
 * inactive till is hollow, because an inactive terminal is out of play rather
 * than an alarm.
 */

export type Pin = {
  id: string;
  name: string;
  /** The address as recorded, shown so the pin can be checked against it. */
  address: string;
  place: Place;
  kind: 'warehouse' | 'pos';
  /** Points of sale only. An inactive one is drawn hollow. */
  active?: boolean;
};

const STYLE = {
  warehouse: { radius: 9, color: '#0f6c78', fillColor: '#0f6c78', fillOpacity: 0.85 },
  posActive: { radius: 6, color: '#a8750c', fillColor: '#d99b16', fillOpacity: 0.9 },
  posIdle: { radius: 6, color: '#6b8089', fillColor: '#ffffff', fillOpacity: 0.9 },
} as const;

export default function LocationMap({
  pins,
  height = 380,
}: {
  pins: Pin[];
  height?: number;
}) {
  /**
   * The frame is fitted to the pins, so one city of outlets fills the map and
   * two cities apart still both fit. With a single pin there is no extent to
   * fit, so it falls back to a close zoom on that pin.
   */
  const bounds = useMemo(() => {
    if (pins.length === 0) return null;
    return L.latLngBounds(pins.map((p) => p.place.at));
  }, [pins]);

  if (pins.length === 0) return null;

  const single = pins.length === 1 ? pins[0].place.at : null;

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [40, 40], maxZoom: 14 }}
        center={single ?? undefined}
        zoom={single ? 14 : undefined}
        scrollWheelZoom={false}
        className="h-full w-full"
        // Tiles sit under the page's own chrome, never over a dropdown.
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {pins.map((pin) => {
          const style =
            pin.kind === 'warehouse'
              ? STYLE.warehouse
              : pin.active === false
                ? STYLE.posIdle
                : STYLE.posActive;

          return (
            <CircleMarker key={pin.id} center={pin.place.at} pathOptions={style} radius={style.radius}>
              <Tooltip direction="top" offset={[0, -6]}>
                {pin.name}
              </Tooltip>
              <Popup>
                <span className="block text-[13px] font-semibold">{pin.name}</span>
                {pin.address && (
                  <span className="mt-0.5 block text-[12px] text-gray-600">{pin.address}</span>
                )}
                {/* The pin's honesty, on the pin. It is placed from the area
                    the row names, not from its street door. */}
                <span className="mt-1 block text-[11px] text-gray-500">
                  Pin at {PRECISION_WORD[pin.place.as]}
                  {pin.kind === 'pos' && pin.active === false ? ' · inactive' : ''}
                </span>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
