"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, NotificationResponse, UnreadCountResponse } from "@/lib/api/notifications";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useUser } from "@/components/providers/userProvider";

export const NOTIFICATION_KEYS = {
    all: ["notifications"] as const,
    infinite: (limit: number) => [...NOTIFICATION_KEYS.all, "infinite", { limit }] as const,
    unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

export function useNotifications(limit = 10) {
    const queryClient = useQueryClient();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { refreshUser } = useUser();

    // 1. Fetch infinite notifications
    // ... lines omitted ...
    const infiniteQuery = useInfiniteQuery({
        queryKey: NOTIFICATION_KEYS.infinite(limit),
        queryFn: ({ pageParam = 1 }) => notificationsApi.getNotifications(pageParam as number, limit),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.data.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        staleTime: 30000, // 30 seconds
        refetchInterval: 30000, // Background polling every 30s
    });

    // 2. Fetch unread count
    const unreadCountQuery = useQuery({
        queryKey: NOTIFICATION_KEYS.unreadCount(),
        queryFn: () => notificationsApi.getUnreadCount(),
        staleTime: 30000,
        refetchInterval: 30000, // Background polling every 30s
    });

    const unreadCount = unreadCountQuery.data?.data.unreadCount ?? 0;
    const prevUnreadCount = useRef(unreadCount);

    // Play sound when unread count increases + background refresh + persistent toast
    useEffect(() => {
        if (unreadCount > prevUnreadCount.current) {
            // 1. Play Sound
            if (!audioRef.current) {
                audioRef.current = new Audio("/sound/notification.mp3");
            }
            audioRef.current.play().catch(err => console.log("Audio play blocked by browser:", err));

            // 2. Background Refresh User Data (Silent/No Await)
            refreshUser();

            // 3. Show Toast Notification
            toast.info("New Notification Received", {
                description: "You have a new activity update.",
                duration: 5000, // Auto-dismiss after 5 seconds
            });
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount, refreshUser]);

    // 3. Mutation: Mark as Read
    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to mark as read");
        },
    });

    // 4. Mutation: Mark All as Read
    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            toast.success("All notifications marked as read");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to mark all as read");
        },
    });

    // 5. Mutation: Delete Single
    const deleteMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete notification");
        },
    });

    // 6. Mutation: Clear All
    const clearAllMutation = useMutation({
        mutationFn: () => notificationsApi.clearAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            toast.success("Clear all notifications successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to clear notifications");
        },
    });

    // Flatten notifications from all pages
    const notifications = infiniteQuery.data?.pages.flatMap((page) => page.data.notifications) ?? [];

    return {
        // Data
        notifications,
        unreadCount,

        // Infinite Scroll Status
        fetchNextPage: infiniteQuery.fetchNextPage,
        hasNextPage: !!infiniteQuery.hasNextPage,
        isFetchingNextPage: infiniteQuery.isFetchingNextPage,
        isLoading: infiniteQuery.isLoading || unreadCountQuery.isLoading,
        isFetching: infiniteQuery.isFetching,
        isError: infiniteQuery.isError,

        // Actions
        markAsRead: markAsReadMutation.mutate,
        markAllAsRead: markAllAsReadMutation.mutate,
        deleteNotification: deleteMutation.mutate,
        clearAll: clearAllMutation.mutate,

        // Mutation States
        isMarkingRead: markAsReadMutation.isPending,
        isMarkingAllRead: markAllAsReadMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isClearingAll: clearAllMutation.isPending,
    };
}
