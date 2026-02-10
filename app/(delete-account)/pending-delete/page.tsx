"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
    ShieldAlert,
    RotateCcw,
    Trash2,
    AlertTriangle,
    ArrowLeft,
    Loader,
    Wallet,
    Calendar,
    User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function PendingDeletionPage() {
    const { user, token, setUser, setAuth, clearAuth } = useAuthStore();
    const router = useRouter();
    const [isReactivating, setIsReactivating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [password, setPassword] = useState("");
    const [modalType, setModalType] = useState<"reactivate" | "permanent" | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Strict Protection Logic
    useEffect(() => {
        // Redirect if:
        // 1. User has a token (already fully logged in)
        // 2. User data is missing
        // 3. User data exists but no deletion is scheduled
        if (token || !user || !user.scheduledDeletionAt) {
            router.replace("/auth");
        }
    }, [user, token, router]);

    if (!user) return null;

    const handleReactivate = async () => {
        if (!password) {
            toast.error("Please enter your password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.reactivateAccount({
                email: user.email,
                password: password
            });

            if (response.status && response.data) {
                setAuth(response.data.user, response.data.token);
                toast.success("Welcome back!", {
                    description: "Your account has been successfully reactivated."
                });
                router.replace("/dashboard");
            } else {
                toast.error(response.error || "Reactivation failed. Please check your password.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid password or server error.");
        } finally {
            setIsLoading(false);
            setModalType(null);
            setPassword("");
        }
    };

    const handlePermanentDelete = async () => {
        if (!password) {
            toast.error("Please enter your password");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.deletePermanently({
                email: user.email,
                password: password
            });

            if (response.status) {
                toast.success("Account permanently deleted", {
                    description: "All your data has been removed from our systems."
                });
                clearAuth();
                router.replace("/auth");
            } else {
                toast.error(response.error || "Deletion failed. Please check your password.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid password or server error.");
        } finally {
            setIsLoading(false);
            setModalType(null);
            setPassword("");
        }
    };

    const deletionDate = user.scheduledDeletionAt ? parseISO(user.scheduledDeletionAt) : null;
    const daysLeft = deletionDate ? formatDistanceToNow(deletionDate) : "Soon";

    // Currency logic (Matches the settings modal logic)
    const isNigeria = user.country?.toLowerCase() === "nigeria";
    const currencySymbol = isNigeria ? "₦" : "GH₵";
    const walletBalance = parseFloat(user.wallet_balance || "0");
    const referralBalance = parseFloat(user.referral_balance || "0");
    const totalBalance = walletBalance + referralBalance;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-900 rounded-3xl">
                    {/* Top Warning Banner */}
                    <div className="bg-red-600 p-3 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Account Scheduled for Deletion
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Profile Section */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-4 border-gray-50 dark:border-zinc-800 shadow-xl">
                                    <AvatarImage src={user.photo_url || ""} />
                                    <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-2xl font-bold">
                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1.5 border-4 border-white dark:border-zinc-900">
                                    <Trash2 className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                                    Hi, {user.first_name}
                                </h1>
                                <p className="text-sm text-gray-500 max-w-[280px]">
                                    Your account is currently in the 14-day grace period before permanent removal.
                                </p>
                            </div>
                        </div>

                        {/* Deletion Details */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-white dark:text-black" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400">Scheduled Deletion</p>
                                    <p className="text-sm font-bold">
                                        {deletionDate ? format(deletionDate, "MMMM do, yyyy") : "Processing..."}
                                    </p>
                                    <p className="text-[11px] text-red-500 font-medium">Deletes in {daysLeft}</p>
                                </div>
                            </div>

                            {totalBalance > 0 && (
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Wallet className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-gray-400">Remaining Balance</p>
                                        <p className="text-sm font-bold">{currencySymbol} {totalBalance.toLocaleString()}</p>
                                        <p className="text-[11px] text-gray-500">Will be forfeited after deletion</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                onClick={() => setModalType("reactivate")}
                                className="h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-xl"
                            >
                                <RotateCcw className="w-5 h-5 mr-3" />
                                Restore My Account
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => setModalType("permanent")}
                                className="text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                                Delete Permanently Now
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => { clearAuth(); router.replace("/auth"); }}
                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                            >
                                <ArrowLeft className="w-3 h-3" /> Sign out and go back
                            </button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Verification Modal */}
            <Dialog open={modalType !== null} onOpenChange={() => !isLoading && setModalType(null)}>
                <DialogContent className="sm:max-w-[400px] border-none rounded-3xl p-8 shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${modalType === 'permanent' ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-black'}`}>
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-center text-xl font-black italic uppercase">
                            {modalType === 'permanent' ? 'Final Warning' : 'Confirm Identity'}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            {modalType === 'permanent'
                                ? 'This action will bypass the 14-day grace period and wipe all data immediately. Please enter your password to confirm.'
                                : 'To restore your account and cancel the deletion process, please verify your password.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="pass" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</Label>
                            <Input
                                id="pass"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 border-2 rounded-xl focus-visible:ring-black"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:flex-col gap-2">
                        <Button
                            disabled={isLoading || !password}
                            onClick={modalType === 'permanent' ? handlePermanentDelete : handleReactivate}
                            className={`w-full h-12 rounded-xl font-bold ${modalType === 'permanent' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-zinc-900'}`}
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : (modalType === 'permanent' ? 'Yes, Delete Forever' : 'Restore Account')}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setModalType(null)}
                            disabled={isLoading}
                            className="text-gray-500"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
