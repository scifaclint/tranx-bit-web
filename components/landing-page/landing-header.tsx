"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import TranxBitLogo from "../design/tranx-bit-logo";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { name: "Sell Cards", href: "/sell-giftcards" },
  { name: "Buy Cards", href: "/buy-giftcards" },
];

export default function LandingHeader() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoVariant = mounted && theme === "dark" ? "light" : "dark";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex h-16 items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="transition-transform group-hover:scale-110 group-active:scale-95">
              <TranxBitLogo size="medium" variant={logoVariant} />
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="relative group"
            >
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {item.name}
              </Link>
              {/* Animated Underline */}
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </motion.div>
          ))}
        </nav>

        {/* CTA Buttons & Mobile Menu */}
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden sm:flex items-center space-x-2"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth?mode=login">Login</Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-5">
              <Link href="/auth?mode=register">Get Started</Link>
            </Button>
          </motion.div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[350px] flex flex-col pt-6"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Explore our services, log in, or sign up for an account.
                  </SheetDescription>
                </SheetHeader>

                <nav className="flex flex-col space-y-5 mt-8">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-base font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col space-y-4 pb-8">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full rounded-xl h-12"
                  >
                    <Link href="/auth?mode=login">Login</Link>
                  </Button>
                  <Button asChild className="w-full rounded-xl h-12">
                    <Link href="/auth?mode=register">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
