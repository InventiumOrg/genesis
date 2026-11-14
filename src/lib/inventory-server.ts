/**
 * Inventory reads and writes for Server Components.
 *
 * These used to call a REST service over HTTP. They now query Postgres in the
 * same process; the signatures and the shapes the screens read are unchanged,
 * which is the whole point of keeping this module as the seam. When inventory
 * becomes its own service again, only the bodies go back to `fetch`.
 */

import {
  createInventoryItem,
  deleteInventoryItem as deleteItem,
  getInventoryItem,
  listInventory,
  updateInventoryItem as updateItem,
} from '@/server/inventory';

import { InventoryItem, InventoryFilters, ITEMS_PER_PAGE, mapBackendItem } from './inventory';
import { uiPagination, type UiPagination } from './pagination';

export async function fetchInventoryItemsServer(filters: InventoryFilters = {}): Promise<{
  items: InventoryItem[];
  pagination: UiPagination;
}> {
  const { search = '', status = 'All', page = 1, limit = ITEMS_PER_PAGE } = filters;
  const { items, pagination } = await listInventory({ search, status, page, limit });
  return { items: items.map(mapBackendItem), pagination: uiPagination(pagination) };
}

export async function fetchInventoryItemServer(id: number): Promise<InventoryItem> {
  const found = await getInventoryItem(id);
  if (!found) throw new Error(`Inventory item ${id} not found`);
  return mapBackendItem(found);
}

export async function createInventoryItemServer(
  item: Omit<InventoryItem, 'id'>,
): Promise<InventoryItem> {
  const created = await createInventoryItem({
    name: item.name,
    unit: item.unit,
    measure: item.measure,
    category: item.category,
    location: item.location ?? item.supplier,
    quantity: item.quantity,
  });
  return mapBackendItem(created);
}

export async function updateInventoryItemServer(
  id: number,
  item: Partial<InventoryItem>,
): Promise<InventoryItem> {
  const updated = await updateItem(id, {
    name: item.name,
    unit: item.unit,
    measure: item.measure,
    category: item.category,
    location: item.location ?? item.supplier,
    quantity: item.quantity,
  });
  if (!updated) throw new Error(`Inventory item ${id} not found`);
  return mapBackendItem(updated);
}

export async function deleteInventoryItemServer(id: number): Promise<void> {
  const gone = await deleteItem(id);
  if (!gone) throw new Error(`Inventory item ${id} not found`);
}
