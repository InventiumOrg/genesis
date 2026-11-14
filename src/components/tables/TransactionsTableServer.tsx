import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import TransactionActions from "../transactions/TransactionActions";
import {
  InventoryTransaction,
  TransactionType,
  formatTransactionDate,
  transactionStatusColor,
} from "@/lib/transactions";

interface TransactionsTableServerProps {
  transactions: InventoryTransaction[];
  type: TransactionType;
}

export default function TransactionsTableServer({
  transactions,
  type,
}: TransactionsTableServerProps) {
  return (
    <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="">
              <TableRow>
                {[
                  "Type",
                  "Source",
                  "Destination",
                  "Qty",
                  "Unit",
                  "Category",
                  "Status",
                  "Created",
                  "Actions",
                ].map((label) => (
                  <TableCell
                    key={label}
                    isHeader
                    className="px-4 py-2.5 text-start"
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge color={tx.type === "IMPORT" ? "success" : "warning"}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {tx.source || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {tx.destination || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {tx.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {tx.inventoryUnit || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {tx.inventoryCategory || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Badge color={transactionStatusColor(tx.status)}>
                        {tx.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatTransactionDate(tx.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <TransactionActions transaction={tx} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No {type === "IMPORT" ? "import" : "export"} transactions
                    found for this inventory item.
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
