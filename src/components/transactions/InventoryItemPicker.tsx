"use client";

import { useEffect, useRef, useState } from "react";
import { useInventoryClient } from "@/lib/inventory-client";
import { InventoryItem } from "@/lib/inventory";

interface InventoryItemPickerProps {
  /** Currently-selected label/text to show when not actively searching. */
  initialLabel?: string;
  placeholder?: string;
  onSelect: (item: InventoryItem) => void;
}

/**
 * Searchable inventory item combobox. Loads items from the inventory service
 * and reports the chosen item so callers can use its id (and other fields).
 */
export default function InventoryItemPicker({
  initialLabel = "",
  placeholder = "Search inventory items by name…",
  onSelect,
}: InventoryItemPickerProps) {
  const { fetchInventoryItems } = useInventoryClient();
  const fetchInventoryItemsRef = useRef(fetchInventoryItems);
  fetchInventoryItemsRef.current = fetchInventoryItems;

  const [query, setQuery] = useState(initialLabel);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search whenever the dropdown is open and the query changes.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);

    const handle = setTimeout(async () => {
      try {
        const { items } = await fetchInventoryItemsRef.current({
          search: query.trim(),
          limit: 20,
        });
        if (active) setItems(items);
      } catch (err) {
        if (active) {
          setItems([]);
          setError(err instanceof Error ? err.message : "Failed to load items");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query, open]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSelect = (item: InventoryItem) => {
    onSelect(item);
    setQuery(item.name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-success-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white"
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              Loading…
            </div>
          )}
          {error && !loading && (
            <div className="px-3 py-2 text-sm text-error-600 dark:text-error-400">
              {error}
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              No items found.
            </div>
          )}
          {!loading &&
            !error &&
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/[0.05]"
              >
                <span className="text-gray-800 dark:text-white/90">
                  {item.name}
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  {item.category && <span>{item.category}</span>}
                  <span className="font-mono">#{item.id}</span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
