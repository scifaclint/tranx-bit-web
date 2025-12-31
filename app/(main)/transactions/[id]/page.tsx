"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  CreditCard,
  Calendar,
  Hash,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

export default function TransactionIDPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  // Mock transaction data - will be replaced with API call
  const transaction = {
    id: transactionId,
    brand: "Amazon",
    brandLogo: "/brands/logo-amazon.svg",
    type: "sell" as "buy" | "sell",
    amount: 25.0,
    fee: 1.25,
    total: 23.75,
    status: "completed" as "pending" | "completed" | "failed",
    paymentMethod: "Bank Transfer",
    createdAt: "Dec 15, 2025 at 10:30 AM",
    completedAt: "Dec 15, 2025 at 11:45 AM",
    cardCode: "XXXX-XXXX-XXXX-1234",
    confirmationCode: "CONF-2025-001",
    timeline: [
      { label: "Order Created", date: "Dec 15, 10:30 AM", completed: true },
      { label: "Processing", date: "Dec 15, 10:45 AM", completed: true },
      { label: "Completed", date: "Dec 15, 11:45 AM", completed: true },
    ],
  };

  const getStatusBadge = () => {
    const statusConfig = {
      completed: {
        label: "Completed",
        icon: CheckCircle2,
        className:
          "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400",
      },
      pending: {
        label: "Pending",
        icon: Clock,
        className:
          "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      },
      failed: {
        label: "Failed",
        icon: XCircle,
        className:
          "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400",
      },
    };

    const config = statusConfig[transaction.status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1.5`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="w-full ">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center mb-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction Details</h1>
            <p className="text-sm text-muted-foreground mt-1">{transaction.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-muted rounded-lg p-3 ring-1 ring-border/50">
                  <Image
                    src={transaction.brandLogo}
                    alt={transaction.brand}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{transaction.brand} Gift Card</h3>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}{" "}
                    Transaction
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${transaction.amount.toFixed(2)}</p>
                </div>
              </div>

              {transaction.cardCode && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Card Code</span>
                    <span className="font-mono text-sm">{transaction.cardCode}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">{transaction.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Card Amount</span>
                <span className="font-medium">${transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processing Fee</span>
                <span className="font-medium">${transaction.fee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-lg">${transaction.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                <p className="text-sm font-mono break-all">{transaction.id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{transaction.createdAt}</p>
              </div>
              {transaction.completedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Completed</p>
                    <p className="text-sm">{transaction.completedAt}</p>
                  </div>
                </>
              )}
              {transaction.confirmationCode && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Confirmation Code</p>
                    <p className="text-sm font-mono">{transaction.confirmationCode}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Support
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Our support team is available 24/7 to assist you
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
