import { NextResponse } from 'next/server';

import {
  badRequest,
  data,
  handle,
  listParams,
  notFound,
  num,
  one,
  readBody,
  requireUser,
  unauthorized,
} from '@/server/http';
import { getInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/server/inventory';

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
    const found = await getInventoryItem(id);
    return found ? data(found) : notFound('Inventory item');
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
      unit: one(body, 'unit', 'Unit'),
      measure: one(body, 'measure', 'Measure'),
      category: one(body, 'category', 'Category'),
      location: one(body, 'location', 'Location'),
      quantity: num(one(body, 'quantity', 'Quantity'), 0),
    };
    const updated = await updateInventoryItem(id, payload);
    return updated ? data(updated) : notFound('Inventory item');
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const gone = await deleteInventoryItem(id);
    return gone ? NextResponse.json({ data: { id } }) : notFound('Inventory item');
  });
}
