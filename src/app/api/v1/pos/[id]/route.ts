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
import { getPos, updatePos, deletePos } from '@/server/pos';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function idFrom(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number.parseInt(id, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET(_request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const found = await getPos(id);
    return found ? data(found) : notFound('Point of sale');
  });
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const body = await readBody(request);
    const payload = {
      name: one(body, 'name', 'Name') ?? '',
      location: one(body, 'location', 'Location'),
      status: one(body, 'status', 'Status'),
      warehouseId: num(one(body, 'warehouseId', 'WarehouseID', 'warehouse_id')) ?? null,
      latitude: nullableNum(body, 'latitude', 'Latitude'),
      longitude: nullableNum(body, 'longitude', 'Longitude'),
    };
    const updated = await updatePos(id, payload);
    return updated ? data(updated) : notFound('Point of sale');
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const gone = await deletePos(id);
    return gone ? NextResponse.json({ data: { id } }) : notFound('Point of sale');
  });
}
