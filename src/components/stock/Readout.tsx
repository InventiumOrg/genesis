import React from "react";

/**
 * One figure, its name, and the line that says where it came from.
 *
 * The note is not decoration. Every reading on these screens is traceable to
 * rows, and the note is where that provenance is written, so a `Readout`
 * without one is a figure nobody can check.
 */
export function Readout({
  label,
  value,
  note,
  tone = "ok",
  lead = false,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "ok" | "breach";
  lead?: boolean;
}) {
  return (
    <div className={lead ? "px-5 py-5" : "px-5 py-4"}>
      <div className="label-cap">{label}</div>
      <div
        className={`mt-1.5 font-extrabold tabular ${
          lead ? "text-title-sm sm:text-title-md" : "text-theme-xl"
        } ${
          tone === "breach"
            ? "text-error-600 dark:text-error-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1 font-mono text-[11px] ${
          tone === "breach"
            ? "text-error-600 dark:text-error-300"
            : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {note}
      </div>
    </div>
  );
}

/** A `Readout` at the size that sits under one, in a stacked rail. */
export function SubReadout({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="px-5 py-3">
      <div className="label-cap">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-bold tabular text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">
        {note}
      </div>
    </div>
  );
}

/** What a screen says instead of a figure when a read failed or found nothing. */
export function EmptyState({
  title,
  body,
  className = "px-5 py-12",
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={`${className} text-center`}>
      <p className="text-theme-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-600 dark:text-gray-400">
        {body}
      </p>
    </div>
  );
}

/** The frame every block on these screens sits in: one border, one heading. */
export function Panel({
  heading,
  action,
  children,
  className = "",
}: {
  heading: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-3.5 dark:border-gray-800">
        <h2 className="label-cap-sm font-medium text-gray-900 dark:text-white">
          {heading}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
