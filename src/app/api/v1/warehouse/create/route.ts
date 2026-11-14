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
import { createWarehouse } from '@/server/warehouses';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const body = await readBody(request);
    const payload = {
      name: one(body, 'name', 'Name') ?? '',
      address: one(body, 'address', 'Address'),
      ward: one(body, 'ward', 'Ward'),
      district: one(body, 'district', 'District'),
      city: one(body, 'city', 'City'),
      country: one(body, 'country', 'Country'),
    };
    if (!payload.name.trim()) return badRequest('A name is required');
    return data(await createWarehouse(payload), 201);
  });
}
