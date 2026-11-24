import { NextResponse } from 'next/server';

import {
  badRequest,
  data,
  handle,
  listParams,
  notFound,
  nullableNum,
  num,
  one,
  readBody,
  requireUser,
  unauthorized,
} from '@/server/http';
import { createPos } from '@/server/pos';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const body = await readBody(request);
    const payload = {
      name: one(body, 'name', 'Name') ?? '',
      location: one(body, 'location', 'Location'),
      status: one(body, 'status', 'Status'),
      warehouseId: num(one(body, 'warehouseId', 'WarehouseID', 'warehouse_id')) ?? null,
      latitude: nullableNum(body, 'latitude', 'Latitude'),
      longitude: nullableNum(body, 'longitude', 'Longitude'),
    };
    if (!payload.name.trim()) return badRequest('A name is required');
    return data(await createPos(payload), 201);
  });
}
