import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { RecipeEditFormShell } from "@/components/forms/RecipeEditFormShell";
import { fetchRecipeServer } from "@/lib/recipes-server";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit recipe | Dashboard",
  description: "Edit recipe",
};

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);
  if (isNaN(recipeId)) notFound();

  try {
    const recipe = await fetchRecipeServer(recipeId);

    return (
      <div>
        <PageBreadcrumb pageTitle={`Edit recipe #${recipeId}`} />
        <div className="space-y-6">
          <ComponentCard title={`Recipe #${recipe.id}`}>
            <RecipeEditFormShell recipe={recipe} />
          </ComponentCard>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch recipe:", error);
    notFound();
  }
}
