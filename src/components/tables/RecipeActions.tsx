"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import { useRecipesClient } from "@/lib/recipes-client";

interface RecipeActionsProps {
  recipeId: number;
}

export default function RecipeActions({ recipeId }: RecipeActionsProps) {
  const router = useRouter();
  const { deleteRecipe } = useRecipesClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    router.push(`/recipes/${recipeId}`);
  };

  const handleEdit = () => {
    router.push(`/recipes/edit/${recipeId}`);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this recipe? This cannot be undone."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteRecipe(recipeId);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Failed to delete recipe."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={handleView}>
        View
      </Button>
      <Button size="sm" variant="outline" onClick={handleEdit}>
        Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 disabled:opacity-50"
      >
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </div>
  );
}
