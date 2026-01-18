"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  Info,
  Upload,
  X,
  Plus,
} from "lucide-react";
import Image from "next/image";

const brands = [
  { value: "amazon", label: "Amazon", logo: "/brands/logo-amazon.svg" },
  { value: "apple", label: "Apple", logo: "/brands/apple-11.svg" },
  {
    value: "apex-legends",
    label: "Apex Legends",
    logo: "/brands/apex-legends-1.svg",
  },
  { value: "att", label: "AT&T", logo: "/brands/at-t-4.svg" },
  { value: "best-buy", label: "Best Buy", logo: "/brands/best-buy.svg" },
  { value: "booking", label: "Booking.com", logo: "/brands/bookingcom-1.svg" },
  {
    value: "calvin-klein",
    label: "Calvin Klein",
    logo: "/brands/calvin-klein-1.svg",
  },
  { value: "ea-sports", label: "EA Sports", logo: "/brands/ea-sports-2.svg" },
  { value: "ebay", label: "eBay", logo: "/brands/ebay.svg" },
  {
    value: "google-play",
    label: "Google Play",
    logo: "/brands/google-play-4.svg",
  },
  { value: "itunes", label: "iTunes", logo: "/brands/itunes-1.svg" },
  {
    value: "playstation",
    label: "PlayStation",
    logo: "/brands/playstation-6.svg",
  },
  { value: "spotify", label: "Spotify", logo: "/brands/spotify-logo.svg" },
  { value: "steam", label: "Steam", logo: "/brands/steam-1.svg" },
  { value: "target", label: "Target", logo: "/brands/target.svg" },
  { value: "uber-eats", label: "Uber Eats", logo: "/brands/uber-eats.svg" },
  { value: "xbox", label: "Xbox", logo: "/brands/xbox-3.svg" },
];

