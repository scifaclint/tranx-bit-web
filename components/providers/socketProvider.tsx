"use client";

import React, { createContext, useContext, useEffect } from "react";
import { socket, initSocketAuth } from "@/lib/socket";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { NOTIFICATION_KEYS } from "@/hooks/useNotifications";
import { queryKeys } from "@/lib/query/queryKeys";
import { useUser } from "./userProvider";
import { useRef } from "react";
import { useUIStore } from "@/hooks/useUIStore";

interface SocketContextType {
    isConnected: boolean;
    emitTyping: (orderId: string, isTyping: boolean) => void;
    joinOrderChat: (orderId: string) => void;
    leaveOrderChat: (orderId: string) => void;
    typingUsers: Record<string, { userId: string; isTyping: boolean; senderType: string }>;
}

const SocketContext = createContext<SocketContextType>({
    isConnected: false,
    emitTyping: () => { },
    joinOrderChat: () => { },
    leaveOrderChat: () => { },
    typingUsers: {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, token } = useAuthStore();
    const [isConnected, setIsConnected] = React.useState(socket.connected);
    const [typingUsers, setTypingUsers] = React.useState<Record<string, { userId: string; isTyping: boolean; senderType: string }>>({});
    const queryClient = useQueryClient();
    const { refreshUser } = useUser();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const emitTyping = React.useCallback((orderId: string, isTyping: boolean) => {
        socket.emit("typing", { orderId, isTyping });
    }, []);

    const joinOrderChat = React.useCallback((orderId: string) => {
        socket.emit("join_order", orderId);
    }, []);

    const leaveOrderChat = React.useCallback((orderId: string) => {
        socket.emit("leave_order", orderId);
        // Clear typing status for this order when leaving
        setTypingUsers(prev => {
            const next = { ...prev };
            delete next[orderId];
            return next;
        });
    }, []);

    useEffect(() => {
        // If not authenticated, ensure we are disconnected
        if (!isAuthenticated || !token) {
            if (socket.connected) {
                socket.disconnect();
            }
            return;
        }

        // Initialize auth mapping and connect
        initSocketAuth();
        socket.connect();

        function onConnect() {
            setIsConnected(true);
            console.log("WebSocket Connected");
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log("WebSocket Disconnected");
        }

        function onConnectError(err: any) {
            console.error("WebSocket Connection Error:", err.message);
        }

        function onNewNotification(payload: any) {
            console.log("New notification received:", payload);
            const { notification, counts } = payload;

            if (!notification) return;

            // 1. Play Sound
            if (!audioRef.current) {
                audioRef.current = new Audio("/sound/notification.mp3");
            }
            audioRef.current.play().catch(err => console.log("Audio play blocked by browser"));

            // 2. Show Toast
            toast.info(notification.title, {
                description: notification.message,
                duration: 5000,
            });

            // 3. Update User Data (Balances, etc)
            refreshUser();

            // 4. Update TanStack Query Cache with server counts
            if (counts) {
                // Update global count (no filter)
                queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount(undefined), (old: any) => {
                    if (!old) return old;
                    return { ...old, data: { unreadCount: counts.total } };
                });

                // Update "Alerts" count (excludeType: order_chat)
                queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount({ excludeType: "order_chat" }), (old: any) => {
                    if (!old) return old;
                    return { ...old, data: { unreadCount: counts.general } };
                });

                // Update "Messages" count (type: order_chat)
                queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount({ type: "order_chat" }), (old: any) => {
                    if (!old) return old;
                    return { ...old, data: { unreadCount: counts.chat } };
                });
            }

            // Prepend to Infinite Query Lists — update each filtered list explicitly.
            // TanStack v5 setQueriesData updater only receives (oldData), so we cannot
            // inspect the query key inside a shared callback. We update each known
            // variant directly to avoid leaking notifications into the wrong tab.
            const prependNotification = (oldData: any) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any, index: number) => {
                        if (index === 0) {
                            return {
                                ...page,
                                data: {
                                    ...page.data,
                                    notifications: [notification, ...page.data.notifications]
                                }
                            };
                        }
                        return page;
                    })
                };
            };

            // Only add to the "all" (unfiltered) list unconditionally
            queryClient.setQueryData(NOTIFICATION_KEYS.infinite(10), prependNotification);

            // Only add to the "Messages" (type: order_chat) list if this IS a chat notification
            if (notification.type === "order_chat") {
                queryClient.setQueryData(NOTIFICATION_KEYS.infinite(10, { type: "order_chat" }), prependNotification);
            } else {
                // Only add to the "Alerts" (excludeType: order_chat) list if this is NOT a chat notification
                queryClient.setQueryData(NOTIFICATION_KEYS.infinite(10, { excludeType: "order_chat" }), prependNotification);
            }
        }

        function onTypingUpdate(data: { orderId: string; userId: string; isTyping: boolean; senderType: string }) {
            console.log("Typing update:", data);
            setTypingUsers(prev => ({
                ...prev,
                [data.orderId]: data
            }));
        }

        function onNewMessage(payload: any) {
            console.log("New message received via socket:", payload);
            const { message } = payload;
            if (!message || !message.orderId) return;

            // 1. Notification Logic
            const uiState = useUIStore.getState();
            const currentUser = useAuthStore.getState().user;
            const isMe = String(message.senderId) === String(currentUser?.id);

            // Refine isViewingThisChat to strictly use mongo _id
            const isViewingThisChat = uiState.isChatOpen &&
                uiState.chatView === "room" &&
                uiState.activeOrderId === message.orderId;

            if (!isMe && !isViewingThisChat) {
                // Play Sound
                if (!audioRef.current) {
                    audioRef.current = new Audio("/sound/notification.mp3");
                }
                audioRef.current.play().catch(err => console.log("Audio play blocked by browser"));

                // Show Toast
                toast.info(`New message from ${message.senderType === 'admin' ? 'Admin' : 'Customer'}`, {
                    description: message.message || (message.attachments?.length > 0 ? "Shared an image" : ""),
                    action: {
                        label: "View",
                        onClick: () => uiState.openChat(message.orderId)
                    }
                });
            }

            // 2. Update the chat history for this specific order.
            // Must use queryKeys.orders.chat() to match the key used by useChatHistory.
            queryClient.setQueryData(queryKeys.orders.chat(message.orderId), (old: any) => {
                if (!old) return old;

                // Handle raw array
                if (Array.isArray(old)) {
                    const exists = old.some((m: any) => m._id === message._id);
                    if (exists) return old;
                    return [...old, message];
                }

                // Handle wrapped { data: [] }
                if (!old.data) return old;
                const exists = old.data.some((m: any) => m._id === message._id);
                if (exists) return old;

                return {
                    ...old,
                    data: [...old.data, message]
                };
            });

            // If message is new, unread counts might have updated on server
            // The new_notification event usually handles this, but we can invalidate just in case
            // queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.unreadCount() });
        }

        function onAdminChatUpdate(payload: any) {
            console.log("Admin chat update received:", payload);
            const { conversation } = payload;
            if (!conversation || !conversation.orderId) return;

            // 1. Play "Ding" Sound for Admin
            const uiState = useUIStore.getState();
            const isAdmin = useAuthStore.getState().user?.role === "admin";

            // If admin is active but NOT viewing this specific chat room, play ding
            const isViewingThisRoom = uiState.isChatOpen &&
                uiState.chatView === "room" &&
                uiState.activeOrderId === conversation.orderId;

            if (isAdmin && !isViewingThisRoom) {
                const ding = new Audio("/sound/ding.mp3");
                ding.play().catch(err => console.log("Ding play blocked"));
            }

            // 2. Update Admin Inbox Cache Instantly
            // We use the same query key pattern as useAdminChatInbox
            queryClient.setQueriesData({ queryKey: ["chat", "admin", "inbox"] }, (old: any) => {
                if (!old || !old.data || !old.data.conversations) return old;

                const conversations = [...old.data.conversations];
                const index = conversations.findIndex(c => c.orderId === conversation.orderId);

                if (index !== -1) {
                    // Update and move to top
                    conversations.splice(index, 1);
                    conversations.unshift(conversation);
                } else {
                    // Just unshift if new
                    conversations.unshift(conversation);
                }

                return {
                    ...old,
                    data: {
                        ...old.data,
                        conversations,
                        pagination: {
                            ...old.data.pagination,
                            totalConversations: index === -1 ? (old.data.pagination.totalConversations + 1) : old.data.pagination.totalConversations
                        }
                    }
                };
            });
        }

        function onOrderHistory(messages: any) {
            console.log("Chat history received via socket:", messages);
            const currentOrderId = useUIStore.getState().activeOrderId;
            if (!currentOrderId || !Array.isArray(messages)) return;

            // authoritarian update: replace cache with what the server sent
            queryClient.setQueryData(queryKeys.orders.chat(currentOrderId), messages);
        }

        function onMessageAppended(updatedMsg: any) {
            console.log("Message appended/updated via socket:", updatedMsg);
            if (!updatedMsg || !updatedMsg.orderId) return;

            queryClient.setQueryData(queryKeys.orders.chat(updatedMsg.orderId), (old: any) => {
                if (!old) return old;

                const updateItem = (item: any) => item._id === updatedMsg._id ? updatedMsg : item;

                if (Array.isArray(old)) {
                    return old.map(updateItem);
                }

                if (!old.data) return old;
                return {
                    ...old,
                    data: old.data.map(updateItem)
                };
            });
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        socket.on("new_notification", onNewNotification);
        socket.on("typing_update", onTypingUpdate);
        socket.on("new_message", onNewMessage);
        socket.on("order_history", onOrderHistory);
        socket.on("message_appended", onMessageAppended);
        socket.on("admin_chat_update", onAdminChatUpdate);

        // Cleanup on unmount or when auth changes
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
            socket.off("new_notification", onNewNotification);
            socket.off("typing_update", onTypingUpdate);
            socket.off("new_message", onNewMessage);
            socket.off("order_history", onOrderHistory);
            socket.off("message_appended", onMessageAppended);
            socket.off("admin_chat_update", onAdminChatUpdate);

            // We only disconnect if the component unmounts entirely 
            // or if authentication is lost (handled by the if check above)
        };
    }, [isAuthenticated, token]);

    return (
        <SocketContext.Provider value={{ isConnected, emitTyping, joinOrderChat, leaveOrderChat, typingUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
