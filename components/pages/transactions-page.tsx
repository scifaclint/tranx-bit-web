"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, ShoppingBag, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type FilterStatus = "all" | "pending" | "completed" | "failed";

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
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  // Read filter from URL query parameter on mount
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (
      filterParam &&
      ["all", "pending", "completed", "failed"].includes(filterParam)
    ) {
      setActiveFilter(filterParam as FilterStatus);
    }
  }, [searchParams]);

  // Mock transactions
  const transactions: Transaction[] = [
    {
      id: "1",
      brand: "Amazon",
      brandLogo: "/brands/logo-amazon.svg",
      type: "sell",
      date: "Oct 28, 2025",
      amount: 25.0,
      status: "completed",
    },
    {
      id: "2",
      brand: "iTunes",
      brandLogo: "/brands/itunes-1.svg",
      type: "buy",
      date: "Oct 27, 2025",
      amount: 50.0,
      status: "pending",
    },
  ];

  const filters: { label: string; value: FilterStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  const getFilterLabel = () => {
    return filters.find((f) => f.value === activeFilter)?.label || "All";
  };

  // Filter transactions based on active filter
  const filteredTransactions =
    activeFilter === "all"
      ? transactions
      : transactions.filter((t) => t.status === activeFilter);

  return (
    <div className="w-full space-y-6">
      {/* Header with Filter Dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your gift card transactions
          </p>
        </div>

        {/* Filter Dropdown at Far Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {getFilterLabel()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`cursor-pointer ${
                  activeFilter === filter.value
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : ""
                }`}
              >
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty State or Transactions Table */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            {/* Animated background circle */}
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-950 rounded-full opacity-20 animate-pulse"></div>
            {/* Icon */}
            <div className="relative bg-blue-50 dark:bg-blue-950/50 rounded-full p-6">
              <FileText className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Your transaction history will appear here once you start buying or
            selling gift cards.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/buy-giftcards">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Buy Gift Card
              </Button>
            </Link>
            <Link href="/sell-giftcards">
              <Button
                variant="outline"
                className="hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500"
              >
                Sell Gift Card
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-card">
          {/* Fixed Table Header */}
          <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-muted/50 border-b font-medium text-sm sticky top-0 z-10">
            <div className="col-span-2">Product name</div>
            <div>Type</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Status</div>
          </div>

          {/* ScrollArea wrapping the table body */}
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-6 gap-4 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer items-center"
                >
                  {/* Product name (Brand) */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="relative w-8 h-8 flex-shrink-0 bg-muted rounded-lg p-1.5">
                      <Image
                        src={transaction.brandLogo}
                        alt={transaction.brand}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-sm">
                      {transaction.brand}
                    </span>
                  </div>

                  {/* Type */}
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        transaction.type === "buy"
                          ? "border-green-500 text-green-700 dark:text-green-400"
                          : "border-blue-500 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </Badge>
                  </div>

                  {/* Amount */}
                  <div className="font-semibold text-sm">
                    ${transaction.amount.toFixed(2)}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-muted-foreground">
                    {transaction.date}
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={`w-fit text-xs ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                          : ""
                      }`}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
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
