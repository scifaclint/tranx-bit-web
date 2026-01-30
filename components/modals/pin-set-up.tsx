"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

type Step = "initial" | "password" | "pin" | "confirmPin" | "success";

interface PinSetupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPinSet?: (pin: string) => void;
    mode?: 'admin' | 'client'; // Determines which API to use
}

export default function PinSetupDialog({ open, onOpenChange, onPinSet, mode = 'admin' }: PinSetupDialogProps) {
    const [step, setStep] = useState<Step>("initial");
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shake, setShake] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePin = (value: string): string | null => {
        if (value.length < 4 || value.length > 6) {
            return "PIN must be 4-6 digits";
        }
        if (!/^\d+$/.test(value)) {
            return "PIN must contain only numbers";
        }
        return null;
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handlePasswordSubmit = () => {
        if (!password) {
            setErrors({ password: "Password is required" });
            triggerShake();
            return;
        }
        setErrors({});
        setStep("pin");
    };

    const handlePinSubmit = () => {
        const error = validatePin(pin);
        if (error) {
            setErrors({ pin: error });
            triggerShake();
            return;
        }
        setErrors({});
        setStep("confirmPin");
    };

    const handleConfirmPinSubmit = async () => {
        if (pin !== confirmPin) {
            setErrors({ confirmPin: "PINs do not match" });
            triggerShake();
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            let response;

            if (mode === 'client') {
                // Client mode: use authApi.setUserPin
                response = await authApi.setUserPin({
                    pin: pin,
                    password: password
                });
            } else {
                // Admin mode: use adminApi.setPin
                response = await adminApi.setPin({
                    currentPassword: password,
                    newPin: pin
                });
            }

            if (response.status) {
                setStep("success");
                if (onPinSet) {
                    onPinSet(pin);
                }
                setTimeout(() => {
                    handleClose();
                }, 2500);
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error || error?.message || "Failed to set PIN";

            // If it's a password error, send them back to the password step
            if (errorMessage.toLowerCase().includes("password")) {
                setStep("password");
                setErrors({ password: errorMessage });
            } else {
                setErrors({ confirmPin: errorMessage });
            }
            triggerShake();
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return; // Prevent closing while API call is in progress
        onOpenChange(false);
        setTimeout(() => {
            setStep("initial");
            setPassword("");
            setPin("");
            setConfirmPin("");
            setErrors({});
        }, 300);
    };

    const handleBack = () => {
        setErrors({});
        if (step === "pin") setStep("password");
        else if (step === "confirmPin") setStep("pin");
    };

    return (
        <>
            <Dialog open={open} onOpenChange={mode === 'client' ? onOpenChange : undefined}>
                <DialogContent
                    className={`w-[95%] max-w-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-xl ${shake ? "animate-shake" : ""
                        } p-0 overflow-hidden`}
                >
                    {/* Animated Header */}
                    <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b-2 border-black bg-zinc-50 dark:bg-zinc-900/50">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="inline-flex"
                        >
                            {step === "success" ? (
                                <CheckCircle2 className="w-8 h-8" />
                            ) : (
                                <Lock className="w-8 h-8" />
                            )}
                        </motion.div>

                        <DialogTitle className="text-2xl font-bold">
                            {step === "success" ? "PIN Set Successfully!" : "Set Your PIN"}
                        </DialogTitle>

                        <DialogDescription className="text-base">
                            {step === "initial" && "You haven't set up a PIN yet. Secure your account now."}
                            {step === "password" && "Verify your identity with your password"}
                            {step === "pin" && "Choose a secure 4-6 digit PIN"}
                            {step === "confirmPin" && "Re-enter your PIN to confirm"}
                            {step === "success" && "Your account is now protected with a PIN"}
                        </DialogDescription>

                        {/* Progress Bar */}
                        <motion.div
                            className="h-1 bg-black rounded-full"
                            initial={{ width: "0%" }}
                            animate={{
                                width:
                                    step === "initial" ? "0%" :
                                        step === "password" ? "25%" :
                                            step === "pin" ? "50%" :
                                                step === "confirmPin" ? "75%" :
                                                    "100%",
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </DialogHeader>

                    {/* Content with animations */}
                    <AnimatePresence mode="wait">
                        {step === "initial" && (
                            <motion.div
                                key="initial"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 sm:p-6 space-y-5"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <motion.div
                                        animate={{
                                            rotate: [0, -10, 10, -10, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                        className="p-4 border-2 border-black bg-white"
                                    >
                                        <AlertCircle className="w-16 h-16" />
                                    </motion.div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">No PIN Set</h3>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Protect your account with a PIN for quick and secure access.
                                            It only takes a minute to set up.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setStep("password")}
                                    className="w-full h-12 bg-black hover:bg-black/80 text-white font-bold rounded-xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[2px] transition-all"
                                    size="lg"
                                >
                                    Set PIN Now
                                </Button>
                            </motion.div>
                        )}

                        {step === "password" && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 sm:p-6 space-y-5"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-semibold">
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            disabled={isSubmitting}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                                            placeholder="Enter your password"
                                            className={`h-12 border-2 pr-10 ${errors.password ? "border-red-500 bg-red-50" : "border-zinc-200 focus:border-black"
                                                } rounded-xl text-lg focus-visible:ring-black`}
                                            autoFocus
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert variant="destructive" className="border-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.password}</AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}
                                </div>

                                <Button
                                    onClick={handlePasswordSubmit}
                                    className="w-full h-12 bg-black hover:bg-black/80 text-white font-bold rounded-xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[2px] transition-all"
                                    size="lg"
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        )}

                        {step === "pin" && (
                            <motion.div
                                key="pin"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 sm:p-6 space-y-5"
                            >
                                <div className="space-y-3">
                                    <Label htmlFor="pin" className="font-semibold">
                                        Enter PIN (4-6 digits)
                                    </Label>
                                    <Input
                                        id="pin"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={pin}
                                        disabled={isSubmitting}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                        onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                                        placeholder="••••"
                                        className={`h-16 rounded-xl border-2 text-center text-3xl font-bold tracking-[0.5em] ${errors.pin ? "border-red-500 bg-red-50" : "border-zinc-200 focus:border-black"
                                            } focus-visible:ring-black`}
                                        autoFocus
                                    />

                                    {/* PIN Dots Indicator */}
                                    <div className="flex gap-2 justify-center">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${i < pin.length ? "bg-black" : "bg-white"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {errors.pin && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert variant="destructive" className="border-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.pin}</AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleBack}
                                        variant="outline"
                                        className="flex-1 h-12 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handlePinSubmit}
                                        className="flex-1 h-12 bg-black hover:bg-black/80 text-white font-bold rounded-xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[2px] transition-all"
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "confirmPin" && (
                            <motion.div
                                key="confirmPin"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 sm:p-6 space-y-5"
                            >
                                <div className="space-y-3">
                                    <Label htmlFor="confirmPin" className="font-semibold">
                                        Confirm Your PIN
                                    </Label>
                                    <Input
                                        id="confirmPin"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={6}
                                        value={confirmPin}
                                        disabled={isSubmitting}
                                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                                        onKeyDown={(e) => e.key === "Enter" && handleConfirmPinSubmit()}
                                        placeholder="••••"
                                        className={`h-16 rounded-xl border-2 text-center text-3xl font-bold tracking-[0.5em] ${errors.confirmPin ? "border-red-500 bg-red-50" : "border-zinc-200 focus:border-black"
                                            } focus-visible:ring-black`}
                                        autoFocus
                                    />

                                    {/* PIN Dots Indicator */}
                                    <div className="flex gap-2 justify-center">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`w-3 h-3 rounded-full border-2 border-black transition-all ${i < confirmPin.length ? "bg-black" : "bg-white"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {errors.confirmPin && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Alert variant="destructive" className="border-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>{errors.confirmPin}</AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleBack}
                                        variant="outline"
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleConfirmPinSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 bg-black hover:bg-black/80 text-white font-bold rounded-xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[2px] transition-all"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Setting Up...
                                            </>
                                        ) : (
                                            "Set PIN"
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="py-8"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 10,
                                            delay: 0.2,
                                        }}
                                        className="p-6 bg-black text-white rounded-full"
                                    >
                                        <CheckCircle2 className="w-16 h-16" strokeWidth={2.5} />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="space-y-2"
                                    >
                                        <h3 className="text-2xl font-bold">All Set!</h3>
                                        <p className="text-muted-foreground">
                                            Your PIN has been successfully configured
                                        </p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
        </>
    );
}