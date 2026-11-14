import {
  formatRecipeIngredient,
  parseRecipeIngredient,
} from "@/lib/recipes";

interface RecipeIngredientsDisplayProps {
  ingredients: string[];
  /** compact = inline chips for tables; list = bullet list for detail pages */
  variant?: "compact" | "list";
}

export default function RecipeIngredientsDisplay({
  ingredients,
  variant = "compact",
}: RecipeIngredientsDisplayProps) {
  if (ingredients.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  if (variant === "list") {
    return (
      <ul className="space-y-2">
        {ingredients.map((raw, index) => {
          const item = parseRecipeIngredient(raw);
          const label = formatRecipeIngredient(raw);
          return (
            <li
              key={`${raw}-${index}`}
              className="flex items-baseline gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/40"
            >
              {item?.quantity != null && (
                <span className="shrink-0 text-lg font-semibold tabular-nums text-brand-600 dark:text-brand-400">
                  {item.quantity}
                  {item.measure ? (
                    <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                      {item.measure}
                    </span>
                  ) : null}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white/90 capitalize">
                  {item?.name ?? label}
                </p>
                {item?.unit && item.unit !== item.measure && item.unit !== item.name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Unit: {item.unit}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {ingredients.map((raw, index) => (
        <li
          key={`${raw}-${index}`}
          className="inline-flex items-center rounded-sm bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300 mr-1 mb-1"
        >
          {formatRecipeIngredient(raw)}
        </li>
      ))}
    </ul>
  );
}
