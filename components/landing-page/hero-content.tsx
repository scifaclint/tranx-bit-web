"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";

export function HeroContent() {
  const { user } = useAuthStore();

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full pt-16 px-4 text-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl"
      >
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/80">
            Buy & Sell Giftcards
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-foreground/80 to-foreground/60">
            Instantly
          </span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Trade your favorite brand giftcards securely and get the best rates in
          the market
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pointer-events-auto"
        >
          <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
            <Link href={user ? "/dashboard" : "/auth?mode=register"}>
              {user ? "Start Trading" : "Get Started Now"}
            </Link>
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-16 md:mt-20"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
            <span className="text-xs uppercase tracking-wider">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
