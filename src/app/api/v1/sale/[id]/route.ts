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
import { getSale, updateSale, deleteSale } from '@/server/sales';

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
    const found = await getSale(id);
    return found ? data(found) : notFound('Sale');
  });
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const body = await readBody(request);
    const payload = {
      posId: num(one(body, 'posId', 'PosID', 'pos_id'), 0) as number,
      recipeId: num(one(body, 'recipeId', 'RecipeID', 'recipe_id'), 0) as number,
      price: num(one(body, 'price', 'Price'), 0),
      quantity: num(one(body, 'quantity', 'Quantity'), 1),
    };
    const updated = await updateSale(id, payload);
    return updated ? data(updated) : notFound('Sale');
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const gone = await deleteSale(id);
    return gone ? NextResponse.json({ data: { id } }) : notFound('Sale');
  });
}
