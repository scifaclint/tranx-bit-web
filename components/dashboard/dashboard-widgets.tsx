"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Wallet, ListChecks, ArrowRight, Plus, Copy, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "flag-icons/css/flag-icons.min.css";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { useAuthStore } from "@/stores";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import PinSetupDialog from "@/components/modals/pin-set-up";
import WithdrawalModal from "@/components/modals/withdrawal";

export default function DashboardWidgets() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();

    // PIN Setup Modal State
    const [showPinModal, setShowPinModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'withdraw-wallet' | 'withdraw-bonus' | 'add-funds' | null>(null);

    // Withdrawal Modal State
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalSource, setWithdrawalSource] = useState<'main' | 'referral'>('main');

    const ads = [
        { src: "/ads/amazon-ads.svg", alt: "Amazon Gift Cards" },
        { src: "/ads/netflix-ads.svg", alt: "Netflix Subscriptions" },
        { src: "/ads/steam-ads.svg", alt: "Steam Wallet Codes" },
        { src: "/ads/apple-ads.svg", alt: "Apple Gift Cards" },
    ];

    const getCurrencyDetails = (country?: string) => {
        const c = country?.toLowerCase() || "";
        if (c === "ghana") return { symbol: "GH₵" };
        if (c === "nigeria") return { symbol: "₦" };
        return { symbol: "$" };
    };

    const currency = getCurrencyDetails(user?.country);
    const balanceValue = parseFloat(user?.wallet_balance || "0");

    const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    const [copied, setCopied] = useState(false);

    const handleCopyReferral = () => {
        const referralCode = (user as any)?.username || user?.id;
        const link = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Check if PIN is set, if not show modal, otherwise execute action
    const checkPinAndExecute = (action: 'withdraw-wallet' | 'withdraw-bonus' | 'add-funds') => {
        if (!(user as any)?.is_pin_set) {
            setPendingAction(action);
            setShowPinModal(true);
        } else {
            executePendingAction(action);
        }
    };

    // Execute the pending action after PIN is set or if PIN already exists
    const executePendingAction = (action: 'withdraw-wallet' | 'withdraw-bonus' | 'add-funds' | null) => {
        if (!action) return;

        switch (action) {
            case 'withdraw-wallet':
                setWithdrawalSource('main');
                setShowWithdrawalModal(true);
                break;
            case 'withdraw-bonus':
                setWithdrawalSource('referral');
                setShowWithdrawalModal(true);
                break;
            case 'add-funds':
                toast.info("Add credits feature coming soon");
                break;
        }
        setPendingAction(null);
    };

    // Handle successful PIN setup
    const handlePinSetSuccess = () => {
        // Update user store to reflect PIN is now set
        if (user) {
            setUser({ ...user, is_pin_set: true } as any);
        }
        // Execute the pending action
        executePendingAction(pendingAction);
    };

    // Handle successful withdrawal
    const handleWithdrawalSuccess = (data: any) => {
        // TODO: Update user balance in store
        // TODO: Show success message
        // TODO: Optionally navigate to transactions
        console.log("Withdrawal successful:", data);
    };

    useEffect(() => {
        if (!emblaApi) return;

        const t = setInterval(() => {
            if (!isPaused) {
                emblaApi?.scrollNext();
            }
        }, 4000);

        return () => clearInterval(t);
    }, [emblaApi, isPaused]);

    return (
        <div className="w-full mb-6 sm:mb-8">
            {/* Balance Cards and Carousel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Available Credits Card */}
                <Card className="bg-backgroundSecondary dark:bg-background shadow-sm rounded-2xl border border-borderColorPrimary">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                                    Available Credits
                                </p>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                                        {currency.symbol}{user?.wallet_balance || "0.00"}
                                    </h2>
                                    {balanceValue >= 0 && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-full border border-borderColorPrimary hover:bg-white dark:hover:bg-white/10"
                                                        onClick={() => checkPinAndExecute('add-funds')}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Add funds</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>

                                {user && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                                            <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100">
                                                {currency.symbol}{user.referral_balance || "0.00"}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                            Referral Bonus
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={handleCopyReferral}
                                    className="mt-6 flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group shadow-sm w-fit"
                                >
                                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                        Copy Referral Link
                                    </span>
                                    <div className="shrink-0">
                                        <AnimatePresence mode="wait">
                                            {copied ? (
                                                <motion.div
                                                    key="check"
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                >
                                                    <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="copy"
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                >
                                                    <Copy className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </button>
                            </div>
                            <div className="bg-black dark:bg-white/10 p-4 rounded-full">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col pt-0">
                        <Separator className="bg-borderColorPrimary mb-4" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="w-full justify-between items-center bg-white dark:bg-zinc-900 border-borderColorPrimary dark:border-white/20 text-bodyColor hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors px-6 h-11 rounded-xl"
                                    variant="outline"
                                    aria-label="Withdraw funds"
                                >
                                    <span className="font-semibold text-sm">Withdraw funds</span>
                                    <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white dark:bg-zinc-900 border border-borderColorPrimary rounded-xl shadow-xl p-2"
                            >
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (balanceValue > 0) {
                                            checkPinAndExecute('withdraw-wallet');
                                        } else {
                                            toast.info("Insufficient wallet balance");
                                        }
                                    }}
                                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-800 outline-none"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Main Wallet</span>
                                        <span className="text-[10px] text-zinc-400 font-medium">Use your available credits</span>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        {currency.symbol}{user?.wallet_balance || "0.00"}
                                    </span>
                                </DropdownMenuItem>

                                <Separator className="my-1 bg-zinc-100 dark:bg-zinc-800/50" />

                                <DropdownMenuItem
                                    onClick={() => {
                                        const bonus = parseFloat(user?.referral_balance || "0");
                                        if (bonus > 0) {
                                            checkPinAndExecute('withdraw-bonus');
                                        } else {
                                            toast.info("Insufficient referral bonus");
                                        }
                                    }}
                                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-800 outline-none"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Referral Bonus</span>
                                        <span className="text-[10px] text-zinc-400 font-medium">Use your earned bonuses</span>
                                    </div>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        {currency.symbol}{user?.referral_balance || "0.00"}
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardFooter>
                </Card>

                {/* Pending Orders Card */}
                <Card className="bg-backgroundSecondary dark:bg-background shadow-sm rounded-2xl border border-borderColorPrimary">
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                                    {user?.pending_orders_count || 0}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Pending Orders
                                </p>
                            </div>
                            <div className="bg-black dark:bg-white/10 p-4 rounded-full">
                                <ListChecks className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col pt-0">
                        <Separator className="bg-borderColorPrimary mb-4" />
                        <Button
                            onClick={() => {
                                router.push("/orders?filter=pending");
                            }}
                            className="w-full justify-center border-borderColorPrimary dark:border-white/20 text-bodyColor hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            variant="outline"
                            aria-label="View pending orders"
                        >
                            View pending orders
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* Ads Carousel */}
                <Card className="bg-backgroundSecondary dark:bg-background rounded-2xl p-4 shadow-lg border border-borderColorPrimary">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            Featured Offers
                        </h3>
                        <div
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <Carousel
                                className="w-full"
                                opts={{ align: "start", loop: true }}
                                setApi={setEmblaApi}
                            >
                                <CarouselContent>
                                    {ads.map((ad) => (
                                        <CarouselItem key={ad.src}>
                                            <div className="p-1 flex items-center justify-center h-32 cursor-pointer">
                                                <Image
                                                    src={ad.src}
                                                    alt={ad.alt}
                                                    width={420}
                                                    height={128}
                                                    className="h-full w-auto object-cover rounded-lg"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-0 shadow-md hover:bg-white h-5 w-5" />
                                <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border-0 shadow-md hover:bg-white h-5 w-5" />
                            </Carousel>
                        </div>
                    </div>
                </Card>
            </div>

            {/* PIN Setup Modal for Client */}
            <PinSetupDialog
                open={showPinModal}
                onOpenChange={setShowPinModal}
                onPinSet={handlePinSetSuccess}
                mode="client"
            />

            {/* Withdrawal Modal */}
            <WithdrawalModal
                open={showWithdrawalModal}
                onOpenChange={setShowWithdrawalModal}
                balanceSource={withdrawalSource}
                availableBalance={
                    withdrawalSource === 'main'
                        ? parseFloat(user?.wallet_balance || "0")
                        : parseFloat(user?.referral_balance || "0")
                }
                currencySymbol={currency.symbol}
                onSuccess={handleWithdrawalSuccess}
            />
        </div>
    );
}
