"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowUpRight,
    ArrowDownLeft,
    ArrowLeft,
    Gift,
    Repeat,
    RefreshCcw,
    Search,
    Loader2,
    Inbox
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserTransactionsInfinite } from "@/hooks/useTransactions";

interface AllTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AllTransactionsModal({ isOpen, onClose }: AllTransactionsModalProps) {
    const router = useRouter();

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    // Infinite Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useUserTransactionsInfinite({
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        limit: 15
    });

    const transactions = data?.pages.flatMap((page) => page.data.transactions) || [];

    // Infinite Scroll Observer
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [observerTarget, hasNextPage, isFetchingNextPage, fetchNextPage]);


    // UI Helpers
    const getIcon = (type: string) => {
        switch (type) {
            case "withdrawal": return <ArrowUpRight className="w-4 h-4" />;
            case "trade_credit": return <ArrowDownLeft className="w-4 h-4" />;
            case "bonus": return <Gift className="w-4 h-4" />;
            case "internal_transfer": return <Repeat className="w-4 h-4" />;
            default: return <RefreshCcw className="w-4 h-4" />;
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

    // Client-side filtering for Search (since API doesn't support it yet)
    // Note: This only filters LOADED items. Truly effective search needs backend support.
    const filteredTransactions = transactions.filter(tx => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            tx.reference.toLowerCase().includes(query) ||
            tx.amount.toString().includes(query)
        );
    });

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col bg-background dark:bg-zinc-950/50 backdrop-blur-xl">
                <SheetHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-background/80 backdrop-blur sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="sm:hidden -ml-2 h-8 w-8" onClick={onClose}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <SheetTitle className="text-lg font-bold">All Transactions</SheetTitle>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search reference or amount..."
                                className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="flex-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="flex-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                    <SelectItem value="trade_credit">Trade Credit</SelectItem>
                                    <SelectItem value="bonus">Bonus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </SheetHeader>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto min-h-0 container-snap px-4 sm:px-6 py-2">
                    {/* Loading Initial State */}
                    {isLoading && (
                        <div className="flex flex-col gap-2 py-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-20 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && filteredTransactions.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                <Inbox className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">No transactions found</h3>
                            <p className="text-sm mt-1 max-w-[200px]">
                                Try adjusting your filters or search terms.
                            </p>
                        </div>
                    )}

                    {/* List */}
                    <div className="space-y-1">
                        {filteredTransactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 shadow-sm mb-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                                onClick={() => {
                                    onClose();
                                    router.push(`/transactions/${tx._id}`);
                                }}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`
                                        w-10 h-10 rounded-full 
                                        flex items-center justify-center shrink-0 border
                                        ${tx.type === 'withdrawal'
                                            ? 'bg-zinc-50 border-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100'
                                            : 'bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                                        }
                                    `}>
                                        {getIcon(tx.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">
                                            {getTypeLabel(tx.type)}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            {format(new Date(tx.createdAt), "MMM d, h:mm a")}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`font-bold text-sm mb-1 ${tx.type === 'withdrawal' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-900 dark:text-zinc-100'
                                        }`}>
                                        {tx.type === 'withdrawal' ? '−' : '+'}
                                        {tx.currency} {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 h-5 ${getStatusColor(tx.status)}`}>
                                        {tx.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Infinite Scroll Loader */}
                    <div ref={observerTarget} className="py-6 flex justify-center w-full">
                        {isFetchingNextPage && (
                            <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading more...</span>
                            </div>
                        )}
                        {!hasNextPage && transactions.length > 0 && (
                            <p className="text-xs text-zinc-400 font-medium">No more transactions</p>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
