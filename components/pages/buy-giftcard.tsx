"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Minus, Plus, Check, ChevronDown, Loader, Gift } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useCards } from "@/hooks/useCards";
import { motion, AnimatePresence } from "framer-motion";
import { ordersApi } from "@/lib/api/orders";
// import { cn } from "@/lib/utils";

// Static brands removed to use live data from useCards hook

export default function BuyGiftCardPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: cardsData, isLoading: isLoadingCards } = useCards();
  const brands = cardsData?.data?.cards?.filter(c => c.type === "buy" && c.status === "active") || [];

  const selectedBrandData = brands.find(
    (brand) => brand._id === selectedBrand
  );

  const amounts = selectedBrandData?.prices?.map(p => p.denomination) || [];

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const calculateTotal = () => {
    if (selectedAmount) {
      return selectedAmount * quantity;
    }
    return 0;
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  const handleBuyCard = async () => {
    if (!selectedBrand || !selectedAmount) {
      toast.error("Please select a brand and amount");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add 2-second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        cardId: selectedBrand,
        selectedDenomination: selectedAmount,
        quantity: quantity,
        recipientEmail: email,
      };

      const response = await ordersApi.createBuyOrder(payload);

      if (response.status) {
        toast.success("Order created successfully!");
        router.push(`/buy-giftcards/${response.data.orderId}`);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Card Brand Selector */}
      <div className="space-y-2">
        <Label>Select Card Brand</Label>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild disabled={isLoadingCards}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-10 focus:ring-2 focus:ring-black/20 dark:focus:ring-gray-400/20 focus:border-black dark:focus:border-gray-600 transition-all font-normal"
            >
              {isLoadingCards ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span>Loading brands...</span>
                </div>
              ) : selectedBrandData ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5 flex-shrink-0">
                    {selectedBrandData.imageUrl && !selectedBrandData.imageUrl.includes("example.com") ? (
                      <Image
                        src={selectedBrandData.imageUrl}
                        alt={selectedBrandData.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-sm flex items-center justify-center">
                        <Gift className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span>{selectedBrandData.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select card brand</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search brands..." className="h-9" />
              <CommandList>
                {isLoadingCards ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-black/60" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No brand found.</CommandEmpty>
                    <CommandGroup>
                      <div className="grid grid-cols-2 gap-1 p-2">
                        {brands.map((brand) => (
                          <CommandItem
                            key={brand._id}
                            value={brand.name}
                            onSelect={() => {
                              setSelectedBrand(
                                brand._id === selectedBrand
                                  ? ""
                                  : brand._id
                              );
                              setSelectedAmount(null);
                              setOpen(false);
                            }}
                            className="flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-backgroundSecondary dark:hover:bg-gray-800 rounded-lg border-2 border-transparent data-[selected=true]:border-black dark:data-[selected=true]:border-gray-600 data-[selected=true]:bg-backgroundSecondary dark:data-[selected=true]:bg-gray-800"
                          >
                            <div className="relative w-12 h-12 mb-2">
                              {brand.imageUrl && !brand.imageUrl.includes("example.com") ? (
                                <Image
                                  src={brand.imageUrl}
                                  alt={brand.name}
                                  fill
                                  className="object-contain"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                                  <Gift className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-center truncate w-full px-1">
                              {brand.name}
                            </span>
                            {selectedBrand === brand._id && (
                              <Check className="absolute top-1 right-1 h-3 w-3 text-black dark:text-gray-200" />
                            )}
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Amount Selection - Conditional Animation */}
      <AnimatePresence mode="wait">
        {selectedBrand && amounts.length > 0 ? (
          <motion.div
            key="amount-selection"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <Label>Choose Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`
                    relative p-[1px] rounded-lg border border-black/20 dark:border-gray-700 transition-all duration-200
                    ${selectedAmount === amount
                      ? "border-black dark:border-gray-400"
                      : "hover:border-black dark:hover:border-gray-600"
                    }
                  `}
                >
                  <div
                    className={`
                    rounded-lg p-3 transition-all duration-200
                    ${selectedAmount === amount
                        ? "bg-black dark:bg-gray-700 text-white"
                        : "bg-backgroundSecondary dark:bg-gray-800"
                      }
                  `}
                  >
                    <div className="text-base font-bold">${amount}</div>
                    <div className="text-xs text-inherit opacity-70">USD</div>
                    {selectedAmount === amount && (
                      <div className="absolute top-1.5 right-1.5">
                        <div className="w-3.5 h-3.5 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center border-none">
                          <div className="w-1.5 h-1.5 bg-black dark:bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : !selectedBrand && !isLoadingCards && (
          <motion.div
            key="amount-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground/60 bg-muted/5"
          >
            <Gift className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-[10px] font-medium uppercase tracking-wider">Select a brand to see pricing</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <Label>Quantity</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="h-9 w-9 rounded-lg hover:border-black dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            className="h-9 w-16 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            min="1"
            placeholder="1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="h-9 w-9 rounded-lg hover:border-black dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
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
          className="h-10 focus:ring-2 focus:ring-black/20 dark:focus:ring-gray-400/20 focus:border-black dark:focus:border-gray-600 transition-all"
        />
        <p className="text-xs text-muted-foreground">
          The gift card code will be sent to this email address.
        </p>
      </div>

      {/* Calculated Total */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount:
          </span>
          <span className="text-xl font-bold text-black dark:text-gray-100">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>
        <Button
          className="w-full bg-black dark:bg-gray-800 text-white dark:text-gray-100 font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.99] enabled:hover:bg-black/80 dark:enabled:hover:bg-gray-700"
          disabled={!selectedBrand || !selectedAmount || isSubmitting}
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
