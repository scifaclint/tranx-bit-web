"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProfileDropdown from "../profileDropdown";

export default function DashBoardHeader() {
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
        {/* Header with User Profile and Notification */}
        <div className="flex items-center justify-between">
          <div
            // onClick={() => router.push("/profile")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <div>
              <p className="text-muted-foreground">Welcome,</p>
              <p className="text-xl font-semibold">John Doe</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <button className="relative p-3 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm">
                  <Bell
                    size={20}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      0 new
                    </span>
                  </div>
                  <div className="text-center py-6">
                    <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No notifications yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      We&apos;ll notify you when something important happens
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
