"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Filter,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  CreditCard,
  History,
  DollarSign,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useUserOrders } from "@/hooks/useOrders";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

type FilterStatus =
  | "all"
  | "pending_payment"
  | "under_review"
  | "completed"
  | "cancelled"
  | "refunded"
  | "payment_claimed";
type FilterType = "all" | "buy" | "sell";

interface Transaction {
  id: string;
  brand: string;
  brandLogo: string;
  type: "buy" | "sell";
  date: string;
  amount: number;
  status: "pending" | "completed" | "failed";
}

export default function TransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();

  // API Call
  const { data: ordersData, isLoading, isFetching } = useUserOrders(page);
  const transactions = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination;

  // Read filters from URL query parameters on mount
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");

    const validStatuses = [
      "all",
      "pending_payment",
      "under_review",
      "completed",
      "cancelled",
      "refunded",
      "payment_claimed",
    ];

    if (statusParam && validStatuses.includes(statusParam)) {
      setStatusFilter(statusParam as FilterStatus);
    }

    if (typeParam && ["all", "buy", "sell"].includes(typeParam)) {
      setTypeFilter(typeParam as FilterType);
    }
  }, [searchParams]);

  const statusFilters: {
    label: string;
    value: FilterStatus;
    icon: React.ElementType;
  }[] = [
      { label: "All Status", value: "all", icon: Filter },
      { label: "Pending Payment", value: "pending_payment", icon: Clock },
      { label: "Under Review", value: "under_review", icon: TrendingUp },
      { label: "Completed", value: "completed", icon: CheckCircle2 },
      { label: "Cancelled", value: "cancelled", icon: XCircle },
      { label: "Refunded", value: "refunded", icon: DollarSign },
      { label: "Payment Claimed", value: "payment_claimed", icon: Wallet },
    ];

  const typeFilters: {
    label: string;
    value: FilterType;
    icon: React.ElementType;
  }[] = [
      { label: "All Types", value: "all", icon: Filter },
      { label: "Buy", value: "buy", icon: TrendingUp },
      { label: "Sell", value: "sell", icon: TrendingDown },
    ];

  const getStatusLabel = () => {
    return (
      statusFilters.find((f) => f.value === statusFilter)?.label || "All Status"
    );
  };

  const getTypeLabel = () => {
    return (
      typeFilters.find((f) => f.value === typeFilter)?.label || "All Types"
    );
  };

  // Filter transactions based on active filters (client-side for now, could be server-side later)
  const filteredTransactions = transactions.filter((t) => {
    const statusMatch = statusFilter === "all" || t.status.toLowerCase().includes(statusFilter.toLowerCase());
    const typeMatch = typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();
    return statusMatch && typeMatch;
  });

  // Handle row click
  const handleRowClick = (transactionId: string) => {
    router.push(`/transactions/${transactionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 text-black animate-spin" />
        <p className="mt-2 text-sm text-muted-foreground font-medium">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Filter Dropdowns */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Transactions</h1>
          {isFetching && <Loader className="h-4 w-4 text-muted-foreground animate-spin" />}
        </div>

        {/* Filter Controls */}
        <div className={`flex items-center gap-3 ${isMobile ? "w-full overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" : ""}`}>
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[140px] bg-backgroundSecondary border-borderColorPrimary dark:border-white/10">
                <Filter className="h-4 w-4" />
                {getStatusLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Filter by Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`cursor-pointer flex items-center gap-2 ${statusFilter === filter.value
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : ""
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {filter.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[130px] bg-backgroundSecondary border-borderColorPrimary dark:border-white/10">
                <Filter className="h-4 w-4" />
                {getTypeLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Filter by Type
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {typeFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <DropdownMenuItem
                    key={filter.value}
                    onClick={() => setTypeFilter(filter.value)}
                    className={`cursor-pointer flex items-center gap-2 ${typeFilter === filter.value
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : ""
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {filter.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Transaction Table */}
      {filteredTransactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 border rounded-2xl bg-backgroundSecondary/20 border-borderColorPrimary border-dashed"
        >
          <div className="bg-muted/20 p-4 rounded-full mb-4">
            <History className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-foreground/80">No Transactions Found</h3>
          <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-2">
            Your gift card transactions will appear here once they are processed.
          </p>
        </motion.div>
      ) : (
        <div className="dark:bg-background border-borderColorPrimary shadow-sm rounded-lg overflow-hidden border">
          {/* Table Header - Desktop Only */}
          {!isMobile && (
            <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_auto] gap-4 px-6 py-4 bg-backgroundSecondary/50 border-b border-borderColorPrimary font-semibold text-sm">
              <div>Product name</div>
              <div>Type</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Status</div>
              <div className="w-8"></div>
            </div>
          )}

          {/* Table Body / Card List */}
          <ScrollArea className={`${isMobile ? "h-[calc(100vh-300px)]" : "h-[calc(100vh-350px)]"} min-h-[400px]`}>
            <div className={`divide-y divide-border/50 ${isMobile ? "p-4 space-y-4 divide-y-0" : ""}`}>
              {filteredTransactions.map((transaction) => {
                if (isMobile) {
                  return (
                    <div
                      key={transaction.orderId}
                      onClick={() => handleRowClick(transaction.orderId)}
                      className="p-5 bg-backgroundSecondary/30 rounded-2xl border border-borderColorPrimary/50 active:scale-[0.98] transition-all space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted/40 rounded-xl flex items-center justify-center border border-borderColorPrimary/30">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">
                              {transaction.productName || transaction.brand}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              #{transaction.orderId.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 h-5 font-semibold ${transaction.status.toLowerCase().includes("completed")
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : transaction.status.toLowerCase().includes("pending")
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                        >
                          {transaction.status.toLowerCase().includes("completed") ? "Completed" : transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase()}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-end pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-muted/20">
                              {transaction.type.toUpperCase()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{transaction.date}</span>
                          </div>
                          <div className="text-lg font-bold tabular-nums">
                            ${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-2 bg-muted/20 rounded-full">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={transaction.orderId}
                    onClick={() => handleRowClick(transaction.orderId)}
                    className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_auto] gap-4 px-6 py-4 hover:bg-backgroundSecondary transition-all duration-200 cursor-pointer items-center group"
                  >
                    {/* Desktop row content remains same */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 flex-shrink-0 bg-muted/60 rounded-lg flex items-center justify-center ring-1 ring-border/50 group-hover:ring-border transition-all overflow-hidden p-1">
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm group-hover:text-foreground/80 transition-colors truncate max-w-[150px]">
                          {transaction.productName || transaction.brand}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.orderId}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Badge variant="outline" className="text-xs font-medium w-fit">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </div>

                    <div className="font-semibold text-sm tabular-nums">
                      ${transaction.amount.toFixed(2)}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {transaction.date}
                    </div>

                    <div>
                      <Badge
                        variant="outline"
                        className={`w-fit text-xs font-medium flex items-center gap-1.5 ${transaction.status.toLowerCase().includes("completed")
                          ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : transaction.status.toLowerCase().includes("pending")
                            ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400"
                          }`}
                      >
                        {transaction.status.toLowerCase().includes("completed") && <CheckCircle2 className="h-3 w-3" />}
                        {transaction.status.toLowerCase().includes("pending") && <Clock className="h-3 w-3" />}
                        {!transaction.status.toLowerCase().includes("completed") && !transaction.status.toLowerCase().includes("pending") && <XCircle className="h-3 w-3" />}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-end">
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-backgroundSecondary/30 border-t border-borderColorPrimary font-medium text-sm mt-auto">
              <div className="text-muted-foreground hidden sm:block">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 border-black/10 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 border-black/10 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
