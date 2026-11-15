import type { Metadata } from "next";
import React from "react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RevenueBoard from "@/components/stock/RevenueBoard";
import {
  fetchRevenueServer,
  type RevenueByPos,
  type RevenueByRecipe,
} from "@/lib/sales-server";

export const metadata: Metadata = {
  title: "Revenue dashboard | Inventium",
  description:
    "What came in, per day, per point of sale and per recipe — from recorded sales alone.",
};

const WINDOW_DAYS = 14;

export default async function RevenueDashboard() {
  let revenue = 0;
  let units = 0;
  let sales = 0;
  let byDay: { t: string; v: number }[] = [];
  let byPos: RevenueByPos[] = [];
  let byRecipe: RevenueByRecipe[] = [];
  let readable = true;

  try {
    const result = await fetchRevenueServer(WINDOW_DAYS);
    revenue = result.revenue;
    units = result.units;
    sales = result.sales;
    byDay = result.byDay;
    byPos = result.byPos;
    byRecipe = result.byRecipe;
  } catch (error) {
    console.error("Revenue dashboard read failed:", error);
    readable = false;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Revenue dashboard"
        section="Dashboard"
        sectionHref="/dashboard"
        description="Revenue is price × quantity over recorded sales. No target, no forecast, and no estimate stands in for a day that has not traded."
      />
      <RevenueBoard
        days={WINDOW_DAYS}
        revenue={revenue}
        units={units}
        sales={sales}
        byDay={byDay}
        byPos={byPos}
        byRecipe={byRecipe}
        readable={readable}
      />
    </div>
  );
}
