"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, NotificationResponse, UnreadCountResponse } from "@/lib/api/notifications";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useUser } from "@/components/providers/userProvider";

export const NOTIFICATION_KEYS = {
    all: ["notifications"] as const,
    infinite: (limit: number, filter?: Record<string, any>) =>
        [...NOTIFICATION_KEYS.all, "infinite", { limit, ...filter }] as const,
    unreadCount: (filter?: Record<string, any>) =>
        [...NOTIFICATION_KEYS.all, "unread-count", filter] as const,
};

export function useNotifications(limit = 10, filter?: { type?: string; excludeType?: string }) {
    const queryClient = useQueryClient();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { refreshUser } = useUser();

    // 1. Fetch infinite notifications
    const infiniteQuery = useInfiniteQuery({
        queryKey: NOTIFICATION_KEYS.infinite(limit, filter),
        queryFn: ({ pageParam = 1 }) =>
            notificationsApi.getNotifications(pageParam as number, limit, filter),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { currentPage, totalPages } = lastPage.data.pagination;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        staleTime: Infinity,
    });

    // 2. Fetch unread count
    const unreadCountQuery = useQuery({
        queryKey: NOTIFICATION_KEYS.unreadCount(filter),
        queryFn: () => notificationsApi.getUnreadCount(filter),
        staleTime: Infinity,
    });

    const unreadCount = unreadCountQuery.data?.data.unreadCount ?? 0;

    // Mutation: Mark as Read
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
        mutationFn: () => notificationsApi.markAllAsRead(filter),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            toast.success("Notifications marked as read");
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
        mutationFn: () => notificationsApi.clearAll(filter),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
            toast.success("Clear notifications successfully");
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
