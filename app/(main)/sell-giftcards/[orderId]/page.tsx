"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader,
  Eye,
  EyeOff,
  Lock,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ordersApi, OrderDetailsResponse } from "@/lib/api/orders";
import { PAYMENT_LOGOS, NETWORK_LABELS, CARD_CURRENCIES } from "@/lib/payment-constants";
import Image from "next/image";
import "flag-icons/css/flag-icons.min.css";

export default function SellGiftcardOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesFetched, setImagesFetched] = useState(false);

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

  const handleViewImages = async () => {
    setLoadingImages(true);
    try {
      const response = await ordersApi.getOrderImages(orderId);
      if (response.status && response.data.images) {
        setImageUrls(response.data.images);
        setImagesFetched(true);
        toast.success("Images loaded successfully");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to load images";
      toast.error(errorMessage);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderData?.orderNumber || orderId);
    setCopiedOrderId(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const getCurrencyInfo = (currencyId?: string) => {
    if (!currencyId) return { symbol: "$", flag: "us", name: "US Dollar" };
    const currency = CARD_CURRENCIES.find(c => c.id.toUpperCase() === currencyId.toUpperCase());
    return currency || { symbol: currencyId.toUpperCase(), flag: "us", name: currencyId };
  };

  const OrderDetailsSkeleton = () => (
    <div className="max-w-3xl space-y-4 pb-8">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Card className="border-borderColorPrimary rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Separator className="bg-borderColorPrimary/50" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Separator className="bg-borderColorPrimary/50" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Separator className="bg-borderColorPrimary/50" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </Card>
    </div>
  );

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (!orderData) {
    return null;
  }

  const firstItem = orderData.items?.[0];
  const cardName = firstItem?.cardName || firstItem?.cardBrand || "Gift Card";
  const cardValue = orderData.cardValue || 0;
  const amountToReceive = orderData.amountToReceive || 0;
  const paymentMethod = orderData.paymentMethodId;
  const cardCurrencyInfo = getCurrencyInfo(orderData.cardCurrency);
  const payoutCurrencyInfo = getCurrencyInfo(orderData.payoutCurrency);

  const paymentMethodDisplay = paymentMethod?.type === "mobile_money"
    ? `${paymentMethod.mobileNetwork?.toUpperCase()} - ${paymentMethod.accountName} (${paymentMethod.mobileNumber})`
    : `BTC - ${paymentMethod?.btcAddress}`;

  const rate = orderData.orderType === "sell" ? orderData.sellRate : orderData.buyRate;

  return (
    <div className="max-w-3xl space-y-4 pb-8">
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
      <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none rounded-2xl overflow-hidden">
        <div className="p-4 flex gap-3">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Lock className="h-5 w-5 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
              {orderData.status.replace(/_/g, " ")}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Your gift card details have been submitted securely. You will be notified once the review is complete.
            </p>
          </div>
        </div>
      </Card>

      {/* Rejection Reason (if failed) */}
      {orderData.status === "failed" && orderData.rejectionReason && (
        <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 shadow-none rounded-2xl overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold text-red-900 dark:text-red-100 text-sm">Rejection Reason</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">{orderData.rejectionReason}</p>
          </div>
        </Card>
      )}

      {/* Admin Notes */}
      {orderData.notes && (
        <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none rounded-2xl overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Admin Notes</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{orderData.notes}</p>
          </div>
        </Card>
      )}

      {/* Order Summary */}
      <Card className="dark:bg-zinc-900/50 border-borderColorPrimary rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`fi fi-${cardCurrencyInfo.flag} text-2xl rounded-sm`}></span>
              <h2 className="text-xl font-bold">{cardName}</h2>
            </div>
            <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-800 border-none px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
              {orderData.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Card Value</p>
              <p className="text-lg font-bold">{cardCurrencyInfo.symbol}{cardValue.toLocaleString()}</p>
            </div>
            {rate !== undefined && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Rate</p>
                <p className="text-lg font-bold">{rate}</p>
              </div>
            )}
            {orderData.exchangeRate !== undefined && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Exchange</p>
                <p className="text-lg font-bold">{orderData.exchangeRate}</p>
              </div>
            )}
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
                {orderData.hasImages ? "Card Images" : "Gift Card Codes"}
              </p>
              {firstItem?.giftCardCodes && firstItem.giftCardCodes.length > 0 && (
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

            {/* Gift Card Codes */}
            {firstItem?.giftCardCodes && firstItem.giftCardCodes.length > 0 ? (
              <div className="space-y-2">
                {firstItem.giftCardCodes.map((code, i) => (
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
            ) : orderData.hasImages ? (
              <div className="space-y-3">
                {!imagesFetched ? (
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-6 h-6 text-white dark:text-zinc-900" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            Secure Image Access
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                            Your card images are encrypted and stored securely. Click below to generate temporary access links.
                          </p>
                        </div>
                        <Button
                          onClick={handleViewImages}
                          disabled={loadingImages}
                          className="w-full h-11 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold rounded-xl"
                        >
                          {loadingImages ? (
                            <><Loader className="w-4 h-4 animate-spin mr-2" /> Loading Images...</>
                          ) : (
                            <><Lock className="w-4 h-4 mr-2" /> View Secure Images</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : loadingImages ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-48 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {imageUrls.map((img, i) => (
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
                    <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                        ⚠️ Links expire in 1 hour for security
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewImages}
                        className="h-7 text-xs font-semibold"
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 font-medium">Card details submitted securely.</p>
            )}
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Payment Method */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Payment Method</p>
            <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-borderColorPrimary">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {(() => {
                  const logoKey = paymentMethod?.type === "mobile_money" ? paymentMethod.mobileNetwork : "btc";
                  return logoKey && PAYMENT_LOGOS[logoKey] ? (
                    <Image
                      src={PAYMENT_LOGOS[logoKey]}
                      alt={paymentMethod?.type || "payment"}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Lock className="w-5 h-5 text-zinc-400" />
                  );
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {paymentMethodDisplay}
                </p>
                <p className="text-xs text-zinc-500">
                  {paymentMethod?.type === "mobile_money" ? "Mobile Money" : "Cryptocurrency"}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Final Payout */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-borderColorPrimary">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">You Will Get</p>
                <div className="flex items-center gap-2">
                  {/* <span className={`fi fi-${payoutCurrencyInfo.flag} text-xl rounded-sm`}></span> */}
                  <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                    {payoutCurrencyInfo.symbol}{amountToReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Comments */}
          {orderData.additionalComments && (
            <>
              <Separator className="bg-borderColorPrimary/50" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Your Comments</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{orderData.additionalComments}</p>
              </div>
            </>
          )}
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
