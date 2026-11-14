import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrdersTableServer from "@/components/tables/OrdersTableServer";
import OrderFilters from "@/components/tables/OrderFilters";
import InventoryPagination from "@/components/tables/InventoryPagination";
import { fetchOrdersServer } from "@/lib/orders-server";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Orders | Inventium",
  description: "List and manage orders",
};

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const { search, page } = params;

  try {
    const { orders, pagination } = await fetchOrdersServer({
      search,
      page: page ? parseInt(page, 10) : 1,
    });

    return (
      <div>
        <PageBreadcrumb
          pageTitle="Orders"
          section="Service"
          description="Incoming stock orders and their state."
          actions={
            <Link href="/orders/add" className="inline-flex h-10 items-center justify-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400">
              New order
            </Link>
          }
        />
        <div className="space-y-6">

          <div className="space-y-4">
              <OrderFilters />
              <OrdersTableServer orders={orders} />
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
    console.error("Orders page error:", error);

    return (
      <div>
        <PageBreadcrumb pageTitle="Orders" />
        <div className="space-y-6">
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 dark:bg-error-900/20 dark:border-error-800">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Orders service unavailable
            </h3>
            <p className="mt-1 text-sm text-error-700 dark:text-error-300">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              All orders
            </h2>
            <button
              disabled
              className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-gray-300 text-gray-500 shadow-theme-xs cursor-not-allowed"
              title="Service unavailable"
            >
              New order
            </button>
          </div>

          <ComponentCard title="">
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>
                Orders cannot be displayed while the service is unavailable.
              </p>
              <p className="text-sm mt-2">
                Check the orders API gateway and refresh the page.
              </p>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }
}
