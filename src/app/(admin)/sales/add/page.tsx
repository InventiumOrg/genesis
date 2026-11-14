import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SaleCreateForm from "@/components/forms/SaleCreateForm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New sale | Dashboard",
  description: "Create a sale",
};

export default function AddSalePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New sale" />
      <div className="space-y-6">
        <ComponentCard title="Create sale">
          <SaleCreateForm />
        </ComponentCard>
      </div>
    </div>
  );
}
