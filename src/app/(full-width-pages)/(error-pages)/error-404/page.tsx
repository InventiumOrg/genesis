import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Page not found | Inventium",
  description: "The page you asked for is not part of Inventium.",
};

export default function Error404() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-6 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-lg">
        <p className="label-cap">Error 404</p>
        <h1 className="mt-3 text-title-lg font-extrabold tabular text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-400">
          There is no page at this address. Nothing has been changed, and no
          stock or sales record is affected.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-brand-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Back to today
          </Link>
          <Link
            href="/inventory"
            className="inline-flex h-10 items-center justify-center rounded-sm border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.04]"
          >
            Go to inventory
          </Link>
        </div>
      </div>
      <p className="label-cap absolute bottom-6 left-1/2 -translate-x-1/2">
        Inventium · Stock &amp; Service
      </p>
    </div>
  );
}
