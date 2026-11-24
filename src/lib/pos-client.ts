import { POS, POSFilters, POS_PER_PAGE, mapBackendPOS } from './pos';
import { useCallback } from 'react';
import { useApiClient } from './api-client';

// Hook for client-side POS operations with Clerk authentication
export function usePOSClient() {
  const { apiRequest } = useApiClient('pos');

  const fetchPOSList = useCallback(async (filters: POSFilters = {}) => {
    const { search = "", page = 1, limit = POS_PER_PAGE } = filters;
    
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (page > 1) params.append('page', page.toString());
      if (limit !== POS_PER_PAGE) params.append('limit', limit.toString());

      const queryString = params.toString();
      const endpoint = `/list${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest<any>(endpoint);

      let posList: POS[] = [];
      let pagination = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
        startIndex: 1,
        endIndex: 0,
      };

      if (response && typeof response === 'object') {
        if (response.posList && Array.isArray(response.posList)) {
          posList = response.posList.map(mapBackendPOS);
          if (response.pagination) {
            pagination = {
              currentPage: response.pagination.currentPage || page,
              totalPages: response.pagination.totalPages || 1,
              totalItems: response.pagination.totalItems || response.posList.length,
              itemsPerPage: response.pagination.itemsPerPage || limit,
              startIndex: ((response.pagination.currentPage || page) - 1) * (response.pagination.itemsPerPage || limit) + 1,
              endIndex: Math.min(
                (response.pagination.currentPage || page) * (response.pagination.itemsPerPage || limit),
                response.pagination.totalItems || response.posList.length
              ),
            };
          } else {
            pagination.totalItems = response.posList.length;
            pagination.endIndex = response.posList.length;
          }
        }
        else if (Array.isArray(response)) {
          posList = response.map(mapBackendPOS);
          pagination.totalItems = response.length;
          pagination.endIndex = response.length;
        }
        else if (response.data) {
          if (Array.isArray(response.data)) {
            posList = response.data.map(mapBackendPOS);
            pagination.totalItems = response.data.length;
            pagination.endIndex = response.data.length;
          } else if (response.data.posList) {
            posList = response.data.posList.map(mapBackendPOS);
            if (response.data.pagination) {
              pagination = {
                currentPage: response.data.pagination.currentPage || page,
                totalPages: response.data.pagination.totalPages || 1,
                totalItems: response.data.pagination.totalItems || response.data.posList.length,
                itemsPerPage: response.data.pagination.itemsPerPage || limit,
                startIndex: ((response.data.pagination.currentPage || page) - 1) * (response.data.pagination.itemsPerPage || limit) + 1,
                endIndex: Math.min(
                  (response.data.pagination.currentPage || page) * (response.data.pagination.itemsPerPage || limit),
                  response.data.pagination.totalItems || response.data.posList.length
                ),
              };
            }
          }
        }
      }

      return {
        posList,
        pagination,
      };
    } catch (error) {
      console.error('Failed to fetch POS list:', error);
      throw new Error(
        error instanceof Error 
          ? `POS service error: ${error.message}` 
          : 'Failed to connect to POS service'
      );
    }
  }, [apiRequest]);

  const fetchPOS = useCallback(async (id: number): Promise<POS> => {
    try {
      const response = await apiRequest<any>(`/${id}`);
      if (response.data) {
        return mapBackendPOS(response.data);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`Failed to fetch POS ${id}:`, error);
      throw error;
    }
  }, [apiRequest]);

  const deletePOS = useCallback(async (id: number): Promise<void> => {
    try {
      await apiRequest(`/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error(`Failed to delete POS ${id}:`, error);
      throw error;
    }
  }, [apiRequest]);

  const updatePOS = useCallback(async (id: number, pos: Partial<POS>): Promise<POS> => {
    try {
      console.log(`🔄 Updating POS ${id} with data:`, pos);
      
      const formData = new URLSearchParams();
      if (pos.name) formData.append('name', pos.name);
      if (pos.location) formData.append('location', pos.location);
      if (pos.status) formData.append('status', pos.status);
      if (pos.warehouseId !== undefined) formData.append('warehouseId', pos.warehouseId.toString());
      // Sent even when null, as an empty value: that is how the route is told
      // to clear a coordinate rather than leave the stored one alone.
      if (pos.latitude !== undefined) {
        formData.append('latitude', pos.latitude === null ? '' : String(pos.latitude));
      }
      if (pos.longitude !== undefined) {
        formData.append('longitude', pos.longitude === null ? '' : String(pos.longitude));
      }

      const response = await apiRequest<any>(`/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log(`✅ Successfully updated POS ${id}:`, response);

      if (response.data) {
        return mapBackendPOS(response.data);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`❌ Failed to update POS ${id}:`, error);
      throw error;
    }
  }, [apiRequest]);

  return {
    fetchPOSList,
    fetchPOS,
    deletePOS,
    updatePOS,
  };
}
