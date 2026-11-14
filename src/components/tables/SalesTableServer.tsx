import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import SaleActions from "./SaleActions";
import { Sale, formatSaleDate, formatSaleMoney } from "@/lib/sales";

interface SalesTableServerProps {
  sales: Sale[];
}

export default function SalesTableServer({ sales }: SalesTableServerProps) {
  return (
    <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="">
              <TableRow>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  ID
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  POS ID
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Recipe ID
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Qty
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Price
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Created
                </TableCell>
                <TableCell isHeader className="px-4 py-2.5 text-start">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="px-5 py-4 text-start font-mono text-theme-sm text-gray-800 dark:text-white/90">
                      {sale.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start font-mono text-theme-sm text-gray-800 dark:text-white/90">
                      {sale.posId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start font-mono text-theme-sm text-gray-800 dark:text-white/90">
                      {sale.recipeId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {sale.quantity}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {formatSaleMoney(sale.price)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatSaleDate(sale.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <SaleActions saleId={sale.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No sales found.
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
