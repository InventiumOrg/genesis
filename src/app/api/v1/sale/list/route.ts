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
import { listSales } from '@/server/sales';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const { items, pagination } = await listSales(listParams(request, 10));
    return NextResponse.json({ sales: items, pagination });
  });
}
