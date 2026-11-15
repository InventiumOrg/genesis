import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import RecipeActions from "./RecipeActions";
import RecipeIngredientsDisplay from "@/components/recipes/RecipeIngredientsDisplay";
import Money from "@/components/common/Money";
import { Recipe } from "@/lib/recipes";

interface RecipesTableServerProps {
  recipes: Recipe[];
}

export default function RecipesTableServer({ recipes }: RecipesTableServerProps) {
  return (
    <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="">
              <TableRow>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  ID
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Name
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Ingredients
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Cost
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className="px-5 py-4 text-start font-mono text-theme-sm text-gray-800 dark:text-white/90">
                      {recipe.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {recipe.name || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm max-w-md">
                      <RecipeIngredientsDisplay ingredients={recipe.ingredients} variant="compact" />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-white/90">
                      <Money cents={recipe.cost} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <RecipeActions recipeId={recipe.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="col-span-full">No recipes found.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
