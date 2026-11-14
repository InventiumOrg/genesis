import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TransactionsTableServer from "@/components/tables/TransactionsTableServer";
import InventoryIdSelector from "@/components/transactions/InventoryIdSelector";
import TransactionCreateButton from "@/components/transactions/TransactionCreateButton";
import { fetchTransactionsServer } from "@/lib/transactions-server";
import { TransactionType, transactionTypeLabel } from "@/lib/transactions";
import Link from "next/link";
import React from "react";

interface TransactionsViewProps {
  type: TransactionType;
  inventoryId?: string;
  cursor?: string;
}

export default async function TransactionsView({
  type,
  inventoryId,
  cursor,
}: TransactionsViewProps) {
  const label = transactionTypeLabel(type);
  const title = `${label} Transactions`;

  const header = (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {label} history
      </h2>
      <TransactionCreateButton type={type} defaultInventoryId={inventoryId} />
    </div>
  );

  // No inventory item chosen yet — prompt for one.
  if (!inventoryId) {
    return (
      <div>
        <PageBreadcrumb pageTitle={title} />
        <div className="space-y-6">
          {header}
          <ComponentCard title="">
            <div className="space-y-2">
              <InventoryIdSelector
                placeholder={`Enter an inventory ID to view ${label.toLowerCase()} transactions…`}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {label} transactions are listed per inventory item.
              </p>
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  }

  try {
    const { transactions, count, nextCursor } = await fetchTransactionsServer({
      inventoryId,
      type,
      cursor,
    });

    const nextHref = nextCursor
      ? `?inventoryId=${encodeURIComponent(inventoryId)}&cursor=${encodeURIComponent(nextCursor)}`
      : null;

    return (
      <div>
        <PageBreadcrumb pageTitle={title} />
        <div className="space-y-6">
          {header}
          <ComponentCard title="">
            <div className="space-y-4">
              <InventoryIdSelector />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {count} {label.toLowerCase()} transaction
                {count === 1 ? "" : "s"} for inventory{" "}
                <span className="font-mono text-gray-800 dark:text-white/90">
                  {inventoryId}
                </span>
                .
              </div>
              <TransactionsTableServer transactions={transactions} type={type} />
              {nextHref && (
                <div className="flex justify-end">
                  <Link
                    href={nextHref}
                    className="inline-flex items-center justify-center font-medium gap-2 rounded-lg px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                  >
                    Next page →
                  </Link>
                </div>
              )}
            </div>
          </ComponentCard>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageBreadcrumb pageTitle={title} />
        <div className="space-y-6">
          {header}
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 dark:bg-error-900/20 dark:border-error-800">
            <h3 className="text-sm font-medium text-error-800 dark:text-error-200">
              {label} transactions service unavailable
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
