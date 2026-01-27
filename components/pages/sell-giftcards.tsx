"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ChevronDown,
  Loader,
  Info,
  Upload,
  X,
  Plus,
  Gift,
  Wallet,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useCards } from "@/hooks/useCards";
import { usePaymentMethods } from "@/hooks/usePayments";
import { motion, AnimatePresence } from "framer-motion";
import { ordersApi } from "@/lib/api/orders";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";
import "flag-icons/css/flag-icons.min.css";
import PaymentMethodModal from "@/components/modals/payment-method-modal";
import { useIsMobile } from "@/hooks/use-mobile";

const CURRENCIES = [
  { id: "usd", name: "US Dollar", flag: "us", symbol: "$" },
  { id: "gbp", name: "UK Pounds", flag: "gb", symbol: "£" },
  { id: "eur", name: "Euro", flag: "eu", symbol: "€" },
  { id: "aud", name: "Australia Dollar", flag: "au", symbol: "A$" },
  { id: "cad", name: "Canadian Dollar", flag: "ca", symbol: "C$" },
  { id: "nzd", name: "New Zealand Dollar", flag: "nz", symbol: "NZ$" },
];

export default function SellGiftCards() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SellGiftCardsContent />
    </Suspense>
  );
}

function SellGiftCardsContent() {
  const router = useRouter();
  const [cardType, setCardType] = useState("ecodes");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedBrand, setSelectedBrand] = useState("");
  const [amount, setAmount] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [comment, setComment] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cardCurrency, setCardCurrency] = useState("usd");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Hooks
  const { data: cardsData, isLoading: isLoadingCards } = useCards();
  const { data: paymentsData, isLoading: isLoadingPayments } = usePaymentMethods();

  // Derived Data
  const brands = cardsData?.data?.cards?.filter(c => c.type === "sell" && c.status === "active") || [];
  const paymentMethods = paymentsData?.data || [];

  // Handle pre-population from dashboard
  useEffect(() => {
    const brandParam = searchParams.get("brandName");
    const amountParam = searchParams.get("amount");

    if (brandParam && brands.length > 0) {
      // Find the real DB brand that matches the name passed from dashboard
      const matchedBrand = brands.find(b =>
        b.name.toLowerCase().includes(brandParam.toLowerCase())
      );

      if (matchedBrand) {
        setSelectedBrand(matchedBrand._id);
        // If the brand has a default type (most are ecodes), we select it
        if (matchedBrand.category?.toLowerCase() === "physical") {
          setCardType("physical");
        } else {
          setCardType("ecodes");
        }
      }
    }

    if (amountParam) {
      setAmount(amountParam);
    }
  }, [brands, searchParams]);

  const selectedBrandData = brands.find(
    (brand) => brand._id === selectedBrand
  );

  const sellRate = selectedBrandData?.sellRate || 0;

  const calculatePayout = () => {
    const cardAmount = parseFloat(amount);
    if (isNaN(cardAmount) || cardAmount <= 0) return 0;
    return cardAmount * sellRate;
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (side === "front") {
        setFrontImage(files[0]);
      } else {
        setBackImage(files[0]);
      }
    }
  };

  const removeImage = (side: "front" | "back") => {
    if (side === "front") {
      setFrontImage(null);
    } else {
      setBackImage(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBrand) {
      toast.error("Please select a card brand");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid card amount");
      return;
    }

    if (cardType === "ecodes" && !giftCardCode) {
      toast.error("Please enter your gift card code");
      return;
    }

    if (cardType === "physical" && (!frontImage || !backImage)) {
      toast.error("Please upload both front and back images");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add 2-second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      const payload = {
        cardId: selectedBrand,
        cardValue: parseFloat(amount),
        paymentMethodId: selectedPaymentMethod,
        card_currency: cardCurrency,
        additionalComments: comment || undefined,
        cardImages: cardType === "physical" && frontImage && backImage
          ? [frontImage, backImage]
          : undefined,
      };

      const response = await ordersApi.createSellOrder(payload);

      if (response.status) {
        toast.success("Order created successfully!");
        router.push(`/sell-giftcards/${response.data.orderId}`);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to submit order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBrandPicker = () => (
    <div className="space-y-2">
      <Label>Select Card Brand</Label>
      <Popover open={open} onOpenChange={setOpen}>
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
                <div className="relative w-6 h-6 flex-shrink-0">
                  {selectedBrandData.imageUrl && !selectedBrandData.imageUrl.includes("example.com") ? (
                    <Image
                      src={selectedBrandData.imageUrl}
                      alt={selectedBrandData.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-sm flex items-center justify-center">
                      <Gift className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                  )}
                </div>
                <span className="font-medium">{selectedBrandData.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                {brands.length === 0 ? "No cards available" : "Select card brand"}
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] dark:bg-backgroundSecondary p-0" align="start">
          <Command className="dark:bg-backgroundSecondary">
            <CommandInput placeholder="Search brands..." className="h-10" />
            <CommandList>
              <CommandEmpty>No brand found.</CommandEmpty>
              <CommandGroup>
                <div className="grid grid-cols-2 gap-1 p-2">
                  {brands.map((brand) => (
                    <CommandItem
                      key={brand._id}
                      value={brand.name}
                      onSelect={() => {
                        setSelectedBrand(brand._id === selectedBrand ? "" : brand._id);
                        setOpen(false);
                      }}
                      className="flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-hoverColorPrimary rounded-xl border-2 border-transparent data-[selected=true]:border-black dark:data-[selected=true]:border-borderColorPrimary data-[selected=true]:bg-zinc-50 dark:data-[selected=true]:bg-backgroundSecondary transition-all gap-2"
                    >
                      <div className="relative w-12 h-12">
                        {brand.imageUrl && !brand.imageUrl.includes("example.com") ? (
                          <Image
                            src={brand.imageUrl}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center">
                            <Gift className="w-6 h-6 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-center truncate w-full">
                        {brand.name}
                      </span>
                      {selectedBrand === brand._id && (
                        <div className="absolute top-2 right-2 p-0.5 bg-black dark:bg-zinc-200 rounded-full">
                          <Check className="h-3 w-3 text-white dark:text-black" />
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderCurrencyPicker = () => {
    const selected = CURRENCIES.find((c) => c.id === cardCurrency) || CURRENCIES[0];
    return (
      <div className="space-y-2">
        <Label>Card Currency</Label>
        <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 bg-white dark:bg-background border-zinc-200 dark:border-borderColorPrimary focus:ring-2 focus:ring-black/5"
            >
              <div className="flex items-center gap-2">
                <span className={`fi fi-${selected.flag} rounded-sm`}></span>
                <span className="font-medium">{selected.name} ({selected.id.toUpperCase()})</span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 dark:bg-backgroundSecondary" align="start">
            <Command className="dark:bg-backgroundSecondary">
              <CommandList>
                <CommandGroup>
                  {CURRENCIES.map((currency) => (
                    <CommandItem
                      key={currency.id}
                      onSelect={() => {
                        setCardCurrency(currency.id);
                        setCurrencyOpen(false);
                      }}
                      className="p-3 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className={`fi fi-${currency.flag} rounded-sm`}></span>
                          <span className="font-medium text-sm">{currency.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase">{currency.id}</span>
                      </div>
                      <Check
                        className={`ml-auto h-4 w-4 ${cardCurrency === currency.id ? "opacity-100" : "opacity-0"}`}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderPaymentPicker = () => (
    <div className="space-y-2">
      <Label>Select Payment Method</Label>
      <Popover open={paymentMethodOpen} onOpenChange={setPaymentMethodOpen}>
        <PopoverTrigger asChild disabled={isLoadingPayments}>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-12 focus:ring-2 focus:ring-black/5 transition-all font-normal bg-white dark:bg-background border-zinc-200 dark:border-borderColorPrimary"
          >
            {isLoadingPayments ? (
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                <span>Loading accounts...</span>
              </div>
            ) : selectedPaymentMethod ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const method = paymentMethods.find((m) => m._id === selectedPaymentMethod);
                  if (!method) return <Wallet className="h-4 w-4 text-zinc-500" />;
                  const logoKey = method.type === "mobile_money" ? method.mobileNetwork : "btc";
                  return PAYMENT_LOGOS[logoKey] ? (
                    <div className="w-5 h-5 flex-shrink-0">
                      <Image
                        src={PAYMENT_LOGOS[logoKey]}
                        alt={method.type}
                        width={20}
                        height={20}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <Wallet className="h-4 w-4 text-zinc-500" />
                  );
                })()}
                <span className="font-medium">
                  {(() => {
                    const method = paymentMethods.find((m) => m._id === selectedPaymentMethod);
                    if (!method) return "Select account";
                    return method.type === "mobile_money"
                      ? `${NETWORK_LABELS[method.mobileNetwork] || method.mobileNetwork} - ${method.accountName}`
                      : `${NETWORK_LABELS.btc} - ${method.btcAddress}`;
                  })()}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">
                {paymentMethods.length === 0 ? "No saved accounts" : "Choose payment account"}
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              <CommandGroup>
                {paymentMethods.map((method) => (
                  <CommandItem
                    key={method._id}
                    value={method._id}
                    onSelect={() => {
                      setSelectedPaymentMethod(method._id === selectedPaymentMethod ? "" : method._id);
                      setPaymentMethodOpen(false);
                    }}
                    className="p-3"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${selectedPaymentMethod === method._id ? "opacity-100" : "opacity-0"}`}
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center p-1 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
                        {(() => {
                          const logoKey = method.type === "mobile_money" ? method.mobileNetwork : "btc";
                          return PAYMENT_LOGOS[logoKey] ? (
                            <Image
                              src={PAYMENT_LOGOS[logoKey]}
                              alt={method.type}
                              width={24}
                              height={24}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Wallet className="w-4 h-4 text-zinc-400" />
                          );
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {method.type === "mobile_money"
                            ? (NETWORK_LABELS[method.mobileNetwork] || method.mobileNetwork)
                            : NETWORK_LABELS.btc}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {method.type === "mobile_money" ? method.accountName : method.btcAddress}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => {
                    setPaymentMethodOpen(false);
                    setIsPaymentModalOpen(true);
                  }}
                  className="border-t mt-1 py-3"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Account
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderPayoutSection = () => (
    <AnimatePresence mode="wait">
      {amount && selectedBrandData ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="p-4 bg-zinc-50 dark:bg-backgroundSecondary border border-zinc-200 dark:border-borderColorPrimary rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">You Will Get:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-zinc-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Current rate: {(sellRate * 100).toFixed(0)}% of card value</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ${calculatePayout().toFixed(2)}
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
        {/* Left Side - Instructions */}
        <div className="w-full lg:flex-1 space-y-6">
          <div className="bg-white dark:bg-background border border-zinc-200 dark:border-borderColorPrimary rounded-2xl overflow-hidden shadow-sm">
            {/* Header / Toggle (Mobile Only) */}
            <button
              onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
              className="w-full flex items-center justify-between p-6 lg:p-8 text-left focus:outline-none"
              disabled={!isMobile}
            >
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Order Instructions</h2>
              {isMobile && (
                <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  {isInstructionsOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              )}
            </button>

            <AnimatePresence initial={false}>
              {(!isMobile || isInstructionsOpen) && (
                <motion.div
                  initial={isMobile ? { height: 0, opacity: 0 } : false}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 lg:px-8 pb-8 space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 lg:border-t-0 mt-[-1px]">
                    <p>
                      <strong>Step 1: Verify Your Card Balance</strong>
                      <br />
                      Always check and confirm your gift card balance before submitting.
                      This ensures a smooth transaction and faster processing time.
                    </p>
                    <p>
                      <strong>Important Balance Verification Tips:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>
                        <strong>Amazon cards:</strong> Balance verification is typically
                        not required before submission.
                      </li>
                      <li>
                        <strong>Onevanilla cards:</strong> Do NOT check balance on
                        VanillaGift.com as this can deactivate your card. Instead, call
                        the Onevanilla customer service to confirm your card is active
                        and has the correct balance.
                      </li>
                      <li>
                        <strong>iTunes/Apple cards:</strong> Search &quot;check iTunes
                        balance&quot; to find Apple&apos;s official balance checker on
                        their website.
                      </li>
                      <li>
                        <strong>Retail cards (Walmart, Best Buy, etc.):</strong> Visit
                        the retailer&apos;s official website to verify your card
                        balance.
                      </li>
                    </ul>
                    <p>
                      <strong>Step 2: Submit Your Card</strong>
                      <br />
                      Once you&apos;ve confirmed the balance is correct, complete the
                      form on the right with your card details.
                    </p>
                    <p>
                      <strong>Processing Time:</strong>
                      <br />
                      We typically process payments within 30-60 minutes after
                      validating your card. During peak times, processing may take
                      slightly longer due to high order volume.
                    </p>
                    <p>
                      <strong>What Happens Next:</strong>
                      <br />
                      After we verify and use your card successfully, payment will be
                      transferred to your TranxBit account automatically. The
                      transaction will then be marked as complete by our system.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[450px] space-y-6">
          <Tabs value={cardType} onValueChange={setCardType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-100 dark:bg-backgroundSecondary rounded-xl">
              <TabsTrigger value="ecodes" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-background shadow-sm">
                Ecodes
              </TabsTrigger>
              <TabsTrigger value="physical" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-background shadow-sm">
                Physical
              </TabsTrigger>
            </TabsList>

            {/* Ecodes Tab */}
            <TabsContent value="ecodes" className="space-y-6 mt-6">
              {renderBrandPicker()}
              {renderCurrencyPicker()}

              <div className="space-y-2">
                <Label>Card Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                    {CURRENCIES.find(c => c.id === cardCurrency)?.symbol || "$"}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 h-12 rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gift Card Code</Label>
                <Input
                  placeholder="Enter your card code"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  className="h-12 rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
                />
              </div>

              {renderPaymentPicker()}
              {renderPayoutSection()}

              <div className="space-y-2">
                <Label>Comments (Optional)</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                disabled={!selectedBrand || !amount || !giftCardCode || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Sell Gift Card"
                )}
              </Button>
            </TabsContent>

            {/* Physical Tab */}
            <TabsContent value="physical" className="space-y-6 mt-6">
              {renderBrandPicker()}
              {renderCurrencyPicker()}

              <div className="space-y-2">
                <Label>Card Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
                    {CURRENCIES.find(c => c.id === cardCurrency)?.symbol || "$"}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 h-12 rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Card Images</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "front", label: "Front Image", file: frontImage },
                    { id: "back", label: "Back Image", file: backImage }
                  ].map((img) => (
                    <div key={img.id} className="space-y-2">
                      <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">{img.label}</Label>
                      {img.file ? (
                        <div className="relative h-28 border-2 border-zinc-900 rounded-xl overflow-hidden group">
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                            <button onClick={() => removeImage(img.id as "front" | "back")} className="p-2 bg-white rounded-full text-black hover:bg-zinc-100">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                            <span className="text-[10px] text-zinc-500 font-medium px-4 text-center truncate w-full">{img.file.name}</span>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-zinc-200 dark:border-borderColorPrimary rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all gap-1">
                          <Upload className="h-5 w-5 text-zinc-400" />
                          <span className="text-[10px] font-semibold text-zinc-500">UPLOAD</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, img.id as "front" | "back")} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {renderPaymentPicker()}
              {renderPayoutSection()}

              <div className="space-y-2">
                <Label>Comments (Optional)</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px] rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                disabled={!selectedBrand || !amount || !frontImage || !backImage || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Sell Gift Card"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
