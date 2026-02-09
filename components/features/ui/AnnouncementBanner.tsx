"use client";

import { useUIStore } from "@/hooks/useUIStore";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AnnouncementBanner() {
    const { announcement, isAnnouncementVisible, hideAnnouncement, dismissAnnouncement } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isAnnouncementVisible || !announcement) return null;

    const handleDismiss = () => {
        if (announcement.id) {
            dismissAnnouncement(announcement.id);
        } else {
            hideAnnouncement();
        }
    };

    const bgColor =
        announcement.type === "warning"
            ? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
            : announcement.type === "error"
                ? "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100"
                : announcement.type === "success"
                    ? "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
                    : "bg-blue-600 text-white"; // Default info style

    return (
        <div
            className={cn(
                "sticky top-0 z-50 w-full px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm font-medium transition-all duration-300 animate-in slide-in-from-top-2",
                bgColor
            )}
        >
            <div className="flex-1 mr-8">
                <p>{announcement.message}</p>
            </div>

            {announcement.actionLabel && announcement.actionUrl && (
                <Button
                    variant="secondary"
                    size="sm"
                    className="whitespace-nowrap h-8 px-3 text-xs bg-white/20 hover:bg-white/30 text-inherit border-none shadow-none"
                    onClick={() => window.open(announcement.actionUrl, "_blank")}
                >
                    {announcement.actionLabel}
                </Button>
            )}

            <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 sm:top-1/2 sm:-translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
