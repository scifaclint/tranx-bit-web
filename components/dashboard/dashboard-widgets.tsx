"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Wallet, ListChecks, ArrowRight, Plus } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

export default function DashboardWidgets() {
    const router = useRouter();
    const { user } = useAuthStore();

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
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
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
                                                        onClick={() => {
                                                            toast.info("Add credits feature coming soon");
                                                        }}
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
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Available Credits
                                </p>
                            </div>
                            <div className="bg-black dark:bg-white/10 p-4 rounded-full">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col pt-0">
                        <Separator className="bg-borderColorPrimary mb-4" />
                        <Button
                            onClick={() => {
                                if (balanceValue > 0) {
                                    router.push("/withdraw");
                                } else {
                                    toast.info("This feature will be available soon", {
                                        position: "top-center",
                                    });
                                }
                            }}
                            className="w-full justify-center border-borderColorPrimary dark:border-white/20 text-bodyColor hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            variant="outline"
                            aria-label="Withdraw funds"
                        >
                            Withdraw funds
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
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
                                router.push("/transactions?filter=pending");
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
        </div>
    );
}
