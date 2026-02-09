import axiosInstance from "./axios";

export type NotificationType = "info" | "warning" | "success" | "error" | "card_status_update";

export interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: {
        orderId?: string;
        orderNumber?: string;
        cardStatus?: string;
        [key: string]: any;
    };
    isRead: boolean;
    link?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    status: boolean;
    message: string;
    data: {
        notifications: Notification[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalNotifications: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

export interface UnreadCountResponse {
    status: boolean;
    message: string;
    data: {
        unreadCount: number;
    };
}

export const notificationsApi = {
    /**
     * Fetch paginated notifications
     */
    getNotifications: async (page = 1, limit = 10): Promise<NotificationResponse> => {
        const response = await axiosInstance.get(`/notifications`, {
            params: { page, limit },
        });
        return response.data;
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        const response = await axiosInstance.get(`/notifications/unread-count`);
        return response.data;
    },

    /**
     * Mark a single notification as read
     */
    markAsRead: async (id: string): Promise<{ status: boolean; message: string }> => {
        const response = await axiosInstance.patch(`/notifications/${id}/read`);
        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (): Promise<{ status: boolean; message: string }> => {
        const response = await axiosInstance.patch(`/notifications/read-all`);
        return response.data;
    },

    /**
     * Delete a single notification
     */
    deleteNotification: async (id: string): Promise<{ status: boolean; message: string }> => {
        const response = await axiosInstance.delete(`/notifications/${id}`);
        return response.data;
    },

    /**
     * Clear all notifications
     */
    clearAll: async (): Promise<{ status: boolean; message: string }> => {
        const response = await axiosInstance.delete(`/notifications/`);
        return response.data;
    },
};
