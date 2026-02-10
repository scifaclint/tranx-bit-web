"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle,
    ArrowRight,
    ArrowLeft,
    Loader,
    Wallet,
    Package,
    ShieldAlert,
    Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AccountDeletionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type DeletionStep = "warning" | "password" | "confirm";

export default function AccountDeletionModal({ isOpen, onClose }: AccountDeletionModalProps) {
    const [step, setStep] = useState<DeletionStep>("warning");
    const [password, setPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(false); // Artificial friction loader
    const [isDeleting, setIsDeleting] = useState(false); // Real API loader
    const [acknowledged, setAcknowledged] = useState(false);

    const { user, clearAuth } = useAuthStore();
    const router = useRouter();

    // Reset modal state when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep("warning");
                setPassword("");
                setIsVerifying(false);
                setIsDeleting(false);
                setAcknowledged(false);
            }, 300);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (isDeleting || isVerifying) return;
        onClose();
    };

    const handlePasswordVerification = async () => {
        setIsVerifying(true);
        // Artificial friction: delay for 2.5 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 2500));
        setIsVerifying(false);
        setStep("confirm");
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await authApi.deleteAccount(password);

            if (response.status) {
                toast.success("Account scheduled for deletion");

                // Short delay for the user to see success before logout
                await new Promise(resolve => setTimeout(resolve, 2000));
                clearAuth();
                router.push("/login");
            } else {
                toast.error(response.message || "Failed to schedule deletion");
                setStep("password");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid password or server error");
            setStep("password");
        } finally {
            setIsDeleting(false);
        }
    };

    const walletBalance = parseFloat(user?.wallet_balance || "0");
    const referralBalance = parseFloat(user?.referral_balance || "0");
    const totalBalance = walletBalance + referralBalance;
    const pendingOrders = user?.pending_orders_count || 0;

    // Currency logic based on user country
    const isNigeria = user?.country?.toLowerCase() === "nigeria";
    const currencySymbol = isNigeria ? "₦" : "GH₵";
    const minWithdrawal = isNigeria ? "15,000 NGN" : "GH₵ 100";

    const renderWarning = () => {
        if (pendingOrders > 0) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 text-center"
                >
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                        <Package className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Action Blocked</h3>
                        <p className="text-sm text-gray-500">
                            You currently have <span className="font-bold text-black dark:text-white">{pendingOrders} pending order(s)</span>.
                            Accounts with active transactions cannot be scheduled for deletion.
                        </p>
                    </div>
                    <Button onClick={handleClose} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold">
                        Okay, I'll wait
                    </Button>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Delete Account</h3>
                        <p className="text-sm text-gray-500">
                            Please review your account details before we proceed.
                        </p>
                    </div>
                </div>

                {totalBalance > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <Wallet className="w-3 h-3" /> Remaining Balance
                        </div>
                        <div className="text-2xl font-mono font-bold tracking-tight">
                            {currencySymbol} {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] leading-relaxed text-orange-600 dark:text-orange-400 font-medium">
                            <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                            Minimum withdrawal is {minWithdrawal}. Any amount below this will be forfeited upon final deletion.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        By proceeding, your account will be <span className="text-black dark:text-white font-bold underline decoration-red-500">scheduled for deletion</span>.
                        You will be logged out immediately.
                    </p>

                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <Checkbox
                            id="acknowledge"
                            checked={acknowledged}
                            onCheckedChange={(checked) => setAcknowledged(checked === true)}
                            className="mt-1"
                        />
                        <Label htmlFor="acknowledge" className="text-xs text-gray-600 dark:text-gray-400 leading-normal cursor-pointer select-none">
                            I understand that I have 14 days to reactivate my account before all data is permanently wiped.
                        </Label>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={handleClose} className="flex-1">Cancel</Button>
                    <Button
                        disabled={!acknowledged}
                        onClick={() => setStep("password")}
                        className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 group"
                    >
                        Proceed
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </motion.div>
        );
    };

    const renderPassword = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">Security Check</h3>
                    <p className="text-sm text-gray-500">Please enter your password to continue.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="p-input" className="text-xs uppercase tracking-widest font-bold text-gray-400">Identity Verification</Label>
                    <Input
                        id="p-input"
                        type="password"
                        placeholder="Account Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 border-2 focus-visible:ring-black dark:focus-visible:ring-white"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => setStep("warning")}
                    disabled={isVerifying}
                    className="w-12 h-12 p-0 rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                    disabled={!password || isVerifying}
                    onClick={handlePasswordVerification}
                    className="flex-1 h-12 bg-black dark:bg-white text-white dark:text-black font-bold text-md"
                >
                    {isVerifying ? (
                        <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                        "Verify & Continue"
                    )}
                </Button>
            </div>
        </motion.div>
    );

    const renderConfirm = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-white dark:text-black animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase">The Point of No Return</h3>
                    <p className="text-sm text-gray-500 px-4">
                        This is your last chance to cancel. Once you click the button below, your account will be immediately deactivated.
                    </p>
                </div>
            </div>

            <div className="p-4 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Final Notice:</h4>
                <ul className="text-xs space-y-2 font-medium">
                    <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-current rounded-full" /> Immediate Logout
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-current rounded-full" /> 14-Day Recovery Period Starts
                    </li>
                    <li className="flex items-center gap-2 text-red-500">
                        <div className="w-1 h-1 bg-red-500 rounded-full" /> Balance Forfeiture (if &lt; {minWithdrawal})
                    </li>
                </ul>
            </div>

            <div className="flex flex-col gap-3">
                <Button
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="h-14 bg-red-600 hover:bg-red-700 text-white font-black text-lg uppercase tracking-wider"
                >
                    {isDeleting ? (
                        <Loader className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                        "Yes, Delete My Account"
                    )}
                </Button>
                <Button
                    variant="ghost"
                    disabled={isDeleting}
                    onClick={handleClose}
                    className="text-gray-500 font-bold underline"
                >
                    I changed my mind, take me back
                </Button>
            </div>
        </motion.div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none rounded-2xl bg-white dark:bg-background shadow-2xl forced-modal">
                {/* Hidden headers for accessibility */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Account Deletion</DialogTitle>
                    <DialogDescription>Process to schedule account for deletion</DialogDescription>
                </DialogHeader>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === "warning" && renderWarning()}
                        {step === "password" && renderPassword()}
                        {step === "confirm" && renderConfirm()}
                    </AnimatePresence>
                </div>

                {/* Step Indicator */}
                <div className="flex h-1 w-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                        className="h-full bg-black dark:bg-white"
                        animate={{
                            width: step === "warning" ? "33.3%" : step === "password" ? "66.6%" : "100%"
                        }}
                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
