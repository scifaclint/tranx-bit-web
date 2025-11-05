"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ShoppingBag } from "lucide-react";
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
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage your gift card transactions
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                activeFilter === filter.value
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-muted text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-foreground"
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Empty State or Transactions Table */}
      {transactions.length === 0 ? (
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
        <div className="border rounded-lg overflow-hidden bg-card max-h-[600px] flex flex-col">
          {/* Table Header - Sticky */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 border-b font-medium text-sm sticky top-0 z-10">
            <div className="col-span-2">Transaction</div>
            <div>Type</div>
            <div>Date</div>
            <div className="text-right">Amount</div>
          </div>

          {/* Table Body - Scrollable */}
          <div className="divide-y overflow-y-auto flex-1">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer items-center"
              >
                {/* Transaction (Brand + Status) */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0 bg-muted rounded-lg p-2">
                    <Image
                      src={transaction.brandLogo}
                      alt={transaction.brand}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{transaction.brand}</span>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={`w-fit mt-1 ${
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

                {/* Type */}
                <div>
                  <Badge
                    variant="outline"
                    className={`${
                      transaction.type === "buy"
                        ? "border-green-500 text-green-700 dark:text-green-400"
                        : "border-blue-500 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)}
                  </Badge>
                </div>

                {/* Date */}
                <div className="text-sm text-muted-foreground">
                  {transaction.date}
                </div>

                {/* Amount */}
                <div className="text-right font-semibold">
                  ${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
