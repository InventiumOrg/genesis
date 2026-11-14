import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InventoryServiceBanner from "@/components/common/InventoryServiceBanner";
import InventoryTableServer from "@/components/tables/InventoryTableServer";
import InventoryFilters from "@/components/tables/InventoryFilters";
import InventoryPagination from "@/components/tables/InventoryPagination";
import { StockReadout } from "@/components/stock/StockReadout";
import { fetchInventoryItemsServer } from "@/lib/inventory-server";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Inventory | Inventium",
  description:
    "Stock on hand across every warehouse, with each line's level against the highest line on the page.",
};

interface InventoryPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

const ACTION_PRIMARY =
  "inline-flex h-10 items-center justify-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400";
const ACTION_SECONDARY =
  "inline-flex h-10 items-center justify-center rounded-sm border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.04]";

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const { search, status, page } = params;

  try {
    const { items, pagination } = await fetchInventoryItemsServer({
      search,
      status,
      page: page ? parseInt(page) : 1,
    });

    const outCount = items.filter((i) => i.status === "Out of Stock").length;
    const lowCount = items.filter((i) => i.status === "Low Stock").length;

    return (
      <div>
        <PageBreadcrumb
          pageTitle="Inventory on hand"
          section="Stock"
          actions={
            <>
              <Link href="/inventory/import" className={ACTION_SECONDARY}>
                Import
              </Link>
              <Link href="/inventory/export" className={ACTION_SECONDARY}>
                Export
              </Link>
              <Link href="/inventory/add" className={ACTION_PRIMARY}>
                Add item
              </Link>
            </>
          }
        />

        <StockReadout
          totalItems={pagination.totalItems}
          shownItems={items.length}
          outCount={outCount}
          lowCount={lowCount}
        />

        <div className="mt-6 space-y-4">
          <InventoryFilters />
          <InventoryTableServer items={items} />
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
    );
  } catch (error) {
    console.error("Inventory page error:", error);

    return (
      <div>
        <PageBreadcrumb
          pageTitle="Inventory on hand"
          section="Stock"
          actions={
            <button
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-sm bg-gray-200 px-4 text-sm font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-500"
              title="Stock service unavailable"
            >
              Add item
            </button>
          }
        />

        <InventoryServiceBanner
          error={error instanceof Error ? error.message : "Unknown error occurred"}
        />

        <div className="mt-6 border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-theme-sm font-semibold text-gray-900 dark:text-white">
            Stock cannot be read right now
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-600 dark:text-gray-400">
            The inventory service did not answer, so no line can be shown. Nothing
            has been changed. Reload once the service is reachable again.
          </p>
        </div>
      </div>
    );
  }
}
