"use client";

import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MessageSquare,
    Search,
    ArrowLeft,
    Send,
    Paperclip,
    MoreVertical,
    CheckCheck,
    Clock,
    X,
    FileImage
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useUIStore } from "@/hooks/useUIStore";
import { useAdminChatInbox } from "@/hooks/useAdmin";
import { useChatHistory, useSendMessage, useMarkAsRead, useChatUploadUrl } from "@/hooks/useOrders";
import { useSocket } from "@/components/providers/socketProvider";
import { useAuthStore } from "@/stores";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useMemo } from "react";
import { AdminChatConversation } from "@/lib/api/admin";
import { ChatMessage } from "@/lib/api/orders";
import { toast } from "sonner";

export default function OrderChat({ isAdmin = false }: { isAdmin?: boolean }) {
    const { isChatOpen, setChatOpen, activeOrderId, activeOrderMetadata, chatView, setChatView } = useUIStore();
    const { user } = useAuthStore();
    const { emitTyping, joinOrderChat, leaveOrderChat, typingUsers } = useSocket();

    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Queries
    // Always pre-fetch the inbox even while in room view so it's ready when the user navigates back.
    const { data: inboxData, isLoading: isLoadingInbox } = useAdminChatInbox(
        { search: searchQuery },
        { enabled: isAdmin && isChatOpen }
    );
    const inboxItems = (inboxData?.data?.conversations || []) as AdminChatConversation[];

    // Find active order details from the inbox list or use a separate query if needed
    // For now, let's assume we can find it in the list if we're an admin
    // If not an admin, we might need to fetch it differently or the activeOrderNumber is actually the ID
    const activeOrder = useMemo(() => {
        // Strictly find by Mongo ID
        return inboxItems.find((o) => o.orderId === activeOrderId);
    }, [inboxItems, activeOrderId]);

    const totalInboxUnread = useMemo(() => {
        return inboxItems.reduce((acc, item) => acc + (item.unreadCount || 0), 0);
    }, [inboxItems]);

    const orderId = activeOrderId;

    const { data: chatData } = useChatHistory(
        orderId as string,
        { enabled: isChatOpen && !!orderId }
    );

    // Robust message extraction to handle both raw array and wrapped { data: [] } responses
    const messages = useMemo(() => {
        if (!chatData) return [];
        if (Array.isArray(chatData)) return chatData;
        if ((chatData as any).data && Array.isArray((chatData as any).data)) return (chatData as any).data;
        return [];
    }, [chatData]) as ChatMessage[];

    const { mutate: sendMessage } = useSendMessage();
    const { mutate: markRead } = useMarkAsRead();
    const { mutateAsync: getUploadUrl } = useChatUploadUrl();

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, chatView]);

    // Typing Logic
    const handleTyping = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        if (activeOrderId) {
            emitTyping(activeOrderId as string, e.target.value.length > 0);
        }
    }, [activeOrderId, emitTyping]);

    // Join/Leave room
    useEffect(() => {
        if (chatView === "room" && activeOrderId && isChatOpen) {
            joinOrderChat(activeOrderId as string);
            markRead(activeOrderId as string);
            return () => leaveOrderChat(activeOrderId as string);
        }
    }, [chatView, activeOrderId, isChatOpen, joinOrderChat, leaveOrderChat, markRead]);

    const handleBack = React.useCallback(() => {
        if (isAdmin && chatView === "room") {
            setChatView("inbox");
        } else {
            setChatOpen(false);
            if (!isAdmin) {
                useUIStore.getState().setNotificationCenterOpen(true);
            }
        }
    }, [isAdmin, chatView, setChatView, setChatOpen]);

    const handleSelectOrder = (order: any) => {
        useUIStore.getState().openChat(order.orderId || order.orderNumber);
    };

    const handleFileSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSelectedFiles(prev => {
            const updatedFiles = [...prev];
            files.forEach(file => {
                if (file.size > 10 * 1024 * 1024) {
                    // console.error("File size exceeds 10MB");
                    return;
                }
                updatedFiles.push({
                    file,
                    preview: URL.createObjectURL(file)
                });
            });
            return updatedFiles;
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    }, []);

    const removeFile = React.useCallback((index: number) => {
        setSelectedFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    }, []);

    const handleSend = async () => {
        if ((!messageInput.trim() && selectedFiles.length === 0) || !orderId || isUploading) return;

        setIsUploading(true);
        try {
            const attachments = [];

            // 1. Upload all files if any
            for (const item of selectedFiles) {
                console.log(`Requesting upload URL for: ${item.file.name}`);
                const urlResponse = await getUploadUrl({
                    orderId: activeOrderId as string,
                    fileName: item.file.name,
                    contentType: item.file.type
                }) as any;

                const uploadData = urlResponse.data || urlResponse;
                const uploadUrl = uploadData.uploadUrl;
                const uploadKey = uploadData.key;

                if (uploadUrl && uploadKey) {
                    console.log(`Uploading ${item.file.name} to R2...`);
                    const uploadRes = await fetch(uploadUrl, {
                        method: "PUT",
                        body: item.file,
                        headers: {
                            "Content-Type": item.file.type
                        },
                        mode: 'cors'
                    });

                    if (!uploadRes.ok) {
                        throw new Error(`Upload failed for ${item.file.name}: ${uploadRes.statusText}`);
                    }

                    console.log(`Upload successful for ${item.file.name}. Key: ${uploadKey}`);
                    attachments.push({
                        name: item.file.name,
                        key: uploadKey,
                        mimeType: item.file.type
                    });
                } else {
                    console.error("Invalid upload URL response:", urlResponse);
                }
            }

            console.log(`Sending message with ${attachments.length} attachments`);
            // 2. Send the message
            sendMessage({
                orderId: activeOrderId as string,
                payload: {
                    message: messageInput.trim(),
                    attachments
                }
            });

            // 3. Clear state
            setMessageInput("");
            selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
            setSelectedFiles([]);
            if (activeOrderId) {
                emitTyping(activeOrderId as string, false);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Typing Indicator state for this room
    const currentTyping = orderId ? typingUsers[orderId as string] : null;
    const isOtherPartyTyping = currentTyping && currentTyping.userId !== String(user?.id) && currentTyping.isTyping;
    const otherPartyLabel = isAdmin ? "Customer is typing..." : "Admin is typing...";

    return (
        <Sheet open={isChatOpen} onOpenChange={setChatOpen}>
            <SheetContent className="w-full sm:max-w-[450px] flex flex-col p-0 gap-0 border-l border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl">
                <AnimatePresence mode="wait" initial={false}>
                    {chatView === "inbox" ? (
                        <motion.div
                            key="inbox"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="flex flex-col h-full"
                        >
                            <SheetHeader className="p-6 pb-4 border-b border-border/40 space-y-4">
                                <div className="flex items-center justify-between">
                                    <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                        Messages
                                        {totalInboxUnread > 0 && (
                                            <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">
                                                {totalInboxUnread}
                                            </div>
                                        )}
                                    </SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Browse your active order conversations
                                    </SheetDescription>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <Input
                                        placeholder="Search order or customer..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-11 pl-10 rounded-xl bg-muted/40 border-transparent focus:bg-background focus:border-border transition-all font-medium text-sm"
                                    />
                                </div>
                            </SheetHeader>
                            <ScrollArea className="flex-1">
                                <div className="p-2 space-y-1">
                                    {isLoadingInbox ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                    ) : inboxItems.length === 0 ? (
                                        <div className="text-center py-20 space-y-3">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                                                <MessageSquare className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium">No conversations found</p>
                                        </div>
                                    ) : (
                                        inboxItems.map((item) => (
                                            <button
                                                key={item.orderId}
                                                onClick={() => handleSelectOrder(item)}
                                                className="w-full text-left p-4 rounded-2xl hover:bg-muted/50 transition-all group relative border border-transparent hover:border-border/40 hover:shadow-sm"
                                            >
                                                <div className="flex gap-3">
                                                    <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary/10">
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                                                            {(item.user?.firstName || "U")[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-bold text-sm truncate">
                                                                {item.user ? `${item.user.firstName} ${item.user.lastName}` : "Customer"}
                                                            </p>
                                                            <span className="text-[10px] text-muted-foreground font-medium uppercase">
                                                                {item.lastMessageAt ? format(new Date(item.lastMessageAt), "kk:mm") : ""}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.orderNumber}</p>
                                                            {Number(item.unreadCount) > 0 && (
                                                                <span className="bg-rose-500 w-2 h-2 rounded-full ring-4 ring-rose-500/10" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-1 italic">
                                                            {item.lastMessage || "No messages yet"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="room"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="flex flex-col h-full"
                        >
                            {/* Room Header */}
                            <div className="p-4 border-b border-border/40 flex items-center gap-3 bg-muted/20 backdrop-blur-md">
                                <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-muted">
                                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                                </Button>
                                <div className="flex-1 min-w-0">
                                    <SheetTitle className="font-bold text-sm truncate">
                                        {isAdmin ? (
                                            activeOrder
                                                ? `${activeOrder.user.firstName} ${activeOrder.user.lastName}`
                                                : activeOrderMetadata?.userName || "Customer"
                                        ) : "tranxbit-admin"}
                                    </SheetTitle>
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            activeOrder?.chatStatus === "closed" ? "bg-muted-foreground" : "bg-green-500 animate-pulse"
                                        )} />
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
                                            {activeOrder?.orderNumber || activeOrderMetadata?.orderNumber || activeOrderId || "Order Chat"}
                                            {activeOrder?.chatStatus === "closed" && " (Closed)"}
                                        </p>
                                    </div>
                                    <SheetDescription className="sr-only">
                                        Chat with support regarding order {activeOrder?.orderNumber || activeOrderId}
                                    </SheetDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-6 pb-4">
                                    {(messages.length === 0 && chatView === "room") ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        </div>
                                    ) : (
                                        messages.filter(Boolean).map((msg) => {
                                            if (!msg || !msg.senderType) return null;
                                            const isMe = msg.senderType === (isAdmin ? "admin" : "user");

                                            return (
                                                <div key={msg._id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                                    {!isMe && (
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1 ml-1">
                                                            {msg.senderType === "admin" ? "tranxbit-admin" : (activeOrder ? `${activeOrder.user.firstName} ${activeOrder.user.lastName}` : "Customer")}
                                                        </span>
                                                    )}
                                                    <div className={cn(
                                                        "max-w-[85%] rounded-[24px] px-4 py-3 text-sm shadow-sm space-y-3",
                                                        isMe
                                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                                            : "bg-muted/50 border border-border/40 text-foreground rounded-tl-none"
                                                    )}>
                                                        {msg.attachments && msg.attachments.length > 0 && (
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {msg.attachments.map((att: any, i: number) => (
                                                                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-black/5 group/img">
                                                                        <img
                                                                            src={att.url || att.contentUrl}
                                                                            alt={att.name || "attachment"}
                                                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                                                            onClick={() => setLightboxImage(att.url || att.contentUrl)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {msg.message && <p className="leading-relaxed break-words">{msg.message}</p>}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {format(new Date(msg.createdAt), "kk:mm")}
                                                        </span>
                                                        {isMe && (
                                                            <CheckCheck className={cn("w-3.5 h-3.5 text-primary")} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* Real-time Typing Indicator */}
                                    {isOtherPartyTyping && activeOrder?.chatStatus !== "closed" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center gap-2 text-muted-foreground px-1"
                                        >
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{otherPartyLabel}</span>
                                        </motion.div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>

                            {/* Input Area or Closed State Indicator */}
                            {activeOrder?.chatStatus === "closed" ? (
                                <div className="p-6 bg-muted/30 border-t border-border/40 text-center space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">This conversation has been closed</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-6 rounded-xl border-dashed hover:bg-background transition-all"
                                        onClick={() => {/* TODO: Implement re-open endpoint */ }}
                                    >
                                        Re-open Chat
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-4 bg-muted/10 border-t border-border/40">
                                    <div className="relative flex flex-col gap-2 group">
                                        {/* File Previews */}
                                        <AnimatePresence>
                                            {selectedFiles.length > 0 && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="flex flex-wrap gap-2 px-1 mb-1"
                                                >
                                                    {selectedFiles.map((file, i) => (
                                                        <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted/30 group/file shadow-premium">
                                                            <img src={file.preview} className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => removeFile(i)}
                                                                className="absolute top-1 right-1 bg-black/60 hover:bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover/file:opacity-100 transition-all"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="relative flex items-end gap-2">
                                            <div className="flex-1 relative">
                                                <Input
                                                    placeholder={selectedFiles.length > 0 ? "Add a caption..." : "Type a message..."}
                                                    value={messageInput}
                                                    onChange={handleTyping}
                                                    onKeyDown={handleKeyPress}
                                                    disabled={isUploading}
                                                    className="min-h-[48px] rounded-2xl bg-background border-border/60 focus-visible:ring-primary/20 pr-12 pl-4 py-3 resize-none scrollbar-none shadow-premium transition-all disabled:opacity-50"
                                                />
                                                <div className="absolute right-2 bottom-1.5 flex gap-1">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                        multiple
                                                        accept="image/*"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground"
                                                        disabled={isUploading}
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <Paperclip className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleSend}
                                                disabled={(!messageInput.trim() && selectedFiles.length === 0) || isUploading}
                                                className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Send className="w-5 h-5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {lightboxImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                            onClick={() => setLightboxImage(null)}
                        >
                            <motion.button
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                onClick={() => setLightboxImage(null)}
                            >
                                <X className="w-6 h-6" />
                            </motion.button>
                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                src={lightboxImage}
                                className="max-w-full max-h-full rounded-2xl shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </SheetContent>
        </Sheet>
    );
}
