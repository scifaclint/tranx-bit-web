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
} from "lucide-react";
import { toast } from "sonner";
import { ordersApi, OrderDetailsResponse } from "@/lib/api/orders";

export default function SellGiftcardOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [tradeStarted, setTradeStarted] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const cardBrand = firstItem?.cardBrand || "Gift Card";
  const cardValue = orderData.cardValue || 0;
  const amountToReceive = orderData.amountToReceive || 0;
  const paymentMethod = orderData.paymentMethodId;
  const paymentMethodDisplay = paymentMethod?.type === "mobile_money"
    ? `${paymentMethod.mobileNetwork} - ${paymentMethod.accountName}`
    : `BTC - ${paymentMethod?.btcAddress}`;

  return (
    <div className=" max-w-3xl  space-y-3">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/sell-giftcards")}
        className="flex items-center gap-2 bg-backgroundSecondary border border-borderColorPrimary dark:border-white/10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sell Gift Cards
      </Button>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold">Sell Order Confirmation</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Order #{orderData.orderNumber}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyOrderId}
            className="h-6 w-6"
          >
            {copiedOrderId ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Important Alert */}
      <Card className="bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10 shadow-none">
        <div className="p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              Please Review Your Order
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Once you click &quot;Start Trade&quot;, your gift card information
              will be submitted for verification and you&apos;ll receive your
              payout upon approval.
            </p>
          </div>
        </div>
      </Card>

      {/* Order Details */}
      <Card className="dark:bg-background border-borderColorPrimary">
        <div className="p-6 space-y-4">
          {/* Brand and Type */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{cardBrand}</h2>
              <Badge variant="secondary" className="mt-1">
                {orderData.orderType === "sell" ? "Sell Order" : "Buy Order"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Order Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Card Value</p>
              <p className="font-semibold">
                ${cardValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold capitalize">{orderData.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-semibold">
                {new Date(orderData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold">{orderData.orderNumber}</p>
            </div>
          </div>

          <Separator />

          {/* Payout */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  You will receive
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ${amountToReceive.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  via {paymentMethodDisplay}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Trade Status or Action Buttons */}
      {tradeStarted ? (
        <Card className="bg-orange-500/5 border-orange-500/20 dark:bg-orange-500/10 shadow-none">
          <div className="p-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Trade Under Review
              </h3>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Your trade has been submitted and is currently being reviewed by
              our team. You will be notified once the verification is complete.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex gap-4">
          <Button
            onClick={handleStartTrade}
            variant={"default"}
            className="flex-1 h-12  "
          >
            Start Trade
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-12 bg-backgroundSecondary border-borderColorPrimary dark:border-white/10"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Customer Service */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Have questions? Contact customer service using the chat widget below
        </p>
      </div>
    </div>
  );
}
