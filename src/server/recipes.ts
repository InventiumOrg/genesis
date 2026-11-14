/**
 * Recipes: the hinge between a sale and the stock it consumes.
 *
 * Ingredients are returned as objects; `mapBackendRecipe` stringifies each one
 * and `parseRecipeIngredient` reads it back, so the existing screens get the
 * structured name/unit/measure/quantity they already know how to render.
 */

import { asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm';

import { db } from '@/db';
import { inventoryItems, recipeIngredients, recipes } from '@/db/schema';

import { paginate, type Pagination } from './shared';

export type BackendIngredient = {
  Name: string;
  Unit: string;
  Measure: string;
  Quantity: number;
  InventoryItemID: number | null;
};

export type BackendRecipeRow = {
  ID: number;
  Name: string;
  Cost: number;
  Ingredients: BackendIngredient[];
  CreatedAt: string;
};

export type RecipeInput = {
  name: string;
  cost?: number;
  ingredients?: { name: string; unit?: string; measure?: string; quantity?: number }[];
};

async function ingredientsFor(recipeIds: number[]): Promise<Map<number, BackendIngredient[]>> {
  const map = new Map<number, BackendIngredient[]>();
  if (recipeIds.length === 0) return map;

  const rows = await db
    .select()
    .from(recipeIngredients)
    .where(inArray(recipeIngredients.recipeId, recipeIds))
    .orderBy(asc(recipeIngredients.id));

  for (const r of rows) {
    const list = map.get(r.recipeId) ?? [];
    list.push({
      Name: r.name,
      Unit: r.unit,
      Measure: r.measure,
      Quantity: r.quantity,
      InventoryItemID: r.inventoryItemId,
    });
    map.set(r.recipeId, list);
  }
  return map;
}

export async function listRecipes(
  filters: { search?: string; page?: number; limit?: number } = {},
): Promise<{ items: BackendRecipeRow[]; pagination: Pagination }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, filters.limit ?? 10);
  const where = filters.search?.trim()
    ? ilike(recipes.name, `%${filters.search.trim()}%`)
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recipes)
    .where(where);

  const rows = await db
    .select()
    .from(recipes)
    .where(where)
    .orderBy(desc(recipes.id))
    .limit(limit)
    .offset((page - 1) * limit);

  const ing = await ingredientsFor(rows.map((r) => r.id));

  return {
    items: rows.map((r) => ({
      ID: r.id,
      Name: r.name,
      Cost: r.cost,
      Ingredients: ing.get(r.id) ?? [],
      CreatedAt: r.createdAt.toISOString(),
    })),
    pagination: paginate(Number(count), page, limit),
  };
}

export async function getRecipe(id: number): Promise<BackendRecipeRow | null> {
  const [found] = await db.select().from(recipes).where(eq(recipes.id, id));
  if (!found) return null;
  const ing = await ingredientsFor([id]);
  return {
    ID: found.id,
    Name: found.name,
    Cost: found.cost,
    Ingredients: ing.get(id) ?? [],
    CreatedAt: found.createdAt.toISOString(),
  };
}

/** Link an ingredient line to a stock item by name, so a sale can draw it down. */
async function resolveInventoryId(name: string): Promise<number | null> {
  if (!name.trim()) return null;
  const [match] = await db
    .select({ id: inventoryItems.id })
    .from(inventoryItems)
    .where(ilike(inventoryItems.name, name.trim()))
    .limit(1);
  return match?.id ?? null;
}

export async function createRecipe(input: RecipeInput): Promise<BackendRecipeRow> {
  const id = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(recipes)
      .values({ name: input.name, cost: Math.round(Number(input.cost ?? 0)) })
      .returning();

    for (const line of input.ingredients ?? []) {
      await tx.insert(recipeIngredients).values({
        recipeId: created.id,
        inventoryItemId: await resolveInventoryId(line.name),
        name: line.name,
        unit: line.unit ?? '',
        measure: line.measure ?? '',
        quantity: Number(line.quantity ?? 0),
      });
    }
    return created.id;
  });

  return (await getRecipe(id))!;
}

export async function updateRecipe(
  id: number,
  input: Partial<RecipeInput>,
): Promise<BackendRecipeRow | null> {
  const exists = await db.select({ id: recipes.id }).from(recipes).where(eq(recipes.id, id));
  if (exists.length === 0) return null;

  await db.transaction(async (tx) => {
    await tx
      .update(recipes)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.cost !== undefined ? { cost: Math.round(Number(input.cost)) } : {}),
      })
      .where(eq(recipes.id, id));

    if (input.ingredients) {
      await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
      for (const line of input.ingredients) {
        await tx.insert(recipeIngredients).values({
          recipeId: id,
          inventoryItemId: await resolveInventoryId(line.name),
          name: line.name,
          unit: line.unit ?? '',
          measure: line.measure ?? '',
          quantity: Number(line.quantity ?? 0),
        });
      }
    }
  });

  return getRecipe(id);
}

export async function deleteRecipe(id: number): Promise<boolean> {
  const gone = await db.delete(recipes).where(eq(recipes.id, id)).returning({ id: recipes.id });
  return gone.length > 0;
}
