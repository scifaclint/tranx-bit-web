"use client";

import React, { useState } from "react";
import { Menu, Bell, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "../profileDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";
import NotificationCenter from "../features/notifications/NotificationCenter";
import { useUIStore } from "@/hooks/useUIStore";
import { useNotifications } from "@/hooks/useNotifications";

import { getWelcomeMessage } from "@/lib/constants";
import { FeedbackModal } from "../modals/feedbackModal";

interface UserHeaderProps {
  onOpenMobileMenu: () => void;
}

export default function UserHeader({ onOpenMobileMenu }: UserHeaderProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { isNotificationCenterOpen, setNotificationCenterOpen } = useUIStore();
  const pathname = usePathname();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [greetingInfo, setGreetingInfo] = useState({
    greeting: "Welcome",
    message: "",
  });

  const isAdminRoute = pathname.startsWith("/internal-portal-Trx13");

  React.useEffect(() => {
    if (user) {
      setGreetingInfo(
        getWelcomeMessage(user.first_name || "User", isAdminRoute),
      );
    }
  }, [user, isAdminRoute]);

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-8 w-full sticky top-0 bg-background/95 backdrop-blur z-20 px-4 py-4 border-b border-border/40">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button - VISIBLE ON MOBILE ONLY */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="lg:hidden mr-1"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3 group">
          <div>
            <p className="text-muted-foreground text-sm">
              {greetingInfo.greeting},
            </p>
            <p className="text-lg font-semibold leading-tight truncate">
              {user?.first_name || "User"} {user?.last_name || ""}
            </p>
            {/* Desktop Only Message */}
            <p className="text-xs text-muted-foreground hidden lg:block mt-0.5">
              {greetingInfo.message}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* <ThemeToggle /> */}
        {user?.role === "admin" && !isAdminRoute && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl hidden sm:flex"
                  onClick={() => {
                    window.open("/internal-portal-Trx13/dashboard", "_blank");
                  }}
                >
                  Admin Portal
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to Admin Panel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
                onClick={() => setFeedbackOpen(true)}
              >
                <MessageSquare size={20} className="text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Give Feedback</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Sheet
          open={isNotificationCenterOpen}
          onOpenChange={setNotificationCenterOpen}
        >
          <SheetTrigger asChild>
            <button
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setNotificationCenterOpen(true)}
            >
              <Bell size={20} className="text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          </SheetTrigger>
          <NotificationCenter />
        </Sheet>
        <ProfileDropdown />
      </div>
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
