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
import { createSale } from '@/server/sales';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const body = await readBody(request);
    const payload = {
      posId: num(one(body, 'posId', 'PosID', 'pos_id'), 0) as number,
      recipeId: num(one(body, 'recipeId', 'RecipeID', 'recipe_id'), 0) as number,
      price: num(one(body, 'price', 'Price'), 0),
      quantity: num(one(body, 'quantity', 'Quantity'), 1),
    };
    if (!payload.posId || !payload.recipeId) return badRequest('A sale needs a point of sale and a recipe');
    return data(await createSale(payload), 201);
  });
}
