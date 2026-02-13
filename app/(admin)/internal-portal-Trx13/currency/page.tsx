"use client";

import React, { useState } from "react";
import { useCurrencies } from "@/hooks/useCards";
import {
    RefreshCw,
    TrendingUp,
    Globe,
    Clock,
    AlertCircle,
    ArrowRightLeft,
    ChevronRight,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import "flag-icons/css/flag-icons.min.css";

const CurrencyFlag = ({ code, className }: { code: string; className?: string }) => {
    // Basic mapping for common currencies to country codes for flag-icons
    const currencyToCountry: Record<string, string> = {
        USD: "us",
        GHS: "gh",
        NGN: "ng",
        ZAR: "za",
        KES: "ke",
        GBP: "gb",
        EUR: "eu",
        CAD: "ca",
        AUD: "au",
        JPY: "jp",
        CNY: "cn"
    };

    const countryCode = currencyToCountry[code.toUpperCase()] || code.slice(0, 2).toLowerCase();

    return (
        <span className={`fi fi-${countryCode} rounded-sm shadow-sm ${className}`} />
    );
};

export default function CurrencyPage() {
    const { data: currenciesResponse, isLoading, isError, refetch, isFetching } = useCurrencies();
    const [searchQuery, setSearchQuery] = useState("");

    const currencies = currenciesResponse?.data || [];

    const handleRefresh = async () => {
        try {
            await refetch();
            // toast.success("Rates updated successfully");
        } catch (error) {
            // toast.error("Failed to refresh rates");
            return
        }
    };

    const filteredCurrencies = currencies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const baseCurrency = currencies.find(c => c.id === "USD") || currencies[0];

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Currency Management</h1>
                    <p className="text-muted-foreground text-sm font-bold opacity-60 uppercase tracking-widest">
                        Monitor Live Exchange Rates & Payout Status
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        disabled={isFetching}
                        className="font-black uppercase tracking-tighter"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        {isFetching ? 'Syncing...' : 'Sync Rates'}
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">Active Currencies</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{currencies.filter(c => c.isActive).length}</div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Available for Payouts</p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">Last Update</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">
                            {baseCurrency?.ratesUpdatedAt ? format(new Date(baseCurrency.ratesUpdatedAt), "HH:mm") : "--:--"}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                            {baseCurrency?.ratesUpdatedAt ? format(new Date(baseCurrency.ratesUpdatedAt), "MMM do, yyyy") : "No date"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-50">Base Currency</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black flex items-center gap-2">
                            {baseCurrency && <CurrencyFlag code={baseCurrency.id} className="text-lg" />}
                            {baseCurrency?.id || 'USD'}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Used for all calculations</p>
                    </CardContent>
                </Card>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Cards Grid */}
                <section className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest">Supported Assets</h2>
                        <div className="relative w-48">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="pl-8 h-8 text-xs border-borderColorPrimary rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="h-[500px] pr-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-backgroundSecondary animate-pulse rounded-2xl border border-borderColorPrimary" />
                                ))
                            ) : filteredCurrencies.map((currency) => (
                                <Card key={currency.id} className="group relative bg-background border-borderColorPrimary shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-backgroundSecondary rounded-xl flex items-center justify-center border border-borderColorPrimary">
                                                    <CurrencyFlag code={currency.id} className="text-2xl" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm uppercase tracking-tight">{currency.name}</h3>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                                        {currency.id} • {currency.symbol}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={currency.isActive ? "default" : "secondary"} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                {currency.isActive ? "Active" : "Disabled"}
                                            </Badge>
                                        </div>

                                        <div className="mt-6 flex items-end justify-between">
                                            <div>
                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block mb-0.5">EXCHANGE Rate</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black">1.00</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">USD</span>
                                                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground mx-1" />
                                                    <span className="text-xl font-black">
                                                        {baseCurrency?.rates[currency.id]?.toFixed(2) || '0.00'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">{currency.id}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </section>

                {/* Right: Detailed Rates Table */}
                <section className="lg:col-span-4 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest">Rate Matrix</h2>
                    <Card className="bg-background border-borderColorPrimary shadow-none rounded-2xl overflow-hidden">
                        <ScrollArea className="h-[535px]">
                            <Table>
                                <TableHeader className="bg-backgroundSecondary">
                                    <TableRow className="hover:bg-transparent border-borderColorPrimary">
                                        <TableHead className="text-[10px] font-black uppercase p-4">Currency</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase p-4 text-right">Per USD</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {baseCurrency && Object.entries(baseCurrency.rates).map(([code, rate]) => (
                                        <TableRow key={code} className="border-borderColorPrimary group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                            <TableCell className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <CurrencyFlag code={code} className="text-xs" />
                                                    <span className="text-xs font-black uppercase">{code}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4 text-right">
                                                <span className="text-sm font-black tabular-nums">{rate.toFixed(4)}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </Card>
                </section>
            </main>

            {isError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-bold uppercase tracking-tight">Failed to fetch live rates. Please try again later.</p>
                </div>
            )}
        </div>
    );
}
