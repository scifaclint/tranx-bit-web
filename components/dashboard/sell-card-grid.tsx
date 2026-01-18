"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, DollarSign, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface GiftCardBrand {
    id: string;
    name: string;
    image: string;
    rate: number;
    popular?: boolean;
    color: string;
}

const BRANDS: GiftCardBrand[] = [
    { id: "amazon", name: "Amazon", image: "/brands/logo-amazon.svg", rate: 0.85, popular: true, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    { id: "apple", name: "Apple", image: "/brands/apple-11.svg", rate: 0.82, popular: true, color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400" },
    { id: "google", name: "Google Play", image: "/brands/google-play-4.svg", rate: 0.80, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { id: "steam", name: "Steam", image: "/brands/steam-1.svg", rate: 0.83, color: "bg-slate-700/10 text-slate-700 dark:text-slate-300" },
    { id: "ebay", name: "eBay", image: "/brands/ebay.svg", rate: 0.78, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    { id: "playstation", name: "PlayStation", image: "/brands/playstation-6.svg", rate: 0.81, color: "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400" },
    { id: "xbox", name: "Xbox", image: "/brands/xbox-3.svg", rate: 0.79, color: "bg-green-600/10 text-green-600 dark:text-green-400" },
    { id: "itunes", name: "iTunes", image: "/brands/itunes-1.svg", rate: 0.82, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
];

const PRESET_VALUES = [25, 50, 100, 500];

function GiftCardSkeleton() {
    return (
        <Card className="relative bg-background border border-borderColorPrimary rounded-[2rem] p-2.5 flex flex-col items-center overflow-hidden animate-pulse">
            {/* Hero Skeleton */}
            <div className="w-full h-28 bg-backgroundSecondary rounded-[1.5rem] mb-3" />

            <div className="w-full px-2 pb-1 space-y-4">
                {/* Presets Skeleton */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 h-7 bg-backgroundSecondary rounded-lg" />
                    ))}
                </div>

                {/* Payout & Button Skeleton */}
                <div className="space-y-3">
                    <div className="flex justify-between px-1">
                        <div className="h-2 w-10 bg-backgroundSecondary rounded" />
                        <div className="h-4 w-16 bg-backgroundSecondary rounded" />
                    </div>
                    <div className="w-full h-10 bg-backgroundSecondary rounded-xl" />
                </div>
            </div>
        </Card>
    );
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
    const [isLoading, setIsLoading] = useState(true);
    const [selectedValues, setSelectedValues] = useState<Record<string, number>>(() =>
        BRANDS.reduce((acc, brand) => ({ ...acc, [brand.id]: 100 }), {})
    );

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handlePresetClick = (id: string, preset: number) => {
        setSelectedValues((prev) => ({ ...prev, [id]: preset }));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
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
                    BRANDS.map((brand, index) => {
                        const amount = selectedValues[brand.id];
                        const payout = amount * brand.rate;

                        return (
                            <motion.div
                                key={brand.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04, duration: 0.3 }}
                            >
                                <TooltipProvider delayDuration={100}>
                                    <Card className="group relative bg-background border border-borderColorPrimary rounded-[2rem] p-2.5 transition-all duration-300 hover:shadow-2xl hover:border-black/10 dark:hover:border-white/10 hover:-translate-y-1.5 flex flex-col items-center overflow-hidden cursor-pointer">
                                        {/* Hero Visual Section - Stable Logo */}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full h-28 bg-backgroundSecondary rounded-[1.5rem] flex items-center justify-center p-6 relative overflow-hidden mb-3 transition-colors duration-300">
                                                    <div
                                                        className={`w-full h-full ${brand.color} transition-colors duration-300`}
                                                        style={{
                                                            maskImage: `url(${brand.image})`,
                                                            WebkitMaskImage: `url(${brand.image})`,
                                                            maskRepeat: 'no-repeat',
                                                            maskPosition: 'center',
                                                            maskSize: 'contain',
                                                            backgroundColor: 'currentColor'
                                                        }}
                                                    />
                                                    {brand.popular && (
                                                        <div className="absolute top-3 left-3">
                                                            <div className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full text-[8px] font-black tracking-tighter shadow-lg flex items-center gap-1">
                                                                <Sparkles className="h-2 w-2" />
                                                                HOT
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-lg px-3 py-1.5 border-none">
                                                {brand.name}
                                            </TooltipContent>
                                        </Tooltip>

                                        {/* Content Section */}
                                        <div className="w-full px-2 pb-1 text-center">
                                            {/* Slim Preset Selection */}
                                            <div className="flex gap-1 mb-4">
                                                {PRESET_VALUES.map((preset) => (
                                                    <button
                                                        key={preset}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePresetClick(brand.id, preset);
                                                        }}
                                                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all duration-200 border ${amount === preset
                                                            ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-sm scale-105"
                                                            : "bg-backgroundSecondary border-borderColorPrimary text-bodyColor/25 hover:text-bodyColor"
                                                            }`}
                                                    >
                                                        ${preset}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Action Area: Clear Value + Reactive Button */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[9px] font-bold text-bodyColor/20 uppercase tracking-widest">You Get</span>
                                                    <div className="text-sm font-black text-bodyColor flex items-center gap-0.5">
                                                        <span className="text-green-500 text-xs">$</span>
                                                        <AnimatedNumber value={payout} />
                                                    </div>
                                                </div>

                                                <Button
                                                    className="w-full h-10 bg-black/5 dark:bg-white/5 group-hover:bg-black dark:group-hover:bg-white text-black/40 dark:text-white/40 group-hover:text-white dark:group-hover:text-black font-bold text-xs rounded-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-borderColorPrimary group-hover:border-transparent shadow-none group-hover:shadow-md"
                                                >
                                                    Sell Now
                                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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
