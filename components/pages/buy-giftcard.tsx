"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Minus, Plus, ChevronDown, Loader, Gift } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCards } from "@/hooks/useCards";
import { useCreateBuyOrder } from "@/hooks/useOrders";
import { BrandList } from "@/components/shared/brand-list";
import { useIsMobile } from "@/hooks/use-mobile";
import MobilePicker from "@/components/modals/mobile-picker";
import { ordersApi, BuyOrderPayload } from "@/lib/api/orders";
import "flag-icons/css/flag-icons.min.css";
import { useAuthStore } from "@/stores";

const MIN_BUY_AMOUNT = 10;

export default function BuyGiftCardPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { mutateAsync: createBuyOrder } = useCreateBuyOrder();
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "tether">(
    "tether",
  );

  // Calculation State
  const [calculationData, setCalculationData] = useState<{
    payoutAmount: number;
    payoutCurrency: string;
    exchangeRate: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine local currency based on user's country
  const localCurrency = useMemo(() => {
    if (!user?.country) return "GHS";
    const country = user.country.toLowerCase();
    if (country === "nigeria" || country === "ng") return "NGN";
    return "GHS";
  }, [user]);

  // Determine Payout Currency based on payment method
  const payoutCurrency = useMemo(() => {
    return paymentMethod === "tether" ? "USD" : localCurrency;
  }, [paymentMethod, localCurrency]);

  // Handle Cost Calculation
  React.useEffect(() => {
    const calculateCost = async () => {
      const parsedAmount = parseFloat(amount);
      if (
        !selectedBrand ||
        isNaN(parsedAmount) ||
        parsedAmount < MIN_BUY_AMOUNT
      ) {
        setCalculationData(null);
        return;
      }

      setIsCalculating(true);
      try {
        const payload = {
          type: "buy" as const,
          cardId: selectedBrand,
          amount: parsedAmount,
          currency: "USD",
          payoutCurrency,
        };

        const response = await ordersApi.calculateOrder(payload);

        if (response.status) {
          setCalculationData({
            payoutAmount: response.data.payoutAmount,
            payoutCurrency: response.data.payoutCurrency,
            exchangeRate: response.data.exchangeRate,
          });
        }
      } catch (error) {
        console.error("Calculation error:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    const timer = setTimeout(() => {
      calculateCost();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [amount, selectedBrand, payoutCurrency]);

  const calculateTotal = () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      if (calculationData) {
        return calculationData.payoutAmount * quantity;
      }
      return 0; // Or parsedAmount * quantity depending on what you want to show while loading
    }
    return 0;
  };

  // Fetch cards from API
  const { data: cardsData, isLoading: isLoadingCards } = useCards({
    limit: 1000,
  });

  // Filter for "buy" or "both" cards
  const brands = useMemo(() => {
    const rawBrands =
      cardsData?.data?.cards?.filter(
        (c) => (c.type === "buy" || c.type === "both") && c.status === "active",
      ) || [];
    return [...rawBrands].sort((a, b) => a.name.localeCompare(b.name));
  }, [cardsData]);

  const selectedBrandData = brands.find((brand) => brand._id === selectedBrand);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleBuyCard = async () => {
    if (!selectedBrand) {
      toast.error("Please select a brand");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < MIN_BUY_AMOUNT) {
      toast.error(`Minimum buy amount is $${MIN_BUY_AMOUNT} USD`);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: BuyOrderPayload = {
        cardId: selectedBrand,
        selectedDenomination: parsedAmount,
        quantity,
        currency: "USD",
        payoutCurrency,
        recipientEmail: email,
        expectedPayout: calculateTotal(),
        calculatedAt: new Date().toISOString(),
        paymentMethod: paymentMethod === "tether" ? "tether" : "mobile_money",
      };

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await createBuyOrder(payload);

      if (response.status) {
        toast.success("Order created successfully!");
        router.push(`/buy-giftcards/${response.data.orderId}`);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Card Brand Selector */}
      <div className="space-y-2">
        <Label>Select Card Brand</Label>
        {mounted && isMobile ? (
          <>
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              disabled={isLoadingCards}
              className="w-full justify-between h-12 focus:ring-2 focus:ring-black/5 transition-all font-normal bg-white dark:bg-background border-zinc-200 dark:border-borderColorPrimary"
            >
              {isLoadingCards ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span>Loading brands...</span>
                </div>
              ) : selectedBrandData ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 flex-shrink-0">
                    {selectedBrandData.imageUrl ? (
                      <Image
                        src={selectedBrandData.imageUrl}
                        alt={selectedBrandData.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <Gift className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <span className="font-medium">{selectedBrandData.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select card brand</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            <MobilePicker
              isOpen={open}
              onClose={() => setOpen(false)}
              title="Select Card Brand"
            >
              <BrandList
                brands={brands}
                selectedBrand={selectedBrand}
                onSelect={(id) => {
                  setSelectedBrand(id);
                  setOpen(false);
                }}
                isLoading={isLoadingCards}
              />
            </MobilePicker>
          </>
        ) : (
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild disabled={isLoadingCards}>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-12 focus:ring-2 focus:ring-black/5 transition-all font-normal bg-white dark:bg-background border-zinc-200 dark:border-borderColorPrimary"
              >
                {isLoadingCards ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span>Loading brands...</span>
                  </div>
                ) : selectedBrandData ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 flex-shrink-0">
                      {selectedBrandData.imageUrl ? (
                        <Image
                          src={selectedBrandData.imageUrl}
                          alt={selectedBrandData.name}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <Gift className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>
                    <span className="font-medium">
                      {selectedBrandData.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    Select card brand
                  </span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 dark:bg-backgroundSecondary"
              align="start"
              sideOffset={4}
            >
              <div className="max-h-[300px] flex flex-col">
                <BrandList
                  brands={brands}
                  selectedBrand={selectedBrand}
                  onSelect={(id) => {
                    setSelectedBrand(id);
                    setOpen(false);
                  }}
                  isLoading={isLoadingCards}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-borderColorPrimary">
          <button
            type="button"
            onClick={() => {
              toast.info("Almost there! This feature will be available in the next update");
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all opacity-50 cursor-not-allowed ${paymentMethod === "mobile_money"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
          >
            Mobile Money ({localCurrency})
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("tether")}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${paymentMethod === "tether"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
          >
            Tether (USDT)
          </button>
        </div>
      </div>

      {/* Locked Currency Display */}
      <div className="space-y-2">
        <Label>Card Currency</Label>
        <div className="w-full h-12 flex items-center gap-2 px-3 bg-zinc-50 dark:bg-backgroundSecondary border border-zinc-200 dark:border-borderColorPrimary rounded-xl opacity-80 cursor-not-allowed">
          <span className="fi fi-us rounded-sm"></span>
          <span className="font-medium text-sm text-muted-foreground">
            United States Dollar (USD)
          </span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <Label>Amount (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
            $
          </span>
          <Input
            type="number"
            placeholder={`Min $${MIN_BUY_AMOUNT}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7 h-12 rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
            min={MIN_BUY_AMOUNT}
          />
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label>Quantity</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            className="h-10 w-20 text-center focus:ring-2 focus:ring-black/5 rounded-xl"
            min="1"
            placeholder="1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Address */}
      <div className="space-y-2">
        <Label htmlFor="email">Receiving Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
        />
        <p className="text-xs text-muted-foreground">
          The gift card code will be sent to this email address.
        </p>
      </div>

      {/* Calculated Total */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount to Pay:
          </span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {isCalculating ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : calculationData ? (
              `${calculationData.payoutCurrency} ${calculateTotal().toLocaleString()}`
            ) : (
              `${payoutCurrency} 0.00`
            )}
          </span>
        </div>
        <Button
          className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
          disabled={
            !selectedBrand ||
            !amount ||
            parseFloat(amount) < MIN_BUY_AMOUNT ||
            !email ||
            isSubmitting ||
            isCalculating
          }
          onClick={handleBuyCard}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            "Buy Gift Card"
          )}
        </Button>
      </div>
    </div>
  );
}
