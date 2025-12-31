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
} from "lucide-react";
import Image from "next/image";

type FilterStatus = "all" | "pending" | "completed" | "failed";
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

  // Read filters from URL query parameters on mount
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");

    if (
      statusParam &&
      ["all", "pending", "completed", "failed"].includes(statusParam)
    ) {
      setStatusFilter(statusParam as FilterStatus);
    }

    if (typeParam && ["all", "buy", "sell"].includes(typeParam)) {
      setTypeFilter(typeParam as FilterType);
    }
  }, [searchParams]);

  // Mock transactions - expanded for better demo
  const transactions: Transaction[] = [
    {
      id: "TXN-2025-001",
      brand: "Amazon",
      brandLogo: "/brands/logo-amazon.svg",
      type: "sell",
      date: "Dec 15, 2025",
      amount: 25.0,
      status: "completed",
    },
    {
      id: "TXN-2025-002",
      brand: "iTunes",
      brandLogo: "/brands/itunes-1.svg",
      type: "buy",
      date: "Dec 14, 2025",
      amount: 50.0,
      status: "pending",
    },
    {
      id: "TXN-2025-003",
      brand: "Steam",
      brandLogo: "/brands/steam-1.svg",
      type: "buy",
      date: "Dec 13, 2025",
      amount: 100.0,
      status: "completed",
    },
    {
      id: "TXN-2025-004",
      brand: "PlayStation",
      brandLogo: "/brands/playstation-6.svg",
      type: "sell",
      date: "Dec 12, 2025",
      amount: 75.0,
      status: "failed",
    },
    {
      id: "TXN-2025-005",
      brand: "Apple",
      brandLogo: "/brands/apple-11.svg",
      type: "buy",
      date: "Dec 11, 2025",
      amount: 200.0,
      status: "pending",
    },
  ];

  const statusFilters: {
    label: string;
    value: FilterStatus;
    icon: React.ElementType;
  }[] = [
    { label: "All Status", value: "all", icon: Filter },
    { label: "Pending", value: "pending", icon: Clock },
    { label: "Completed", value: "completed", icon: CheckCircle2 },
    { label: "Failed", value: "failed", icon: XCircle },
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

  // Filter transactions based on active filters
  const filteredTransactions = transactions.filter((t) => {
    const statusMatch = statusFilter === "all" || t.status === statusFilter;
    const typeMatch = typeFilter === "all" || t.type === typeFilter;
    return statusMatch && typeMatch;
  });

  // Handle row click
  const handleRowClick = (transactionId: string) => {
    router.push(`/transactions/${transactionId}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Filter Dropdowns */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your gift card transactions
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[140px]">
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
                    className={`cursor-pointer flex items-center gap-2 ${
                      statusFilter === filter.value
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
              <Button variant="outline" className="gap-2 min-w-[130px]">
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
                    className={`cursor-pointer flex items-center gap-2 ${
                      typeFilter === filter.value
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
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_auto] gap-4 px-6 py-4 bg-muted/50 border-b font-semibold text-sm">
            <div>Product name</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Status</div>
            <div className="w-8"></div>
          </div>

          {/* Table Body with ScrollArea */}
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border/50">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  onClick={() => handleRowClick(transaction.id)}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_auto] gap-4 px-6 py-4 hover:bg-muted/40 transition-all duration-200 cursor-pointer items-center group"
                >
                  {/* Product name (Brand) */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0 bg-muted/60 rounded-lg p-2 ring-1 ring-border/50 group-hover:ring-border transition-all">
                      <Image
                        src={transaction.brandLogo}
                        alt={transaction.brand}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm group-hover:text-foreground/80 transition-colors">
                        {transaction.brand}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.id}
                      </span>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Badge
                      variant="outline"
                      className="text-xs font-medium w-fit"
                    >
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </Badge>
                  </div>

                  {/* Amount */}
                  <div className="font-semibold text-sm tabular-nums">
                    ${transaction.amount.toFixed(2)}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-muted-foreground">
                    {transaction.date}
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      variant="outline"
                      className={`w-fit text-xs font-medium flex items-center gap-1.5 ${
                        transaction.status === "completed"
                          ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : transaction.status === "pending"
                          ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}
                    >
                      {transaction.status === "completed" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {transaction.status === "pending" && (
                        <Clock className="h-3 w-3" />
                      )}
                      {transaction.status === "failed" && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex items-center justify-end">
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
