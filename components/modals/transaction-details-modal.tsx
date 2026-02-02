"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CheckCircle,
    XCircle,
    Copy,
    User,
    CreditCard,
    Wallet,
    Calendar,
    Hash,
    Smartphone,
    Building,
    Globe
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AdminTransaction, AdminWithdrawal } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { PAYMENT_LOGOS } from "@/lib/payment-constants";
import Image from "next/image";
import PinVerificationModal from "./pin-verification-modal";
import { Loader } from "lucide-react";

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: AdminTransaction | AdminWithdrawal | null;
    onApprove: (id: string, pin: string) => Promise<void>;
    onReject: (id: string, pin: string, notes: string) => Promise<void>;
    isLoading?: boolean;
}

export default function TransactionDetailsModal({
    isOpen,
    onClose,
    item,
    onApprove,
    onReject,
    isLoading = false,
}: TransactionDetailsModalProps) {
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);
    const [adminNotes, setAdminNotes] = useState("");

    if (!item) return null;

    const isWithdrawal = "balanceSource" in item;
    const reference = "reference" in item ? item.reference : "Withdrawal";

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
            case "success":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "pending":
            case "processing":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "failed":
            case "rejected":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400";
        }
    };

    const isActionDisabled = ["completed", "success", "failed", "rejected"].includes(item.status.toLowerCase());

    const handleApproveClick = () => {
        setPendingAction("approve");
        setIsPinModalOpen(true);
    };

    const handleRejectClick = () => {
        const notes = prompt("Please enter a reason for rejection (Required):");
        if (!notes) {
            toast.error("Rejection reason is required");
            return;
        }
        setAdminNotes(notes);
        setPendingAction("reject");
        setIsPinModalOpen(true);
    };

    const handleConfirmAction = async (pin: string) => {
        if (!pendingAction) return;

        try {
            if (pendingAction === "approve") {
                await onApprove(item._id, pin);
            } else {
                await onReject(item._id, pin, adminNotes);
            }
            setIsPinModalOpen(false);
            setPendingAction(null);
            setAdminNotes("");
            onClose();
        } catch (error) {
            // Error handling is usually done in the parent or mutation
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-background border-borderColorPrimary rounded-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                                {isWithdrawal ? "Withdrawal Details" : "Transaction Details"}
                            </DialogTitle>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                {isWithdrawal ? item.balanceSource.replace("_", " ") : item.type} • {reference}
                            </p>
                        </div>
                        <Badge className={cn("text-[10px] font-black uppercase px-2 py-1", getStatusColor(item.status))}>
                            {item.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] p-6 pt-4">
                    <div className="space-y-6">
                        {/* Amount Section */}
                        <div className="bg-backgroundSecondary border border-borderColorPrimary rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                Amount {isWithdrawal ? "to send" : "processed"}
                            </p>
                            <h2 className="text-4xl font-black tracking-tight">
                                {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xl">{item.currency}</span>
                            </h2>
                        </div>

                        {/* User Info */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <User className="h-3 w-3" /> User Information
                            </h3>
                            <div className="bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Full Name</span>
                                    <span className="font-black uppercase tracking-tight">{item.userId.firstName} {item.userId.lastName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Username</span>
                                    <span className="font-black tracking-tight">@{item.userId.username}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Email</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black tracking-tight">{item.userId.email}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(item.userId.email, "Email")}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Info */}
                        {item.paymentMethodId && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="h-3 w-3" /> Payment Destination
                                </h3>
                                <div className="bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Type</span>
                                        <Badge variant="outline" className="font-black uppercase text-[8px] bg-background">
                                            {item.paymentMethodId.type.replace("_", " ")}
                                        </Badge>
                                    </div>

                                    {item.paymentMethodId.type === "bank" && (
                                        <>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Bank</span>
                                                <span className="font-black uppercase tracking-tight flex items-center gap-1">
                                                    <Building className="h-3 w-3" /> {item.paymentMethodId.bankName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Account No</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black">{item.paymentMethodId.accountNumber}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(item.paymentMethodId.accountNumber!, "Account number")}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Account Name</span>
                                                <span className="font-black uppercase tracking-tight">{item.paymentMethodId.accountName}</span>
                                            </div>
                                        </>
                                    )}

                                    {item.paymentMethodId.type === "mobile_money" && (
                                        <>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Network</span>
                                                <div className="flex items-center gap-2">
                                                    {PAYMENT_LOGOS[item.paymentMethodId.mobileNetwork?.toLowerCase() || ""] && (
                                                        <div className="relative h-4 w-4">
                                                            <Image
                                                                src={PAYMENT_LOGOS[item.paymentMethodId.mobileNetwork!.toLowerCase()]}
                                                                alt={item.paymentMethodId.mobileNetwork!}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="font-black uppercase tracking-tight flex items-center gap-1">
                                                        <Smartphone className="h-3 w-3" /> {item.paymentMethodId.mobileNetwork}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Mobile No</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black">{item.paymentMethodId.mobileNumber}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(item.paymentMethodId.mobileNumber!, "Mobile number")}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Account Name</span>
                                                <span className="font-black uppercase tracking-tight">{item.paymentMethodId.accountName}</span>
                                            </div>
                                        </>
                                    )}

                                    {item.paymentMethodId.type === "crypto" && (
                                        <>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Asset</span>
                                                <div className="flex items-center gap-2">
                                                    {PAYMENT_LOGOS[item.paymentMethodId.cryptoAsset?.toLowerCase() || ""] && (
                                                        <div className="relative h-4 w-4">
                                                            <Image
                                                                src={PAYMENT_LOGOS[item.paymentMethodId.cryptoAsset!.toLowerCase()]}
                                                                alt={item.paymentMethodId.cryptoAsset!}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="font-black uppercase tracking-tight flex items-center gap-1">
                                                        <Globe className="h-3 w-3" /> {item.paymentMethodId.cryptoAsset}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-1">
                                                <span className="font-bold text-muted-foreground opacity-60 uppercase text-[10px]">Wallet Address</span>
                                                <div className="flex items-center gap-2 bg-background p-2 rounded border border-borderColorPrimary">
                                                    <span className="font-mono text-[10px] font-black break-all flex-1">{item.paymentMethodId.walletAddress}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(item.paymentMethodId.walletAddress!, "Wallet address")}>
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Temporal Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> Date
                                </h3>
                                <div className="bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-3">
                                    <p className="font-black text-xs uppercase tracking-tight">
                                        {format(new Date(item.createdAt), "MMM dd, yyyy")}
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground">
                                        {format(new Date(item.createdAt), "HH:mm:ss")}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Hash className="h-3 w-3" /> ID
                                </h3>
                                <div className="bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-3 flex items-center justify-between">
                                    <p className="font-mono font-black text-[10px] opacity-60 uppercase">
                                        ...{item._id.slice(-8)}
                                    </p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(item._id, "Internal ID")}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 grid grid-cols-2 gap-3 sm:gap-3 items-center">
                    <Button
                        variant="destructive"
                        className="font-black uppercase tracking-tighter rounded-xl h-12"
                        onClick={handleRejectClick}
                        disabled={isActionDisabled || isLoading}
                    >
                        {isLoading && pendingAction === "reject" ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Decline
                    </Button>
                    <Button
                        className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black uppercase tracking-tighter rounded-xl h-12"
                        onClick={handleApproveClick}
                        disabled={isActionDisabled || isLoading}
                    >
                        {isLoading && pendingAction === "approve" ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Mark as Paid
                    </Button>
                </DialogFooter>
            </DialogContent>

            <PinVerificationModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handleConfirmAction}
                isPending={isLoading}
            />
        </Dialog>
    );
}
