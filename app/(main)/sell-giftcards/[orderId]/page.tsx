"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { ordersApi, OrderDetailsResponse } from "@/lib/api/orders";
import { useCurrencies } from "@/hooks/useCards";

export default function SellGiftcardOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [tradeStarted, setTradeStarted] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData?.data || [];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersApi.getOrderDetails(orderId);
        if (response.status && response.data) {
          setOrderData(response.data);
        } else {
          toast.error("Order not found");
          router.push("/sell-giftcards");
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to load order";
        toast.error(errorMessage);
        router.push("/sell-giftcards");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleStartTrade = () => {
    toast.success("Trade started successfully!", {
      description:
        "A trade representative will review your submission shortly.",
      position: "top-center",
    });
    setTradeStarted(true);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      toast.info("Order cancelled", {
        position: "top-center",
      });
      router.push("/sell-giftcards");
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const firstItem = orderData.items?.[0];
  const cardName = firstItem?.cardName || firstItem?.cardBrand || "Gift Card";
  const cardValue = orderData.cardValue || 0;
  const amountToReceive = orderData.amountToReceive || 0;
  const paymentMethod = orderData.paymentMethodId;
  const paymentMethodDisplay = paymentMethod?.type === "mobile_money"
    ? `${paymentMethod.mobileNetwork?.toUpperCase()} - ${paymentMethod.accountName} (${paymentMethod.mobileNumber})`
    : `BTC - ${paymentMethod?.btcAddress}`;

  const getSymbol = (currencyId?: string) => {
    if (!currencyId) return "$";
    const currency = currencies.find(c => c.id.toUpperCase() === currencyId.toUpperCase());
    return currency?.symbol || currencyId.toUpperCase();
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/sell-giftcards")}
        className="flex items-center gap-2 bg-backgroundSecondary border border-borderColorPrimary dark:border-white/10 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sell Gift Cards
      </Button>

      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Order Submitted</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-zinc-500">Order ID: <span className="font-mono text-zinc-900 dark:text-zinc-100">{orderData.orderNumber}</span></p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyOrderId}
            className="h-6 w-6 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {copiedOrderId ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <Card className="bg-emerald-500/5 border-emerald-500/10 dark:bg-emerald-500/10 shadow-none rounded-2xl overflow-hidden">
        <div className="p-4 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
              Order Under Review
            </h3>
            <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80 mt-1">
              Your gift card details have been submitted. Our team is currently verifying the card.
              You will be notified once the review is complete and your payout is processed.
            </p>
          </div>
        </div>
      </Card>

      {/* Order Summary */}
      <Card className="dark:bg-zinc-900/50 border-borderColorPrimary rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{cardName}</h2>
            <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 border-none px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
              {orderData.status}
            </Badge>
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Amount</p>
              <p className="text-lg font-bold">{getSymbol(orderData.cardCurrency)}{cardValue.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rate</p>
              <p className="text-lg font-bold">{orderData.sellRate || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Exchange</p>
              <p className="text-lg font-bold">{orderData.exchangeRate || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</p>
              <p className="text-lg font-bold">{new Date(orderData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Proof of Submission */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {orderData.cardImages && orderData.cardImages.length > 0 ? "Attached Cards" : "Giftcard Codes"}
              </p>
              {orderData.items[0]?.giftCardCodes && orderData.items[0].giftCardCodes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCodes(!showCodes)}
                  className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  {showCodes ? (
                    <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Hide Codes</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 mr-1.5" /> View Codes</>
                  )}
                </Button>
              )}
            </div>

            {orderData.items[0]?.giftCardCodes && orderData.items[0].giftCardCodes.length > 0 ? (
              <div className="space-y-2">
                {orderData.items[0].giftCardCodes.map((code, i) => (
                  <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-borderColorPrimary flex items-center justify-between group">
                    <code className="text-sm font-mono font-black text-zinc-800 dark:text-zinc-200">
                      {showCodes ? code : "•".repeat(Math.min(code.length, 12))}
                    </code>
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
                  <div key={i} className="relative group rounded-2xl overflow-hidden border border-borderColorPrimary bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={img}
                      alt={`Card ${i + 1}`}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
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
            ) : (
              <p className="text-sm text-zinc-500 font-medium">Card details submitted securely.</p>
            )}
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Final Payout */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-borderColorPrimary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">You Will Get</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {getSymbol(orderData.payoutCurrency)}{amountToReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Sending to: {paymentMethodDisplay}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        <Button
          onClick={() => router.push("/transactions")}
          className="w-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all text-base shadow-xl dark:shadow-white/5"
        >
          View Transaction History
        </Button>
      </div>

      {/* Customer Service */}
      <div className="py-4 text-center">
        <p className="text-sm text-zinc-500 font-medium">
          Have questions? Chat with our support team using the widget below.
        </p>
      </div>
    </div>
  );
}
