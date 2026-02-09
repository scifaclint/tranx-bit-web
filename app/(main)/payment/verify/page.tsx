"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Receipt,
    ExternalLink
} from "lucide-react";
import { useVerifyPaystack } from "@/hooks/usePayments";
import { motion, AnimatePresence } from "framer-motion";

export default function PaystackVerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const { mutate: verify, isPending } = useVerifyPaystack();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!reference) {
            setStatus("error");
            setErrorMessage("No payment reference found.");
            return;
        }

        verify(reference, {
            onSuccess: () => {
                setStatus("success");
            },
            onError: (error: any) => {
                setStatus("error");
                setErrorMessage(error?.response?.data?.message || "Verification failed. Please contact support.");
            }
        });
    }, [reference, verify]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {status === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center space-y-6"
                        >
                            <div className="relative w-24 h-24 mx-auto">
                                <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
                                <Receipt className="absolute inset-0 m-auto w-10 h-10 text-blue-600/40" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                    Verifying Payment
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Hang tight! Confirming your transaction with Paystack...
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">
                                    REF: {reference || "Processing..."}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-200/50 dark:shadow-none">
                                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                    Payment Successful!
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    Your payment has been verified. Our team is now processing your gift card codes.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 pt-4">
                                <Button
                                    onClick={() => router.push("/orders")}
                                    className="w-full h-12 rounded-xl font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:opacity-90"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    View My Orders
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/")}
                                    className="w-full h-12 rounded-xl"
                                >
                                    Return to Dashboard
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-500/20">
                                <XCircle className="w-14 h-14 text-rose-500" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                    Verification Failed
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    {errorMessage}
                                </p>
                            </div>
                            <div className="p-4 bg-rose-50/50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20">
                                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-medium">
                                    If you have already been debited, please do not worry. Your transaction will be manually verified by our support team.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-3 pt-4">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="w-full h-12 rounded-xl font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900"
                                >
                                    Retry Verification
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/orders")}
                                    className="w-full h-12 rounded-xl"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Orders
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}
