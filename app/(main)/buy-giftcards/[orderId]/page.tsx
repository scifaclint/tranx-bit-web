"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Check,
  Clock,
  Smartphone,
  Bitcoin,
  AlertCircle,
  Loader,
  Info,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Upload,
  Gift,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import ConfirmationModal from "@/components/modals/confirmation-modal";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";
import {
  useOrderDetails,
  useClaimPayment,
  useCancelOrder,
} from "@/hooks/useOrders";
import { usePaymentMethods, useInitializePaystack } from "@/hooks/usePayments";
import type {
  Order,
  OrderStatus,
  PaymentMethodSnapshot,
} from "@/lib/api/orders";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  // Fetch order details
  const { data: orderData, isLoading, error } = useOrderDetails(orderId);
  const { data: platformPayments } = usePaymentMethods("platform");
  const claimPaymentMutation = useClaimPayment();
  const cancelOrderMutation = useCancelOrder();
  const initializePaystackMutation = useInitializePaystack();

  // Local state
  const [selectedCryptoAsset, setSelectedCryptoAsset] = useState<string>("");
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const order = orderData?.data as Order | undefined;

  // Auto-select USDT for USD orders
  useEffect(() => {
    if (order && order.payoutCurrency === "USD") {
      setSelectedCryptoAsset("usdt");
    }
  }, [order]);

  // Handle navigation and errors
  useEffect(() => {
    if (error) {
      toast.error("Order not found", {
        description: "The order you're looking for doesn't exist.",
      });
      router.push("/orders");
    }
  }, [error, router]);

  // Validate buy order
  useEffect(() => {
    if (order && order.orderType !== "buy") {
      toast.error("Invalid order type", {
        description: "This page is only for buy orders.",
      });
      router.push("/orders");
    }
  }, [order, router]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setReceiptFiles(Array.from(files));
    }
  };

  const handleClaimPayment = async () => {
    // Get the appropriate payment method ID
    let paymentMethodId = "";

    if (order?.payoutCurrency === "USD") {
      // For USD orders (Tether), get the crypto payment method
      if (!selectedCryptoAsset) {
        toast.error("Please select USDT network");
        return;
      }
      const cryptoMethod = getCryptoPaymentMethod();
      if (!cryptoMethod?._id) {
        toast.error("Payment method not found");
        return;
      }
      paymentMethodId = cryptoMethod._id;

      try {
        if (receiptFiles.length === 0) {
          toast.error("Receipt required", {
            description: "Please upload your payment receipt to proceed.",
          });
          return;
        }

        await claimPaymentMutation.mutateAsync({
          orderId,
          paymentMethodId,
          cardImages: receiptFiles,
        });
        toast.success("Payment claimed successfully!", {
          description: "Your payment is now being verified.",
        });
      } catch (error: any) {
        toast.error("Failed to claim payment", {
          description: error?.response?.data?.message || "Please try again.",
        });
      }
    } else {
      // For local currency orders (Mobile Money), use Paystack Automation
      try {
        setIsInitializing(true);

        // Artificial delay BEFORE api call as requested by USER
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await initializePaystackMutation.mutateAsync(orderId);

        if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
        }
      } catch (error: any) {
        toast.error("Failed to initialize payment", {
          description: error?.response?.data?.message || "Please try again.",
        });
        setIsInitializing(false);
      }
    }
  };

  const handleCancelOrder = async () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      router.push("/orders");
    } catch (error: any) {
      toast.error("Failed to cancel order", {
        description: error?.response?.data?.message || "Please try again.",
      });
    }
  };

  // Get crypto payment method for selected asset
  const getCryptoPaymentMethod = () => {
    if (!selectedCryptoAsset || !platformPayments?.data) return null;
    const method = platformPayments.data.find(
      (m) =>
        m.type === "crypto" &&
        m.cryptoAsset.toLowerCase() === selectedCryptoAsset.toLowerCase(),
    );
    // Type guard to ensure we return crypto payment method
    return method && method.type === "crypto" ? method : null;
  };

  // Render order status badge
  const renderStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending_payment: {
        icon: Clock,
        color: "yellow",
        label: "Payment Pending",
      },
      processing: {
        icon: Loader,
        color: "blue",
        label: "Processing",
      },
      completed: {
        icon: CheckCircle,
        color: "green",
        label: "Completed",
      },
      cancelled: {
        icon: XCircle,
        color: "gray",
        label: "Cancelled",
      },
      rejected: {
        icon: XCircle,
        color: "red",
        label: "Rejected",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.pending_payment;
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-700 dark:text-${config.color}-500 rounded-full text-sm font-medium`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const firstItem = order.items?.[0];
  const allCodes =
    order.items?.flatMap((item) => item.giftCardCodes || []) || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/orders")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Button>

      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Buy Order Details
          </h1>
          {renderStatusBadge(order.status)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Order Number:
          </span>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            {order.orderNumber}
          </code>
          <button
            onClick={() => handleCopy(order.orderNumber, "orderId")}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            {copiedField === "orderId" ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Order Summary */}
        <Card className="p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Order Summary
          </h2>

          <div className="space-y-4">
            {/* Card Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="relative w-16 h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
                <Gift className="w-8 h-8 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {firstItem?.cardName || "Gift Card"}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg w-fit">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Deliver to
                    </span>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                      {order.recipientEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Card Value
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {order.cardCurrency} {order.cardValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Quantity
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {firstItem?.quantity || order.totalItems}
                </span>
              </div>
              {order.buyRate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Buy Rate
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {order.buyRate}
                  </span>
                </div>
              )}
              {order.exchangeRate && order.status !== "cancelled" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Exchange Rate
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    1 {order.cardCurrency} = {order.exchangeRate.toFixed(2)}{" "}
                    {order.payoutCurrency}
                  </span>
                </div>
              )}
              {order.status !== "cancelled" && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      Total Amount
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {order.payoutCurrency}{" "}
                      {order.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Status-specific messages */}
            {order.status === "pending_payment" && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Payment Required
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Select a payment method and complete your payment to
                      receive your gift card codes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === "processing" && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Payment Under Review
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Our team is verifying your payment. You'll receive your
                      codes shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === "completed" && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Order Completed!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your gift card codes are ready. Check your email or view
                      them below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex gap-2">
                  <XCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Order Cancelled
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      This order has been cancelled and is no longer being processed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === "rejected" && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex gap-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Order Rejected
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {order.rejectionReason || "This order was rejected by our team. Please contact support for more information."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {order.status === "cancelled" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Order is no longer active</h2>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  You have cancelled this transaction. You can start a new order to proceed.
                </p>
              </div>
              <Button
                onClick={() => router.push("/buy-giftcards")}
                className="mt-4 rounded-xl px-8 h-12 font-bold"
              >
                Buy Again
              </Button>
            </div>
          )}
        </Card>

        {/* Right Column: Payment/Codes Section - Changes based on status */}
        <div className="space-y-4">
          {order.status !== "cancelled" && (
            <>
              {/* PENDING_PAYMENT: Payment Method Selection */}
              {order.status === "pending_payment" && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Complete Payment
                  </h2>

                  <div className="space-y-6">
                    {/* Mobile Money Payment (for GHS/NGN orders) */}
                    {(order.payoutCurrency === "GHS" ||
                      order.payoutCurrency === "NGN") && (
                        <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                          <div className="flex items-center gap-3 mb-4">
                            <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              Mobile Money Payment
                            </h3>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs text-gray-600 dark:text-gray-400">
                                Amount to Pay
                              </Label>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {order.payoutCurrency}{" "}
                                {order.totalAmount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>

                            {/* <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                              <p className="text-xs text-center text-gray-500 leading-relaxed">
                                You will be redirected to Paystack to complete your payment securely via Mobile Money.
                              </p>
                            </div> */}

                            <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleClaimPayment}
                                  className="flex-1 h-11 rounded-xl font-bold"
                                  disabled={isInitializing || initializePaystackMutation.isPending}
                                >
                                  {(isInitializing || initializePaystackMutation.isPending) ? (
                                    <>
                                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                                      Initializing...
                                    </>
                                  ) : (
                                    "Proceed to Pay"
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelOrder}
                                  disabled={cancelOrderMutation.isPending}
                                >
                                  {cancelOrderMutation.isPending ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Cancel Order"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}

                    {/* Tether/Crypto Payment (for USD orders) */}
                    {order.payoutCurrency === "USD" && (
                      <Card className="p-4 border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                        <div className="flex items-center gap-3 mb-4">
                          <Bitcoin className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Tether (USDT) Payment
                          </h3>
                        </div>

                        <div className="space-y-4">
                          {/* Show USDT payment details */}
                          {getCryptoPaymentMethod() && (
                            <>
                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  Wallet Address
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-mono text-xs break-all">
                                    {getCryptoPaymentMethod()?.walletAddress}
                                  </code>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() =>
                                      handleCopy(
                                        getCryptoPaymentMethod()?.walletAddress ||
                                        "",
                                        "wallet",
                                      )
                                    }
                                  >
                                    {copiedField === "wallet" ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  Network
                                </Label>
                                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                  {getCryptoPaymentMethod()?.network.replace(
                                    "_",
                                    " ",
                                  )}
                                </p>
                              </div>

                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  Amount to Send
                                </Label>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  $
                                  {order.totalAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}{" "}
                                  USDT
                                </p>
                              </div>

                              {/* Upload Receipt */}
                              <div className="space-y-2">
                                <Label htmlFor="cryptoReceipt" className="text-sm font-semibold">
                                  Upload Transfer Receipt <span className="text-red-500">(Required)</span>
                                </Label>
                                <Input
                                  id="cryptoReceipt"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  multiple
                                />
                                {receiptFiles.length > 0 && (
                                  <p className="text-xs text-green-600">
                                    {receiptFiles.length} file(s) selected
                                  </p>
                                )}
                              </div>

                              <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleClaimPayment}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                    disabled={claimPaymentMutation.isPending || receiptFiles.length === 0}
                                  >
                                    {claimPaymentMutation.isPending ? (
                                      <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />I have
                                        transferred
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={handleCancelOrder}
                                    disabled={cancelOrderMutation.isPending}
                                  >
                                    {cancelOrderMutation.isPending ? (
                                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Show loading state if payment methods not loaded yet */}
                          {!getCryptoPaymentMethod() && (
                            <div className="p-4 text-center">
                              <Loader className="w-6 h-6 animate-spin mx-auto text-orange-600" />
                              <p className="text-sm text-gray-500 mt-2">
                                Loading payment details...
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </Card>
              )}

              {/* PROCESSING: Show payment details submitted */}
              {order.status === "processing" && order.paymentMethodSnapshot && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Payment Details
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex gap-2 mb-4">
                        <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Verifying Payment
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Your payment is being verified by our team.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4">
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Payment Method
                          </Label>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {order.paymentMethodSnapshot.name}
                          </p>
                        </div>

                        {order.paymentMethodSnapshot.type === "mobile_money" && (
                          <>
                            <div>
                              <Label className="text-xs text-gray-600 dark:text-gray-400">
                                Network
                              </Label>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {
                                  NETWORK_LABELS[
                                  order.paymentMethodSnapshot
                                    .mobileNetwork as keyof typeof NETWORK_LABELS
                                  ]
                                }
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600 dark:text-gray-400">
                                Phone Number
                              </Label>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {order.paymentMethodSnapshot.mobileNumber}
                              </p>
                            </div>
                          </>
                        )}

                        {order.paymentMethodSnapshot.type === "crypto" && (
                          <>
                            <div>
                              <Label className="text-xs text-gray-600 dark:text-gray-400">
                                Crypto Asset
                              </Label>
                              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {order.paymentMethodSnapshot.cryptoAsset}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600 dark:text-gray-400">
                                Network
                              </Label>
                              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                {order.paymentMethodSnapshot.network.replace(
                                  "_",
                                  " ",
                                )}
                              </p>
                            </div>
                          </>
                        )}

                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Amount
                          </Label>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {order.payoutCurrency}{" "}
                            {order.totalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>

                        {order.paymentConfirmedAt && (
                          <div>
                            <Label className="text-xs text-gray-600 dark:text-gray-400">
                              Payment Claimed At
                            </Label>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {new Date(order.paymentConfirmedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Show uploaded receipts if any */}
                    {order.cardImages.length > 0 && (
                      <div>
                        <Label className="text-sm mb-2 block">
                          Payment Receipt(s)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {order.cardImages.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                            >
                              <Image
                                src={img}
                                alt={`Receipt ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* COMPLETED: Show Gift Card Codes */}
              {order.status === "completed" && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Your Gift Card Codes
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            Order Completed Successfully!
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Your codes have been sent to {order.recipientEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {allCodes.length > 0 ? (
                      <div className="space-y-3">
                        <Label className="text-sm">Gift Card Codes:</Label>
                        {allCodes.map((code, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border"
                          >
                            <code className="flex-1 font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                              {code}
                            </code>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleCopy(code, `code-${idx}`)}
                            >
                              {copiedField === `code-${idx}` ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Codes will be sent to your email shortly.
                      </p>
                    )}

                    {order.completedAt && (
                      <div className="pt-3 border-t">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Completed At
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(order.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
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
