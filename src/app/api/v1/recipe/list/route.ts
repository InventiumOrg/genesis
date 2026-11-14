import { NextResponse } from 'next/server';

import { handle, listParams, requireUser, unauthorized } from '@/server/http';
import { listRecipes } from '@/server/recipes';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const { items, pagination } = await listRecipes(listParams(request, 10));
    return NextResponse.json({ items, recipes: items, pagination });
  });
}
