import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RecipesTableServer from "@/components/tables/RecipesTableServer";
import RecipeFilters from "@/components/tables/RecipeFilters";
import InventoryPagination from "@/components/tables/InventoryPagination";
import { fetchRecipesServer } from "@/lib/recipes-server";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Recipes | Inventium",
  description: "List and manage recipes",
};

interface RecipesPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const { search, page } = params;

  try {
    const { recipes, pagination } = await fetchRecipesServer({
      search,
      page: page ? parseInt(page, 10) : 1,
    });

    return (
      <div>
        <PageBreadcrumb
          pageTitle="Recipes"
          section="Stock"
          sectionHref="/inventory"
          description="What each drink is made of, and what it costs."
          actions={
            <Link href="/recipes/add" className="inline-flex h-10 items-center justify-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400">
              New recipe
            </Link>
          }
        />
        <div className="space-y-6">
          <div className="space-y-4">
              <RecipeFilters />
              <RecipesTableServer recipes={recipes} />
              {pagination.totalPages > 1 && (
                <InventoryPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                />
              )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Recipes" />
        <div className="space-y-6">
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 dark:bg-error-900/20 dark:border-error-800">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Recipes service unavailable
            </h3>
            <p className="mt-1 text-sm text-error-700 dark:text-error-300">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
