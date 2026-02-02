"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowUpRight,
    Copy,
    Hash,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionDetails } from "@/hooks/useTransactions";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";

export default function TransactionDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const { data, isLoading, error } = useTransactionDetails(id);
    const transaction = data?.data;

    // Loading Skeleton
    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 pb-20 sm:pb-0">
                <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 h-14 flex items-center justify-between sm:h-16 sm:px-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </header>

                <main className="container max-w-lg mx-auto p-4 sm:p-8 space-y-6">
                    <div className="text-center space-y-4 py-6">
                        <Skeleton className="w-16 h-16 mx-auto rounded-2xl" />
                        <div className="space-y-2 flex flex-col items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>

                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-3 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between py-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    {i < 3 && <Separator className="mt-2" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    // Error State
    if (error || !transaction) {
        return (
            <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">Transaction not found</h2>
                <p className="text-zinc-500 mb-6 max-w-xs">
                    We couldn&apos;t find the transaction details you&apos;re looking for.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "success":
            case "completed":
                return {
                    color: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/20",
                    navBg: "bg-green-500",
                    icon: CheckCircle2,
                    label: "Successful"
                };
            case "failed":
            case "rejected":
                return {
                    color: "text-red-600 dark:text-red-400",
                    bg: "bg-red-100 dark:bg-red-900/20",
                    navBg: "bg-red-500",
                    icon: XCircle,
                    label: "Failed"
                };
            default:
                return {
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-100 dark:bg-amber-900/20",
                    navBg: "bg-amber-500",
                    icon: Clock,
                    label: "Processing"
                };
        }
    };

    const getTypeLabel = (type: string) => {
        if (!type) return "";
        return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    const getPaymentMethodImage = (method: any) => {
        if (!method) return null;

        // Values to check in order of priority
        const valuesToTry = [
            method.mobileNetwork,
            method.cryptoAsset,
            method.type,
            method.mobile_network, // Case variation
            method.crypto_asset    // Case variation
        ];

        for (const val of valuesToTry) {
            if (val && typeof val === "string") {
                const key = val.toLowerCase();
                if (PAYMENT_LOGOS[key]) return PAYMENT_LOGOS[key];
            }
        }

        return null;
    };

    const statusConfig = getStatusConfig(transaction.status);
    const StatusIcon = statusConfig.icon;
    const paymentImage = getPaymentMethodImage(transaction.paymentMethodId);

    return (
        <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 pb-20 sm:pb-0">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 h-14 flex items-center justify-between sm:h-16 sm:px-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="-ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                        onClick={() => router.push("/dashboard")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-semibold text-base sm:text-lg">Transaction Details</h1>
                </div>
                {/* Share button removed as requested */}
            </header>

            <main className="container max-w-lg mx-auto p-4 sm:p-8 space-y-6">

                {/* Status Card */}
                <div className="text-center space-y-2 py-6">
                    <div className={`
                        w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4
                        ${statusConfig.bg} ${statusConfig.color}
                    `}>
                        <StatusIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">
                            {getTypeLabel(transaction.type)}
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            {transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <Badge variant="outline" className={`mt-2 border-zinc-200 dark:border-zinc-800 ${statusConfig.color} bg-background`}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader className="pb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Transaction Info</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Reference */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Hash className="w-4 h-4" />
                                <span className="text-sm">Reference</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium font-mono">{transaction.reference}</span>
                                <Copy className="w-3 h-3 text-zinc-400 cursor-pointer hover:text-zinc-600" />
                            </div>
                        </div>

                        <Separator />

                        {/* Date */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Date & Time</span>
                            </div>
                            <span className="text-sm font-medium">
                                {format(new Date(transaction.createdAt), "MMM d, yyyy • h:mm a")}
                            </span>
                        </div>

                        <Separator />

                        {/* Source */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <ArrowUpRight className="w-4 h-4" />
                                <span className="text-sm">Source</span>
                            </div>
                            <span className="text-sm font-medium capitalize">
                                {transaction.balanceSource} Wallet
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Method Section */}
                {transaction.paymentMethodId && (
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                        <CardHeader className="pb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Payment Method</h3>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="w-12 h-12 shrink-0 bg-white rounded-lg border border-zinc-100 flex items-center justify-center p-2">
                                    {paymentImage ? (
                                        <Image
                                            src={paymentImage}
                                            alt="Provider"
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <CreditCard className="w-6 h-6 text-zinc-400" />
                                    )}
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-sm font-bold truncate">
                                        {transaction.paymentMethodId?.accountName || transaction.paymentMethodId?.name || "Unknown Account"}
                                    </p>
                                    <p className="text-xs text-zinc-500 font-mono">
                                        {transaction.paymentMethodId?.mobileNumber || transaction.paymentMethodId?.walletAddress || transaction.paymentMethodId?.accountNumber}
                                    </p>
                                </div>
                                {(() => {
                                    const netOrAsset = transaction.paymentMethodId?.mobileNetwork || transaction.paymentMethodId?.cryptoAsset;
                                    if (!netOrAsset) return null;
                                    return (
                                        <div className="ml-auto text-xs font-medium px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 capitalize">
                                            {NETWORK_LABELS[netOrAsset.toLowerCase()] || netOrAsset.toUpperCase()}
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}

            </main>
        </div>
    );
}
