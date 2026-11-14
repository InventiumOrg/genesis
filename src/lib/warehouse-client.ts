import { Warehouse, WarehouseFilters, WAREHOUSES_PER_PAGE, mapBackendWarehouse } from './warehouse';
import { useCallback } from 'react';
import { useApiClient } from './api-client';

// Hook for client-side warehouse operations with Clerk authentication
export function useWarehouseClient() {
  const { apiRequest } = useApiClient('warehouse');

  const fetchWarehouses = useCallback(async (filters: WarehouseFilters = {}) => {
    const { search = "", page = 1, limit = WAREHOUSES_PER_PAGE } = filters;
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (page > 1) params.append('page', page.toString());
      if (limit !== WAREHOUSES_PER_PAGE) params.append('limit', limit.toString());

      const queryString = params.toString();
      const endpoint = `/list${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest<any>(endpoint);

      let warehouses: Warehouse[] = [];
      let pagination = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        startIndex: 1,
        endIndex: 0,
      };

      if (response && typeof response === 'object') {
        if (response.warehouses && Array.isArray(response.warehouses)) {
          warehouses = response.warehouses.map(mapBackendWarehouse);
          if (response.pagination) {
            pagination = {
              currentPage: response.pagination.currentPage || page,
              totalPages: response.pagination.totalPages || 1,
              totalItems: response.pagination.totalItems || response.warehouses.length,
              itemsPerPage: response.pagination.itemsPerPage || limit,
              startIndex: ((response.pagination.currentPage || page) - 1) * (response.pagination.itemsPerPage || limit) + 1,
              endIndex: Math.min(
                (response.pagination.currentPage || page) * (response.pagination.itemsPerPage || limit),
                response.pagination.totalItems || response.warehouses.length
              ),
            };
          } else {
            pagination.totalItems = response.warehouses.length;
            pagination.endIndex = response.warehouses.length;
          }
        }
        else if (Array.isArray(response)) {
          warehouses = response.map(mapBackendWarehouse);
          pagination.totalItems = response.length;
          pagination.endIndex = response.length;
        }
        else if (response.data) {
          if (Array.isArray(response.data)) {
            warehouses = response.data.map(mapBackendWarehouse);
            pagination.totalItems = response.data.length;
            pagination.endIndex = response.data.length;
          } else if (response.data.warehouses) {
            warehouses = response.data.warehouses.map(mapBackendWarehouse);
            if (response.data.pagination) {
              pagination = {
                currentPage: response.data.pagination.currentPage || page,
                totalPages: response.data.pagination.totalPages || 1,
                totalItems: response.data.pagination.totalItems || response.data.warehouses.length,
                itemsPerPage: response.data.pagination.itemsPerPage || limit,
                startIndex: ((response.data.pagination.currentPage || page) - 1) * (response.data.pagination.itemsPerPage || limit) + 1,
                endIndex: Math.min(
                  (response.data.pagination.currentPage || page) * (response.data.pagination.itemsPerPage || limit),
                  response.data.pagination.totalItems || response.data.warehouses.length
                ),
              };
            }
          }
        }
      }

      return {
        warehouses,
        pagination,
      };
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      throw new Error(
        error instanceof Error 
          ? `Warehouse service error: ${error.message}` 
          : 'Failed to connect to warehouse service'
      );
    }
  }, [apiRequest]);

  const fetchWarehouse = useCallback(async (id: number): Promise<Warehouse> => {
    try {
      const response = await apiRequest<any>(`/${id}`);
      if (response.data) {
        return mapBackendWarehouse(response.data);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`Failed to fetch warehouse ${id}:`, error);
      throw error;
    }
  }, [apiRequest]);

  const deleteWarehouse = useCallback(async (id: number): Promise<void> => {
    try {
      await apiRequest(`/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Failed to delete warehouse ${id}:`, error);
      throw error;
    }
  }, [apiRequest]);

  return {
    fetchWarehouses,
    fetchWarehouse,
    deleteWarehouse,
  };
}
