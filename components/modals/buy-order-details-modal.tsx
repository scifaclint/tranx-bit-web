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
import { CheckCircle, XCircle, Copy, Plus, Trash2, MessageSquare, Loader } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useApproveOrder, useRejectOrder } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { AdminOrder } from "@/lib/api/admin";
import Image from "next/image";
import PinVerificationModal from "./pin-verification-modal";
import { ordersApi } from "@/lib/api/orders";
import { PAYMENT_LOGOS } from "@/lib/payment-constants";

interface BuyOrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: AdminOrder;
}

export default function BuyOrderDetailsModal({
    isOpen,
    onClose,
    order,
}: BuyOrderDetailsModalProps) {
    const [codes, setCodes] = useState<string[]>([""]);
    const [adminNotes, setAdminNotes] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
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
                    giftCardCodes: codes.filter(c => c.trim() !== ""),
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
                            Order #{order.orderNumber || order._id.slice(-8)} - BUYING
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

                <div className="grid gap-6 py-4">
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <p className="font-medium text-sm">
                            Customer is BUYING this card from YOU
                        </p>
                    </div>

                    {/* Payment Info */}
                    {order.paymentMethodSnapshot && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Payment Method (Customer Paid To)
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 text-sm p-4">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-medium text-right capitalize">
                                    {order.paymentMethodSnapshot.name || order.paymentMethodSnapshot.type?.replace("_", " ")}
                                </span>

                                {order.paymentMethodSnapshot.accountName && (
                                    <>
                                        <span className="text-muted-foreground">Account Name:</span>
                                        <span className="font-medium text-right">{order.paymentMethodSnapshot.accountName}</span>
                                    </>
                                )}

                                {order.paymentMethodSnapshot.accountNumber && (
                                    <>
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
                                    </>
                                )}

                                {order.paymentMethodSnapshot.mobileNumber && !order.paymentMethodSnapshot.accountNumber && (
                                    <>
                                        <span className="text-muted-foreground">Mobile Number:</span>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-medium font-mono">{order.paymentMethodSnapshot.mobileNumber}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={() => handleCopyCode(order.paymentMethodSnapshot!.mobileNumber!)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </>
                                )}

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
                            </div>
                        </div>
                    )}

                    {/* Payment Receipt */}
                    {(order.hasImages || (order.cardImages && order.cardImages.length > 0) || fetchedImages.length > 0) && (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Payment Receipt
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
                                                            alt={`Receipt ${idx + 1}`}
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
                            <span className="font-bold text-right text-lg text-green-600">
                                {order.payoutCurrency} {order.totalAmount?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground text-right col-span-2 italic">
                                (Card Value: {order.cardCurrency} {order.cardValue?.toLocaleString()})
                            </span>
                        </div>
                    </div>

                    {/* Card Code Section (for pending/processing orders) */}
                    {(order.status === "pending" || order.status === "processing") && (
                        <div className="space-y-4 p-4 border-2 border-blue-100 rounded-xl bg-blue-50/30">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-sm text-blue-700 uppercase tracking-wider">
                                    Approve with Gift Card Codes
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCodes([...codes, ""])}
                                    className="h-7 px-2 text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
                                >
                                    <Plus className="h-3 w-3 mr-1" /> ADD CODE
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {codes.map((code, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400">
                                                #{idx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                                                    const formatted = val.match(/.{1,4}/g)?.join("-") || val;
                                                    const newCodes = [...codes];
                                                    newCodes[idx] = formatted.slice(0, 25); // Limit to reasonable length
                                                    setCodes(newCodes);
                                                }}
                                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border-2 border-blue-200 bg-background font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                        {codes.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCodes(codes.filter((_, i) => i !== idx))}
                                                className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Admin Notes Section */}
                            <div className="space-y-2 pt-2 border-t border-blue-100">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Admin Notes / Message
                                </div>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Enter internal notes or message to user..."
                                    className="w-full px-3 py-2 text-sm rounded-md border-2 border-blue-100 bg-background focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Delivered Codes (for completed orders) */}
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

                <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
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
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={!codes.some(c => c.trim()) || isLoading}
                        >
                            {approveMutation.isPending ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Approve & Send Code
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
