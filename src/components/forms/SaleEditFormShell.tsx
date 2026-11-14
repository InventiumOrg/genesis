"use client";

import dynamic from "next/dynamic";
import type { Sale } from "@/lib/sales";

const SaleEditForm = dynamic(() => import("./SaleEditForm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-10 text-gray-500">
      Loading editor…
    </div>
  ),
});

export function SaleEditFormShell({ sale }: { sale: Sale }) {
  return <SaleEditForm sale={sale} />;
}
