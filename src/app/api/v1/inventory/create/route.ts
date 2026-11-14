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
import { createInventoryItem } from '@/server/inventory';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const body = await readBody(request);
    const payload = {
      name: one(body, 'name', 'Name') ?? '',
      unit: one(body, 'unit', 'Unit'),
      measure: one(body, 'measure', 'Measure'),
      category: one(body, 'category', 'Category'),
      location: one(body, 'location', 'Location'),
      quantity: num(one(body, 'quantity', 'Quantity'), 0),
    };
    if (!payload.name.trim()) return badRequest('A name is required');
    return data(await createInventoryItem(payload), 201);
  });
}
