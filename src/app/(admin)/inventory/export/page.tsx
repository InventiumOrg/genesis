import TransactionsView from "@/components/transactions/TransactionsView";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Export Transactions | Dashboard",
  description: "Inventory export (stock-out) transactions",
};

interface PageProps {
  searchParams: Promise<{ inventoryId?: string; cursor?: string }>;
}

export default async function ExportTransactionsPage({ searchParams }: PageProps) {
  const { inventoryId, cursor } = await searchParams;
  return <TransactionsView type="EXPORT" inventoryId={inventoryId} cursor={cursor} />;
}
