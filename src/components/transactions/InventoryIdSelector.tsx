"use client";

import { useRouter, useSearchParams } from "next/navigation";
import InventoryItemPicker from "@/components/transactions/InventoryItemPicker";
import { InventoryItem } from "@/lib/inventory";

export default function InventoryIdSelector({
  placeholder = "Search inventory items by name…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (item: InventoryItem) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("inventoryId", String(item.id));
    // Reset cursor when switching items.
    params.delete("cursor");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6">
      <InventoryItemPicker placeholder={placeholder} onSelect={handleSelect} />
    </div>
  );
}
