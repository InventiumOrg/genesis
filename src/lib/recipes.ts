export interface RecipeIngredient {
  name: string;
  unit?: string;
  measure?: string;
  quantity?: number;
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  cost: number;
}

export interface RecipeIngredientInput {
  name: string;
  unit: string;
  measure: string;
  quantity: string;
}

export interface RecipeFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const RECIPES_PER_PAGE = 10;

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (raw[k] !== undefined && raw[k] !== null) return raw[k];
  }
  return undefined;
}

function ingredientToString(item: unknown): string {
  if (item === null || item === undefined) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (typeof item === "object") {
    try {
      return JSON.stringify(item);
    } catch {
      return String(item);
    }
  }
  return String(item).trim();
}

function parseIngredients(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(ingredientToString).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parseIngredients(parsed);
      if (parsed && typeof parsed === "object") return [JSON.stringify(parsed)];
    } catch {
      // Not JSON — treat as comma-separated plain text.
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (raw && typeof raw === "object") {
    return [JSON.stringify(raw)];
  }
  return [];
}

/** Parse a stored ingredient string into a structured object. */
export function parseRecipeIngredient(raw: string): RecipeIngredient | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const quantityRaw = pick(parsed as Record<string, unknown>, "quantity", "Quantity");
      const quantity =
        typeof quantityRaw === "number"
          ? quantityRaw
          : quantityRaw != null && quantityRaw !== ""
            ? Number(quantityRaw)
            : undefined;

      return {
        name: String(pick(parsed as Record<string, unknown>, "name", "Name") ?? "").trim(),
        unit: String(pick(parsed as Record<string, unknown>, "unit", "Unit") ?? "").trim() || undefined,
        measure: String(pick(parsed as Record<string, unknown>, "measure", "Measure") ?? "").trim() || undefined,
        quantity: Number.isFinite(quantity) ? quantity : undefined,
      };
    }
  } catch {
    // plain text ingredient
  }

  return { name: trimmed };
}

/** e.g. "2 pcs egg", "10 g butter · slice", "1 pinch salt" */
export function formatRecipeIngredient(ingredient: string): string {
  const item = parseRecipeIngredient(ingredient);
  if (!item?.name) return ingredient.trim();

  const { name, unit, measure, quantity } = item;
  const parts: string[] = [];

  if (quantity != null && Number.isFinite(quantity)) {
    parts.push(measure ? `${quantity} ${measure}` : String(quantity));
  } else if (measure) {
    parts.push(measure);
  }

  parts.push(name);

  let label = parts.join(" ");

  if (unit && unit !== measure && unit !== name) {
    label += ` · ${unit}`;
  }

  return label;
}

export function emptyIngredientInput(): RecipeIngredientInput {
  return { name: "", unit: "", measure: "", quantity: "1" };
}

export function ingredientInputFromRaw(raw: string): RecipeIngredientInput {
  const parsed = parseRecipeIngredient(raw);
  if (!parsed) return emptyIngredientInput();

  return {
    name: parsed.name,
    unit: parsed.unit ?? "",
    measure: parsed.measure ?? "",
    quantity: parsed.quantity != null ? String(parsed.quantity) : "1",
  };
}

export function ingredientInputToRaw(input: RecipeIngredientInput): string {
  const name = input.name.trim();
  if (!name) return "";

  const quantity = Number(input.quantity);
  const payload: RecipeIngredient = { name };

  const unit = input.unit.trim();
  const measure = input.measure.trim();
  if (unit) payload.unit = unit;
  if (measure) payload.measure = measure;
  if (Number.isFinite(quantity) && quantity > 0) payload.quantity = quantity;

  return JSON.stringify(payload);
}

export function mapBackendRecipe(raw: Record<string, unknown>): Recipe {
  const costRaw = pick(raw, "Cost", "cost");
  return {
    id: Number(pick(raw, "ID", "id") ?? 0),
    name: String(pick(raw, "Name", "name") ?? ""),
    ingredients: parseIngredients(pick(raw, "Ingredients", "ingredients")),
    cost: typeof costRaw === "number" ? costRaw : Number(costRaw ?? 0),
  };
}

/** Build application/x-www-form-urlencoded body for create/update. */
export function recipeToFormBody(
  input: Pick<Recipe, "name" | "ingredients" | "cost">
): URLSearchParams {
  const formData = new URLSearchParams();
  formData.append("name", input.name.trim());
  input.ingredients
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => formData.append("ingredients", item));
  formData.append("cost", String(Math.max(0, Math.floor(input.cost))));
  return formData;
}

export function formatRecipeCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cost);
}
