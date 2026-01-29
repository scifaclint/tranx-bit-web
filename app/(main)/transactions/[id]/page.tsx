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
  Copy,
} from "lucide-react";
import Image from "next/image";
import { ordersApi, OrderDetailsResponse } from "@/lib/api/orders";
import { toast } from "sonner";
import { useCurrencies } from "@/hooks/useCards";

export default function TransactionIDPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [orderData, setOrderData] = useState<OrderDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData?.data || [];

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

  const getSymbol = (currencyId?: string) => {
    if (!currencyId) return "$";
    const currency = currencies.find(c => c.id.toUpperCase() === currencyId.toUpperCase());
    return currency?.symbol || currencyId.toUpperCase();
  };

  return (
    <div className="w-full ">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Transaction Details</h1>
            <p className="text-[10px] sm:text-sm text-muted-foreground">#{orderData.orderNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusBadge(orderData.status)}
          <Button variant="outline" size="sm" className="gap-1.5 bg-backgroundSecondary border-borderColorPrimary dark:border-white/10 h-8 sm:h-9 px-2 sm:px-3">
            <Download className="h-3.5 w-3.5" />
            <span className="text-xs sm:text-sm">Receipt</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-backgroundSecondary rounded-lg p-3 ring-1 ring-borderColorPrimary flex-shrink-0">
                    {firstItem?.cardBrand ? (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                        {firstItem.cardBrand.substring(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <Package className="w-full h-full text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{firstItem?.cardName || cardBrand} Gift Card</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {orderData.orderType.charAt(0).toUpperCase() + orderData.orderType.slice(1)}{" "}
                      Transaction
                    </p>
                  </div>
                </div>
                <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed border-borderColorPrimary">
                  <p className="text-xl sm:text-2xl font-bold">{getSymbol(orderData.cardCurrency)}{cardValue.toLocaleString()}</p>
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

          {/* Uploaded Card Images or Codes */}
          {((orderData.cardImages && orderData.cardImages.length > 0) ||
            (firstItem?.giftCardCodes && firstItem.giftCardCodes.length > 0)) && (
              <Card className="dark:bg-background border-borderColorPrimary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {orderData.cardImages && orderData.cardImages.length > 0 ? "Uploaded Card Images" : "Gift Card Codes"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {firstItem?.giftCardCodes && firstItem.giftCardCodes.length > 0 ? (
                    <div className="space-y-2">
                      {firstItem.giftCardCodes.map((code, i) => (
                        <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-borderColorPrimary flex items-center justify-between group">
                          <code className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">{code}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                              toast.success("Code copied to clipboard!");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : orderData.cardImages && orderData.cardImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orderData.cardImages.map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-borderColorPrimary bg-zinc-100 dark:bg-zinc-800">
                          <img
                            src={img}
                            alt={`Card ${i + 1}`}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="rounded-full font-bold text-xs"
                              onClick={() => window.open(img, '_blank')}
                            >
                              View Full Image
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

          {/* Payment Details */}
          <Card className="dark:bg-background border-borderColorPrimary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium text-sm sm:text-base">{paymentMethodDisplay}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <span className="text-sm text-muted-foreground">Card Amount</span>
                <span className="font-medium text-sm sm:text-base">{getSymbol(orderData.cardCurrency)}{cardValue.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm sm:text-base">Total Amount</span>
                <span className="font-bold text-lg sm:text-xl text-primary">{getSymbol(orderData.payoutCurrency)}{amountToReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

          {/* Help / Support Tip */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-borderColorPrimary rounded-2xl p-4 sm:p-5">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Need help with this order?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our team is available 24/7 to assist you. Simply click the <span className="text-primary font-medium">chat bubble</span> in the bottom right corner to start a conversation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
