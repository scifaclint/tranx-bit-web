"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCards } from "@/hooks/useCards";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const BRAND_COLORS: Record<string, string> = {
    amazon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    apple: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
    google: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    steam: "bg-slate-700/10 text-slate-700 dark:text-slate-300",
    ebay: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    playstation: "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400",
    xbox: "bg-green-600/10 text-green-600 dark:text-green-400",
    itunes: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

const DEFAULT_COLOR = "bg-primary/10 text-primary";
const PRESET_VALUES = [25, 50, 100, 500];

function GiftCardSkeleton() {
    return (
        <Card className="relative bg-background border border-borderColorPrimary rounded-[1.5rem] lg:rounded-[2rem] p-2 lg:p-2.5 flex flex-col items-center overflow-hidden animate-pulse">
            {/* Hero Skeleton */}
            <div className="w-full h-20 lg:h-28 bg-backgroundSecondary rounded-[1rem] lg:rounded-[1.5rem] mb-3" />

            <div className="w-full px-1 lg:px-2 pb-1 space-y-3 lg:space-y-4">
                {/* Presets Skeleton */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 h-6 lg:h-7 bg-backgroundSecondary rounded-lg" />
                    ))}
                </div>

                {/* Payout & Button Skeleton */}
                <div className="space-y-2 lg:space-y-3">
                    <div className="flex justify-between px-1">
                        <div className="h-2 w-8 lg:w-10 bg-backgroundSecondary rounded" />
                        <div className="h-3 lg:h-4 w-12 lg:w-16 bg-backgroundSecondary rounded" />
                    </div>
                    <div className="w-full h-8 lg:h-10 bg-backgroundSecondary rounded-lg lg:rounded-xl" />
                </div>
            </div>
        </Card>
    );
}

// Helper to get color for brand
function getBrandColor(brandName: string) {
    const key = brandName.toLowerCase();
    for (const [k, v] of Object.entries(BRAND_COLORS)) {
        if (key.includes(k)) return v;
    }
    return DEFAULT_COLOR;
}

// Counter animation component
function AnimatedNumber({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 500;
        const steps = 30;
        const increment = value / steps;
        const stepDuration = duration / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(current);
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [value]);

    return <>{displayValue.toFixed(2)}</>;
}

function getRateColor(rate: number) {
    if (rate >= 0.85) return "text-emerald-500";
    if (rate >= 0.75) return "text-amber-500";
    return "text-rose-500";
}

export function SellGiftCardGrid() {
    const router = useRouter();
    const { data: cardsResponse, isLoading } = useCards({
        staleTime: Infinity, // Fetch once and cache forever (or until refresh)
    });

    const [selectedValues, setSelectedValues] = useState<Record<string, number>>({});

    const sellCards = useMemo(() => {
        if (!cardsResponse?.data?.cards) return [];
        // Filter for sell cards and active status
        const filtered = cardsResponse.data.cards.filter(
            (card) => card.type === "sell" && card.status === "active"
        );

        // Deduplicate by brand to show unique cards
        const seenBrands = new Set();
        return filtered.filter((card) => {
            if (seenBrands.has(card.brand)) return false;
            seenBrands.add(card.brand);
            return true;
        });
    }, [cardsResponse]);

    const handlePresetClick = (id: string, preset: number) => {
        setSelectedValues((prev) => ({ ...prev, [id]: preset }));
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-6">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    // Skeleton Grid
                    Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={`skeleton-${i}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GiftCardSkeleton />
                        </motion.div>
                    ))
                ) : (
                    // Real Content
                    sellCards.map((card, index) => {
                        const amount = selectedValues[card._id] || 100;
                        const payout = amount * card.sellRate;
                        const brandColor = getBrandColor(card.brand);

                        return (
                            <motion.div
                                key={card._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.3 }}
                            >
                                <TooltipProvider delayDuration={100}>
                                    <Card className="group relative bg-background border border-borderColorPrimary rounded-[1.5rem] lg:rounded-[2rem] p-2 lg:p-2.5 transition-all duration-300 hover:shadow-2xl hover:border-black/10 dark:hover:border-white/10 hover:-translate-y-1.5 flex flex-col items-center overflow-hidden cursor-pointer">
                                        {/* Hero Visual Section - Stable Logo */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full h-20 lg:h-28 bg-backgroundSecondary rounded-[1rem] lg:rounded-[1.5rem] flex items-center justify-center p-4 lg:p-6 relative overflow-hidden mb-3 transition-colors duration-300">
                                                    <div
                                                        className={`w-full h-full ${brandColor} transition-colors duration-300`}
                                                        style={{
                                                            maskImage: `url(${card.imageUrl})`,
                                                            WebkitMaskImage: `url(${card.imageUrl})`,
                                                            maskRepeat: 'no-repeat',
                                                            maskPosition: 'center',
                                                            maskSize: 'contain',
                                                            backgroundColor: 'currentColor'
                                                        }}
                                                    />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-lg px-3 py-1.5 border-none">
                                                {card.brand}
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* Content Section */}
                                        <div className="w-full px-1 lg:px-2 pb-1 text-center">
                                            {/* Slim Preset Selection */}
                                            <div className="flex gap-1 mb-3 lg:mb-4">
                                                {PRESET_VALUES.map((preset) => (
                                                    <button
                                                        key={preset}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePresetClick(card._id, preset);
                                                        }}
                                                        className={`flex-1 py-1 lg:py-1.5 rounded-lg text-[8px] lg:text-[9px] font-bold transition-all duration-200 border ${amount === preset
                                                            ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-sm scale-105"
                                                            : "bg-backgroundSecondary border-borderColorPrimary text-bodyColor/25 hover:text-bodyColor"
                                                            }`}
                                                    >
                                                        ${preset}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Action Area: Clear Value + Reactive Button */}
                                            <div className="space-y-2 lg:space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[8px] lg:text-[9px] font-bold text-bodyColor/20 uppercase tracking-widest">You Get</span>
                                                    <div className="text-xs lg:text-sm font-black text-bodyColor flex items-center gap-0.5">
                                                        <span className="text-green-500 text-[10px] lg:text-xs">$</span>
                                                        <AnimatedNumber value={payout} />
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => router.push(`/sell-giftcards?brandName=${card.brand}&amount=${amount}`)}
                                                    className="w-full h-8 lg:h-10 bg-black dark:bg-white lg:bg-black/5 lg:dark:bg-white/5 lg:group-hover:bg-black lg:dark:group-hover:bg-white text-white dark:text-black lg:text-black/40 lg:dark:text-white/40 lg:group-hover:text-white lg:dark:group-hover:text-black font-bold text-[10px] lg:text-xs rounded-lg lg:rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-transparent lg:border-borderColorPrimary lg:group-hover:border-transparent shadow-md lg:shadow-none lg:group-hover:shadow-md"
                                                >
                                                    Sell Now
                                                    <ArrowRight className="w-3 h-3 lg:w-3.5 lg:h-3.5 transition-transform lg:group-hover:translate-x-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </TooltipProvider>
                            </motion.div>
                        );
                    })
                )}
            </AnimatePresence>
        </div>
    );
}
