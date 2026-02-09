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
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ordersApi,
  OrderDetailsResponse,
  Order,
} from "@/lib/api/orders";
import {
  useOrderDetails,
  useCancelOrder,
} from "@/hooks/useOrders";
import {
  PAYMENT_LOGOS,
  NETWORK_LABELS,
  CARD_CURRENCIES,
} from "@/lib/payment-constants";
import Image from "next/image";
import "flag-icons/css/flag-icons.min.css";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import CardValidationStatus from "@/components/features/orders/CardValidationStatus";

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;

  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [orderData, setOrderData] = useState<
    OrderDetailsResponse["data"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesFetched, setImagesFetched] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: orderResponse } = useOrderDetails(transactionId);
  const cancelOrderMutation = useCancelOrder();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await ordersApi.getOrderDetails(transactionId);
        if (response.status && response.data) {
          setOrderData(response.data);
          // If images are already present in the order data, use them
          if (response.data.cardImages && response.data.cardImages.length > 0) {
            setImageUrls(response.data.cardImages);
            setImagesFetched(true);
          }
        } else {
          toast.error("Transaction not found");
          router.push("/orders");
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to load transaction";
        toast.error(errorMessage);
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, router]);

  const handleViewImages = async () => {
    setLoadingImages(true);
    try {
      const response = await ordersApi.getOrderImages(transactionId);
      if (response.status && response.data.images) {
        setImageUrls(response.data.images);
        setImagesFetched(true);
        toast.success("Images loaded successfully");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load images";
      toast.error(errorMessage);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleCancelOrder = async () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(transactionId);
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      router.push("/orders");
    } catch (error: any) {
      toast.error("Failed to cancel order", {
        description: error?.response?.data?.message || "Please try again.",
      });
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderData?.orderNumber || transactionId);
    setCopiedOrderId(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const getCurrencyInfo = (currencyId?: string) => {
    if (!currencyId) return { symbol: "$", flag: "us", name: "US Dollar" };
    const currency = CARD_CURRENCIES.find(
      (c) => c.id.toUpperCase() === currencyId.toUpperCase(),
    );
    return (
      currency || {
        symbol: currencyId.toUpperCase(),
        flag: "us",
        name: currencyId,
      }
    );
  };

  const TransactionSkeleton = () => (
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
    return <TransactionSkeleton />;
  }

  if (!orderData) {
    return null;
  }

  const firstItem = orderData.items?.[0];
  const cardName = firstItem?.cardName || firstItem?.cardBrand || "Gift Card";
  const cardValue = orderData.cardValue || 0;
  const totalAmount = orderData.totalAmount || 0;
  const paymentMethod = orderData.paymentMethodSnapshot;
  const cardCurrencyInfo = getCurrencyInfo(orderData.cardCurrency);
  const payoutCurrencyInfo = getCurrencyInfo(orderData.payoutCurrency);

  const paymentMethodDisplay = (() => {
    if (!paymentMethod) return "Not Provided";
    if (paymentMethod.type === "mobile_money") {
      return `${paymentMethod.mobileNetwork?.toUpperCase()} - ${paymentMethod.accountName}`;
    }
    if (paymentMethod.type === "crypto") {
      const asset = paymentMethod.cryptoAsset?.toUpperCase() || "CRYPTO";
      const label = NETWORK_LABELS[paymentMethod.cryptoAsset || ""] || asset;
      const network = paymentMethod.network
        ? ` (${NETWORK_LABELS[paymentMethod.network] || paymentMethod.network.replace("_", " ").toUpperCase()})`
        : "";
      return `${label}${network}`;
    }
    return "Not Provided";
  })();

  const rateValue =
    orderData.orderType === "sell" ? orderData.sellRate : orderData.buyRate;
  const rateLabel = orderData.orderType === "sell" ? "Sell Rate" : "Buy Rate";

  return (
    <div className="max-w-3xl space-y-4 pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/orders")}
        className="flex items-center gap-2 bg-backgroundSecondary border border-borderColorPrimary dark:border-white/10 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Button>

      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-zinc-500">
            Order ID:{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              {orderData.orderNumber}
            </span>
          </p>
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

      {/* Status Badge & Label */}
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
              {orderData.orderType === "buy"
                ? orderData.status === "completed"
                  ? `Your gift card codes have been sent to ${orderData.recipientEmail || "your email"}.`
                  : orderData.status === "processing"
                    ? "Payment Successful! We're finalizing your order and preparing your digital codes for delivery."
                    : orderData.status === "pending_payment"
                      ? "Payment is pending. Please complete your payment to proceed."
                      : orderData.status === "cancelled"
                        ? "You have cancelled this order."
                        : orderData.status === "rejected"
                          ? "This order was rejected by an agent."
                          : "Your order is being processed."
                : orderData.status === "completed"
                  ? "This transaction has been successfully processed and funds released."
                  : orderData.status === "pending" ||
                    orderData.status === "processing"
                    ? "This transaction is currently under review by our agents."
                    : orderData.status === "cancelled"
                      ? "You have cancelled this transaction."
                      : orderData.status === "rejected"
                        ? "This transaction was rejected by an agent."
                        : "There was an issue processing this transaction."}
            </p>
          </div>
          {(orderData.status === "pending_payment" || orderData.status === "pending") && (
            <div className="ml-auto flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
                className="font-bold uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl"
              >
                {cancelOrderMutation.isPending ? (
                  <Loader className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                )}
                Cancel Order
              </Button>
            </div>
          )}
          {orderData.status === "cancelled" && (
            <div className="ml-auto flex-shrink-0">
              <Button
                onClick={() =>
                  router.push(
                    orderData.orderType === "buy"
                      ? "/buy-giftcards"
                      : "/sell-giftcards",
                  )
                }
                className="font-bold uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm hover:scale-105 transition-transform"
              >
                {orderData.orderType === "buy" ? "Buy Again" : "Sell Again"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Card Validation Status (Sell Orders Only) */}
      {orderData.orderType === "sell" && orderData.cardStatus && (
        <CardValidationStatus status={orderData.cardStatus as "pending" | "valid" | "invalid"} />
      )}

      {/* Rejection Reason (if failed) */}
      {orderData.status === "failed" && orderData.rejectionReason && (
        <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 shadow-none rounded-2xl overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold text-red-900 dark:text-red-100 text-sm">
              Rejection Reason
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {orderData.rejectionReason}
            </p>
          </div>
        </Card>
      )}

      {/* Admin Notes */}
      {orderData.notes && (
        <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-none rounded-2xl overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              Admin Notes
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {orderData.notes}
            </p>
          </div>
        </Card>
      )}

      {/* Order Summary */}
      <Card className="dark:bg-zinc-900/50 border-borderColorPrimary rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`fi fi-${cardCurrencyInfo.flag} text-2xl rounded-sm`}
              ></span>
              <h2 className="text-xl font-bold">{cardName}</h2>
            </div>
            <Badge
              variant="outline"
              className="bg-zinc-100 dark:bg-zinc-800 border-none px-3 py-1 font-semibold uppercase tracking-wider text-[10px]"
            >
              {orderData.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <Separator className="bg-borderColorPrimary/50" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Card Value
              </p>
              <p className="text-lg font-bold">
                {cardCurrencyInfo.symbol}
                {cardValue.toLocaleString()}
              </p>
            </div>
            {rateValue !== undefined && orderData.status !== "cancelled" && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {rateLabel}
                </p>
                <p className="text-lg font-bold">{rateValue}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Date
              </p>
              <p className="text-lg font-bold">
                {new Date(orderData.createdAt).toLocaleDateString()}
              </p>
            </div>
            {orderData.exchangeRate !== undefined &&
              orderData.orderType !== "buy" &&
              orderData.status !== "cancelled" && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Exchange
                  </p>
                  <p className="text-lg font-bold">{orderData.exchangeRate}</p>
                </div>
              )}
          </div>

          {orderData.status !== "cancelled" && (
            <>
              <Separator className="bg-borderColorPrimary/50" />

              {/* Proof of Submission / Gift Card Codes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {(orderData.orderType === "buy"
                      ? orderData.status === "completed" &&
                        firstItem?.giftCardCodes &&
                        firstItem.giftCardCodes.length > 0
                        ? "Gift Card Codes"
                        : orderData.hasImages || (orderData.cardImages && orderData.cardImages.length > 0)
                          ? "Payment Receipt"
                          : "Order Details"
                      : orderData.hasImages || (orderData.cardImages && orderData.cardImages.length > 0)
                        ? "Card Images"
                        : "Gift Card Codes")}
                  </p>
                  {firstItem?.giftCardCodes &&
                    firstItem.giftCardCodes.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCodes(!showCodes)}
                        className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white"
                      >
                        {showCodes ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Hide Codes
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Codes
                          </>
                        )}
                      </Button>
                    )}
                </div>

                {/* Gift Card Codes (Buy Order - Completed OR Sell Order with codes) */}
                {firstItem?.giftCardCodes && firstItem.giftCardCodes.length > 0 ? (
                  <div className="space-y-2">
                    {orderData.orderType === "buy" && orderData.recipientEmail && (
                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-3">
                        <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                          ✓ Gift card codes sent to {orderData.recipientEmail}
                        </p>
                      </div>
                    )}
                    {firstItem.giftCardCodes.map((code, i) => (
                      <div
                        key={i}
                        className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-borderColorPrimary flex items-center justify-between group"
                      >
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
                ) : (orderData.hasImages || (orderData.cardImages && orderData.cardImages.length > 0)) ? (
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
                                {orderData.orderType === "buy"
                                  ? "Payment Receipt"
                                  : "Secure Image Access"}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                {orderData.orderType === "buy"
                                  ? "View your payment receipt. These images are encrypted and stored securely."
                                  : "Your card images are encrypted and stored securely. Click below to generate temporary access links."}
                              </p>
                            </div>
                            <Button
                              onClick={handleViewImages}
                              disabled={loadingImages}
                              className="w-full h-11 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold rounded-xl"
                            >
                              {loadingImages ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin mr-2" />{" "}
                                  Loading Images...
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" /> View{" "}
                                  {orderData.orderType === "buy"
                                    ? "Receipt"
                                    : "Secure Images"}
                                </>
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
                            <div
                              key={i}
                              className="relative group rounded-2xl overflow-hidden border border-borderColorPrimary bg-zinc-100 dark:bg-zinc-800"
                            >
                              <img
                                src={img}
                                alt={
                                  orderData.orderType === "buy"
                                    ? `Receipt ${i + 1}`
                                    : `Card ${i + 1}`
                                }
                                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-full font-bold text-xs"
                                  onClick={() => window.open(img, "_blank")}
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
                ) : orderData.orderType === "buy" &&
                  orderData.status === "processing" ? (
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      ✓ Payment Successful! We&apos;re finalizing your order and preparing
                      your digital codes for delivery to {orderData.recipientEmail}.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 font-medium">
                    {orderData.orderType === "buy"
                      ? "Order details submitted securely."
                      : "Data details submitted securely."}
                  </p>
                )}
              </div>

              <Separator className="bg-borderColorPrimary/50" />

              {/* Payment Method */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Payment Method
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-borderColorPrimary">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      {(() => {
                        let logoKey: string | undefined;
                        if (paymentMethod?.type === "mobile_money") {
                          // Handle Paystack specifically first
                          if (paymentMethod.name === "Paystack") {
                            logoKey = "paystack";
                          } else {
                            logoKey = paymentMethod.mobileNetwork;
                          }
                        } else if (paymentMethod?.type === "crypto") {
                          logoKey = paymentMethod.cryptoAsset;
                        }

                        return logoKey && PAYMENT_LOGOS[logoKey] ? (
                          <Image
                            src={PAYMENT_LOGOS[logoKey]}
                            alt={paymentMethod?.type || "payment"}
                            width={40}
                            height={40}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Lock className="w-5 h-5 text-zinc-400" />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {paymentMethod?.name === "Paystack"
                          ? "Secure Checkout"
                          : paymentMethodDisplay}
                      </p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        {paymentMethod?.name === "Paystack"
                          ? "Automated Payment"
                          : paymentMethod?.type === "mobile_money"
                            ? "Mobile Money"
                            : paymentMethod?.type === "crypto"
                              ? "Cryptocurrency"
                              : "Payment Method"}
                      </p>
                    </div>
                  </div>

                  {/* Responsive Address/Number Display with Copy - HIDDEN for Paystack */}
                  {paymentMethod && paymentMethod.name !== "Paystack" && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-borderColorPrimary">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 px-1">
                            {paymentMethod.type === "mobile_money"
                              ? "Phone Number"
                              : "Wallet Address"}
                          </p>
                          <code className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 break-all bg-white dark:bg-zinc-900 px-3 py-2 rounded-xl border border-borderColorPrimary block">
                            {paymentMethod.type === "mobile_money"
                              ? (paymentMethod as any).mobileNumber
                              : (paymentMethod as any).walletAddress || "N/A"}
                          </code>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0 bg-white dark:bg-zinc-900 border border-borderColorPrimary hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shadow-sm"
                          onClick={() => {
                            const val =
                              paymentMethod.type === "mobile_money"
                                ? (paymentMethod as any).mobileNumber
                                : (paymentMethod as any).walletAddress;
                            if (val) {
                              navigator.clipboard.writeText(val);
                              toast.success("Copied to clipboard!");
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-borderColorPrimary/50" />
            </>
          )}

          {orderData.status !== "cancelled" && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-borderColorPrimary">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {orderData.orderType === "sell"
                      ? "Amount To Receive"
                      : orderData.status === "processing" ||
                        orderData.status === "completed"
                        ? "Amount Paid"
                        : "Amount To Pay"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                      {payoutCurrencyInfo.symbol}
                      {totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {orderData.status === "rejected" && orderData.rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-widest mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-relaxed">
                    {orderData.rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Comments */}
          {orderData.additionalComments && (
            <>
              <Separator className="bg-borderColorPrimary/50" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Your Comments
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {orderData.additionalComments}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Footer Support */}
      <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-borderColorPrimary">
        <p className="text-sm text-zinc-500 font-medium px-6">
          Need help? Our team is available 24/7. Chat with our support team
          using the widget below.
        </p>
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelOrder}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        cancelText="Go Back"
        variant="danger"
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
}
