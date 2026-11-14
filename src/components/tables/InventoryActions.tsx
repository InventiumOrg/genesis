"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TransactionCreateButton from "@/components/transactions/TransactionCreateButton";
import { deleteInventoryItem, InventoryItem } from "@/lib/inventory";

interface InventoryActionsProps {
  item: InventoryItem;
}

const ACTION =
  "inline-flex h-7 items-center rounded-sm border border-gray-300 bg-white px-2 text-[12px] font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/[0.06]";

export default function InventoryActions({ item }: InventoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/inventory/edit/${item.id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteInventoryItem(item.id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      <span className="hidden sm:contents">
        <TransactionCreateButton
          inventoryItem={item}
          variant="outline"
          buttonLabel="Move"
          stayOnPage
          className={ACTION}
        />
      </span>
      <button type="button" onClick={handleEdit} className={ACTION}>
        Edit
      </button>
      <span className="hidden sm:contents">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className={`${ACTION} text-error-600 hover:border-error-300 hover:bg-error-50 hover:text-error-700 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-error-300 dark:hover:bg-error-500/10`}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </span>
    </div>
  );
}
