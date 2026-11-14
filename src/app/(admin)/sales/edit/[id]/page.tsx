import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { SaleEditFormShell } from "@/components/forms/SaleEditFormShell";
import { fetchSaleServer } from "@/lib/sales-server";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit sale | Dashboard",
  description: "Edit sale",
};

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { id } = await params;
  const saleId = parseInt(id, 10);
  if (isNaN(saleId)) notFound();

  try {
    const sale = await fetchSaleServer(saleId);

    return (
      <div>
        <PageBreadcrumb pageTitle={`Edit sale #${saleId}`} />
        <div className="space-y-6">
          <ComponentCard title={`Sale #${sale.id}`}>
            <SaleEditFormShell sale={sale} />
          </ComponentCard>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch sale:", error);
    notFound();
  }
}
