"use client";
import { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  Wallet,
  DollarSign,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Card } from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SellGiftCardGrid } from "@/components/dashboard/sell-card-grid";
import DashboardWidgets from "@/components/dashboard/dashboard-widgets";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("sell");
  const router = useRouter();

  const handleTabChange = (value: string) => {
    if (value === "buy") {
      toast.info("Coming Soon!", {
        description: "The Buy feature is being finalized and will be available very soon!",
        position: "bottom-right",
      });
      return;
    }
    setActiveTab(value);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <DashboardWidgets />
      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card
          onClick={() => {
            toast.info("Coming Soon!", {
              description: "The Buy Gift Card feature is under development and will be available soon.",
              position: "bottom-right",
            });
          }}
          className="bg-background rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-cyan-500 dark:bg-cyan-600 rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Buy Gift Card
            </p>
          </div>
        </Card>

        <Card
          onClick={() => {
            router.push("/sell-giftcards");
          }}
          className="bg-background rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
              <CreditCard size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Sell Gift Card
            </p>
          </div>
        </Card>

        <Card
          onClick={() => {
            toast.info("Coming Soon!", {
              description: "Virtual Dollar Cards feature is coming soon.",
              position: "bottom-right",
            });
          }}
          className="bg-background rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              Virtual Dollar Cards
            </p>
          </div>
        </Card>

        <Card
          onClick={() => {
            toast.info("Coming Soon!", {
              description: "P2P   feature is coming soon.",
              position: "bottom-right",
            });
          }}
          className="bg-background rounded-2xl p-5 border-0 hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-white" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              P2P
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs and Search Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList className="bg-backgroundSecondary dark:bg-backgroundSecondary border border-borderColorPrimary p-1 rounded-xl h-auto">
            <TabsTrigger
              value="sell"
              className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-bodyColor shadow-sm transition-all font-medium"
            >
              Sell
            </TabsTrigger>
            <TabsTrigger
              value="buy"
              className="px-8 py-2.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-bodyColor shadow-sm transition-all font-medium"
            >
              Buy
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-1.5 self-end sm:self-center">
          <span className="text-[10px] font-bold text-bodyColor/20 uppercase tracking-widest px-1">Currency</span>
          <Select defaultValue="usd">
            <SelectTrigger className="w-[110px] h-10 bg-backgroundSecondary border-borderColorPrimary dark:border-white/20 rounded-xl focus:ring-0 focus:ring-offset-0 font-bold text-xs ring-offset-transparent shadow-none">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent className="bg-background border-borderColorPrimary rounded-xl overflow-hidden shadow-xl border-none">
              <SelectItem value="usd" className="focus:bg-backgroundSecondary cursor-pointer font-bold text-xs py-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇺🇸</span> USD
                </div>
              </SelectItem>
              <SelectItem value="ghs" className="focus:bg-backgroundSecondary cursor-pointer font-bold text-xs py-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇬🇭</span> CEDIS
                </div>
              </SelectItem>
              <SelectItem value="ngn" className="focus:bg-backgroundSecondary cursor-pointer font-bold text-xs py-2.5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🇳🇬</span> NAIRA
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "sell" && (
          <motion.div
            key="sell-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <SellGiftCardGrid />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
