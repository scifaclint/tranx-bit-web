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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { useCards, useCurrencies } from "@/hooks/useCards";
import { usePaymentMethods } from "@/hooks/usePayments";
import { motion, AnimatePresence } from "framer-motion";
import { ordersApi } from "@/lib/api/orders";
import { PAYMENT_LOGOS, NETWORK_LABELS } from "@/lib/payment-constants";
import "flag-icons/css/flag-icons.min.css";
import PaymentMethodModal from "@/components/modals/payment-method-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores";
import { useUser } from "@/components/providers/userProvider";

// CURRENCIES array removed - now using useCurrencies() hook

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
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const { user } = useAuthStore();
  const { refreshUser } = useUser();

  const [cardType, setCardType] = useState("ecodes");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Form State
  const [selectedBrand, setSelectedBrand] = useState("");
  const [amount, setAmount] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [comment, setComment] = useState("");
  const [cardImages, setCardImages] = useState<File[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [cardCurrency, setCardCurrency] = useState("usd");

  // Calculation State
  const [calculationData, setCalculationData] = useState<{
    payoutAmount: number;
    payoutCurrency: string;
    cardRate: number;
    exchangeRate: number;
    calculatedAt: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Hooks
  const { data: cardsData, isLoading: isLoadingCards } = useCards({ limit: 1000 });
  const { data: paymentsData, isLoading: isLoadingPayments } = usePaymentMethods();
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useCurrencies();

  // Derived Data
  const brands = React.useMemo(() => {
    const rawBrands = cardsData?.data?.cards?.filter(c => (c.type === "sell" || c.type === "both") && c.status === "active") || [];
    return [...rawBrands].sort((a, b) => a.name.localeCompare(b.name));
  }, [cardsData]);

  const currencies = currenciesData?.data || [];
  const paymentMethods = paymentsData?.data || [];

  const selectedBrandData = brands.find(
    (brand) => brand._id === selectedBrand
  );

  // Determine Payout Currency
  const payoutCurrency = React.useMemo(() => {
    if (!user?.country) return "GHS";
    const country = user.country.toLowerCase();
    if (country === "nigeria" || country === "ng") return "NGN";
    return "GHS";
  }, [user]);

  // Effects
  // Handle pre-population from dashboard
  useEffect(() => {
    const brandParam = searchParams.get("brandName");
    const amountParam = searchParams.get("amount");

    if (brandParam && brands.length > 0) {
      const matchedBrand = brands.find(b =>
        b.name.toLowerCase().includes(brandParam.toLowerCase())
      );

      if (matchedBrand) {
        setSelectedBrand(matchedBrand._id);
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

  // Handle Fixed Currency Locking
  useEffect(() => {
    if (selectedBrandData?.fixedCurrency) {
      setCardCurrency(selectedBrandData.fixedCurrency.toLowerCase());
    }
  }, [selectedBrand, selectedBrandData]);

  // Dynamic Payout Calculation
  useEffect(() => {
    const fetchCalculation = async () => {
      const cardAmount = parseFloat(amount);
      // Valid amount check (must be greater than 0)
      if (!selectedBrand || isNaN(cardAmount) || cardAmount <= 0) {
        setCalculationData(null);
        return;
      }

      setIsCalculating(true);
      try {
        const response = await ordersApi.calculateOrder({
          cardId: selectedBrand,
          amount: cardAmount,
          currency: cardCurrency.toUpperCase(),
          payoutCurrency,
        });

        if (response.status) {
          setCalculationData(response.data);
        }
      } catch (error) {
        console.error("Calculation failed:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    const debounceTimer = setTimeout(fetchCalculation, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedBrand, amount, cardCurrency, payoutCurrency]);

  // Handlers
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files[0] && cardImages.length < 2) {
      setCardImages(prev => [...prev, files[0]]);
    }
    // Reset input so the same file can be uploaded again if removed
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setCardImages(prev => prev.filter((_, i) => i !== index));
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

    if (cardType === "physical" && cardImages.length === 0) {
      toast.error("Please upload at least one card image");
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
        card_currency: cardCurrency.toUpperCase(),
        giftCardCodes: cardType === "ecodes" ? giftCardCode : undefined,
        payoutCurrency,
        expectedPayout: calculationData?.payoutAmount,
        calculatedAt: calculationData?.calculatedAt,
        additionalComments: comment || undefined,
        cardImages: cardType === "physical" && cardImages.length > 0
          ? cardImages
          : undefined,
      };

      console.log("Submitting Sell Order Payload:", payload);

      const response = await ordersApi.createSellOrder(payload);

      if (response.status) {
        toast.success("Order created successfully!");
        // Silently refresh user data in the background
        refreshUser();
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


  const BrandList = ({ onSelect }: { onSelect: (brandId: string) => void }) => (
    <Command className="flex flex-col h-full bg-transparent">
      <div className="px-4 py-2 border-b border-zinc-200/20 dark:border-zinc-800/20">
        <CommandInput
          placeholder="Search brands..."
          className="h-12 bg-zinc-100/50 dark:bg-zinc-800/50 border-none rounded-xl focus:ring-0"
        />
      </div>
      <CommandList className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
        <CommandEmpty className="py-12 text-center text-muted-foreground">
          No brand found.
        </CommandEmpty>
        <CommandGroup>
          <div className="grid grid-cols-1 gap-2">
            {brands.map((brand) => (
              <CommandItem
                key={brand._id}
                value={brand.name}
                onSelect={() => onSelect(brand._id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-2xl border border-transparent data-[selected=true]:border-blue-500/50 data-[selected=true]:bg-blue-500/10 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-sm">
                    <Gift className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">
                      {brand.name}
                    </span>
                    {/* <span className="text-xs text-muted-foreground">
                      Sell gift card
                    </span> */}
                  </div>
                </div>
                {selectedBrand === brand._id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const renderBrandPicker = () => (
    <div className="space-y-2">
      <Label>Select Card Brand</Label>
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild disabled={isLoadingCards}>
            <Button
              variant="outline"
              className="w-full justify-between h-12 focus:ring-2 focus:ring-black/5 transition-all font-normal bg-white dark:bg-background border-zinc-200 dark:border-borderColorPrimary"
            >
              {isLoadingCards ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span>Loading brands...</span>
                </div>
              ) : selectedBrandData ? (
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-zinc-500" />
                  <span className="font-medium">{selectedBrandData.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select card brand</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[95vh] rounded-t-[20px] px-0 flex flex-col">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-left text-xl font-bold">Select Card Brand</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <BrandList onSelect={(id) => {
                setSelectedBrand(id);
                setOpen(false);
              }} />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
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
                  <Gift className="w-4 h-4 text-zinc-500" />
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
            <BrandList onSelect={(id) => {
              setSelectedBrand(id);
              setOpen(false);
            }} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );

  const renderCurrencyPicker = () => {
    const selected = currencies.find((c) => c.id.toLowerCase() === cardCurrency.toLowerCase()) || currencies[0];
    return (
      <div className="space-y-2">
        <Label>Card Currency</Label>
        <Popover open={currencyOpen} onOpenChange={setCurrencyOpen}>
          <PopoverTrigger asChild disabled={isLoadingCurrencies || currencies.length === 0 || !!selectedBrandData?.fixedCurrency}>
            <Button
              variant="outline"
              className="w-full justify-between h-12 bg-white dark:bg-background border-zinc-200 dark:border-borderColorPrimary focus:ring-2 focus:ring-black/5"
            >
              {isLoadingCurrencies ? (
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span>Loading currencies...</span>
                </div>
              ) : selected ? (
                <div className="flex items-center gap-2">
                  <span className={`fi fi-${selected.flag.toLowerCase()} rounded-sm`}></span>
                  <span className="font-medium">{selected.name} ({selected.id.toUpperCase()})</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select currency</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 dark:bg-backgroundSecondary" align="start">
            <Command className="dark:bg-backgroundSecondary">
              <CommandList>
                <CommandGroup>
                  {currencies.map((currency) => (
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
                          <span className={`fi fi-${currency.flag.toLowerCase()} rounded-sm`}></span>
                          <span className="font-medium text-sm">{currency.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground uppercase">{currency.id}</span>
                      </div>
                      <Check
                        className={`ml-auto h-4 w-4 ${cardCurrency.toLowerCase() === currency.id.toLowerCase() ? "opacity-100" : "opacity-0"}`}
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
          className="p-4 bg-zinc-50 dark:bg-backgroundSecondary border border-zinc-200 dark:border-borderColorPrimary rounded-xl relative overflow-hidden"
        >
          {isCalculating && (
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <Loader className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">You Will Get:</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {calculationData ? (
                  `${payoutCurrency === "GHS" ? "GH₵" : "₦"}${calculationData.payoutAmount.toLocaleString()}`
                ) : (
                  <Loader className="h-6 w-6 animate-spin text-zinc-400" />
                )}
              </span>
            </div>
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
                    {currencies.find(c => c.id.toLowerCase() === cardCurrency.toLowerCase())?.symbol || "$"}
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
                  placeholder="e.g. ABCD EFGH IJKL"
                  value={giftCardCode}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase();
                    // Allow letters, numbers, dashes and spaces (temporary for formatting)
                    // But we strip multiple spaces or weird characters
                    const raw = val.replace(/[^A-Z0-9-\s]/g, "").replace(/\s+/g, " "); // Allow spaces, then collapse multiple spaces

                    if (raw.includes("-")) {
                      // If they explicitly use dashes, keep it raw but uppercase
                      setGiftCardCode(raw);
                    } else {
                      // If just alphanumeric, auto-insert spaces every 4 characters
                      const alphanumericOnly = raw.replace(/\s/g, ""); // Remove spaces for formatting
                      const formatted = alphanumericOnly.match(/.{1,4}/g)?.join(" ") || alphanumericOnly;
                      setGiftCardCode(formatted);
                    }
                  }}
                  className="h-12 rounded-xl border-zinc-200 dark:border-borderColorPrimary focus-visible:ring-black/5 font-mono text-base tracking-wider"
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
                disabled={!selectedBrand || !amount || !giftCardCode || !selectedPaymentMethod || isSubmitting}
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
                    {currencies.find(c => c.id.toLowerCase() === cardCurrency.toLowerCase())?.symbol || "$"}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Attach Card Images (Front/Back)</Label>
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    {cardImages.length}/2 Images
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {cardImages.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative h-32 border border-zinc-200 dark:border-borderColorPrimary rounded-2xl overflow-hidden group bg-zinc-50 dark:bg-zinc-900/50"
                      >
                        <div className="absolute top-2 right-2 z-20">
                          <button
                            onClick={() => removeImage(index)}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 rounded-full flex items-center justify-center text-white transition-all transform active:scale-90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                            <Check className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-[10px] text-zinc-500 font-medium truncate w-full px-2">
                            {file.name}
                          </span>
                        </div>
                      </motion.div>
                    ))}

                    {cardImages.length < 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full"
                      >
                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-200 dark:border-borderColorPrimary rounded-2xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all gap-2 group">
                          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="h-5 w-5 text-zinc-500" />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                disabled={!selectedBrand || !amount || (cardType === "ecodes" ? !giftCardCode : cardImages.length === 0) || !selectedPaymentMethod || isSubmitting}
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
