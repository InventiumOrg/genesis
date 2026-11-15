import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { fetchSaleServer } from "@/lib/sales-server";
import Money from "@/components/common/Money";
import { formatSaleDate } from "@/lib/sales";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Sale | Dashboard",
  description: "Sale details",
};

interface SaleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = await params;
  const saleId = parseInt(id, 10);
  if (isNaN(saleId)) notFound();

  try {
    const sale = await fetchSaleServer(saleId);

    return (
      <div>
        <PageBreadcrumb pageTitle={`Sale #${sale.id}`} />
        <div className="space-y-6">
          <ComponentCard title={`Sale #${sale.id}`}>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">POS ID</dt>
                <dd className="font-mono text-gray-900 dark:text-white mt-1">
                  {sale.posId}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Recipe ID</dt>
                <dd className="font-mono text-gray-900 dark:text-white mt-1">
                  {sale.recipeId}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Quantity</dt>
                <dd className="text-gray-900 dark:text-white mt-1">
                  {sale.quantity}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Price</dt>
                <dd className="text-gray-900 dark:text-white mt-1">
                  <Money cents={sale.price} />
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="text-gray-900 dark:text-white mt-1">
                  {formatSaleDate(sale.createdAt)}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={`/sales/edit/${sale.id}`}
                className="inline-flex items-center px-4 py-2 text-sm rounded-sm bg-brand-900 text-white hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Edit
              </Link>
              <Link
                href="/sales"
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
