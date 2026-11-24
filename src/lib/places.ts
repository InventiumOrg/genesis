/**
 * Where a recorded address sits on a map, as far as the record can say.
 *
 * Nothing in the schema holds coordinates. `warehouses` records
 * `address / ward / district / city / country` and `points_of_sale` records one
 * free-text `location`, so the most precise thing that can honestly be drawn is
 * the **centre of the ward or district named on the row** — not the street door.
 *
 * These centres are public geographic facts, written down here rather than
 * fetched: a geocoding call would put a network round trip and an API key
 * between a row and whether it appears, and would answer with a guess for an
 * address it could not match. A pin placed from this table is either a real
 * area centre or absent, and the map says which.
 *
 * To pin a street door instead, `warehouses` and `points_of_sale` need
 * `latitude` / `longitude` columns and someone to fill them. That is a schema
 * change, not a lookup, and it is not pretended here.
 */

export type Place = {
  /** [latitude, longitude]. */
  at: [number, number];
  /** How precise this is, shown to the reader rather than implied. */
  as: 'exact' | 'ward' | 'district' | 'city';
};

/**
 * A recorded coordinate pair, when the row has one.
 *
 * Checked before any area centre: a surveyed door beats the middle of its
 * ward. Both values must be present and inside the real range — a lone
 * latitude, or a longitude of 200, is a half-filled form rather than a place,
 * and falling back to the ward is better than drawing a pin in the sea.
 */
export function exactPlace(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): Place | null {
  if (latitude == null || longitude == null) return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  return { at: [latitude, longitude], as: 'exact' };
}

/** Fallback for anything in the city whose ward and district are unknown. */
export const HO_CHI_MINH_CITY: Place = { at: [10.7769, 106.7009], as: 'city' };

/**
 * Ward centres, keyed by the ward name as the record spells it. Checked first,
 * because a ward is a tighter answer than the district around it.
 */
const WARDS: Record<string, [number, number]> = {
  'Thảo Điền': [10.8044, 106.7347],
  'Linh Chiểu': [10.8505, 106.7636],
  'Phường 25': [10.7978, 106.7093],
};

/** District centres, keyed by district name as the record spells it. */
const DISTRICTS: Record<string, [number, number]> = {
  'Thủ Đức': [10.8494, 106.7537],
  'Bình Thạnh': [10.8039, 106.7077],
  'Quận 1': [10.7756, 106.7019],
  'Quận 3': [10.7797, 106.6822],
  'Quận 7': [10.7340, 106.7215],
  'Phú Nhuận': [10.7994, 106.6797],
  'Gò Vấp': [10.8386, 106.6655],
  'Tân Bình': [10.8014, 106.6526],
};

/** Strip diacritic-insensitive noise so "quan 1" still finds "Quận 1". */
function key(value: string): string {
  return value.trim().toLowerCase();
}

const WARD_KEYS = new Map(Object.entries(WARDS).map(([k, v]) => [key(k), v]));
const DISTRICT_KEYS = new Map(Object.entries(DISTRICTS).map(([k, v]) => [key(k), v]));

/**
 * The tightest known centre for a recorded address, or `null` when the record
 * names nowhere this table knows.
 *
 * `null` is deliberate. A row that cannot be placed is listed as unplaced
 * rather than dropped onto the city centre, which would read as a location
 * nobody recorded.
 */
export function placeOf(parts: {
  ward?: string | null;
  district?: string | null;
  city?: string | null;
}): Place | null {
  const ward = parts.ward ? WARD_KEYS.get(key(parts.ward)) : undefined;
  if (ward) return { at: ward, as: 'ward' };

  const district = parts.district ? DISTRICT_KEYS.get(key(parts.district)) : undefined;
  if (district) return { at: district, as: 'district' };

  // A city is a weak answer, so it is only used when the row actually names
  // one this table knows — never as a catch-all for an empty address.
  if (parts.city && key(parts.city).includes('chí minh')) return HO_CHI_MINH_CITY;

  return null;
}

/**
 * Place a point of sale, whose address is one free-text field.
 *
 * The field is searched for any ward or district name this table knows, so
 * "Quán 3 · Thảo Điền" lands in Thảo Điền. It is a search and not a parse
 * because the field has no agreed shape: an operator types what they type.
 */
export function placeOfText(location: string | null | undefined): Place | null {
  if (!location?.trim()) return null;
  const haystack = key(location);

  for (const [name, at] of WARD_KEYS) {
    if (haystack.includes(name)) return { at, as: 'ward' };
  }
  for (const [name, at] of DISTRICT_KEYS) {
    if (haystack.includes(name)) return { at, as: 'district' };
  }
  if (haystack.includes('chí minh') || haystack.includes('hcm')) return HO_CHI_MINH_CITY;

  return null;
}

/** How a pin's precision reads on screen. */
export const PRECISION_WORD: Record<Place['as'], string> = {
  exact: 'recorded coordinates',
  ward: 'ward centre',
  district: 'district centre',
  city: 'city centre',
};
