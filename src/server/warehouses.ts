/** Warehouses and their storage rooms. */

import { desc, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import { storageRooms, warehouses } from '@/db/schema';

import { paginate, type Pagination } from './shared';

export type BackendWarehouseRow = {
  ID: number;
  Name: string;
  Address: string;
  Ward: string;
  District: string;
  City: string;
  Country: string;
  /** Null when nobody recorded them; never defaulted to 0, which is a place. */
  Latitude: number | null;
  Longitude: number | null;
  CreatedAt: string;
};

export type WarehouseInput = {
  name: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
};

function row(r: typeof warehouses.$inferSelect): BackendWarehouseRow {
  return {
    ID: r.id,
    Name: r.name,
    Address: r.address,
    Ward: r.ward,
    District: r.district,
    City: r.city,
    Country: r.country,
    Latitude: r.latitude,
    Longitude: r.longitude,
    CreatedAt: r.createdAt.toISOString(),
  };
}

export async function listWarehouses(
  filters: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: BackendWarehouseRow[]; pagination: Pagination }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const needle = filters.search?.trim();
  const where = needle
    ? or(
        ilike(warehouses.name, `%${needle}%`),
        ilike(warehouses.city, `%${needle}%`),
        ilike(warehouses.district, `%${needle}%`),
      )
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(warehouses)
    .where(where);

  const rows = await db
    .select()
    .from(warehouses)
    .where(where)
    .orderBy(desc(warehouses.id))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items: rows.map(row), pagination: paginate(Number(count), page, limit) };
}

export async function getWarehouse(id: number): Promise<BackendWarehouseRow | null> {
  const [found] = await db.select().from(warehouses).where(eq(warehouses.id, id));
  return found ? row(found) : null;
}

export async function createWarehouse(input: WarehouseInput): Promise<BackendWarehouseRow> {
  const [created] = await db
    .insert(warehouses)
    .values({
      name: input.name,
      address: input.address ?? '',
      ward: input.ward ?? '',
      district: input.district ?? '',
      city: input.city ?? '',
      country: input.country ?? '',
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .returning();
  return row(created);
}

export async function updateWarehouse(
  id: number,
  input: Partial<WarehouseInput>,
): Promise<BackendWarehouseRow | null> {
  const [existing] = await db.select().from(warehouses).where(eq(warehouses.id, id));
  if (!existing) return null;
  const [updated] = await db
    .update(warehouses)
    .set({
      name: input.name ?? existing.name,
      address: input.address ?? existing.address,
      ward: input.ward ?? existing.ward,
      district: input.district ?? existing.district,
      city: input.city ?? existing.city,
      country: input.country ?? existing.country,
      latitude: input.latitude === undefined ? existing.latitude : input.latitude,
      longitude: input.longitude === undefined ? existing.longitude : input.longitude,
    })
    .where(eq(warehouses.id, id))
    .returning();
  return row(updated);
}

export async function deleteWarehouse(id: number): Promise<boolean> {
  const gone = await db.delete(warehouses).where(eq(warehouses.id, id)).returning({ id: warehouses.id });
  return gone.length > 0;
}

export async function listStorageRooms(warehouseId: number) {
  const rows = await db
    .select()
    .from(storageRooms)
    .where(eq(storageRooms.warehouseId, warehouseId))
    .orderBy(storageRooms.id);
  return rows.map((r) => ({
    ID: r.id,
    WarehouseID: r.warehouseId,
    Name: r.name,
    CreatedAt: r.createdAt.toISOString(),
  }));
}

export async function createStorageRoom(warehouseId: number, name: string) {
  const [created] = await db.insert(storageRooms).values({ warehouseId, name }).returning();
  return {
    ID: created.id,
    WarehouseID: created.warehouseId,
    Name: created.name,
    CreatedAt: created.createdAt.toISOString(),
  };
}

export async function deleteStorageRoom(id: number): Promise<boolean> {
  const gone = await db.delete(storageRooms).where(eq(storageRooms.id, id)).returning({ id: storageRooms.id });
  return gone.length > 0;
}
