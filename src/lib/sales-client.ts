import { useApiClient } from './api-client';
import {
  Sale,
  SaleFilters,
  SALES_PER_PAGE,
  mapBackendSale,
  saleToBackendPayload,
} from './sales';

export function useSalesClient() {
  const { apiRequest } = useApiClient('sale');

  const fetchSales = async (filters: SaleFilters = {}) => {
    const { search = '', page = 1, limit = SALES_PER_PAGE } = filters;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page > 1) params.append('page', page.toString());
    if (limit !== SALES_PER_PAGE) params.append('limit', limit.toString());
    const queryString = params.toString();
    const endpoint = `/list${queryString ? `?${queryString}` : ''}`;
    const response = await apiRequest<any>(endpoint);

    let sales: Sale[] = [];
    let pagination = {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: limit,
      startIndex: 1,
      endIndex: 0,
    };

    const setFromArray = (arr: unknown[], pg?: any) => {
      sales = arr.map((item) => mapBackendSale(item as Record<string, unknown>));
      if (pg) {
        pagination = {
          currentPage: pg.currentPage || page,
          totalPages: pg.totalPages || 1,
          totalItems: pg.totalItems ?? sales.length,
          itemsPerPage: pg.itemsPerPage || limit,
          startIndex:
            ((pg.currentPage || page) - 1) * (pg.itemsPerPage || limit) + 1,
          endIndex: Math.min(
            (pg.currentPage || page) * (pg.itemsPerPage || limit),
            pg.totalItems ?? sales.length
          ),
        };
      } else {
        pagination.totalItems = sales.length;
        pagination.endIndex = sales.length;
      }
    };

    if (response && typeof response === 'object') {
      if (response.sales && Array.isArray(response.sales)) {
        setFromArray(response.sales, response.pagination);
      } else if (response.items && Array.isArray(response.items)) {
        setFromArray(response.items, response.pagination);
      } else if (Array.isArray(response)) {
        setFromArray(response);
      } else if (response.data) {
        const d = response.data;
        if (Array.isArray(d)) setFromArray(d);
        else if (d.sales && Array.isArray(d.sales))
          setFromArray(d.sales, d.pagination);
        else if (d.items && Array.isArray(d.items))
          setFromArray(d.items, d.pagination);
      }
    }

    return { sales, pagination };
  };

  const createSale = async (
    input: Omit<Sale, 'id' | 'createdAt'>
  ): Promise<Sale> => {
    const response = await apiRequest<any>('/create', {
      method: 'POST',
      body: JSON.stringify(saleToBackendPayload(input)),
    });
    if (response.data) {
      return mapBackendSale(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('ID' in response || 'id' in response)) {
      return mapBackendSale(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  const updateSale = async (
    id: number,
    input: Partial<Pick<Sale, 'posId' | 'recipeId' | 'price' | 'quantity'>>
  ): Promise<Sale> => {
    const response = await apiRequest<any>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleToBackendPayload(input)),
    });
    if (response.data) {
      return mapBackendSale(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('ID' in response || 'id' in response)) {
      return mapBackendSale(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  const deleteSale = async (id: number): Promise<void> => {
    await apiRequest(`/${id}`, { method: 'DELETE' });
  };

  return { fetchSales, createSale, updateSale, deleteSale };
}
