import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RecipeCreateForm from "@/components/forms/RecipeCreateForm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New recipe | Dashboard",
  description: "Create a recipe",
};

export default function AddRecipePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New recipe" />
      <div className="space-y-6">
        <ComponentCard title="Create recipe">
          <RecipeCreateForm />
        </ComponentCard>
      </div>
    </div>
  );
}
