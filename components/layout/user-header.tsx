"use client";

import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "../profileDropdown";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";

import { getWelcomeMessage } from "@/lib/constants";

interface UserHeaderProps {
    onOpenMobileMenu: () => void;
}

export default function UserHeader({ onOpenMobileMenu }: UserHeaderProps) {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [greetingInfo, setGreetingInfo] = useState({ greeting: "Welcome", message: "" });

    const isAdminRoute = pathname.startsWith("/internal-portal-Trx13");

    React.useEffect(() => {
        if (user) {
            setGreetingInfo(getWelcomeMessage(user.first_name || "User", isAdminRoute));
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
                        <p className="text-lg font-semibold leading-tight">
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
                <ThemeToggle />
                {user?.role === "admin" && !isAdminRoute && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl hidden sm:flex"
                                    onClick={() => {
                                        window.open("/internal-portal-Trx13/cards", "_blank");
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

                <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                    <PopoverTrigger asChild>
                        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                            <Bell size={20} className="text-foreground" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Notifications</h3>
                                <span className="text-xs text-muted-foreground">0 new</span>
                            </div>
                            <div className="text-center py-6">
                                <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">
                                    No notifications yet
                                </p>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <ProfileDropdown />
            </div>
        </div>
    );
}
