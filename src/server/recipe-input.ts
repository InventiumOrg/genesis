/**
 * The recipe screens post their ingredients as repeated form fields, each one
 * a string that may be JSON or plain text. `parseRecipeIngredient` already
 * knows both dialects, so the HTTP layer reuses it rather than inventing a
 * second parser that would drift from the one the UI reads with.
 */

import { parseRecipeIngredient } from '@/lib/recipes';
import type { Body } from '@/server/http';
import { many, num, one } from '@/server/http';

export function recipeInputFrom(body: Body) {
  const ingredients = many(body, 'ingredients', 'Ingredients')
    .map((raw) => parseRecipeIngredient(raw))
    .filter((i): i is NonNullable<typeof i> => Boolean(i && i.name))
    .map((i) => ({
      name: i.name,
      unit: i.unit ?? '',
      measure: i.measure ?? '',
      quantity: i.quantity ?? 0,
    }));

  return {
    name: (one(body, 'name', 'Name') ?? '').trim(),
    cost: num(one(body, 'cost', 'Cost'), 0),
    ingredients,
  };
}
