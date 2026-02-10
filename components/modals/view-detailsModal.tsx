"use client";

import { AdminOrder } from "@/lib/api/admin";
import SellOrderDetailsModal from "./sell-order-details-modal";
import BuyOrderDetailsModal from "./buy-order-details-modal";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: AdminOrder;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const isBuying = order.orderType === "buy";

  if (isBuying) {
    return <BuyOrderDetailsModal isOpen={isOpen} onClose={onClose} order={order} />;
  }

  return <SellOrderDetailsModal isOpen={isOpen} onClose={onClose} order={order} />;
}
