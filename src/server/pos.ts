/** Points of sale. An inactive terminal is out of play, never an alarm. */

import { desc, eq, ilike, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import { pointsOfSale, warehouses } from '@/db/schema';

import { paginate, type Pagination } from './shared';

export type BackendPosRow = {
  ID: number;
  Name: string;
  Location: string;
  Status: string;
  WarehouseID: number | null;
  WarehouseName: string;
  /** Null when nobody recorded them; never defaulted to 0, which is a place. */
  Latitude: number | null;
  Longitude: number | null;
  CreatedAt: string;
};

export type PosInput = {
  name: string;
  location?: string;
  status?: string;
  warehouseId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

const selection = {
  ID: pointsOfSale.id,
  Name: pointsOfSale.name,
  Location: pointsOfSale.location,
  Status: pointsOfSale.status,
  WarehouseID: pointsOfSale.warehouseId,
  WarehouseName: sql<string>`coalesce(${warehouses.name}, '')`,
  Latitude: pointsOfSale.latitude,
  Longitude: pointsOfSale.longitude,
  CreatedAt: pointsOfSale.createdAt,
};

function row(r: Record<string, unknown>): BackendPosRow {
  return {
    ID: Number(r.ID),
    Name: String(r.Name ?? ''),
    Location: String(r.Location ?? ''),
    Status: String(r.Status ?? 'active'),
    WarehouseID: r.WarehouseID == null ? null : Number(r.WarehouseID),
    WarehouseName: String(r.WarehouseName ?? ''),
    Latitude: r.Latitude == null ? null : Number(r.Latitude),
    Longitude: r.Longitude == null ? null : Number(r.Longitude),
    CreatedAt: (r.CreatedAt instanceof Date ? r.CreatedAt : new Date()).toISOString(),
  };
}

export async function listPos(
  filters: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: BackendPosRow[]; pagination: Pagination }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const needle = filters.search?.trim();
  const where = needle
    ? or(ilike(pointsOfSale.name, `%${needle}%`), ilike(pointsOfSale.location, `%${needle}%`))
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pointsOfSale)
    .where(where);

  const rows = await db
    .select(selection)
    .from(pointsOfSale)
    .leftJoin(warehouses, eq(pointsOfSale.warehouseId, warehouses.id))
    .where(where)
    .orderBy(desc(pointsOfSale.id))
    .limit(limit)
    .offset((page - 1) * limit);

  return { items: rows.map(row), pagination: paginate(Number(count), page, limit) };
}

export async function getPos(id: number): Promise<BackendPosRow | null> {
  const [found] = await db
    .select(selection)
    .from(pointsOfSale)
    .leftJoin(warehouses, eq(pointsOfSale.warehouseId, warehouses.id))
    .where(eq(pointsOfSale.id, id));
  return found ? row(found) : null;
}

export async function createPos(input: PosInput): Promise<BackendPosRow> {
  const [created] = await db
    .insert(pointsOfSale)
    .values({
      name: input.name,
      location: input.location ?? '',
      status: input.status ?? 'active',
      warehouseId: input.warehouseId ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .returning({ id: pointsOfSale.id });
  return (await getPos(created.id))!;
}

export async function updatePos(id: number, input: Partial<PosInput>): Promise<BackendPosRow | null> {
  const [existing] = await db.select().from(pointsOfSale).where(eq(pointsOfSale.id, id));
  if (!existing) return null;
  await db
    .update(pointsOfSale)
    .set({
      name: input.name ?? existing.name,
      location: input.location ?? existing.location,
      status: input.status ?? existing.status,
      warehouseId: input.warehouseId === undefined ? existing.warehouseId : input.warehouseId,
      latitude: input.latitude === undefined ? existing.latitude : input.latitude,
      longitude: input.longitude === undefined ? existing.longitude : input.longitude,
    })
    .where(eq(pointsOfSale.id, id));
  return getPos(id);
}

export async function deletePos(id: number): Promise<boolean> {
  const gone = await db.delete(pointsOfSale).where(eq(pointsOfSale.id, id)).returning({ id: pointsOfSale.id });
  return gone.length > 0;
}
