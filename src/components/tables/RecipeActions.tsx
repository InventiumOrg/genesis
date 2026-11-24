"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { useRecipesClient } from "@/lib/recipes-client";
import IconAction from "./IconAction";

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
    <div className="flex items-center justify-end gap-1">
      <IconAction label="View recipe" onClick={handleView} icon={<EyeIcon />} />
      <IconAction label="Edit recipe" onClick={handleEdit} icon={<PencilIcon />} />
      <IconAction
        label="Delete recipe"
        onClick={handleDelete}
        icon={<TrashBinIcon />}
        tone="danger"
        busy={isDeleting}
      />
    </div>
  );
}
