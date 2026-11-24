"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import IconAction from "./IconAction";
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
    <div className="flex items-center justify-end gap-1">
      <IconAction label="View sale" onClick={handleView} icon={<EyeIcon />} />
      <IconAction label="Edit sale" onClick={handleEdit} icon={<PencilIcon />} />
      <IconAction
        label="Delete sale"
        onClick={handleDelete}
        icon={<TrashBinIcon />}
        tone="danger"
        busy={isDeleting}
      />
    </div>
  );
}
