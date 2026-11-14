import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderCreateForm from "@/components/forms/OrderCreateForm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New order | Dashboard",
  description: "Create a new order",
};

export default function AddOrderPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="New order" />
      <div className="space-y-6">
        <ComponentCard title="Create order">
          <OrderCreateForm />
        </ComponentCard>
      </div>
    </div>
  );
}
