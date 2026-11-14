import { NextResponse } from 'next/server';

import { badRequest, handle, requireUser, unauthorized } from '@/server/http';
import { listTransactions } from '@/server/transactions';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ inventoryId: string }> };

export async function GET(request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const { inventoryId } = await ctx.params;
    const id = Number.parseInt(inventoryId, 10);
    if (!Number.isFinite(id)) return badRequest('Invalid inventory id');

    const url = new URL(request.url);
    const typeRaw = (url.searchParams.get('type') ?? '').toUpperCase();
    const limit = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);

    const result = await listTransactions({
      inventoryId: id,
      type: typeRaw === 'IMPORT' || typeRaw === 'EXPORT' ? typeRaw : undefined,
      limit: Number.isFinite(limit) ? limit : 20,
      cursor: url.searchParams.get('cursor') ?? undefined,
    });

    return NextResponse.json(result);
  });
}
