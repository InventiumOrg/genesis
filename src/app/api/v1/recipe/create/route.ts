import { badRequest, data, handle, readBody, requireUser, unauthorized } from '@/server/http';
import { recipeInputFrom } from '@/server/recipe-input';
import { createRecipe } from '@/server/recipes';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!(await requireUser())) return unauthorized();
  return handle(async () => {
    const payload = recipeInputFrom(await readBody(request));
    if (!payload.name) return badRequest('A recipe needs a name');
    return data(await createRecipe(payload), 201);
  });
}
