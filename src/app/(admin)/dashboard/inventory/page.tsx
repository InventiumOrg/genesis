import type { Metadata } from "next";
import React from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InventoryBoard from "@/components/stock/InventoryBoard";
import type { InventoryItem } from "@/lib/inventory";
import {
  fetchInventoryOverviewServer,
  type LocationStock,
  type MovementReason,
} from "@/lib/inventory-server";

export const metadata: Metadata = {
  title: "Inventory dashboard | Inventium",
  description:
    "What is left, where it sits, and what moved it.",
};

const WINDOW_DAYS = 14;

export default async function InventoryDashboard() {
  let counts = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };
  let byLocation: LocationStock[] = [];
  let movements: MovementReason[] = [];
  let attention: InventoryItem[] = [];
  let readable = true;

  try {
    const overview = await fetchInventoryOverviewServer(WINDOW_DAYS);
    counts = overview.counts;
    byLocation = overview.byLocation;
    movements = overview.movements;
    attention = overview.attention;
  } catch (error) {
    // A failed read is said out loud. It is never filled with a plausible
    // number, which is the one claim this product makes.
    console.error("Inventory dashboard read failed:", error);
    readable = false;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Inventory dashboard"
        section="Dashboard"
        sectionHref="/dashboard"
        description="What is left, where it sits, and what moved it."
      />
      <InventoryBoard
        days={WINDOW_DAYS}
        counts={counts}
        byLocation={byLocation}
        movements={movements}
        attention={attention}
        readable={readable}
      />
    </div>
  );
}
