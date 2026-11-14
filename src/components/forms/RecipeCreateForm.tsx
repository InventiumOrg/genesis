"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import RecipeIngredientEditor from "@/components/recipes/RecipeIngredientEditor";
import {
  RecipeIngredientInput,
  emptyIngredientInput,
  ingredientInputToRaw,
} from "@/lib/recipes";
import { useRecipesClient } from "@/lib/recipes-client";

const inputClass =
  "w-full h-10 px-3 border border-gray-300 rounded-sm text-sm dark:border-gray-700 dark:bg-white/[0.03] dark:text-white";

export default function RecipeCreateForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { createRecipe } = useRecipesClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("0");
  const [ingredients, setIngredients] = useState<RecipeIngredientInput[]>([
    emptyIngredientInput(),
  ]);

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
      await createRecipe({ name: recipeName, ingredients: serialized, cost: costNum });
      router.push("/recipes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create recipe.");
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

      <div className="grid grid-cols-1 gap-6">
        <div>
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

        <div>
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

        <div>
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
          {isLoading ? "Creating…" : "Create recipe"}
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
