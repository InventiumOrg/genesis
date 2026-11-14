/** Recipe reads for Server Components, straight from Postgres. */

import { getRecipe, listRecipes } from '@/server/recipes';

import { uiPagination, type UiPagination } from './pagination';
import { Recipe, RecipeFilters, RECIPES_PER_PAGE, mapBackendRecipe } from './recipes';

export async function fetchRecipesServer(
  filters: RecipeFilters = {},
): Promise<{ recipes: Recipe[]; pagination: UiPagination }> {
  const { search = '', page = 1, limit = RECIPES_PER_PAGE } = filters;
  const { items, pagination } = await listRecipes({ search, page, limit });
  return {
    recipes: items.map((r) => mapBackendRecipe(r as unknown as Record<string, unknown>)),
    pagination: uiPagination(pagination),
  };
}

export async function fetchRecipeServer(id: number): Promise<Recipe> {
  const found = await getRecipe(id);
  if (!found) throw new Error(`Recipe ${id} not found`);
  return mapBackendRecipe(found as unknown as Record<string, unknown>);
}
