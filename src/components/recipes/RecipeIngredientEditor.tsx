"use client";

import {
  RecipeIngredientInput,
  emptyIngredientInput,
  ingredientInputFromRaw,
} from "@/lib/recipes";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-700 dark:bg-white/[0.03] dark:text-white";

interface RecipeIngredientEditorProps {
  ingredients: RecipeIngredientInput[];
  onChange: (ingredients: RecipeIngredientInput[]) => void;
}

export default function RecipeIngredientEditor({
  ingredients,
  onChange,
}: RecipeIngredientEditorProps) {
  const rows = ingredients.length > 0 ? ingredients : [emptyIngredientInput()];

  const updateRow = (index: number, patch: Partial<RecipeIngredientInput>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    onChange([...rows, emptyIngredientInput()]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
          <label className="sm:col-span-4 block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Name *</span>
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(index, { name: e.target.value })}
              placeholder="e.g. egg"
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Qty</span>
            <input
              type="number"
              min={0}
              step="any"
              value={row.quantity}
              onChange={(e) => updateRow(index, { quantity: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Measure</span>
            <input
              type="text"
              value={row.measure}
              onChange={(e) => updateRow(index, { measure: e.target.value })}
              placeholder="pcs, g, ml…"
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-3 block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Unit</span>
            <input
              type="text"
              value={row.unit}
              onChange={(e) => updateRow(index, { unit: e.target.value })}
              placeholder="slice, pinch…"
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-1 flex items-end">
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="w-full px-2 py-2 text-sm text-error-600 hover:text-error-700"
                aria-label="Remove ingredient"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="text-sm text-brand-500 hover:text-brand-600"
      >
        + Add ingredient
      </button>
    </div>
  );
}
