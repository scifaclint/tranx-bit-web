import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification as APINotification, NotificationType } from "@/lib/api/notifications";

export type { APINotification, NotificationType };

interface Announcement {
    message: string;
    type?: string;
    actionLabel?: string;
    actionUrl?: string;
    id?: string; // Unique ID to track local dismissal
}

interface UIState {
    // Announcement Banner State
    announcement: Announcement | null;
    isAnnouncementVisible: boolean;
    dismissedAnnouncementIds: string[];

    // UI Visibility States
    isNotificationCenterOpen: boolean;
    isChatOpen: boolean;
    activeOrderId: string | null;
    activeOrderMetadata: {
        userName?: string;
        orderNumber?: string;
    } | null;
    chatView: "inbox" | "room";
    notificationTab: "alerts" | "messages";

    // Announcement Actions
    showAnnouncement: (announcement: Announcement) => void;
    hideAnnouncement: () => void;
    dismissAnnouncement: (id: string) => void;
    clearDismissedAnnouncements: () => void;

    // UI Actions
    setNotificationCenterOpen: (open: boolean) => void;
    setChatOpen: (open: boolean) => void;
    setChatView: (view: "inbox" | "room") => void;
    setNotificationTab: (tab: "alerts" | "messages") => void;
    openChat: (orderId?: string, metadata?: { userName?: string; orderNumber?: string }) => void;
    reset: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            announcement: null,
            isAnnouncementVisible: false,
            dismissedAnnouncementIds: [],
            isNotificationCenterOpen: false,
            isChatOpen: false,
            activeOrderId: null,
            activeOrderMetadata: null,
            chatView: "inbox",
            notificationTab: "alerts",

            // Announcement Logic
            showAnnouncement: (announcement: Announcement) => {
                const { dismissedAnnouncementIds } = get();
                if (announcement.id && dismissedAnnouncementIds.includes(announcement.id)) {
                    return;
                }
                set({ announcement, isAnnouncementVisible: true });
            },

            hideAnnouncement: () => set({ isAnnouncementVisible: false }),

            dismissAnnouncement: (id: string) => {
                set((state: UIState) => ({
                    isAnnouncementVisible: false,
                    dismissedAnnouncementIds: [...state.dismissedAnnouncementIds, id],
                }));
            },

            clearDismissedAnnouncements: () => {
                set({ dismissedAnnouncementIds: [] });
            },

            // UI Actions
            setNotificationCenterOpen: (open) => set({ isNotificationCenterOpen: open }),
            setChatOpen: (open) => set({ isChatOpen: open }),
            setChatView: (view) => set({ chatView: view }),
            setNotificationTab: (tab) => set({ notificationTab: tab }),

            openChat: (orderId, metadata) => {
                set({
                    isChatOpen: true,
                    activeOrderId: orderId, // No longer falling back to null, orderId can be null
                    activeOrderMetadata: metadata || null,
                    chatView: orderId ? "room" : "inbox"
                });
            },

            reset: () => set({
                announcement: null,
                isAnnouncementVisible: false,
                dismissedAnnouncementIds: [],
                isNotificationCenterOpen: false,
                isChatOpen: false,
                activeOrderId: null,
                activeOrderMetadata: null,
                chatView: "inbox",
                notificationTab: "alerts",
            }),
        }),
        {
            name: "ui-store",
            partialize: (state: UIState) => ({
                dismissedAnnouncementIds: state.dismissedAnnouncementIds,
            }),
        }
    )
);
