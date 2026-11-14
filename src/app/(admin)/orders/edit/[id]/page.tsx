import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { OrderEditFormShell } from "@/components/forms/OrderEditFormShell";
import { fetchOrderServer } from "@/lib/orders-server";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit order | Dashboard",
  description: "Edit order",
};

interface EditOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) {
    notFound();
  }

  try {
    const order = await fetchOrderServer(orderId);

    return (
      <div>
        <PageBreadcrumb pageTitle={`Edit order #${orderId}`} />
        <div className="space-y-6">
          <ComponentCard title={`Order #${order.id}`}>
            <OrderEditFormShell order={order} />
          </ComponentCard>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch order:", error);
    notFound();
  }
}
