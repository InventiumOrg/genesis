import React from "react";
import Link from "next/link";
import { EnvelopeTrace, type TracePoint } from "../trace/EnvelopeTrace";
import { LevelBar } from "../trace/EnvelopeTrace";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { InventoryItem } from "@/lib/inventory";
import { getStatusBadgeColor, STOCK_OK_AT, STOCK_LOW_AT } from "@/lib/inventory";
import type { Sale } from "@/lib/sales";
import { Readout, SubReadout } from "./Readout";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

/** Aggregate real sales into one revenue reading per day, oldest first. */
export function dailyRevenue(sales: Sale[], days = 14): TracePoint[] {
  const byDay = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const localKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    byDay.set(localKey(d), 0);
  }

  for (const sale of sales) {
    if (!sale.createdAt) continue;
    const when = new Date(sale.createdAt);
    if (Number.isNaN(when.getTime())) continue;
    const key = localKey(when);
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) || 0) + sale.price * (sale.quantity || 1));
    }
  }

  return Array.from(byDay.entries()).map(([t, v]) => ({ t, v }));
}

const shortDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short" });

export function DashboardBoard({
  revenue,
  revenueToday,
  salesCount,
  posCount,
  items,
  totalItems,
  salesReadable,
  stockReadable,
}: {
  revenue: TracePoint[];
  revenueToday: number;
  salesCount: number;
  posCount: number;
  items: InventoryItem[];
  totalItems: number;
  salesReadable: boolean;
  stockReadable: boolean;
}) {
  const attention = items
    .filter((i) => i.status === "Out of Stock" || i.status === "Low Stock")
    .slice(0, 6);
  const outCount = items.filter((i) => i.status === "Out of Stock").length;
  const lowCount = items.filter((i) => i.status === "Low Stock").length;
  const window = revenue.length;
  const windowTotal = revenue.reduce((s, p) => s + p.v, 0);
  const average = window ? windowTotal / window : 0;
  // The middle half of the window: two real bounds, nothing invented.
  const sorted = revenue.map((p) => p.v).sort((a, b) => a - b);
  const quantile = (q: number) =>
    sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0;
  const bandLo = quantile(0.25);
  const bandHi = quantile(0.75);
  const daysInBand = revenue.filter((p) => p.v >= bandLo && p.v <= bandHi).length;

  return (
    <div className="space-y-6">
      {/* The trace owns its whole region: no card, no frame inside a frame. */}
      <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px]">
          <div className="min-w-0 p-5">
            {salesReadable ? (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="label-cap">
                    Revenue · last {window} days · all points of sale
                  </h2>
                  <span className="label-cap">
                    No target set · band is where half these {window} days landed
                  </span>
                </div>
                <p className="mt-2 text-title-lg font-extrabold tabular text-gray-900 dark:text-white">
                  {money(revenueToday)}
                  <span className="ml-2 align-middle font-mono text-sm font-medium tracking-wider text-gray-500 uppercase">
                    today
                  </span>
                </p>
                <div className="mt-4">
                  <EnvelopeTrace
                    points={revenue}
                    height={168}
                    reference={{
                      lo: bandLo,
                      hi: bandHi,
                      label: `middle half of the last ${window} days`,
                    }}
                    title={`Revenue per day over the last ${window} days from recorded sales. The band is where half of those days landed, ${money(bandLo)} to ${money(bandHi)}.`}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-gray-500 dark:text-gray-500">
                  <span>{revenue.length ? shortDay(revenue[0].t) : ""}</span>
                  <span>
                    {revenue.length
                      ? shortDay(revenue[Math.floor(window / 2)].t)
                      : ""}
                  </span>
                  <span>
                    {revenue.length ? shortDay(revenue[window - 1].t) : ""}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <h2 className="text-theme-sm font-semibold text-gray-900 dark:text-white">
                  Revenue cannot be read right now
                </h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-600 dark:text-gray-400">
                  The sales service did not answer, so no trace is drawn. No
                  figure here is estimated in its place.
                </p>
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-200 border-t border-gray-200 xl:border-t-0 xl:border-l dark:divide-gray-800 dark:border-gray-800">
            <Readout
              label="Stock outside its state"
              value={stockReadable ? String(outCount + lowCount) : "—"}
              note={
                stockReadable
                  ? `${outCount} out · ${lowCount} low`
                  : "stock service unreachable"
              }
              tone={stockReadable && outCount + lowCount > 0 ? "breach" : "ok"}
              lead
            />
            <SubReadout
              label={`Revenue · ${window} days`}
              value={salesReadable ? money(windowTotal) : "—"}
              note={
                salesReadable
                  ? `${money(average)} average · ${daysInBand} of ${window} days inside the band`
                  : "sales service unreachable"
              }
            />
            <SubReadout
              label="Points of sale selling"
              value={salesReadable ? String(posCount) : "—"}
              note={salesReadable ? `${salesCount} sales in this window` : "unknown"}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <section className="min-w-0 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-3.5 dark:border-gray-800">
            <h2 className="label-cap-sm font-medium text-gray-900 dark:text-white">
              Needs attention
            </h2>
            <Link
              href="/inventory"
              className="label-cap hover:text-gray-900 dark:hover:text-white"
            >
              All stock →
            </Link>
          </div>
          {stockReadable && attention.length > 0 ? (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start">
                      Ingredient
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2.5 text-end">
                      On hand
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2.5 text-start">
                      Level
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2.5 text-start">
                      State
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {attention.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-3 text-theme-sm font-semibold text-gray-900 dark:text-white">
                        {item.name}
                        <span className="mt-0.5 block font-mono text-[11px] font-normal text-gray-500 dark:text-gray-400">
                          {item.location || item.supplier || "no location"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular whitespace-nowrap text-error-600 dark:text-error-300">
                        {item.quantity}
                        <span className="ml-1 text-[11px] text-gray-500">
                          {item.measure || item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <LevelBar
                          value={item.quantity || 0}
                          okAt={STOCK_OK_AT}
                          lowAt={STOCK_LOW_AT}
                          className="w-16 sm:w-28"
                          title={`${item.name}: ${item.quantity} on hand. In stock above ${STOCK_OK_AT}, out at or below ${STOCK_LOW_AT}.`}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <Badge size="sm" color={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-theme-sm font-semibold text-gray-900 dark:text-white">
                {stockReadable
                  ? "Every line is inside its state"
                  : "Stock cannot be read right now"}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-600 dark:text-gray-400">
                {stockReadable
                  ? "Nothing is low or out across the lines on record. This list fills itself the moment one is."
                  : "The inventory service did not answer. Nothing has been changed."}
              </p>
            </div>
          )}
        </section>

        <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-5 py-3.5 dark:border-gray-800">
            <h2 className="label-cap-sm font-medium text-gray-900 dark:text-white">
              Stock on record
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            <Readout
              label="Lines on record"
              value={stockReadable ? String(totalItems) : "—"}
              note={stockReadable ? "across every warehouse" : "unknown"}
            />
            <Readout
              label="Lines read on this page"
              value={stockReadable ? String(items.length) : "—"}
              note={`${items.length - outCount - lowCount} in stock · ${lowCount} low · ${outCount} out`}
            />
          </div>
          <div className="border-t border-gray-200 p-5 dark:border-gray-800">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              The band on the trace above is where half of these days landed, not
              a target: no revenue target is recorded. Stock state is derived
              from quantity by the stock service, and no unit price is returned,
              so stock cannot be valued here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardBoard;
