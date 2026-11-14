import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import OrderActions from "./OrderActions";
import { Order, formatOrderDate, formatOrderPrice } from "@/lib/orders";

interface OrdersTableServerProps {
  orders: Order[];
}

export default function OrdersTableServer({ orders }: OrdersTableServerProps) {
  return (
    <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-2.5 text-start"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-2.5 text-start"
                >
                  POS ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-2.5 text-start"
                >
                  Recipe ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-2.5 text-start"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-2.5 text-start"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-2.5 text-start"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="font-mono text-theme-sm text-gray-800 dark:text-white/90">
                        {order.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start font-mono text-theme-sm text-gray-800 dark:text-white/90">
                      {order.posId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start font-mono text-theme-sm text-gray-800 dark:text-white/90">
                      {order.recipeId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-800 text-start text-theme-sm dark:text-white/90">
                      {formatOrderPrice(order.price)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatOrderDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <OrderActions orderId={order.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="col-span-full">
                      No orders found matching your criteria.
                    </div>
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
