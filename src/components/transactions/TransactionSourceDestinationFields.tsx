"use client";

import { useEffect, useRef, useState } from "react";
import { usePOSClient } from "@/lib/pos-client";
import { POS } from "@/lib/pos";
import { TransactionType } from "@/lib/transactions";

const selectClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white disabled:opacity-60";

const readOnlyClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white/90";

interface TransactionSourceDestinationFieldsProps {
  type: TransactionType;
  /** Warehouse taken from the selected inventory item's location. */
  warehouseName: string;
  source: string;
  destination: string;
  onSourceChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  active?: boolean;
}

export default function TransactionSourceDestinationFields({
  type,
  warehouseName,
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  active = true,
}: TransactionSourceDestinationFieldsProps) {
  const { fetchPOSList } = usePOSClient();
  const fetchPOSListRef = useRef(fetchPOSList);
  fetchPOSListRef.current = fetchPOSList;

  const [posList, setPosList] = useState<POS[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetchPOSListRef
      .current({ limit: 100 })
      .then((result) => {
        if (cancelled) return;
        setPosList(result.posList);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load POS");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  const posSelect = (
    value: string,
    onChange: (value: string) => void,
    placeholder: string
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={selectClass}
    >
      <option value="">{loading ? "Loading POS…" : placeholder}</option>
      {posList.map((p) => (
        <option key={p.id} value={p.name}>
          {p.location ? `${p.name} · ${p.location}` : p.name}
        </option>
      ))}
    </select>
  );

  const warehouseDisplay = (label: string) => (
    <div className="block">
      <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">{label}</span>
      <div className={readOnlyClass}>
        {warehouseName || (
          <span className="text-gray-400 dark:text-gray-500">
            Set on inventory item (location)
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {loadError && (
        <p className="text-sm text-error-600 dark:text-error-400 sm:col-span-2">{loadError}</p>
      )}

      {type === "EXPORT" ? (
        <>
          {warehouseDisplay("Source (warehouse)")}
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              Destination (POS)
            </span>
            {posSelect(destination, onDestinationChange, "Select POS…")}
          </label>
        </>
      ) : (
        <>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              Source (POS)
            </span>
            {posSelect(source, onSourceChange, "Select POS…")}
          </label>
          {warehouseDisplay("Destination (warehouse)")}
        </>
      )}
    </>
  );
}
