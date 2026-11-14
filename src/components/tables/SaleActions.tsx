"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";
import { useSalesClient } from "@/lib/sales-client";

interface SaleActionsProps {
  saleId: number;
}

export default function SaleActions({ saleId }: SaleActionsProps) {
  const router = useRouter();
  const { deleteSale } = useSalesClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = () => {
    router.push(`/sales/${saleId}`);
  };

  const handleEdit = () => {
    router.push(`/sales/edit/${saleId}`);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this sale? This cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteSale(saleId);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to delete sale.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={handleView}>
        View
      </Button>
      <Button size="sm" variant="outline" onClick={handleEdit}>
        Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 disabled:opacity-50"
      >
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </div>
  );
}
