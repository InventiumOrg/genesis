"use client";

import { useRouter } from "next/navigation";
import { PencilIcon } from "@/icons";
import IconAction from "./IconAction";

interface OrderActionsProps {
  orderId: number;
}

export default function OrderActions({ orderId }: OrderActionsProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/orders/edit/${orderId}`);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <IconAction label="Edit order" onClick={handleEdit} icon={<PencilIcon />} />
    </div>
  );
}
