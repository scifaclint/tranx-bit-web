"use client";

import { useState } from "react";
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
  Loader2,
  Info,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type PaymentMethod = "mobile_money" | "bitcoin" | "";
type PaymentMode = "manual" | "automated";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [paymentMode, setPaymentMode] = useState<PaymentMode>("manual");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Automated payment states
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

  // Mock order data
  const orderData = {
    id: orderId,
    brand: {
      name: "Amazon",
      logo: "/brands/logo-amazon.svg",
    },
    amount: 50,
    quantity: 2,
    total: 100,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
  };

  // Mock payment details
  const paymentDetails = {
    mobile_money: {
      network: "MTN Mobile Money",
      phoneNumber: "+233 24 123 4567",
      amount: "GHS 450.00",
      reference: "4fGH8K",
    },
    bitcoin: {
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      amount: "0.00123",
      amountUsd: orderData.total,
    },
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = () => {
    toast.success("Payment confirmation submitted!");
    console.log("Payment confirmed for order:", orderId);
  };

  const handleAutomatedPayment = async () => {
    if (!selectedNetwork || !phoneNumber) {
      toast.error("Please select network and enter phone number");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSent(true);
      toast.success("Payment request sent to your phone!");
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/buy-giftcards")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Buy Gift Cards
      </Button>

      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order Details
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Payment Pending
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Order ID:
          </span>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
            {orderId}
          </code>
          <button
            onClick={() => handleCopy(orderId, "orderId")}
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
        {/* Order Summary Card */}
        <Card className="p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Order Summary
          </h2>

          <div className="space-y-4">
            {/* Brand Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={orderData.brand.logo}
                  alt={orderData.brand.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {orderData.brand.name} Gift Card
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Digital delivery
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Card Value
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ${orderData.amount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Quantity
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {orderData.quantity}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    ${orderData.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Payment Required
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Complete the payment to receive your gift card codes via
                    email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Payment Method
          </h2>

          <div className="space-y-6">
            {/* Payment Mode Toggle */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setPaymentMode("manual")}
                  className={`px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                    paymentMode === "manual"
                      ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Manual Payment
                </button>
                <button
                  onClick={() => setPaymentMode("automated")}
                  className={`px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                    paymentMode === "automated"
                      ? "bg-white dark:bg-gray-900 text-blue-600 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Automated Payment
                </button>
              </div>
            </div>

            {/* Manual Payment Section */}
            {paymentMode === "manual" && (
              <>
                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Select Payment Channel</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as PaymentMethod)
                    }
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Choose how to pay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <span>Mobile Money</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bitcoin">
                        <div className="flex items-center gap-2">
                          <Bitcoin className="w-4 h-4" />
                          <span>Bitcoin (BTC)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile Money Payment Details */}
                {paymentMethod === "mobile_money" && (
                  <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Mobile Money Payment
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Network
                        </Label>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {paymentDetails.mobile_money.network}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Phone Number
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-mono text-sm">
                            {paymentDetails.mobile_money.phoneNumber}
                          </code>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              handleCopy(
                                paymentDetails.mobile_money.phoneNumber,
                                "phone"
                              )
                            }
                          >
                            {copiedField === "phone" ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Amount to Send
                        </Label>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {paymentDetails.mobile_money.amount}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Reference (Important!)
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-mono text-sm">
                            {paymentDetails.mobile_money.reference}
                          </code>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              handleCopy(
                                paymentDetails.mobile_money.reference,
                                "reference"
                              )
                            }
                          >
                            {copiedField === "reference" ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          ⚠️ Please include the reference code when making the
                          payment
                        </p>
                        <Button
                          onClick={handleConfirmPayment}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />I have sent the
                          funds
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Bitcoin Payment Details */}
                {paymentMethod === "bitcoin" && (
                  <Card className="p-4 border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Bitcoin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Bitcoin (BTC) Payment
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* QR Code Placeholder */}
                      <div className="flex justify-center">
                        <div className="w-48 h-48 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">QR Code</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Wallet Address
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded font-mono text-xs break-all">
                            {paymentDetails.bitcoin.address}
                          </code>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                              handleCopy(
                                paymentDetails.bitcoin.address,
                                "btcAddress"
                              )
                            }
                          >
                            {copiedField === "btcAddress" ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Amount
                        </Label>
                        <div className="mt-1">
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {paymentDetails.bitcoin.amount} BTC
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ≈ ${paymentDetails.bitcoin.amountUsd} USD
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
                        <Button
                          onClick={handleConfirmPayment}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />I have sent the
                          funds
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Help Text */}
                {paymentMethod && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Need help? Contact our support team using the chat widget
                    below
                  </p>
                )}
              </>
            )}

            {/* Automated Payment Section */}
            {paymentMode === "automated" && (
              <div className="space-y-4">
                {/* Info Card */}
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Available Payment Methods
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Currently, only Mobile Money is supported for automated
                        payments. More options coming soon!
                      </p>
                    </div>
                  </div>
                </Card>

                {!paymentSent ? (
                  <>
                    {/* Network Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="network">
                        Select Mobile Money Network
                      </Label>
                      <Select
                        value={selectedNetwork}
                        onValueChange={setSelectedNetwork}
                      >
                        <SelectTrigger id="network">
                          <SelectValue placeholder="Choose your network" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mtn">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span>MTN Mobile Money</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="vodafone">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span>Vodafone Cash</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="airteltigo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span>AirtelTigo Money</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Phone Number Input */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Enter Your Phone Number</Label>
                      <div className="flex gap-2">
                        <div className="w-20">
                          <Select defaultValue="+233" disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+233">+233</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="24 123 4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Payment Summary */}
                    {selectedNetwork && phoneNumber && (
                      <Card className="p-4 bg-gray-50 dark:bg-gray-900">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Payment Summary
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Order Total
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              GHS 450.00
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Network Fee (Estimated)
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              ~GHS 2.25
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ⚠️ Network fees are charged by your mobile money
                              provider, not by us
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Initiate Payment Button */}
                    <Button
                      onClick={handleAutomatedPayment}
                      disabled={
                        !selectedNetwork || !phoneNumber || isProcessing
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Initiate Payment"
                      )}
                    </Button>
                  </>
                ) : (
                  /* Payment Sent Success State */
                  <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2">
                          Payment Request Sent!
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please check your phone for a prompt from{" "}
                          <span className="font-medium">
                            {selectedNetwork === "mtn" && "MTN Mobile Money"}
                            {selectedNetwork === "vodafone" && "Vodafone Cash"}
                            {selectedNetwork === "airteltigo" &&
                              "AirtelTigo Money"}
                          </span>{" "}
                          to approve the payment of GHS 450.00
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Enter your Mobile Money PIN on your phone to complete
                          the transaction
                        </p>
                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mt-3">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">
                            Waiting for confirmation...
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setPaymentSent(false);
                          setSelectedNetwork("");
                          setPhoneNumber("");
                        }}
                        variant="outline"
                        className="mt-4"
                      >
                        Cancel & Start Over
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
