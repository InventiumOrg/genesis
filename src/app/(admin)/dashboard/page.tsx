import type { Metadata } from "next";
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DashboardBoard, { dailyRevenue } from "@/components/stock/DashboardBoard";
import { fetchInventoryItemsServer } from "@/lib/inventory-server";
import { fetchSalesServer } from "@/lib/sales-server";
import type { InventoryItem } from "@/lib/inventory";
import type { Sale } from "@/lib/sales";

export const metadata: Metadata = {
  title: "Sales dashboard | Inventium",
  description:
    "Revenue drawn from recorded sales, and the stock lines that need attention.",
};

export default async function Dashboard() {
  // Both services are read independently: one being down must not blank the
  // other half of the board, and no figure is estimated to fill a gap.
  let items: InventoryItem[] = [];
  let totalItems = 0;
  let stockReadable = true;
  try {
    const stock = await fetchInventoryItemsServer({ page: 1 });
    items = stock.items;
    totalItems = stock.pagination.totalItems;
  } catch (error) {
    console.error("Dashboard stock read failed:", error);
    stockReadable = false;
  }

  let sales: Sale[] = [];
  let salesReadable = true;
  try {
    const result = await fetchSalesServer({ page: 1, limit: 200 });
    sales = result.sales;
  } catch (error) {
    console.error("Dashboard sales read failed:", error);
    salesReadable = false;
  }

  const revenue = dailyRevenue(sales, 14);
  const todayKey = new Date().toISOString().slice(0, 10);
  const revenueToday =
    revenue.find((p) => p.t === todayKey)?.v ??
    (revenue.length ? revenue[revenue.length - 1].v : 0);
  const posCount = new Set(sales.map((s) => s.posId).filter(Boolean)).size;
  return (
    <div>
      <PageBreadcrumb
        pageTitle="Sales dashboard"
        section="Dashboard"
        description="Revenue is aggregated from recorded sales; stock state comes from the inventory service. Nothing on this screen is estimated."
      />
      <DashboardBoard
        revenue={revenue}
        revenueToday={revenueToday}
        salesCount={sales.length}
        posCount={posCount}
        items={items}
        totalItems={totalItems}
        salesReadable={salesReadable}
        stockReadable={stockReadable}
      />
    </div>
  );
}
