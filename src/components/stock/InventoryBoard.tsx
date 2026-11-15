import Link from "next/link";
import React from "react";

import type { InventoryItem } from "@/lib/inventory";
import { getStatusBadgeColor, STOCK_LOW_AT, STOCK_OK_AT } from "@/lib/inventory";
import type { LocationStock, MovementReason } from "@/lib/inventory-server";
import { formatCount as count } from "@/lib/currency";

import { LevelBar } from "../trace/EnvelopeTrace";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { EmptyState, Panel, Readout } from "./Readout";

/**
 * How the ledger's own words read on screen. A reason not in this map is shown
 * as it is stored rather than silently renamed: a new reason appearing in the
 * ledger must be visible, not swallowed.
 */
const REASON_WORDS: Record<string, string> = {
  opening: "Opening count",
  sale: "Drawn by a sale",
  order: "Order received",
  transfer: "Transfer",
  waste: "Waste logged",
  import: "Import",
  export: "Export",
  adjustment: "Adjustment",
};

const reasonWord = (reason: string) => REASON_WORDS[reason] ?? reason;

export function InventoryBoard({
  days,
  counts,
  byLocation,
  movements,
  attention,
  readable,
}: {
  days: number;
  counts: { total: number; inStock: number; lowStock: number; outOfStock: number };
  byLocation: LocationStock[];
  movements: MovementReason[];
  attention: InventoryItem[];
  readable: boolean;
}) {
  const needsAttention = counts.lowStock + counts.outOfStock;
  const events = movements.reduce((s, m) => s + m.events, 0);
  const added = movements.reduce((s, m) => s + m.added, 0);
  const removed = movements.reduce((s, m) => s + m.removed, 0);
  // The widest single flow sets the bar scale, so two reasons on this panel are
  // compared against each other rather than each against itself.
  const widestFlow = movements.reduce((m, r) => Math.max(m, r.added, r.removed), 0);

  if (!readable) {
    return (
      <Panel heading="Stock">
        <EmptyState
          title="Stock cannot be read right now"
          body="The database did not answer, so nothing is drawn. No figure here is estimated in its place, and nothing has been changed."
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <section className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:divide-gray-800">
          <Readout
            label="Lines outside their state"
            value={String(needsAttention)}
            note={`${counts.outOfStock} out · ${counts.lowStock} low`}
            tone={needsAttention > 0 ? "breach" : "ok"}
            lead
          />
          <Readout
            label="Lines in stock"
            value={String(counts.inStock)}
            note={`above ${STOCK_OK_AT}`}
          />
          <Readout
            label="Lines on record"
            value={String(counts.total)}
            note={`across ${byLocation.length} ${byLocation.length === 1 ? "warehouse" : "warehouses"}`}
          />
          <Readout
            label={`Movements · ${days} days`}
            value={count(events)}
            note={`+${count(added)} in · −${count(removed)} out`}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <Panel
          heading="Needs attention"
          action={
            <Link href="/inventory" className="label-cap hover:text-gray-900 dark:hover:text-white">
              All stock →
            </Link>
          }
        >
          {attention.length > 0 ? (
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
                        <Link href={`/inventory/${item.id}`} className="hover:underline">
                          {item.name}
                        </Link>
                        <span className="mt-0.5 block font-mono text-[11px] font-normal text-gray-500 dark:text-gray-400">
                          {item.location || item.supplier || "no warehouse recorded"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular whitespace-nowrap text-error-600 dark:text-error-300">
                        {count(item.quantity)}
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
            <EmptyState
              title="Every line is inside its state"
              body="Nothing is low or out across the lines on record. This list fills itself the moment one is."
            />
          )}
        </Panel>

        <Panel heading={`What moved stock · ${days} days`}>
          {movements.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {movements.map((m) => (
                <div key={m.reason} className="px-5 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-theme-sm font-semibold text-gray-900 dark:text-white">
                      {reasonWord(m.reason)}
                    </span>
                    <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                      {count(m.events)} {m.events === 1 ? "event" : "events"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Flow value={m.added} max={widestFlow} direction="in" />
                    <Flow value={m.removed} max={widestFlow} direction="out" />
                  </div>
                  <div className="mt-1.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                    {m.added > 0 && <span>+{count(m.added)} in</span>}
                    {m.added > 0 && m.removed > 0 && <span> · </span>}
                    {m.removed > 0 && <span>−{count(m.removed)} out</span>}
                    {m.added > 0 && m.removed > 0 && (
                      <span> · net {m.net > 0 ? "+" : ""}{count(m.net)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing moved in this window"
              body={`No stock movement was recorded in the last ${days} days. The ledger is append-only, so an empty window means no events, not missing rows.`}
            />
          )}
        </Panel>
      </div>

      <Panel
        heading="Stock by warehouse"
        action={
          <Link href="/warehouse" className="label-cap hover:text-gray-900 dark:hover:text-white">
            All warehouses →
          </Link>
        }
      >
        {byLocation.length > 0 ? (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-2.5 text-start">
                    Warehouse
                  </TableCell>
                  <TableCell isHeader className="px-4 py-2.5 text-end">
                    Lines
                  </TableCell>
                  <TableCell isHeader className="px-4 py-2.5 text-end">
                    Low
                  </TableCell>
                  <TableCell isHeader className="px-4 py-2.5 text-end">
                    Out
                  </TableCell>
                  <TableCell isHeader className="px-4 py-2.5 text-end">
                    On hand
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                {byLocation.map((l) => (
                  <TableRow key={l.location}>
                    <TableCell className="px-5 py-3 text-theme-sm font-semibold text-gray-900 dark:text-white">
                      {l.location}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular text-gray-700 dark:text-gray-300">
                      {count(l.items)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular text-warning-600 dark:text-warning-400">
                      {l.lowStock > 0 ? count(l.lowStock) : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular text-error-600 dark:text-error-300">
                      {l.outOfStock > 0 ? count(l.outOfStock) : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end font-mono text-[13px] tabular text-gray-700 dark:text-gray-300">
                      {count(l.onHand)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="border-t border-gray-200 px-5 py-4 text-sm leading-relaxed text-gray-600 dark:border-gray-800 dark:text-gray-400">
              On hand is one sum of every movement recorded against that
              warehouse&apos;s lines, so it adds quantities in different units
              together. It reads as a count of things moved, not a weight.
              Low and out come from the same thresholds the rest of the product
              uses: in stock above {STOCK_OK_AT}, out at or below {STOCK_LOW_AT},
              regardless of unit.
            </p>
          </div>
        ) : (
          <EmptyState
            title="No stock on record"
            body="No inventory line exists yet, so there is no warehouse to group by."
          />
        )}
      </Panel>
    </div>
  );
}

/**
 * One direction of a reason's flow, drawn against the widest flow on the panel.
 *
 * A flow of zero draws nothing rather than an empty track: a reason that only
 * ever takes stock out should not appear to have an unfilled inbound bar.
 */
function Flow({
  value,
  max,
  direction,
}: {
  value: number;
  max: number;
  direction: "in" | "out";
}) {
  if (value <= 0) return <div className="h-1.5 flex-1" />;
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div
      className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800"
      title={`${direction === "in" ? "Added" : "Removed"}: ${count(value)}`}
    >
      <div
        className={`h-full ${direction === "in" ? "bg-success-500" : "bg-error-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default InventoryBoard;
