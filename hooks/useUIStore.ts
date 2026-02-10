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

    // Announcement Actions
    showAnnouncement: (announcement: Announcement) => void;
    hideAnnouncement: () => void;
    dismissAnnouncement: (id: string) => void;
    clearDismissedAnnouncements: () => void;

    // UI Actions
    setNotificationCenterOpen: (open: boolean) => void;
    reset: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            announcement: null,
            isAnnouncementVisible: false,
            dismissedAnnouncementIds: [],
            isNotificationCenterOpen: false,

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

            reset: () => set({
                announcement: null,
                isAnnouncementVisible: false,
                dismissedAnnouncementIds: [],
                isNotificationCenterOpen: false,
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
