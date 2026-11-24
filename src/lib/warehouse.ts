// Warehouse types and interfaces
export interface Warehouse {
  id: number;
  name: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  /** Decimal degrees, or null when nobody has recorded them. */
  latitude: number | null;
  longitude: number | null;
}

export interface WarehouseFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface WarehousePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export interface WarehouseListResponse {
  warehouses: Warehouse[];
  pagination: WarehousePagination;
}

export const WAREHOUSES_PER_PAGE = 10;

// Map backend warehouse data to frontend interface

/** Read a coordinate without letting a recorded 0 fall through as absent. */
function coord(...values: unknown[]): number | null {
  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function mapBackendWarehouse(backendWarehouse: any): Warehouse {
  return {
    id: backendWarehouse.id || backendWarehouse.ID,
    name: backendWarehouse.name || backendWarehouse.Name || '',
    address: backendWarehouse.address || backendWarehouse.Address || '',
    ward: backendWarehouse.ward || backendWarehouse.Ward || '',
    district: backendWarehouse.district || backendWarehouse.District || '',
    city: backendWarehouse.city || backendWarehouse.City || '',
    country: backendWarehouse.country || backendWarehouse.Country || '',
    latitude: coord(backendWarehouse.latitude, backendWarehouse.Latitude),
    longitude: coord(backendWarehouse.longitude, backendWarehouse.Longitude),
  };
}