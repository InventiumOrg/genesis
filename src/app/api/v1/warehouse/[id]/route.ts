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
import { getWarehouse, updateWarehouse, deleteWarehouse } from '@/server/warehouses';

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
    const found = await getWarehouse(id);
    return found ? data(found) : notFound('Warehouse');
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
      address: one(body, 'address', 'Address'),
      ward: one(body, 'ward', 'Ward'),
      district: one(body, 'district', 'District'),
      city: one(body, 'city', 'City'),
      country: one(body, 'country', 'Country'),
      latitude: nullableNum(body, 'latitude', 'Latitude'),
      longitude: nullableNum(body, 'longitude', 'Longitude'),
    };
    const updated = await updateWarehouse(id, payload);
    return updated ? data(updated) : notFound('Warehouse');
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const gone = await deleteWarehouse(id);
    return gone ? NextResponse.json({ data: { id } }) : notFound('Warehouse');
  });
}
