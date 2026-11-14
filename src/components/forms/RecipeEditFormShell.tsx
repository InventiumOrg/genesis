"use client";

import dynamic from "next/dynamic";
import type { Recipe } from "@/lib/recipes";

const RecipeEditForm = dynamic(() => import("./RecipeEditForm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-10 text-gray-500">
      Loading editor…
    </div>
  ),
});

export function RecipeEditFormShell({ recipe }: { recipe: Recipe }) {
  return <RecipeEditForm recipe={recipe} />;
}
