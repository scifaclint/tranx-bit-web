"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useApproveOrder, useRejectOrder } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { Loader } from "lucide-react";

import { AdminOrder } from "@/lib/api/admin";
import Image from "next/image";
import PinVerificationModal from "./pin-verification-modal";
import { ordersApi } from "@/lib/api/orders";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: AdminOrder; // Changed to accept full order object
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  const [inputCode, setInputCode] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [isFetchingImages, setIsFetchingImages] = useState(false);

  const approveMutation = useApproveOrder();
  const rejectMutation = useRejectOrder();
  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  if (!order) return null;

  const handleFetchImages = async () => {
    setIsFetchingImages(true);
    try {
      const response = await ordersApi.getOrderImages(order._id);
      if (response.status) {
        setFetchedImages(response.data.images);
      } else {
        toast.error("Failed to fetch images");
      }
    } catch (error) {
      toast.error("Error fetching images");
    } finally {
      setIsFetchingImages(false);
    }
  };

  const handleApprove = () => {
    setPendingAction("approve");
    setIsPinModalOpen(true);
  };

  const handleReject = () => {
    const reason = prompt("Please enter a reason for rejection:");
    if (!reason) return;
    setRejectionReason(reason);
    setPendingAction("reject");
    setIsPinModalOpen(true);
  };

  const handleConfirmAction = async (pin: string) => {
    if (!pendingAction) return;

    try {
      if (pendingAction === "approve") {
        await approveMutation.mutateAsync({
          orderId: order._id,
          giftCardCodes: inputCode ? [inputCode] : [],
          adminPin: pin,
        });
        toast.success("Order approved successfully");
      } else {
        await rejectMutation.mutateAsync({
          orderId: order._id,
          rejectionReason: rejectionReason,
          adminPin: pin,
        });
        toast.success("Order rejected successfully");
      }
      setIsPinModalOpen(false);
      setPendingAction(null);
      onClose();
    } catch (error) {
      toast.error(`Failed to ${pendingAction} order`);
    }
  };

  const handleCopyCode = (text: string) => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isBuying = order.orderType === "buy";
  const statusColor =
    order.status === "completed"
      ? "text-green-600 border-green-600 bg-green-50"
      : order.status === "pending" || order.status === "processing"
        ? "text-blue-600 border-blue-600 bg-blue-50"
        : "text-red-500 border-red-500 bg-red-50";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle>
              Order #{order.orderNumber || order._id.slice(-8)} -{" "}
              {isBuying ? "BUYING" : "SELLING"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("capitalize", statusColor)}
              >
                {order.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* SELLING LAYOUT */}
        {!isBuying && (
          <div className="grid gap-6 py-2">
            <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-md flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
              <p className="font-medium text-sm">
                Customer is SELLING this card to YOU
              </p>
            </div>

            {/* Customer Info */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer Info
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-right">
                  {order.userId.firstName} {order.userId.lastName}
                </span>
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-right">
                  {order.userId.email}
                </span>
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-right">
                  {order.userId.phone}
                </span>
                <span className="text-muted-foreground">Username:</span>
                <span className="font-medium text-right">
                  @{order.userId.username}
                </span>
              </div>
            </div>

            {/* Card Details */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Card Details
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                <span className="text-muted-foreground">Card:</span>
                <span className="font-medium text-right">
                  {order.items[0]?.cardBrand} - {order.items[0]?.cardName}
                </span>
                <span className="text-muted-foreground">Denomination:</span>
                <span className="font-medium text-right">
                  {order.cardCurrency} {order.items[0]?.cardDenomination} x{" "}
                  {order.items[0]?.quantity}
                </span>
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium text-right">
                  {order.items[0]?.unitPrice}/{order.cardCurrency}
                </span>
                <div className="col-span-2 border-t my-1"></div>
                <span className="text-muted-foreground font-semibold">
                  Customer Receives:
                </span>
                <span className="font-bold text-right text-lg text-green-600">
                  {order.payoutCurrency}{" "}
                  {order.amountToReceive?.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground text-right col-span-2 italic">
                  (${order.totalAmount?.toLocaleString()} USD equivalent)
                </span>
              </div>
            </div>

            {/* Card Images */}
            {(order.hasImages || fetchedImages.length > 0) && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Card Images (Customer uploaded)
                </div>
                <div className="p-4">
                  {fetchedImages.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto">
                      {fetchedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-24 w-40 bg-muted border rounded-md overflow-hidden group cursor-pointer shrink-0"
                          onClick={() => setSelectedImage(img)}
                        >
                          <Image
                            src={img}
                            alt={`Card ${idx + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded">
                              CLICK TO ZOOM
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 gap-2">
                      <p className="text-sm text-muted-foreground">
                        This order has {order.imagesCount || 0} image
                        {order.imagesCount !== 1 ? "s" : ""}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchImages}
                        disabled={isFetchingImages}
                        className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                      >
                        {isFetchingImages ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        View Images
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card Codes (for selling orders if present) */}
            {order.items[0]?.giftCardCodes &&
              order.items[0].giftCardCodes.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Card Codes (Customer provided)
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/10 space-y-2">
                    {order.items[0].giftCardCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-2 border border-dashed rounded-md bg-white dark:bg-zinc-900/50"
                      >
                        <code className="font-mono font-bold text-sm">
                          {code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleCopyCode(code)}
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Additional Comments */}
            {(order.additionalComments || order.notes) && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer Comments
                </div>
                <div className="p-4 text-sm italic">
                  {order.notes && (
                    <div className="mb-2">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
                  {order.additionalComments && (
                    <div>
                      <strong>Comments:</strong> "{order.additionalComments}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer's Payout Info (
                {order.paymentMethod ||
                  (order.paymentMethodId.type === "crypto"
                    ? order.paymentMethodId.cryptoAsset === "bitcoin"
                      ? "Bitcoin"
                      : "USDT"
                    : order.paymentMethodId.type.replace("_", " "))}
                )
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                {order.paymentMethodId.type === "bank" ? (
                  <>
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-medium text-right">
                      {order.paymentMethodId.accountName}
                    </span>
                    <span className="text-muted-foreground">
                      Account Number:
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium font-mono">
                        {order.paymentMethodId.accountNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          handleCopyCode(order.paymentMethodId.accountNumber!)
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : order.paymentMethodId.type === "mobile_money" ? (
                  <>
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium text-right uppercase">
                      {order.paymentMethodId.mobileNetwork}
                    </span>
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-medium text-right">
                      {order.paymentMethodId.accountName}
                    </span>
                    <span className="text-muted-foreground">
                      Mobile Number:
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium font-mono">
                        {order.paymentMethodId.mobileNumber ||
                          order.paymentMethodId.accountNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          handleCopyCode(
                            (order.paymentMethodId.mobileNumber ||
                              order.paymentMethodId.accountNumber)!,
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground uppercase">
                      {order.paymentMethodId.cryptoAsset || "Crypto"} Address:
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-medium font-mono text-[10px] break-all text-right">
                        {order.paymentMethodId.walletAddress}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 mt-1"
                        onClick={() =>
                          handleCopyCode(order.paymentMethodId.walletAddress!)
                        }
                      >
                        <Copy className="mr-1 h-3 w-3" /> Copy
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center mt-2">
              Submitted: {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Card Images (For both types, if available) */}
        {isBuying && (order.hasImages || fetchedImages.length > 0) && (
          <div className="border rounded-lg overflow-hidden mt-2">
            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Proof of Payment / Receipts
            </div>
            <div className="p-4">
              {fetchedImages.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto">
                  {fetchedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-24 w-40 bg-muted border rounded-md overflow-hidden group cursor-pointer shrink-0"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img}
                        alt={`Receipt ${idx + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-1 rounded">
                          CLICK TO ZOOM
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 gap-2">
                  <p className="text-sm text-muted-foreground">
                    This order has {order.imagesCount || 0} image
                    {order.imagesCount !== 1 ? "s" : ""}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchImages}
                    disabled={isFetchingImages}
                    className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                  >
                    {isFetchingImages ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    View Images
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BUYING LAYOUT */}
        {isBuying && (
          <div className="grid gap-6 py-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              <p className="font-medium text-sm">
                Customer is BUYING this card from YOU
              </p>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm bg-muted/30 p-4 rounded-lg">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-right">
                  {order.userId.firstName} {order.userId.lastName}
                </span>
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-right">
                  {order.userId.email}
                </span>
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-right">
                  {order.userId.phone}
                </span>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">
                Transaction Details
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm border p-4 rounded-lg">
                <span className="text-muted-foreground">Gift Card:</span>
                <span className="font-medium text-right">
                  {order.items[0]?.cardBrand} - {order.items[0]?.cardName}
                </span>
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-right">
                  {order.cardCurrency} {order.items[0]?.cardDenomination} x{" "}
                  {order.items[0]?.quantity}
                </span>
                <div className="col-span-2 border-t my-2"></div>
                <span className="text-muted-foreground font-semibold">
                  Total Paid:
                </span>
                <span className="font-bold text-right text-lg">
                  ${order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card Code Section (for BUY orders) */}
            {(order.status === "pending" || order.status === "processing") && (
              <div className="space-y-3 p-4 border-2 border-blue-100 rounded-xl bg-blue-50/30">
                <h3 className="font-bold text-sm text-blue-700 uppercase tracking-wider">
                  Approve with Gift Card Code
                </h3>
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground mb-1">
                    Enter the gift card code to send to the customer:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Enter card code (e.g. XXXX-XXXX-XXXX-XXXX)"
                      className="flex-1 px-3 py-2.5 text-sm rounded-md border-2 border-blue-200 bg-background font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {order.items[0]?.giftCardCodes &&
              order.items[0].giftCardCodes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">
                    Delivered Codes
                  </h3>
                  <div className="bg-zinc-100 p-4 rounded-lg">
                    {order.items[0].giftCardCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1"
                      >
                        <code className="font-mono font-bold">{code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6"
                          onClick={() => handleCopyCode(code)}
                        >
                          Copy
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="text-xs text-muted-foreground text-center">
              Created on {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleReject}
            disabled={isLoading}
          >
            {rejectMutation.isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Reject
          </Button>
          {(order.status === "pending" || order.status === "processing") && (
            <Button
              className={cn(
                "w-full sm:w-auto",
                !isBuying
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700",
              )}
              onClick={handleApprove}
              disabled={(isBuying && !inputCode.trim()) || isLoading}
            >
              {approveMutation.isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {!isBuying ? "Mark as Paid" : "Approve & Send Code"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Image Lightbox */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-1 border-none bg-transparent shadow-none flex items-center justify-center">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {selectedImage && (
            <div className="relative w-full h-[85vh] flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Full size preview"
                fill
                className="object-contain"
                priority
              />
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="h-6 w-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handleConfirmAction}
        isPending={isLoading}
      />
    </Dialog>
  );
}
