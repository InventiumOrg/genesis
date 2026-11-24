// POS types and interfaces
export interface POS {
  id: number;
  name: string;
  location: string;
  status: string;
  warehouseId?: number;
  warehouseName?: string;
  /** Decimal degrees, or null when nobody has recorded them. */
  latitude: number | null;
  longitude: number | null;
}

export interface POSFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface POSPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export interface POSListResponse {
  posList: POS[];
  pagination: POSPagination;
}

export const POS_PER_PAGE = 10;

// Map backend POS data to frontend interface

/** Read a coordinate without letting a recorded 0 fall through as absent. */
function coord(...values: unknown[]): number | null {
  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function mapBackendPOS(backendPOS: any): POS {
  return {
    id: backendPOS.id || backendPOS.ID,
    name: backendPOS.name || backendPOS.Name || '',
    location: backendPOS.location || backendPOS.Location || '',
    status: backendPOS.status || backendPOS.Status || 'active',
    warehouseId: backendPOS.warehouseId || backendPOS.WarehouseID || backendPOS.warehouse_id,
    warehouseName: backendPOS.warehouseName || backendPOS.WarehouseName || backendPOS.warehouse_name || '',
    latitude: coord(backendPOS.latitude, backendPOS.Latitude),
    longitude: coord(backendPOS.longitude, backendPOS.Longitude),
  };
}
