"use client";

import React, { useState, useEffect } from "react";
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
  Loader,
} from "lucide-react";
import Image from "next/image";
import { ordersApi, OrderDetailsResponse } from "@/lib/api/orders";
import { toast } from "sonner";

export default function TransactionIDPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [orderData, setOrderData] = useState<OrderDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await ordersApi.getOrderDetails(transactionId);
        if (response.status && response.data) {
          setOrderData(response.data);
        } else {
          toast.error("Transaction not found");
          router.push("/transactions");
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to load transaction";
        toast.error(errorMessage);
        router.push("/transactions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, router]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, any> = {
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

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1.5`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const firstItem = orderData.items?.[0];
  const cardBrand = firstItem?.cardBrand || "Gift Card";
  const cardValue = orderData.cardValue || orderData.totalAmount || 0;
  const amountToReceive = orderData.amountToReceive || orderData.totalAmount || 0;
  const paymentMethod = orderData.paymentMethodId;
  const paymentMethodDisplay = paymentMethod?.type === "mobile_money"
    ? `${paymentMethod.mobileNetwork} - ${paymentMethod.accountName}`
    : paymentMethod?.type === "btc"
      ? `BTC - ${paymentMethod.btcAddress}`
      : "N/A";

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
            <p className="text-sm text-muted-foreground mt-1">#{orderData.orderNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(orderData.status)}
          <Button variant="outline" className="gap-2 bg-backgroundSecondary border-borderColorPrimary dark:border-white/10">
            <Download className="h-4 w-4" />
            Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card className="dark:bg-background border-borderColorPrimary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-backgroundSecondary rounded-lg p-3 ring-1 ring-borderColorPrimary">
                  {firstItem?.cardBrand ? (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                      {firstItem.cardBrand.substring(0, 2).toUpperCase()}
                    </div>
                  ) : (
                    <Package className="w-full h-full text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cardBrand} Gift Card</h3>
                  <p className="text-sm text-muted-foreground">
                    {orderData.orderType.charAt(0).toUpperCase() + orderData.orderType.slice(1)}{" "}
                    Transaction
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${cardValue.toFixed(2)}</p>
                </div>
              </div>

              {firstItem?.giftCardCodes && firstItem.giftCardCodes.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Card Code</span>
                    <span className="font-mono text-sm">{firstItem.giftCardCodes[0]}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="dark:bg-background border-borderColorPrimary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">{paymentMethodDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Card Amount</span>
                <span className="font-medium">${cardValue.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-lg">${amountToReceive.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Transaction Info */}
          <Card className="dark:bg-background border-borderColorPrimary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                <p className="text-sm font-mono break-all">{orderData._id}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm">{new Date(orderData.createdAt).toLocaleString()}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order Number</p>
                <p className="text-sm font-mono">{orderData.orderNumber}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="dark:bg-background border-borderColorPrimary">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2 bg-backgroundSecondary border-borderColorPrimary dark:border-white/10">
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
