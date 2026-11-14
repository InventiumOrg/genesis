import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { fetchRecipeServer } from "@/lib/recipes-server";
import { formatRecipeCost } from "@/lib/recipes";
import RecipeIngredientsDisplay from "@/components/recipes/RecipeIngredientsDisplay";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Recipe | Dashboard",
  description: "Recipe details",
};

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { id } = await params;
  const recipeId = parseInt(id, 10);
  if (isNaN(recipeId)) notFound();

  try {
    const recipe = await fetchRecipeServer(recipeId);

    return (
      <div>
        <PageBreadcrumb pageTitle={`Recipe #${recipe.id}`} />
        <div className="space-y-6">
          <ComponentCard title={recipe.name || `Recipe #${recipe.id}`}>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">ID</dt>
                <dd className="font-mono text-gray-900 dark:text-white mt-1">
                  {recipe.id}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Cost</dt>
                <dd className="text-gray-900 dark:text-white mt-1">
                  {formatRecipeCost(recipe.cost)}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-gray-500 dark:text-gray-400 mb-2">Ingredients</dt>
                <dd>
                  <RecipeIngredientsDisplay
                    ingredients={recipe.ingredients}
                    variant="list"
                  />
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={`/recipes/edit/${recipe.id}`}
                className="inline-flex items-center px-4 py-2 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Edit
              </Link>
              <Link
                href="/recipes"
                className="inline-flex items-center px-4 py-2 text-sm ring-1 ring-gray-300 rounded-lg dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                Back to list
              </Link>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
