"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Gift,
    Repeat,
    RefreshCcw,
    CheckCircle2,
    Clock,
    XCircle,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserTransactions } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";

import { AllTransactionsModal } from "@/components/modals/all-transactions-modal";

export default function RecentTransactions() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const { data: transactionsData, isLoading } = useUserTransactions({ limit: 5 });
    const transactions = transactionsData?.data?.transactions || [];

    const getIcon = (type: string) => {
        switch (type) {
            case "withdrawal":
                return <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />;
            case "trade_credit":
                return <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />;
            case "bonus":
                return <Gift className="w-4 h-4 sm:w-5 sm:h-5" />;
            case "internal_transfer":
                return <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />;
            case "order_payment":
                return <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />;
            default:
                return <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success":
            case "completed":
                return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30";
            case "pending":
            case "processing":
                return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30";
            case "failed":
            case "rejected":
                return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30";
            default:
                return "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-800";
        }
    };

    const getTypeLabel = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (isLoading) {
        return (
            <Card className="bg-background h-full border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg sm:text-lg font-bold">Recent Transactions</CardTitle>
                        <Skeleton className="h-4 w-16" />
                    </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20 sm:w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="space-y-2 text-right">
                                <Skeleton className="h-4 w-16 sm:w-20" />
                                <Skeleton className="h-3 w-12 ml-auto" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm h-full flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 p-3 sm:p-6 shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-lg font-semibold tracking-tight">Recent Transactions</CardTitle>
                    <Button
                        variant="link"
                        className="text-xs sm:text-xs font-semibold p-0 h-auto hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-500"
                        onClick={() => setShowModal(true)}
                    >
                        View All
                    </Button>
                </div>
            </CardHeader>
            <AllTransactionsModal isOpen={showModal} onClose={() => setShowModal(false)} />
            <CardContent className="p-0 flex-1 overflow-auto">
                {transactions.length > 0 ? (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {transactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer group"
                                onClick={() => router.push(`/transactions/${tx._id}`)}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    {/* Icon Container - Lighter Style */}
                                    <div className={`
                                        w-10 h-10 sm:w-11 sm:h-11 rounded-full 
                                        flex items-center justify-center shrink-0 border
                                        transition-colors duration-200
                                        ${tx.type === 'withdrawal' || tx.type === 'order_payment'
                                            ? tx.type === 'order_payment'
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-900/30 dark:text-indigo-400'
                                                : 'bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100'
                                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                                        }
                                    `}>
                                        {getIcon(tx.type)}
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <p className="font-semibold text-sm sm:text-base truncate text-zinc-900 dark:text-zinc-100">
                                            {getTypeLabel(tx.type)}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                                            {format(new Date(tx.createdAt), "MMM d • h:mm a")}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                    <p className={`
                                        font-bold text-sm sm:text-base tabular-nums tracking-tight
                                        ${tx.type === 'withdrawal' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-900 dark:text-zinc-100'}
                                    `}>
                                        {tx.type === 'withdrawal' || tx.type === 'order_payment' ? '−' : '+'}
                                        {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={`
                                            text-[10px] sm:text-[10px] font-bold uppercase tracking-wider h-5 px-1.5 border
                                            ${getStatusColor(tx.status)}
                                        `}
                                    >
                                        {tx.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12 px-4 text-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-50 dark:bg-zinc-900 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-3">
                            <RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400" />
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-200 mb-1">No recent activity</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                            Transactions will appear here once you start using your account.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}