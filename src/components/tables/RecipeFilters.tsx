"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function RecipeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      if (name !== "page") params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search recipes by name or ID…"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) =>
            router.push(`?${createQueryString("search", e.target.value)}`)
          }
          className="w-full h-10 px-3 border border-gray-300 rounded-sm text-sm focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
        />
      </div>
    </div>
  );
}
