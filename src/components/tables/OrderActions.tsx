"use client";

import { useRouter } from "next/navigation";
import Button from "../ui/button/Button";

interface OrderActionsProps {
  orderId: number;
}

export default function OrderActions({ orderId }: OrderActionsProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/orders/edit/${orderId}`);
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handleEdit}>
        Edit
      </Button>
    </div>
  );
}
