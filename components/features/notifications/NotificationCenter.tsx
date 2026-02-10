"use client";

import { useUIStore } from "@/hooks/useUIStore";
import { useNotifications } from "@/hooks/useNotifications";
import { APINotification } from "@/hooks/useUIStore";
import {
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    BellOff,
    CheckCheck,
    Trash2,
    Info,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    X,
    Loader2,
    ChevronDown,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
        case "success":
        case "card_status_update":
            return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case "warning":
            return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case "error":
            return <AlertCircle className="w-5 h-5 text-red-500" />;
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

    const handleToggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
        if (!notification.isRead) {
            onMarkRead(notification._id);
        }
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (notification.link) {
            router.push(notification.link);
            useUIStore.getState().setNotificationCenterOpen(false);
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
                                                "text-sm font-semibold leading-none",
                                                !notification.isRead
                                                    ? "text-foreground"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {notification.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })
                                                    .replace("about ", "")
                                                    .replace("less than ", "")}
                                            </span>
                                            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                                        </div>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {!isExpanded ? (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
                                            >
                                                {notification.message}
                                            </motion.p>
                                        ) : (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden space-y-3 pt-1"
                                            >
                                                <p className="text-xs text-foreground leading-relaxed">
                                                    {notification.message}
                                                </p>

                                                {notification.link && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 text-primary flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider"
                                                        onClick={handleLinkClick}
                                                    >
                                                        View Details
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Desktop-only delete button (revealed on hover) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteConfirm(true);
                                }}
                                className="absolute right-2 top-4 p-2 rounded-full opacity-0 lg:group-hover:opacity-100 hover:bg-muted transition-all"
                            >
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function NotificationCenter() {
    const {
        notifications,
        unreadCount,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    } = useNotifications();

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
            <SheetHeader className="p-6 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div>
                        <SheetTitle className="text-xl font-bold flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </SheetTitle>
                        <SheetDescription className="mt-1 text-xs">
                            Stay updated with your latest activities
                        </SheetDescription>
                    </div>
                    <div className="flex gap-1">
                        {notifications.length > 0 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-muted"
                                    onClick={() => markAllAsRead()}
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
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

            {notifications.length > 0 && (
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
