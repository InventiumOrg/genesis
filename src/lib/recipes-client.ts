import { useCallback } from "react";
import { useApiClient } from "./api-client";
import { Recipe, mapBackendRecipe, recipeToFormBody } from "./recipes";

function parseRecipeResponse(response: unknown): Recipe {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (r.data && typeof r.data === "object") {
      return mapBackendRecipe(r.data as Record<string, unknown>);
    }
    if ("ID" in r || "id" in r) {
      return mapBackendRecipe(r);
    }
  }
  throw new Error("Invalid response format");
}

export function useRecipesClient() {
  const { apiRequest } = useApiClient("recipe");

  const createRecipe = useCallback(
    async (input: Omit<Recipe, "id">): Promise<Recipe> => {
      const response = await apiRequest<unknown>("/create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: recipeToFormBody(input).toString(),
      });
      return parseRecipeResponse(response);
    },
    [apiRequest]
  );

  const updateRecipe = useCallback(
    async (id: number, input: Omit<Recipe, "id">): Promise<Recipe> => {
      const response = await apiRequest<unknown>(`/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: recipeToFormBody(input).toString(),
      });
      return parseRecipeResponse(response);
    },
    [apiRequest]
  );

  const deleteRecipe = useCallback(
    async (id: number): Promise<void> => {
      await apiRequest(`/${id}`, { method: "DELETE" });
    },
    [apiRequest]
  );

  return { createRecipe, updateRecipe, deleteRecipe };
}
