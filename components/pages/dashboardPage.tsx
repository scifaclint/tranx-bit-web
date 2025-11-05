"use client";
import { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Wallet,
  DollarSign,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  brand: string;
  brandLogo: string;
  type: "buy" | "sell";
  date: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "review";
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const recentTransactions: Transaction[] = []; // Empty for now

  const filteredTransactions =
    activeFilter === "all"
      ? recentTransactions
      : recentTransactions.filter((t) => t.status === activeFilter);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card
          onClick={() => {
            router.push("/buy-giftcards");
          }}
          className="bg-cyan-50 rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-foreground text-sm">
              Buy Gift Card
            </p>
          </div>
        </Card>

        <Card
          onClick={() => {
            router.push("/sell-giftcards");
          }}
          className="bg-blue-50 rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <CreditCard size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-foreground text-sm">
              Sell Gift Card
            </p>
          </div>
        </Card>

        <Card
          onClick={() => {
            toast.info("Coming Soon!", {
              description: "Virtual Dollar Cards feature is coming soon.",
              position: "bottom-right",
            });
          }}
          className="bg-orange-50 rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-foreground text-sm">
              Virtual Dollar Cards
            </p>
          </div>
        </Card>

        <Card
          onClick={() => {
            toast.info("Coming Soon!", {
              description: "BTC exchange feature is coming soon.",
              position: "bottom-right",
            });
          }}
          className="bg-purple-50 rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-foreground text-sm">
              BTC exchange
            </p>
          </div>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card className="bg-backgroundSecondary dark:bg-card rounded-2xl p-5 sm:p-6 shadow-sm border-0">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="font-bold text-xl">Recent Transactions</h2>
          <div className="flex items-center gap-3">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px] border-black/10 hover:border-black/20 transition-colors">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent className="border-black/10">
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="default"
              size="sm"
              className="bg-black hover:bg-black/90 text-white shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Reports</span>
            </Button>
          </div>
        </div>

        {/* Transaction Table or Empty State */}
        {filteredTransactions.length > 0 ? (
          <div className="border rounded-lg overflow-hidden max-h-[400px] flex flex-col">
            {/* Table Header - Sticky */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-white/80 border-b font-medium text-sm sticky top-0 z-10">
              <div>Transaction</div>
              <div>Type</div>
              <div>Date</div>
              <div className="text-right">Amount</div>
            </div>

            {/* Table Body - Scrollable */}
            <div className="divide-y overflow-y-auto flex-1">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-4 gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer items-center"
                >
                  {/* Transaction (Brand + Logo) */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0 bg-muted rounded-lg p-2">
                      <Image
                        src={transaction.brandLogo}
                        alt={transaction.brand}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {transaction.brand}
                      </span>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={`w-fit mt-1 text-xs ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                            : transaction.status === "review"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="relative mb-6">
              {/* Animated background circle */}
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-950 rounded-full opacity-20 animate-pulse"></div>
              {/* Icon */}
              <div className="relative bg-blue-50 dark:bg-blue-950/50 rounded-full p-6">
                <FileText
                  className="h-12 w-12 text-blue-600"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md text-sm">
              Your recent transaction history will appear here once you start
              buying or selling gift cards.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/buy-giftcards">
                <Button className="bg-black hover:bg-black/90 text-white shadow-sm">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Buy Gift Card
                </Button>
              </Link>
              <Link href="/sell-giftcards">
                <Button
                  variant="outline"
                  className="border-black/10 hover:bg-blue-50 hover:border-black/20"
                >
                  Sell Gift Card
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
