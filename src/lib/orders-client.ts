import { useApiClient } from './api-client';
import { Order, OrderFilters, ORDERS_PER_PAGE, mapBackendOrder, orderToBackendPayload } from './orders';

export function useOrdersClient() {
  const { apiRequest } = useApiClient('orders');

  const fetchOrders = async (filters: OrderFilters = {}) => {
    const { search = '', page = 1, limit = ORDERS_PER_PAGE } = filters;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page > 1) params.append('page', page.toString());
    if (limit !== ORDERS_PER_PAGE) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = `/list${queryString ? `?${queryString}` : ''}`;

    const response = await apiRequest<any>(endpoint);

    let orders: Order[] = [];
    let pagination = {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: limit,
      startIndex: 1,
      endIndex: 0,
    };

    const setFromArray = (arr: unknown[], pg?: any) => {
      orders = arr.map((item) => mapBackendOrder(item as Record<string, unknown>));
      if (pg) {
        pagination = {
          currentPage: pg.currentPage || page,
          totalPages: pg.totalPages || 1,
          totalItems: pg.totalItems ?? orders.length,
          itemsPerPage: pg.itemsPerPage || limit,
          startIndex:
            ((pg.currentPage || page) - 1) * (pg.itemsPerPage || limit) + 1,
          endIndex: Math.min(
            (pg.currentPage || page) * (pg.itemsPerPage || limit),
            pg.totalItems ?? orders.length
          ),
        };
      } else {
        pagination.totalItems = orders.length;
        pagination.endIndex = orders.length;
      }
    };

    if (response && typeof response === 'object') {
      if (response.orders && Array.isArray(response.orders)) {
        setFromArray(response.orders, response.pagination);
      } else if (response.items && Array.isArray(response.items)) {
        setFromArray(response.items, response.pagination);
      } else if (Array.isArray(response)) {
        setFromArray(response);
      } else if (response.data) {
        const d = response.data;
        if (Array.isArray(d)) {
          setFromArray(d);
        } else if (d.orders && Array.isArray(d.orders)) {
          setFromArray(d.orders, d.pagination);
        } else if (d.items && Array.isArray(d.items)) {
          setFromArray(d.items, d.pagination);
        }
      }
    }

    return { orders, pagination };
  };

  const fetchOrder = async (id: number): Promise<Order> => {
    const response = await apiRequest<any>(`/${id}`);
    if (response.data) {
      return mapBackendOrder(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('ID' in response || 'id' in response)) {
      return mapBackendOrder(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  const createOrder = async (input: Pick<Order, 'posId' | 'price' | 'recipeId'>): Promise<Order> => {
    const body = orderToBackendPayload(input);
    const response = await apiRequest<any>('/create', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (response.data) {
      return mapBackendOrder(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('ID' in response || 'id' in response)) {
      return mapBackendOrder(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  const updateOrder = async (id: number, input: Partial<Order>): Promise<Order> => {
    const body = orderToBackendPayload(input);
    const response = await apiRequest<any>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (response.data) {
      return mapBackendOrder(response.data as Record<string, unknown>);
    }
    if (response && typeof response === 'object' && ('ID' in response || 'id' in response)) {
      return mapBackendOrder(response as Record<string, unknown>);
    }
    throw new Error('Invalid response format');
  };

  return {
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
  };
}
