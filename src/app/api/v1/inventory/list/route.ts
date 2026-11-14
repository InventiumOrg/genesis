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
import { listInventory } from '@/server/inventory';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const { items, pagination } = await listInventory(listParams(request, 5));
    return NextResponse.json({ items: items, pagination });
  });
}
