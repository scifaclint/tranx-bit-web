"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BellOff,
    Loader2,
    Trash2,
    CheckCheck,
    Info,
    MessageSquare,
    AlertCircle,
    ShoppingBag,
    CreditCard,
    ArrowUpCircle,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useUIStore } from "@/hooks/useUIStore";
import { Notification as APINotification } from "@/lib/api/notifications";

const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "order_status":
            return <ShoppingBag className="w-5 h-5 text-primary" />;
        case "payment":
            return <CreditCard className="w-5 h-5 text-green-500" />;
        case "deposit":
            return <ArrowUpCircle className="w-5 h-5 text-blue-500" />;
        case "alert":
            return <AlertCircle className="w-5 h-5 text-amber-500" />;
        case "order_chat":
            return <MessageSquare className="w-5 h-5 text-rose-500" />;
        default:
            return <Info className="w-5 h-5 text-blue-500" />;
    }
};

interface NotificationItemProps {
    notification: APINotification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkRead, onDelete }: NotificationItemProps) => {
    const x = useMotionValue(0);
    const [isSwiped, setIsSwiped] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const router = useRouter();

    const handleLinkClick = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        // Special handling for chat notifications to open the internal chat sheet
        if (notification.type === "order_chat" && (notification.metadata?.orderId || notification.metadata?.orderNumber)) {
            useUIStore.getState().openChat(
                (notification.metadata.orderId || notification.metadata.orderNumber) as string,
                { orderNumber: notification.metadata.orderNumber }
            );
            return;
        }

        if (notification.link) {
            router.push(notification.link);
            useUIStore.getState().setNotificationCenterOpen(false);
        }
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();

        // For chat notifications, row click should open the chat directly instead of expanding
        if (notification.type === "order_chat") {
            handleLinkClick();
            if (!notification.isRead) {
                onMarkRead(notification._id);
            }
            return;
        }

        setIsExpanded(!isExpanded);
        if (!notification.isRead) {
            onMarkRead(notification._id);
        }
    };

    const handleConfirmDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(notification._id);
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
        setIsSwiped(false);
        x.set(0);
    };

    return (
        <div className="relative overflow-hidden group">
            <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 dark:bg-red-950/20 p-4 border-l-4 border-red-500"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    Delete this notification?
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelDelete}
                                    className="h-8 px-3 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleConfirmDelete}
                                    className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Background Actions (Visible when swiped) */}
                        <div className="absolute inset-0 flex justify-end">
                            <div className="flex h-full">
                                <button
                                    onClick={() => onMarkRead(notification._id)}
                                    className="bg-primary px-4 flex items-center justify-center text-white transition-opacity"
                                    style={{ opacity: isSwiped ? 1 : 0 }}
                                >
                                    <CheckCheck className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-500 px-4 flex items-center justify-center text-white transition-opacity"
                                    style={{ opacity: isSwiped ? 1 : 0 }}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Foreground Content */}
                        <motion.div
                            key="content"
                            drag="x"
                            dragConstraints={{ left: -140, right: 0 }}
                            dragElastic={0.1}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -40) {
                                    setIsSwiped(true);
                                } else {
                                    setIsSwiped(false);
                                }
                            }}
                            style={{ x }}
                            className={cn(
                                "relative bg-background p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                                !notification.isRead && "bg-primary/5 dark:bg-primary/10",
                                isExpanded && "bg-muted/30"
                            )}
                            onClick={handleToggleExpand}
                        >
                            {!notification.isRead && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                            )}
                            <div className="flex gap-3">
                                <div className="mt-0.5 flex-shrink-0">
                                    <NotificationIcon type={notification.type} />
                                </div>
                                <div className="flex-1 space-y-1 pr-6">
                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className={cn(
                                                "text-sm font-semibold text-foreground",
                                                !notification.isRead && "text-primary"
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p
                                        className={cn(
                                            "text-xs text-muted-foreground leading-relaxed transition-all",
                                            !isExpanded && "line-clamp-2"
                                        )}
                                    >
                                        {notification.message}
                                    </p>

                                    {notification.link && !notification.type.includes("chat") && (
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-xs text-primary font-bold mt-1"
                                            onClick={handleLinkClick}
                                        >
                                            View Details
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function NotificationCenter() {
    const pathname = usePathname();
    const isAdminMode = pathname.startsWith("/internal-portal-Trx13");

    const { notificationTab, setNotificationTab } = useUIStore();
    const activeTab = notificationTab;

    // We fetch both sources to get unread counts for the tabs
    const alertsSource = useNotifications(10, { excludeType: "order_chat" });
    const messagesSource = useNotifications(10, { type: "order_chat" });

    // Determine which data to actually display based on the active tab
    const current = activeTab === "alerts" ? alertsSource : messagesSource;
    const {
        notifications: rawNotifications,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = current;

    // Sync tab with admin mode if necessary
    useEffect(() => {
        if (isAdminMode && activeTab !== "messages") {
            setNotificationTab("messages");
        }
    }, [isAdminMode, activeTab, setNotificationTab]);

    // Grouping logic for the "Messages" tab
    const displayNotifications = useMemo(() => {
        if (activeTab !== "messages") return rawNotifications;

        const groups: Record<string, APINotification> = {};
        const result: APINotification[] = [];

        rawNotifications.forEach((n) => {
            const orderId = n.metadata?.orderId || n.metadata?.orderNumber;

            // If it's not a chat notification or has no order context, keep it discrete
            if (n.type !== "order_chat" || !orderId) {
                result.push(n);
                return;
            }

            if (!groups[orderId]) {
                // Initialize group with a shallow copy to avoid mutating the original
                groups[orderId] = { ...n };
                result.push(groups[orderId]);
            } else {
                // Aggregate: newest item is already in groups[orderId] due to chronological sort
                if (!n.isRead) groups[orderId].isRead = false;
            }
        });

        return result;
    }, [rawNotifications, activeTab]);

    const notifications = displayNotifications;

    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-border/40 bg-background/95 backdrop-blur-xl">
            <SheetHeader className="p-6 pb-0 border-b border-border/40">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                            {isAdminMode ? "Message Inbox" : "Notifications"}
                        </SheetTitle>
                        <SheetDescription className="mt-1 text-xs">
                            {isAdminMode
                                ? "Manage your order conversations"
                                : "Stay updated with your latest activities"
                            }
                        </SheetDescription>
                    </div>
                </div>

                <Tabs defaultValue={isAdminMode ? "messages" : "alerts"} value={activeTab} className="w-full" onValueChange={(v) => setNotificationTab(v as "alerts" | "messages")}>
                    <TabsList className={cn(
                        "w-full grid h-12 p-1 bg-muted/50 rounded-xl mb-4",
                        isAdminMode ? "grid-cols-1" : "grid-cols-2"
                    )}>
                        {!isAdminMode && (
                            <TabsTrigger
                                value="alerts"
                                className="rounded-lg text-xs font-bold uppercase tracking-wider relative"
                            >
                                Alerts
                                {alertsSource.unreadCount > 0 && (
                                    <span className="ml-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                        {alertsSource.unreadCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                        <TabsTrigger
                            value="messages"
                            className="rounded-lg text-xs font-bold uppercase tracking-wider relative"
                        >
                            {isAdminMode ? "Order Chats" : "Messages"}
                            {messagesSource.unreadCount > 0 && (
                                <span className="ml-2 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {messagesSource.unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </SheetHeader>

            <ScrollArea className="flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <BellOff className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div>
                            <p className="text-foreground font-medium">No notifications yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You're all caught up!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        <AnimatePresence initial={false}>
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification._id}
                                    notification={notification}
                                    onMarkRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </AnimatePresence>

                        {/* Infinite Scroll Sentinel */}
                        <div ref={loadMoreRef} className="p-4 flex justify-center">
                            {isFetchingNextPage ? (
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            ) : hasNextPage ? (
                                <div className="h-6" /> // Placeholder to trigger intersection
                            ) : (
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium opacity-50">
                                    That's all for now
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>

            {notifications.length > 0 && activeTab !== "messages" && (
                <div className="p-4 bg-muted/30 border-t border-border/40 mt-auto">
                    <AnimatePresence mode="wait">
                        {showClearConfirm ? (
                            <motion.div
                                key="confirm-clear"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="space-y-3"
                            >
                                <p className="text-xs text-center text-muted-foreground font-medium">
                                    Are you sure you want to clear all notifications?
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-9 rounded-xl text-xs"
                                        onClick={() => setShowClearConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 h-9 rounded-xl text-xs bg-red-500 hover:bg-red-600"
                                        onClick={() => {
                                            clearAll();
                                            setShowClearConfirm(false);
                                        }}
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-2"
                            >
                                <Button
                                    variant="outline"
                                    className="flex-1 text-[10px] uppercase tracking-wider font-bold h-9 rounded-xl border-border/40"
                                    onClick={() => markAllAsRead()}
                                >
                                    Mark all as Read
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 text-[10px] uppercase tracking-wider font-bold h-9 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/5"
                                    onClick={() => setShowClearConfirm(true)}
                                >
                                    <Trash2 className="w-3 h-3 mr-1.5" />
                                    Clear All
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </SheetContent>
    );
}
