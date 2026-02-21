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
import { CheckCircle, XCircle, Copy, Loader, MessageSquare } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useApproveOrder, useRejectOrder, useUpdateCardStatus } from "@/hooks/useAdmin";
import { useUIStore } from "@/hooks/useUIStore";
import { toast } from "sonner";
import { AdminOrder } from "@/lib/api/admin";
import Image from "next/image";
import PinVerificationModal from "./pin-verification-modal";
import { ordersApi } from "@/lib/api/orders";
import { PAYMENT_LOGOS } from "@/lib/payment-constants";

interface SellOrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: AdminOrder;
}

export default function SellOrderDetailsModal({
    isOpen,
    onClose,
    order,
}: SellOrderDetailsModalProps) {
    const [adminNotes, setAdminNotes] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<
        "approve" | "reject" | "mark-valid" | null
    >(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [fetchedImages, setFetchedImages] = useState<string[]>([]);
    const [isFetchingImages, setIsFetchingImages] = useState(false);

    const approveMutation = useApproveOrder();
    const rejectMutation = useRejectOrder();
    const updateCardStatusMutation = useUpdateCardStatus();
    const isLoading = approveMutation.isPending || rejectMutation.isPending || updateCardStatusMutation.isPending;

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
                    giftCardCodes: [],
                    adminPin: pin,
                    adminNotes: adminNotes || undefined,
                });
                toast.success("Order approved successfully");
            } else if (pendingAction === "reject") {
                await rejectMutation.mutateAsync({
                    orderId: order._id,
                    rejectionReason: rejectionReason,
                    adminPin: pin,
                });
                toast.success("Order rejected successfully");
            } else if (pendingAction === "mark-valid") {
                await updateCardStatusMutation.mutateAsync({
                    orderId: order._id,
                    payload: {
                        cardStatus: "valid",
                        adminPin: pin
                    }
                });
                toast.success("Card marked as valid successfully");
            }
            setIsPinModalOpen(false);
            setPendingAction(null);
            onClose();
        } catch (error) {
            toast.error(`Failed to ${pendingAction} order`);
        }
    };

    const handleMarkAsValid = () => {
        setPendingAction("mark-valid");
        setIsPinModalOpen(true);
    };

    const handleCopyCode = (text: string) => {
        if (!text) {
            toast.error("Nothing to copy");
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

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
                            Order #{order.orderNumber || order._id.slice(-8)} - SELLING
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
                                {order.totalAmount?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground text-right col-span-2 italic">
                                (Card Value: {order.cardCurrency} {order.cardValue?.toLocaleString()})
                            </span>

                            {/* Mark as Valid Action */}
                            {order.status !== "completed" && order.status !== "failed" && (
                                <div className="col-span-2 flex justify-end pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "h-8 text-[11px] font-bold uppercase tracking-wider",
                                            order.cardStatus === "valid"
                                                ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        )}
                                        onClick={handleMarkAsValid}
                                        disabled={isLoading || order.cardStatus === "valid"}
                                    >
                                        {order.cardStatus === "valid" ? "Card Verified: Valid" : "Mark Card as Valid"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Images */}
                    {(order.hasImages || (order.cardImages && order.cardImages.length > 0) || fetchedImages.length > 0) && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Card Images (Customer uploaded)
                            </div>
                            <div className="p-4">
                                {(() => {
                                    const displayImages = (order.cardImages && order.cardImages.length > 0) ? order.cardImages : fetchedImages;
                                    if (displayImages.length > 0) {
                                        return (
                                            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                                                {displayImages.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="relative h-24 w-40 bg-muted border rounded-md overflow-hidden group cursor-pointer shrink-0"
                                                        onClick={() => {
                                                            setImageLoading(true);
                                                            setSelectedImage(img);
                                                        }}
                                                    >
                                                        <Image
                                                            src={img}
                                                            alt={`Card ${idx + 1}`}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return (
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
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                {isFetchingImages ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                View Images
                                            </Button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Card Codes */}
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
                            {order.paymentMethodSnapshot?.type
                                ? order.paymentMethodSnapshot.name || order.paymentMethodSnapshot.type.replace("_", " ")
                                : (order.paymentMethod ||
                                    (order.paymentMethodId?.type === "crypto"
                                        ? (order.paymentMethodId?.cryptoAsset === "bitcoin" ? "Bitcoin" : (order.paymentMethodId?.cryptoAsset === "litecoin" ? "Litecoin" : "USDT"))
                                        : order.paymentMethodId?.type?.replace("_", " ") || "N/A"))}
                            )
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                            {order.paymentMethodSnapshot ? (
                                // New Snapshot Logic
                                <>
                                    {(order.paymentMethodSnapshot.accountName || order.paymentMethodSnapshot.accountNumber || order.paymentMethodSnapshot.mobileNumber) && (
                                        <>
                                            <span className="text-muted-foreground">Account Name:</span>
                                            <span className="font-medium text-right">{order.paymentMethodSnapshot.accountName || "N/A"}</span>
                                            <span className="text-muted-foreground">
                                                {order.paymentMethodSnapshot.mobileNumber ? "Mobile Number:" : "Account Number:"}
                                            </span>
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-medium font-mono">
                                                    {order.paymentMethodSnapshot.mobileNumber || order.paymentMethodSnapshot.accountNumber}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => handleCopyCode(order.paymentMethodSnapshot!.mobileNumber || order.paymentMethodSnapshot!.accountNumber!)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            {order.paymentMethodSnapshot.mobileNetwork && (
                                                <>
                                                    <span className="text-muted-foreground">Network:</span>
                                                    <div className="flex items-center justify-end gap-2">
                                                        {PAYMENT_LOGOS[order.paymentMethodSnapshot.mobileNetwork.toLowerCase()] && (
                                                            <Image
                                                                src={PAYMENT_LOGOS[order.paymentMethodSnapshot.mobileNetwork.toLowerCase()]}
                                                                alt={order.paymentMethodSnapshot.mobileNetwork}
                                                                width={20}
                                                                height={20}
                                                                className="object-contain"
                                                            />
                                                        )}
                                                        <span className="font-medium text-right uppercase text-[10px]">
                                                            {order.paymentMethodSnapshot.mobileNetwork}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                    {order.paymentMethodSnapshot.walletAddress && (
                                        <>
                                            <span className="text-muted-foreground uppercase">
                                                {PAYMENT_LOGOS[order.paymentMethodSnapshot.cryptoAsset?.toLowerCase() || ''] && (
                                                    <Image
                                                        src={PAYMENT_LOGOS[order.paymentMethodSnapshot.cryptoAsset?.toLowerCase() || '']}
                                                        alt={order.paymentMethodSnapshot.cryptoAsset || 'Crypto'}
                                                        width={16}
                                                        height={16}
                                                        className="inline-block mr-1 object-contain"
                                                    />
                                                )}
                                                {order.paymentMethodSnapshot.cryptoAsset || "Crypto"} Address:
                                            </span>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="font-medium font-mono text-[10px] break-all text-right">
                                                    {order.paymentMethodSnapshot.walletAddress}
                                                </span>
                                                <Button variant="outline" size="sm" className="h-7 mt-1" onClick={() => handleCopyCode(order.paymentMethodSnapshot!.walletAddress!)}>
                                                    <Copy className="mr-1 h-3 w-3" /> Copy
                                                </Button>
                                            </div>
                                            {order.paymentMethodSnapshot.network && (
                                                <>
                                                    <span className="text-muted-foreground">Blockchain:</span>
                                                    <span className="font-medium text-right uppercase text-[10px]">{order.paymentMethodSnapshot.network}</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                // Legacy Fallback Logic
                                order.paymentMethodId.type === "bank" ? (
                                    <>
                                        <span className="text-muted-foreground">Account Name:</span>
                                        <span className="font-medium text-right">{order.paymentMethodId.accountName}</span>
                                        <span className="text-muted-foreground">Account Number:</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-medium font-mono">{order.paymentMethodId.accountNumber}</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyCode(order.paymentMethodId.accountNumber!)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </>
                                ) : order.paymentMethodId.type === "mobile_money" ? (
                                    <>
                                        <span className="text-muted-foreground">Network:</span>
                                        <span className="font-medium text-right uppercase text-[10px]">{order.paymentMethodId.mobileNetwork}</span>
                                        <span className="text-muted-foreground">Account Name:</span>
                                        <span className="font-medium text-right">{order.paymentMethodId.accountName}</span>
                                        <span className="text-muted-foreground">Mobile Number:</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-medium font-mono">{order.paymentMethodId.mobileNumber || order.paymentMethodId.accountNumber}</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyCode((order.paymentMethodId.mobileNumber || order.paymentMethodId.accountNumber)!)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-muted-foreground uppercase">{order.paymentMethodId.cryptoAsset || "Crypto"} Address:</span>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-medium font-mono text-[10px] break-all text-right">{order.paymentMethodId.walletAddress}</span>
                                            <Button variant="outline" size="sm" className="h-7 mt-1" onClick={() => handleCopyCode(order.paymentMethodId.walletAddress!)}>
                                                <Copy className="mr-1 h-3 w-3" /> Copy
                                            </Button>
                                        </div>
                                    </>
                                )
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-center mt-2">
                        Submitted: {new Date(order.createdAt).toLocaleString()}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2 border-t pt-4">
                    <Button
                        variant="ghost"
                        className="w-full sm:w-auto text-primary hover:text-primary hover:bg-primary/5 font-bold uppercase tracking-wider text-[11px]"
                        onClick={() => {
                            useUIStore.getState().openChat(order._id, {
                                userName: `${order.userId.firstName} ${order.userId.lastName}`,
                                orderNumber: order.orderNumber
                            });
                            onClose();
                        }}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Start Chat
                    </Button>
                    {order.status !== "completed" && order.status !== "cancelled" && order.status !== "failed" && (
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
                    )}
                    {(order.status === "pending" || order.status === "processing") && (
                        <Button
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                            onClick={handleApprove}
                            disabled={isLoading}
                        >
                            {approveMutation.isPending ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Mark as Paid
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
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                    <Loader className="h-12 w-12 animate-spin text-white" />
                                </div>
                            )}
                            <Image
                                src={selectedImage}
                                alt="Full size preview"
                                fill
                                className="object-contain"
                                priority
                                onLoad={() => setImageLoading(false)}
                            />
                            <Button
                                variant="ghost"
                                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 z-20"
                                onClick={() => {
                                    setSelectedImage(null);
                                    setImageLoading(false);
                                }}
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
