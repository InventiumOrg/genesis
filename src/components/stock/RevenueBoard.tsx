// A Client Component so every figure follows the currency toggle. The money
// here is not only in JSX: it is also inside `title` strings and `note`
// props, which cannot hold a `<Money>` element, so this board needs the
// currency as a value. Every prop it takes is already plain data.
"use client";

import Link from "next/link";
import React from "react";

import { useCurrency } from "@/context/CurrencyContext";
import { formatCount as count } from "@/lib/currency";
import type { RevenueByPos, RevenueByRecipe } from "@/lib/sales-server";

import { EnvelopeTrace, type TracePoint } from "../trace/EnvelopeTrace";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { EmptyState, Panel, Readout, SubReadout } from "./Readout";

const shortDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export function RevenueBoard({
  days,
  revenue,
  units,
  sales,
  byDay,
  byPos,
  byRecipe,
  readable,
}: {
  days: number;
  revenue: number;
  units: number;
  sales: number;
  byDay: TracePoint[];
  byPos: RevenueByPos[];
  byRecipe: RevenueByRecipe[];
  readable: boolean;
}) {
  const { money, moneyShort, note } = useCurrency();

  if (!readable) {
    return (
      <Panel heading="Revenue">
        <EmptyState
          title="Revenue cannot be read right now"
          body="The database did not answer, so no trace is drawn and no total is shown. Nothing here is estimated in its place."
        />
      </Panel>
    );
  }

  const today = byDay.length ? byDay[byDay.length - 1].v : 0;
  const average = byDay.length ? revenue / byDay.length : 0;
  const tradingDays = byDay.filter((p) => p.v > 0).length;

  // The middle half of the window: two readings that actually occurred, so the
  // band on the trace is a fact about these days rather than a target nobody set.
  const sorted = byDay.map((p) => p.v).sort((a, b) => a - b);
  const quantile = (qq: number) =>
    sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(qq * sorted.length))] : 0;
  const bandLo = quantile(0.25);
  const bandHi = quantile(0.75);
  const daysInBand = byDay.filter((p) => p.v >= bandLo && p.v <= bandHi).length;

  const selling = byPos.filter((p) => p.sales > 0);
  const silent = byPos.filter((p) => p.sales === 0);
  const topPos = byPos.length ? byPos[0] : null;
  const widestPos = byPos.reduce((m, p) => Math.max(m, p.revenue), 0);
  const widestRecipe = byRecipe.reduce((m, r) => Math.max(m, r.revenue), 0);

  return (
    <div className="space-y-6">
      <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px]">
          <div className="min-w-0 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="label-cap">
                Revenue · last {days} days · all points of sale
              </h2>
              <span className="label-cap">
                No target set · band is where half these {days} days landed
              </span>
            </div>
            <p className="mt-2 text-title-lg font-extrabold tabular text-gray-900 dark:text-white">
              {money(today)}
              <span className="ml-2 align-middle font-mono text-sm font-medium tracking-wider text-gray-500 uppercase">
                today
              </span>
            </p>
            <div className="mt-4">
              <EnvelopeTrace
                points={byDay}
                height={168}
                reference={{
                  lo: bandLo,
                  hi: bandHi,
                  label: `middle half of the last ${days} days`,
                }}
                title={`Revenue per day over the last ${days} days, from price × quantity on recorded sales. The band is where half of those days landed, ${money(bandLo)} to ${money(bandHi)}.`}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-gray-500 dark:text-gray-500">
              <span>{byDay.length ? shortDay(byDay[0].t) : ""}</span>
              <span>
                {byDay.length ? shortDay(byDay[Math.floor(byDay.length / 2)].t) : ""}
              </span>
              <span>{byDay.length ? shortDay(byDay[byDay.length - 1].t) : ""}</span>
            </div>
          </div>

          <div className="divide-y divide-gray-200 border-t border-gray-200 xl:border-t-0 xl:border-l dark:divide-gray-800 dark:border-gray-800">
            <Readout
              label={`Revenue · ${days} days`}
              value={money(revenue)}
              note={`${money(average)} per day · ${tradingDays} of ${days} days sold anything`}
              lead
            />
            <SubReadout
              label="Units sold"
              value={count(units)}
              note={`${count(sales)} ${sales === 1 ? "sale" : "sales"} recorded`}
            />
            <SubReadout
              label="Days inside the band"
              value={`${daysInBand} of ${days}`}
              note={`${money(bandLo)} to ${money(bandHi)}`}
            />
            <SubReadout
              label="Points of sale selling"
              value={`${selling.length} of ${byPos.length}`}
              note={
                silent.length > 0
                  ? `${silent.length} sold nothing in this window`
                  : "every terminal sold something"
              }
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel
          heading={`Revenue by point of sale · ${days} days`}
          action={
            <Link href="/pos" className="label-cap hover:text-gray-900 dark:hover:text-white">
              All points of sale →
            </Link>
          }
        >
          {byPos.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {byPos.map((p) => (
                <div key={p.posId} className="px-5 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/pos/${p.posId}`}
                        className="text-theme-sm font-semibold text-gray-900 hover:underline dark:text-white"
                      >
                        {p.name}
                      </Link>
                      {p.status !== "active" && (
                        <Badge size="sm" color="light">
                          {p.status}
                        </Badge>
                      )}
                      <span className="mt-0.5 block font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {p.location || "no location recorded"}
                      </span>
                    </div>
                    <span className="font-mono text-[13px] tabular whitespace-nowrap text-gray-900 dark:text-white">
                      {money(p.revenue)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full bg-brand-500"
                      style={{
                        width: `${widestPos > 0 ? Math.max(p.revenue > 0 ? 2 : 0, (p.revenue / widestPos) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                    {p.sales > 0
                      ? `${count(p.units)} units · ${count(p.sales)} ${p.sales === 1 ? "sale" : "sales"}`
                      : `nothing sold in the last ${days} days`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No point of sale on record"
              body="Revenue is reported per terminal, and none exists yet."
            />
          )}
        </Panel>

        <Panel
          heading={`Revenue by recipe · ${days} days`}
          action={
            <Link href="/recipes" className="label-cap hover:text-gray-900 dark:hover:text-white">
              All recipes →
            </Link>
          }
        >
          {byRecipe.length > 0 ? (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader className="px-5 py-2.5 text-start">
                      Recipe
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2.5 text-end">
                      Units
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2.5 text-end">
                      Revenue
                    </TableCell>
                    <TableCell isHeader className="px-4 py-2.5 text-start">
                      Share
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {byRecipe.map((r) => (
                    <TableRow key={r.recipeId}>
                      <TableCell className="px-5 py-3 text-theme-sm font-semibold text-gray-900 dark:text-white">
                        <Link href={`/recipes/${r.recipeId}`} className="hover:underline">
                          {r.name}
                        </Link>
                        <span className="mt-0.5 block font-mono text-[11px] font-normal text-gray-500 dark:text-gray-400">
                          {r.cost > 0 ? `${money(r.cost)} recorded cost` : "no cost recorded"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular text-gray-700 dark:text-gray-300">
                        {count(r.units)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular whitespace-nowrap text-gray-900 dark:text-white">
                        {moneyShort(r.revenue)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div
                          className="h-1.5 w-16 bg-gray-100 sm:w-24 dark:bg-gray-800"
                          title={`${r.name}: ${money(r.revenue)} of ${money(revenue)} taken in this window.`}
                        >
                          <div
                            className="h-full bg-success-500"
                            style={{
                              width: `${widestRecipe > 0 ? Math.max(2, (r.revenue / widestRecipe) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              title="No sale recorded in this window"
              body={`Nothing was sold in the last ${days} days, so there is no recipe to rank.`}
            />
          )}
        </Panel>
      </div>

      <Panel heading="What these figures are">
        <div className="space-y-3 p-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <p>
            Revenue is price × quantity summed over the sales recorded in this
            window. A sale row holds the price of one unit, so a row for four
            cups carries one cup&apos;s price; the multiplication happens in the
            query, not after it.
          </p>
          <p>
            Amounts are stored as whole US cents and shown in whichever currency
            the header is set to.{" "}
            {note
              ? `The đồng figures on this screen are ${note} — a conversion, not a recorded amount.`
              : "These are the recorded amounts, not a conversion."}{" "}
            The band on the trace is where half of these {days} days landed — no
            revenue target is recorded, so nothing here is measured against a
            goal.
          </p>
          {topPos && topPos.revenue > 0 && (
            <p>
              {topPos.name} took the most in this window, {money(topPos.revenue)}{" "}
              of {money(revenue)}. Cost of goods is not deducted anywhere on this
              screen: a recipe&apos;s recorded cost sits beside its takings and is
              not subtracted from them.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}

export default RevenueBoard;
