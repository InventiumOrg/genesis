import TransactionsView from "@/components/transactions/TransactionsView";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Import Transactions | Dashboard",
  description: "Inventory import (stock-in) transactions",
};

interface PageProps {
  searchParams: Promise<{ inventoryId?: string; cursor?: string }>;
}

export default async function ImportTransactionsPage({ searchParams }: PageProps) {
  const { inventoryId, cursor } = await searchParams;
  return <TransactionsView type="IMPORT" inventoryId={inventoryId} cursor={cursor} />;
}
