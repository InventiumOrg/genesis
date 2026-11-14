"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset to page 1 when filtering
      if (name !== "page") {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchChange = (value: string) => {
    router.push(`?${createQueryString("search", value)}`);
  };

  const handleStatusChange = (value: string) => {
    router.push(`?${createQueryString("status", value === "All" ? "" : value)}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label
          htmlFor="inventory-search"
          className="label-cap mb-1.5 block"
        >
          Search stock
        </label>
        <input
          id="inventory-search"
          type="search"
          placeholder="name, id, or category"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:font-mono placeholder:text-[12px] placeholder:tracking-wider placeholder:text-gray-400 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-gray-500"
        />
      </div>
      <div className="sm:w-52">
        <label htmlFor="inventory-state" className="label-cap mb-1.5 block">
          State
        </label>
        <select
          id="inventory-state"
          defaultValue={searchParams.get("status") ?? "All"}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
        >
          <option value="All">All states</option>
          <option value="In Stock">In stock</option>
          <option value="Low Stock">Low stock</option>
          <option value="Out of Stock">Out of stock</option>
        </select>
      </div>
    </div>
  );
}