export default function SellGiftCards() {
  const router = useRouter();
  const [cardType, setCardType] = useState("ecodes");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [amount, setAmount] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [comment, setComment] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [paymentMethods] = useState<
    Array<{ value: string; label: string; type: string }>
  >([
    {
      value: "mtn_mobile_money",
      label: "MTN Mobile Money - +233 24 123 4567",
      type: "mobile_money",
    },
  ]);

  const selectedBrandData = brands.find(
    (brand) => brand.value === selectedBrand
  );

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setLoading(true);
      setOpen(true);
      setTimeout(() => {
        setLoading(false);
      }, 600);
    } else {
      setOpen(false);
      setLoading(false);
    }
  };

  // Calculate payout (example: 94% of card value)
  const RATE = 0.94;
  const calculatePayout = () => {
    const cardAmount = parseFloat(amount);
    if (isNaN(cardAmount) || cardAmount <= 0) return 0;
    return cardAmount * RATE;
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

  const handleSubmit = () => {
    // Validate required fields
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
      toast.error("Please upload both front and back images of the card");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    // Generate order ID
    const orderId = `SELL-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

    // Form submission will be handled by backend
    // For now, navigate to order details page
    router.push(`/sell-giftcards/${orderId}`);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
      {/* Left Side - Order Instructions */}
      <div className="w-full lg:flex-1 space-y-4">
        <div className="bg-backgroundSecondary border border-black/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4">
            Order Instructions
          </h2>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
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
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full max-w-md space-y-4">
        {/* Card Type Toggle */}
        <Tabs value={cardType} onValueChange={setCardType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="ecodes"
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Ecodes
            </TabsTrigger>
            <TabsTrigger
              value="physical"
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Physical
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="ecodes"
            className="space-y-4 mt-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {/* Card Brand Selector */}
            <div className="space-y-2">
              <Label>Select Card Brand</Label>
              <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  >
                    {selectedBrandData ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image
                            src={selectedBrandData.logo}
                            alt={selectedBrandData.label}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span>{selectedBrandData.label}</span>
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
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search brands..."
                      className="h-9"
                    />
                    <CommandList>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No brand found.</CommandEmpty>
                          <CommandGroup>
                            <div className="grid grid-cols-2 gap-1 p-2">
                              {brands.map((brand) => (
                                <CommandItem
                                  key={brand.value}
                                  value={brand.value}
                                  onSelect={(currentValue: string) => {
                                    setSelectedBrand(
                                      currentValue === selectedBrand
                                        ? ""
                                        : currentValue
                                    );
                                    setOpen(false);
                                  }}
                                  className="flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg border-2 border-transparent data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-950"
                                >
                                  <div className="relative w-12 h-12 mb-2">
                                    <Image
                                      src={brand.logo}
                                      alt={brand.label}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-center">
                                    {brand.label}
                                  </span>
                                  {selectedBrand === brand.value && (
                                    <Check className="absolute top-1 right-1 h-4 w-4 text-blue-600" />
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

            {/* Card Amount */}
            <div className="space-y-2">
              <Label>Card Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Gift Card Code */}
            <div className="space-y-2">
              <Label>Gift Card Code</Label>
              <Input
                type="text"
                placeholder="Enter your gift card code"
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                className="focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <Popover
                open={paymentMethodOpen}
                onOpenChange={setPaymentMethodOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={paymentMethodOpen}
                    className="w-full justify-between h-10 focus:ring-2 focus:ring-black/20 focus:border-black  transition-all"
                  >
                    {selectedPaymentMethod ? (
                      <span>
                        {
                          paymentMethods.find(
                            (m) => m.value === selectedPaymentMethod
                          )?.label
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Choose payment method
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {paymentMethods.map((method) => (
                          <CommandItem
                            key={method.value}
                            value={method.value}
                            onSelect={(currentValue: string) => {
                              setSelectedPaymentMethod(
                                currentValue === selectedPaymentMethod
                                  ? ""
                                  : currentValue
                              );
                              setPaymentMethodOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedPaymentMethod === method.value
                                  ? "opacity-100"
                                  : "opacity-0"
                                }`}
                            />
                            {method.label}
                          </CommandItem>
                        ))}
                        <CommandItem
                          onSelect={() => {
                            setPaymentMethodOpen(false);
                            toast.info("Add payment method feature coming soon", {
                              description: "You'll be able to add new payment methods here.",
                            });
                          }}
                          className="border-t"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Payment Method
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* You Will Get */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">You Will Get:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-blue-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current rate: {RATE * 100}% of card value</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  ${calculatePayout().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea
                placeholder="Add any additional information..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-black text-white font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.99] enabled:hover:bg-black/80"
              disabled={
                !selectedBrand ||
                !amount ||
                !giftCardCode ||
                !selectedPaymentMethod
              }
            >
              Proceed
            </Button>
          </TabsContent>

          <TabsContent
            value="physical"
            className="space-y-4 mt-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            {/* Card Brand Selector - Same as ecodes */}
            <div className="space-y-2">
              <Label>Select Card Brand</Label>
              <Popover open={open} onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {selectedBrandData ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image
                            src={selectedBrandData.logo}
                            alt={selectedBrandData.label}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span>{selectedBrandData.label}</span>
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
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search brands..."
                      className="h-9"
                    />
                    <CommandList>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No brand found.</CommandEmpty>
                          <CommandGroup>
                            <div className="grid grid-cols-2 gap-1 p-2">
                              {brands.map((brand) => (
                                <CommandItem
                                  key={brand.value}
                                  value={brand.value}
                                  onSelect={(currentValue: string) => {
                                    setSelectedBrand(
                                      currentValue === selectedBrand
                                        ? ""
                                        : currentValue
                                    );
                                    setOpen(false);
                                  }}
                                  className="flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg border-2 border-transparent data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-950"
                                >
                                  <div className="relative w-12 h-12 mb-2">
                                    <Image
                                      src={brand.logo}
                                      alt={brand.label}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-center">
                                    {brand.label}
                                  </span>
                                  {selectedBrand === brand.value && (
                                    <Check className="absolute top-1 right-1 h-4 w-4 text-blue-600" />
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

            {/* Card Amount */}
            <div className="space-y-2">
              <Label>Card Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Upload Card Images */}
            <div className="space-y-2">
              <Label>Upload Card Images</Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Front Image Upload */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Front *
                  </label>
                  {frontImage ? (
                    <div className="relative border-2 border-green-500 rounded-lg p-3 bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm truncate flex-1">
                          {frontImage.name}
                        </span>
                        <button
                          onClick={() => removeImage("front")}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="front-image-upload"
                      className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-backgroundSecondary transition-all"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Upload
                      </span>
                      <input
                        id="front-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "front")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Back Image Upload */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Back *
                  </label>
                  {backImage ? (
                    <div className="relative border-2 border-green-500 rounded-lg p-3 bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm truncate flex-1">
                          {backImage.name}
                        </span>
                        <button
                          onClick={() => removeImage("back")}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="back-image-upload"
                      className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-backgroundSecondary transition-all"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">
                        Upload
                      </span>
                      <input
                        id="back-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "back")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <Popover
                open={paymentMethodOpen}
                onOpenChange={setPaymentMethodOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={paymentMethodOpen}
                    className="w-full justify-between h-10 focus:ring-2 focus:ring-black/20 focus:border-black  transition-all"
                  >
                    {selectedPaymentMethod ? (
                      <span>
                        {
                          paymentMethods.find(
                            (m) => m.value === selectedPaymentMethod
                          )?.label
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Choose payment method
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  {paymentMethods.length === 0 ? (
                    <div className="p-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setPaymentMethodOpen(false);
                          toast.info("Add payment method feature coming soon", {
                            description: "You'll be able to add new payment methods here.",
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add New Payment Method
                      </Button>
                    </div>
                  ) : (
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {paymentMethods.map((method) => (
                            <CommandItem
                              key={method.value}
                              value={method.value}
                              onSelect={(currentValue: string) => {
                                setSelectedPaymentMethod(
                                  currentValue === selectedPaymentMethod
                                    ? ""
                                    : currentValue
                                );
                                setPaymentMethodOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${selectedPaymentMethod === method.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                  }`}
                              />
                              {method.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* You Will Get */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">You Will Get:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-blue-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current rate: {RATE * 100}% of card value</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  ${calculatePayout().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea
                placeholder="Add any additional information..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-black text-white font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[0.99] enabled:hover:bg-black/80"
              disabled={!selectedBrand || !amount || !frontImage || !backImage}
            >
              Proceed
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
