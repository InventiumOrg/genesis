"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RecipeIngredientEditor from "@/components/recipes/RecipeIngredientEditor";
import type { Recipe } from "@/lib/recipes";
import {
  RecipeIngredientInput,
  emptyIngredientInput,
  formatRecipeCost,
  ingredientInputFromRaw,
  ingredientInputToRaw,
} from "@/lib/recipes";
import { useRecipesClient } from "@/lib/recipes-client";

const inputClass =
  "w-full h-10 px-3 border border-gray-300 rounded-sm text-sm dark:border-gray-700 dark:bg-white/[0.03] dark:text-white";

export default function RecipeEditForm({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { updateRecipe } = useRecipesClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(recipe.name);
  const [cost, setCost] = useState(String(recipe.cost));
  const [ingredients, setIngredients] = useState<RecipeIngredientInput[]>(
    recipe.ingredients.length > 0
      ? recipe.ingredients.map(ingredientInputFromRaw)
      : [emptyIngredientInput()]
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setError(null);
    const recipeName = name.trim();
    const serialized = ingredients.map(ingredientInputToRaw).filter(Boolean);
    const costNum = Number(cost);

    if (!recipeName) {
      setError("Name is required.");
      return;
    }
    if (serialized.length === 0) {
      setError("Add at least one ingredient with a name.");
      return;
    }
    if (!Number.isFinite(costNum) || costNum < 0) {
      setError("Cost must be a valid non-negative number.");
      return;
    }

    setIsLoading(true);
    try {
      await updateRecipe(recipe.id, {
        name: recipeName,
        ingredients: serialized,
        cost: costNum,
      });
      router.push("/recipes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-error-50 border border-error-200 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:border-error-800 dark:text-error-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">ID</p>
          <p className="font-mono text-gray-900 dark:text-white">{recipe.id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current cost</p>
          <p className="text-gray-900 dark:text-white">{formatRecipeCost(recipe.cost)}</p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="name" className="label-cap mb-1.5 block">
            Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="cost" className="label-cap mb-1.5 block">
            Cost *
          </label>
          <input
            id="cost"
            type="number"
            min={0}
            step={1}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <span className="mb-2 label-cap mb-1.5 block">
            Ingredients *
          </span>
          <RecipeIngredientEditor ingredients={ingredients} onChange={setIngredients} />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-3 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:opacity-50"
        >
          {isLoading ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/recipes")}
          className="px-5 py-3 text-sm ring-1 ring-gray-300 rounded-lg dark:ring-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
