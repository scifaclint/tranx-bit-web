"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function SellGiftcardOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [tradeStarted, setTradeStarted] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Mock order data based on orderId
  const orderData = {
    orderId,
    brand: "Steam",
    cardType: "E-codes",
    amount: 100,
    currency: "USD",
    quantity: 2,
    payoutMethod: "MTN Mobile Money - +233 24 123 4567",
    payoutAmount: 850,
    payoutCurrency: "GHS",
    rate: 4.25,
  };

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

  return (
    <div className=" max-w-3xl  space-y-3">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/sell-giftcards")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sell Gift Cards
      </Button>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold">Sell Order Confirmation</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
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
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Please Review Your Order
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Once you click &quot;Start Trade&quot;, your gift card information
              will be submitted for verification and you&apos;ll receive your
              payout upon approval.
            </p>
          </div>
        </div>
      </Card>

      {/* Order Details */}
      <Card>
        <div className="p-6 space-y-4">
          {/* Brand and Type */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{orderData.brand}</h2>
              <Badge variant="secondary" className="mt-1">
                {orderData.cardType}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Order Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Card Value</p>
              <p className="font-semibold">
                {orderData.currency} ${orderData.amount}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-semibold">{orderData.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="font-semibold">
                {orderData.currency} ${orderData.amount * orderData.quantity}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exchange Rate</p>
              <p className="font-semibold">{orderData.rate}</p>
            </div>
          </div>

          <Separator />

          {/* Payout */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  You will receive
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {orderData.payoutCurrency} {orderData.payoutAmount}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  via {orderData.payoutMethod}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Trade Status or Action Buttons */}
      {tradeStarted ? (
        <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
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
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Trade
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-12"
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
