import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalesTableServer from "@/components/tables/SalesTableServer";
import SaleFilters from "@/components/tables/SaleFilters";
import InventoryPagination from "@/components/tables/InventoryPagination";
import { fetchSalesServer } from "@/lib/sales-server";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Sales | Inventium",
  description: "List and manage sales",
};

interface SalesPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams;
  const { search, page } = params;

  try {
    const { sales, pagination } = await fetchSalesServer({
      search,
      page: page ? parseInt(page, 10) : 1,
    });

    return (
      <div>
        <PageBreadcrumb
          pageTitle="Sales"
          section="Service"
          description="Every sale, what it sold, and which till rang it."
          actions={
            <Link href="/sales/add" className="inline-flex h-10 items-center justify-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400">
              Record sale
            </Link>
          }
        />
        <div className="space-y-6">
          <div className="space-y-4">
              <SaleFilters />
              <SalesTableServer sales={sales} />
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
        <PageBreadcrumb pageTitle="Sales" />
        <div className="space-y-6">
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 dark:bg-error-900/20 dark:border-error-800">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              Sales service unavailable
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
