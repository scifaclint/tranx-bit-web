"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/hooks/useLogout";

const NAV_ITEMS = [
  { name: "Sell Cards", href: "/sell-giftcards" },
  { name: "Buy Cards", href: "/buy-giftcards" },
];

export default function LandingHeader() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const { handleLogout, isLoggingOut } = useLogout();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoVariant = mounted && theme === "dark" ? "light" : "dark";

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "User";
  const userImage = user?.photo_url || "/profiles/avatarImage.jpg";
  const initials =
    (user?.first_name?.[0] || "U") + (user?.last_name?.[0] || "");

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    await handleLogout();
    setShowLogoutDialog(false);
    setIsSheetOpen(false);
  };

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
          {user ? (
            // Logged in - Show Profile Dropdown (Desktop)
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden sm:flex items-center space-x-2"
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {initials.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="flex items-center gap-2 p-2 pb-2">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback className="text-xs">
                        {initials.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {userName}
                      </span>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogoutClick}
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          ) : (
            // Not logged in - Show Login/Signup (Desktop)
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
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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

                {user && (
                  // Show user info at top when logged in
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={userImage} alt={userName} />
                      <AvatarFallback className="text-sm">
                        {initials.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold truncate max-w-[180px]">
                        {userName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user.email}
                      </span>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col space-y-5 mt-4">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSheetOpen(false)}
                      className="text-base font-medium hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col space-y-3 pb-8">
                  {user ? (
                    // Logged in - Show Dashboard & Logout
                    <>
                      <Button
                        asChild
                        className="w-full rounded-xl h-12"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Go to Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleLogoutClick}
                        className="w-full rounded-xl h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    // Not logged in - Show Login & Signup
                    <>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full rounded-xl h-12"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Link href="/auth?mode=login">Login</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full rounded-xl h-12"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Link href="/auth?mode=register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4 sm:gap-0">
            <Button
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogoutConfirm}
              disabled={isLoggingOut}
              className="bg-red-600 ml-2 hover:bg-red-700 min-w-[100px]"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.header>
  );
}
