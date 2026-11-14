import { NextResponse } from 'next/server';

import { badRequest, data, handle, notFound, readBody, requireUser, unauthorized } from '@/server/http';
import { recipeInputFrom } from '@/server/recipe-input';
import { deleteRecipe, getRecipe, updateRecipe } from '@/server/recipes';

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
    const found = await getRecipe(id);
    return found ? data(found) : notFound('Recipe');
  });
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const updated = await updateRecipe(id, recipeInputFrom(await readBody(request)));
    return updated ? data(updated) : notFound('Recipe');
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const id = await idFrom(ctx);
    if (id === null) return badRequest('Invalid id');
    const gone = await deleteRecipe(id);
    return gone ? NextResponse.json({ data: { id } }) : notFound('Recipe');
  });
}
