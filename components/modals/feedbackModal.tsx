"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageSquareHeart, Loader2 } from "lucide-react";
import { userApi } from "@/lib/api/user";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const [subject, setSubject] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) {
            toast.error("Please enter some feedback before submitting.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Introduce a short delay to allow the loading state to be visible
            await new Promise((resolve) => setTimeout(resolve, 1500));

            await userApi.sendFeedback({
                subject: subject || "No Subject",
                message: feedback,
            });

            toast.success("Thank you for your feedback! We appreciate your help in improving TranxBit.", {
                description: "Your message has been received.",
            });

            setSubject("");
            setFeedback("");
            onClose();
        } catch (error: any) {
            // Error handling is handled by the global axios interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] border-border/40">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <MessageSquareHeart className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">We'd Love to Hear From You!</DialogTitle>
                    <DialogDescription className="text-muted-foreground pt-2">
                        Your feedback helps us build a better experience for everyone.
                        Whether it's a suggestion, a bug report, or just a friendly hello,
                        we're all ears!
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject (Optional)</label>
                        <Input
                            placeholder="e.g. Issue with Transaction"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isSubmitting}
                            className="focus-visible:ring-primary/20 bg-muted/30 border-border/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                            placeholder="Tell us what's on your mind..."
                            className="min-h-[120px] resize-none focus-visible:ring-primary/20 bg-muted/30 border-border/50"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Feedback"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
