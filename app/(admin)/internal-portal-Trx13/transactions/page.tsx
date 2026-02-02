"use client";

import React, { useState } from "react";
import { useAdminTransactions, useAdminWithdrawals } from "@/hooks/useAdmin";
import {
    RefreshCw,
    Eye,
    Check,
    X,
    Search,
    AlertCircle,
    Wallet,
    Gift,
    TrendingDown,
    TrendingUp,
    Clock,
    DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
        case "deposit":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        case "withdrawal":
            return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
        case "bonus":
        case "referral_bonus":
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
        case "trade":
            return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400";
        default:
            return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400";
    }
};

const LoadingSkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <div
                key={i}
                className="h-16 bg-backgroundSecondary animate-pulse rounded-xl border border-borderColorPrimary"
            />
        ))}
    </div>
);

export default function TransactionsPage() {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const {
        data: transactionsResponse,
        isLoading: isLoadingTransactions,
        isError: isErrorTransactions,
        refetch: refetchTransactions,
        isFetching: isFetchingTransactions,
    } = useAdminTransactions({ page: 1, limit: 50 });

    const {
        data: withdrawalsResponse,
        isLoading: isLoadingWithdrawals,
        isError: isErrorWithdrawals,
        refetch: refetchWithdrawals,
        isFetching: isFetchingWithdrawals,
    } = useAdminWithdrawals({ page: 1, limit: 50 });

    const transactions = transactionsResponse?.data?.transactions || [];
    const withdrawals = withdrawalsResponse?.data?.withdrawals || [];

    const handleRefresh = async () => {
        try {
            if (activeTab === "all") {
                await refetchTransactions();
            } else {
                await refetchWithdrawals();
            }
            toast.success("Data refreshed successfully");
        } catch (error) {
            toast.error("Failed to refresh data");
        }
    };

    const handleViewDetails = (id: string) => {
        // TODO: Implement view details modal or navigation
        toast.info(`Viewing details for transaction: ${id}`);
    };

    const handleApprove = (id: string) => {
        // TODO: Implement approve withdrawal
        toast.info(`Approve withdrawal: ${id}`);
    };

    const handleReject = (id: string) => {
        // TODO: Implement reject withdrawal
        toast.info(`Reject withdrawal: ${id}`);
    };

    const filteredTransactions = transactions.filter(
        (t) =>
            t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.userId.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredWithdrawals = withdrawals.filter(
        (w) =>
            w.userId.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.userId.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isFetching = activeTab === "all" ? isFetchingTransactions : isFetchingWithdrawals;
    const isLoading = activeTab === "all" ? isLoadingTransactions : isLoadingWithdrawals;
    const isError = activeTab === "all" ? isErrorTransactions : isErrorWithdrawals;

    // Calculate stats
    const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;
    const completedWithdrawals = withdrawals.filter((w) => w.status === "completed").length;
    const totalTransactions = transactions.length;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">
                        Transaction Management
                    </h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 uppercase tracking-widest">
                        Monitor All Financial Activities
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        disabled={isFetching}
                        className="font-black uppercase tracking-tighter"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                        {isFetching ? "Refreshing..." : "Refresh"}
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Total Transactions
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{totalTransactions}</div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            All Financial Activities
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Pending Withdrawals
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                            {pendingWithdrawals}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            Awaiting Approval
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Completed Withdrawals
                        </CardTitle>
                        <Check className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-green-600 dark:text-green-400">
                            {completedWithdrawals}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            Successfully Processed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <TabsList className="bg-backgroundSecondary border border-borderColorPrimary">
                                    <TabsTrigger
                                        value="all"
                                        className="font-black uppercase tracking-tighter text-xs"
                                    >
                                        All Transactions
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="withdrawals"
                                        className="font-black uppercase tracking-tighter text-xs"
                                    >
                                        Withdrawals
                                        {pendingWithdrawals > 0 && (
                                            <Badge className="ml-2 bg-yellow-500 text-white text-[8px] px-1.5 py-0">
                                                {pendingWithdrawals}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by user or reference..."
                                        className="pl-8 h-8 text-xs border-borderColorPrimary rounded-lg"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <TabsContent value="all" className="mt-6">
                                <ScrollArea className="h-[600px] pr-4">
                                    {isLoading ? (
                                        <LoadingSkeleton />
                                    ) : isError ? (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <p className="text-sm font-bold uppercase tracking-tight">
                                                Failed to fetch transactions. Please try again.
                                            </p>
                                        </div>
                                    ) : filteredTransactions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground font-bold uppercase text-sm">
                                                No transactions found
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {filteredTransactions.map((transaction, index) => (
                                                    <motion.div
                                                        key={transaction._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="group bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs font-black uppercase">
                                                                        {transaction.reference}
                                                                    </span>
                                                                    <Badge
                                                                        className={`text-[8px] font-black uppercase px-2 py-0.5 ${getTypeColor(
                                                                            transaction.type
                                                                        )}`}
                                                                    >
                                                                        {transaction.type}
                                                                    </Badge>
                                                                    <Badge
                                                                        className={`text-[8px] font-black uppercase px-2 py-0.5 ${getStatusColor(
                                                                            transaction.status
                                                                        )}`}
                                                                    >
                                                                        {transaction.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                    <span className="font-bold">
                                                                        {transaction.userId.email}
                                                                    </span>
                                                                    <span className="font-bold">
                                                                        @{transaction.userId.username}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs">
                                                                    <span className="font-black text-lg">
                                                                        {transaction.amount.toFixed(2)}{" "}
                                                                        {transaction.currency}
                                                                    </span>
                                                                    <span className="text-muted-foreground font-bold">
                                                                        {format(
                                                                            new Date(transaction.createdAt),
                                                                            "MMM dd, yyyy HH:mm"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleViewDetails(transaction._id)
                                                                    }
                                                                    className="font-black uppercase text-[10px] h-8"
                                                                >
                                                                    <Eye className="mr-1 h-3 w-3" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="withdrawals" className="mt-6">
                                <ScrollArea className="h-[600px] pr-4">
                                    {isLoading ? (
                                        <LoadingSkeleton />
                                    ) : isError ? (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <p className="text-sm font-bold uppercase tracking-tight">
                                                Failed to fetch withdrawals. Please try again.
                                            </p>
                                        </div>
                                    ) : filteredWithdrawals.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground font-bold uppercase text-sm">
                                                No withdrawals found
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <AnimatePresence>
                                                {filteredWithdrawals.map((withdrawal, index) => (
                                                    <motion.div
                                                        key={withdrawal._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="group bg-backgroundSecondary border border-borderColorPrimary rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Badge
                                                                        className={`text-[8px] font-black uppercase px-2 py-0.5 ${getStatusColor(
                                                                            withdrawal.status
                                                                        )}`}
                                                                    >
                                                                        {withdrawal.status}
                                                                    </Badge>
                                                                    <Badge
                                                                        className={`text-[8px] font-black uppercase px-2 py-0.5 ${withdrawal.balanceSource ===
                                                                            "referral_bonus"
                                                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                                            }`}
                                                                    >
                                                                        {withdrawal.balanceSource ===
                                                                            "referral_bonus" ? (
                                                                            <>
                                                                                <Gift className="mr-1 h-2.5 w-2.5" />
                                                                                Referral
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Wallet className="mr-1 h-2.5 w-2.5" />
                                                                                Wallet
                                                                            </>
                                                                        )}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                    <span className="font-bold">
                                                                        {withdrawal.userId.email}
                                                                    </span>
                                                                    <span className="font-bold">
                                                                        @{withdrawal.userId.username}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 text-xs">
                                                                    <span className="font-black text-lg">
                                                                        {withdrawal.amount.toFixed(2)}{" "}
                                                                        {withdrawal.currency}
                                                                    </span>
                                                                    <span className="text-muted-foreground font-bold">
                                                                        {format(
                                                                            new Date(withdrawal.createdAt),
                                                                            "MMM dd, yyyy HH:mm"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {withdrawal.paymentMethodId && (
                                                                    <div className="text-[10px] text-muted-foreground font-bold">
                                                                        {withdrawal.paymentMethodId.type} •{" "}
                                                                        {withdrawal.paymentMethodId
                                                                            .accountName ||
                                                                            withdrawal.paymentMethodId
                                                                                .accountNumber ||
                                                                            "N/A"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleViewDetails(withdrawal._id)
                                                                    }
                                                                    className="font-black uppercase text-[10px] h-8"
                                                                >
                                                                    <Eye className="mr-1 h-3 w-3" />
                                                                    View
                                                                </Button>
                                                                {withdrawal.status === "pending" && (
                                                                    <>
                                                                        <Button
                                                                            variant="default"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleApprove(withdrawal._id)
                                                                            }
                                                                            className="font-black uppercase text-[10px] h-8 bg-green-600 hover:bg-green-700 text-white"
                                                                        >
                                                                            <Check className="mr-1 h-3 w-3" />
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleReject(withdrawal._id)
                                                                            }
                                                                            className="font-black uppercase text-[10px] h-8"
                                                                        >
                                                                            <X className="mr-1 h-3 w-3" />
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
