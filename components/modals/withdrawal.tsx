"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Wallet, AlertCircle, Loader2, Eye, EyeOff, Plus } from "lucide-react";
import { paymentApi } from "@/lib/api/payment";
import type { PaymentMethodResponse } from "@/lib/api/payment";
import { toast } from "sonner";
import PaymentMethodModal from "./payment-method-modal";

interface WithdrawalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    balanceSource: "main" | "referral";
    availableBalance: number;
    currencySymbol: string;
    onSuccess?: (data: any) => void;
}

export default function WithdrawalModal({
    open,
    onOpenChange,
    balanceSource,
    availableBalance,
    currencySymbol,
    onSuccess,
}: WithdrawalModalProps) {
    const [amount, setAmount] = useState("");
    const [paymentMethodId, setPaymentMethodId] = useState("");
    const [pin, setPin] = useState("");
    const [description, setDescription] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shake, setShake] = useState(false);

    // Payment methods
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(false);

    // Add Payment Modal State
    const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
    useEffect(() => {
        if (open) {
            fetchPaymentMethods();
        }
    }, [open]);

    const fetchPaymentMethods = async () => {
        setLoadingMethods(true);
        try {
            const response = await paymentApi.getPaymentMethods();
            if (response.status) {
                setPaymentMethods(response.data);
                // Auto-select default payment method if available
                const defaultMethod = response.data.find(pm => pm.isDefault);
                if (defaultMethod) {
                    setPaymentMethodId(defaultMethod._id);
                }
            }
        } catch (error: any) {
            console.error("Failed to fetch payment methods:", error);
            toast.error("Failed to load payment methods");
        } finally {
            setLoadingMethods(false);
        }
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = "Please enter a valid amount";
        } else if (parseFloat(amount) > availableBalance) {
            newErrors.amount = "Amount exceeds available balance";
        }

        if (!paymentMethodId) {
            newErrors.paymentMethod = "Please select a payment method";
        }

        if (!pin || pin.length < 4) {
            newErrors.pin = "Please enter your PIN";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            triggerShake();
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const response = await paymentApi.withdraw({
                amount: parseFloat(amount),
                balanceSource,
                paymentMethodId,
                pin,
                description: description || undefined,
            });

            if (response.status) {
                toast.success("Withdrawal request submitted successfully!");
                if (onSuccess) {
                    onSuccess(response.data);
                }
                handleClose();
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.message || "Withdrawal failed";
            setErrors({ submit: errorMessage });
            triggerShake();
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        onOpenChange(false);
        setTimeout(() => {
            setAmount("");
            setPaymentMethodId("");
            setPin("");
            setDescription("");
            setErrors({});
        }, 300);
    };

    const getPaymentMethodImage = (method: PaymentMethodResponse) => {
        if (method.type === "crypto") return method.cryptoAsset === "bitcoin" ? "/payments/bitcoin.svg" : "/payments/tether-usdt.svg";
        if (method.type === "mobile_money") {
            switch (method.mobileNetwork) {
                case "mtn": return "/payments/mtn-seeklogo.svg";
                case "telecel": return "/payments/telecel_logo.svg";
                case "airteltigo": return "/payments/airtel-tigo.svg";
                default: return null;
            }
        }
        return null;
    };

    const getPaymentMethodDetails = (method: PaymentMethodResponse) => {
        if (method.type === "mobile_money") {
            return `${method.name} - ${method.mobileNumber}`;
        } else if (method.type === "crypto") {
            return `${method.name} - ${method.walletAddress.slice(0, 10)}...`;
        }
        return (method as PaymentMethodResponse).name;
    };

    // Find the currently selected method to display in trigger if needed
    const selectedMethod = paymentMethods.find(m => m._id === paymentMethodId);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={`w-[95%] max-w-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-xl ${shake ? "animate-shake" : ""
                        } p-0 overflow-hidden`}
                >
                    <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b-2 border-black bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="inline-flex shrink-0 p-2 bg-white rounded-lg border-2 border-black shadow-sm"
                            >
                                <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
                            </motion.div>

                            <div className="text-left">
                                <DialogTitle className="text-xl sm:text-2xl font-black">
                                    Withdraw Funds
                                </DialogTitle>
                                <DialogDescription className="text-sm sm:text-base text-zinc-600 font-medium">
                                    From {balanceSource === "main" ? "Main Wallet" : "Referral Bonus"}
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border-2 border-black shadow-sm">
                            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                                Balance
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-black">
                                {currencySymbol}{availableBalance.toFixed(2)}
                            </span>
                        </div>
                    </DialogHeader>

                    <div className="p-4 sm:p-6 space-y-5">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="font-bold text-sm uppercase tracking-wide text-zinc-500">
                                Amount to Withdraw
                            </Label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-lg">
                                    {currencySymbol}
                                </span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className={`h-12 pl-14 text-lg font-bold border-2 ${errors.amount ? "border-red-500 bg-red-50" : "border-zinc-200 focus:border-black"
                                        } transition-all rounded-xl placeholder:text-zinc-300`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {errors.amount && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.amount}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Payment Method Select */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod" className="font-bold text-sm uppercase tracking-wide text-zinc-500">
                                Payment Method
                            </Label>
                            {loadingMethods ? (
                                <div className="flex items-center justify-center p-4 border-2 border-zinc-200 rounded-xl bg-zinc-50">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-zinc-400" />
                                    <span className="text-sm font-medium text-zinc-500">Loading methods...</span>
                                </div>
                            ) : paymentMethods.length === 0 ? (
                                <div className="text-center p-6 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50">
                                    <p className="text-zinc-500 font-medium mb-3">No payment methods found</p>
                                    <Button
                                        type="button"
                                        onClick={() => setShowAddPaymentModal(true)}
                                        variant="outline"
                                        className="border-2 border-black hover:bg-zinc-100 font-bold"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Payment Method
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    value={paymentMethodId}
                                    onValueChange={(val) => {
                                        if (val === "ADD_NEW") {
                                            setShowAddPaymentModal(true);
                                        } else {
                                            setPaymentMethodId(val);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        className={`h-auto min-h-[3rem] py-2 border-2 ${errors.paymentMethod ? "border-red-500 bg-red-50" : "border-zinc-200 data-[state=open]:border-black hover:border-zinc-300"
                                            } rounded-xl font-medium`}
                                    >
                                        <SelectValue placeholder="Select destination">
                                            {selectedMethod && (
                                                <div className="flex items-center gap-3">
                                                    {getPaymentMethodImage(selectedMethod) ? (
                                                        <div className="relative w-8 h-8 shrink-0 rounded-full overflow-hidden border border-zinc-100 bg-white">
                                                            <Image
                                                                src={getPaymentMethodImage(selectedMethod)!}
                                                                alt={selectedMethod.name}
                                                                fill
                                                                className="object-contain p-1"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                                            <span className="text-xs font-bold text-zinc-500">
                                                                {selectedMethod.name[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col items-start leading-[1.1]">
                                                        <span className="text-sm font-bold text-zinc-900">
                                                            {selectedMethod.name}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">
                                                            {getPaymentMethodDetails(selectedMethod)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="border-2 border-black rounded-xl p-1 gap-1 max-h-[300px]">
                                        {paymentMethods.map((method) => (
                                            <SelectItem
                                                key={method._id}
                                                value={method._id}
                                                className="rounded-lg focus:bg-zinc-100 data-[state=checked]:bg-zinc-100 py-2 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getPaymentMethodImage(method) ? (
                                                        <div className="relative w-8 h-8 shrink-0 rounded-full overflow-hidden border border-zinc-100 bg-white">
                                                            <Image
                                                                src={getPaymentMethodImage(method)!}
                                                                alt={method.name}
                                                                fill
                                                                className="object-contain p-1"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                                            <span className="text-xs font-bold text-zinc-500">
                                                                {method.name[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col items-start leading-[1.1]">
                                                        <span className="text-sm font-bold text-zinc-900">
                                                            {method.name}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">
                                                            {getPaymentMethodDetails(method)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        <div className="pt-1 mt-1 border-t-2 border-zinc-100">
                                            <SelectItem
                                                value="ADD_NEW"
                                                className="rounded-lg focus:bg-zinc-100 py-3 cursor-pointer text-zinc-600 font-bold"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                                                        <Plus className="w-4 h-4 text-black" />
                                                    </div>
                                                    <span>Add New Payment Method</span>
                                                </div>
                                            </SelectItem>
                                        </div>
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.paymentMethod && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.paymentMethod}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* PIN Input */}
                        <div className="space-y-2">
                            <Label htmlFor="pin" className="font-bold text-sm uppercase tracking-wide text-zinc-500">
                                Transaction PIN
                            </Label>
                            <div className="relative">
                                <Input
                                    id="pin"
                                    type={showPin ? "text" : "password"}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Enter PIN"
                                    className={`h-12 pr-10 border-2 ${errors.pin ? "border-red-500 bg-red-50" : "border-zinc-200 focus:border-black"
                                        } rounded-xl text-lg tracking-widest font-bold placeholder:tracking-normal`}
                                    disabled={isSubmitting}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
                                    onClick={() => setShowPin(!showPin)}
                                >
                                    {showPin ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.pin && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.pin}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Description (Optional) */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description" className="font-bold text-sm uppercase tracking-wide text-zinc-500">
                                    Note
                                </Label>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 px-2 py-0.5 rounded-full">Optional</span>
                            </div>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this for?"
                                className="h-12 border-2 border-zinc-200 focus:border-black rounded-xl font-medium"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Alert variant="destructive" className="border-2 rounded-xl">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="font-bold">{errors.submit}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="p-4 sm:p-6 pt-0 flex gap-3">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                disabled={isSubmitting}
                                className="flex-1 h-12 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || paymentMethods.length === 0}
                                className="flex-1 h-12 bg-black hover:bg-black/80 text-white font-bold rounded-xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[2px] transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Withdraw"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
                    20%, 40%, 60%, 80% { transform: translateX(8px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
                }
            `}</style>

            <PaymentMethodModal
                isOpen={showAddPaymentModal}
                onClose={() => {
                    setShowAddPaymentModal(false);
                    fetchPaymentMethods();
                }}
            />
        </>
    );
}
