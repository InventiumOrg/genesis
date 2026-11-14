import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { LevelBar } from "../trace/EnvelopeTrace";
import InventoryActions from "./InventoryActions";
import {
  InventoryItem,
  formatDate,
  getStatusBadgeColor,
  STOCK_OK_AT,
  STOCK_LOW_AT,
} from "@/lib/inventory";

interface InventoryTableServerProps {
  items: InventoryItem[];
}

const TH = "px-2 py-2.5 text-start whitespace-nowrap sm:px-3";
const TD = "px-2 py-2.5 text-start align-middle sm:px-3";

function levelState(status: string): "ok" | "low" | "out" {
  if (status === "Out of Stock") return "out";
  if (status === "Low Stock") return "low";
  return "ok";
}

export default function InventoryTableServer({
  items,
}: InventoryTableServerProps) {
  return (
    <div className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="label-cap border-b border-gray-200 px-3 py-2 dark:border-gray-800">
        Level · band is in stock above {STOCK_OK_AT}, out at or below {STOCK_LOW_AT}
      </p>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className={`${TH} hidden sm:table-cell`}>ID</TableCell>
                <TableCell isHeader className={TH}>Ingredient</TableCell>
                <TableCell isHeader className={`${TH} hidden lg:table-cell`}>Category</TableCell>
                <TableCell isHeader className={`${TH} !text-end`}>On hand</TableCell>
                <TableCell isHeader className={TH}>
                  Level
                </TableCell>
                <TableCell isHeader className={`${TH} hidden sm:table-cell`}>State</TableCell>
                <TableCell isHeader className={`${TH} hidden lg:table-cell`}>Location</TableCell>
                <TableCell isHeader className={`${TH} hidden xl:table-cell`}>Updated</TableCell>
                <TableCell isHeader className={`${TH} !text-end sm:sticky sm:right-0 sm:z-10 sm:bg-white sm:dark:bg-gray-900`}>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {items.length > 0 ? (
                items.map((item) => {
                  const state = levelState(item.status);
                  const out = state === "out";
                  const low = state === "low";
                  return (
                    <TableRow
                      key={item.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                    >
                      <TableCell className={`${TD} hidden whitespace-nowrap sm:table-cell`}>
                        <span className="font-mono text-[12px] text-gray-500 dark:text-gray-400">
                          {String(item.id).padStart(4, "0")}
                        </span>
                      </TableCell>
                      <TableCell className={`${TD} min-w-[9rem] sm:whitespace-nowrap`}>
                        <span className="text-theme-sm font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="mt-1 block sm:hidden">
                          <Badge size="sm" color={getStatusBadgeColor(item.status)}>
                            {item.status}
                          </Badge>
                        </span>
                      </TableCell>
                      <TableCell
                        className={`${TD} hidden whitespace-nowrap text-theme-sm text-gray-600 lg:table-cell dark:text-gray-400`}
                      >
                        {item.category || "—"}
                      </TableCell>
                      <TableCell className={`${TD} text-end whitespace-nowrap`}>
                        <span
                          className={`font-mono text-[14px] tabular ${
                            out || low
                              ? "font-medium text-error-600 dark:text-error-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.quantity}
                        </span>
                        {(item.unit || item.measure) && (
                          <span className="ml-1 font-mono text-[11px] text-gray-500 dark:text-gray-500">
                            {item.measure || item.unit}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={`${TD} whitespace-nowrap`}>
                        <LevelBar
                          value={item.quantity || 0}
                          okAt={STOCK_OK_AT}
                          lowAt={STOCK_LOW_AT}
                          className="w-12 sm:w-28"
                          title={`${item.name}: ${item.quantity} on hand. In stock above ${STOCK_OK_AT}, out at or below ${STOCK_LOW_AT}.`}
                        />
                      </TableCell>
                      <TableCell
                        className={`${TD} hidden whitespace-nowrap sm:table-cell`}
                      >
                        <Badge size="sm" color={getStatusBadgeColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`${TD} hidden whitespace-nowrap text-theme-sm text-gray-600 lg:table-cell dark:text-gray-400`}
                      >
                        {item.location || item.supplier || "—"}
                      </TableCell>
                      <TableCell
                        className={`${TD} hidden font-mono text-[12px] whitespace-nowrap text-gray-500 xl:table-cell dark:text-gray-400`}
                      >
                        {item.lastUpdated ? formatDate(item.lastUpdated) : "—"}
                      </TableCell>
                      <TableCell
                        className={`${TD} whitespace-nowrap text-end sm:sticky sm:right-0 sm:z-10 sm:border-l sm:border-gray-200 sm:bg-white sm:dark:border-gray-800 sm:dark:bg-gray-900`}
                      >
                        <InventoryActions item={item} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-14 text-center" colSpan={9}>
                    <p className="text-theme-sm font-semibold text-gray-900 dark:text-white">
                      No lines match these filters
                    </p>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-600 dark:text-gray-400">
                      Clear the search or state filter to see the full stock
                      list, or add the ingredient if it is not recorded yet.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
