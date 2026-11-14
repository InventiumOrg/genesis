"use client";

import dynamic from "next/dynamic";
import type { Order } from "@/lib/orders";

const OrderEditForm = dynamic(
  () => import("./OrderEditForm"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-10 text-gray-500 dark:text-gray-400">
        Loading editor…
      </div>
    ),
  }
);

export function OrderEditFormShell({ order }: { order: Order }) {
  return <OrderEditForm order={order} />;
}
