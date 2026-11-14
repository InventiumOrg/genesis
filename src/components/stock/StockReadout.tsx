import React from "react";

/**
 * The readout band. Figures are monumental and tabular; labels drop to small
 * tracked caps; the state figure turns breach red the moment a line is out.
 * Every figure here is counted from the rows actually returned — the scope of
 * each one is printed beneath it rather than implied.
 */
export function StockReadout({
  totalItems,
  shownItems,
  outCount,
  lowCount,
}: {
  totalItems: number;
  shownItems: number;
  outCount: number;
  lowCount: number;
}) {
  const outside = outCount + lowCount;

  return (
    <div className="grid grid-cols-1 border-y border-gray-900 bg-white sm:grid-cols-3 dark:border-gray-200 dark:bg-white/[0.03]">
      <Figure
        label="Lines on record"
        value={String(totalItems)}
        note={`${shownItems} shown on this page`}
      />
      <Figure
        label="In stock on this page"
        value={String(shownItems - outside)}
        note={`of ${shownItems} lines read`}
        divided
      />
      <Figure
        label="Outside their state"
        value={String(outside)}
        note={`${outCount} out · ${lowCount} low`}
        tone={outside > 0 ? "breach" : "ok"}
        divided
      />
    </div>
  );
}

function Figure({
  label,
  value,
  note,
  tone = "ok",
  divided = false,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "ok" | "breach";
  divided?: boolean;
}) {
  return (
    <div
      className={`px-5 py-4 ${
        divided
          ? "border-t border-gray-200 sm:border-t-0 sm:border-l dark:border-gray-800"
          : ""
      }`}
    >
      <div className="label-cap">{label}</div>
      <div
        className={`mt-2 text-title-md font-extrabold tabular ${
          tone === "breach"
            ? "text-error-600 dark:text-error-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1.5 font-mono text-[11px] ${
          tone === "breach"
            ? "text-error-600 dark:text-error-300"
            : "text-success-700 dark:text-success-300"
        }`}
      >
        {note}
      </div>
    </div>
  );
}

export default StockReadout;
