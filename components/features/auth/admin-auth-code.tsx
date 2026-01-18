"use client";
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TranxBitLogo from "@/components/design/tranx-bit-logo";
import { useTheme } from "next-themes";

interface AdminAuthCodeProps {
    onSuccess?: () => void
}

const AdminAuthCode = ({ onSuccess }: AdminAuthCodeProps) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [verificationError, setVerificationError] = useState<string>("");
    const [remainingTime, setRemainingTime] = useState<number>(300); // 5 minutes in seconds
    const [attemptsCount, setAttemptsCount] = useState<number>(0);
    const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
    const [codeRequestState, setCodeRequestState] = useState<
        "not-sent" | "sending" | "sent"
    >("not-sent");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuthStore();
    const router = useRouter();
    const { resolvedTheme } = useTheme();

    // Constants
    const MAX_ATTEMPTS = 3; // Maximum number of failed attempts before enabling resend

    React.useEffect(() => {
        // Cleanup timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Focus first input when code input becomes available
    React.useEffect(() => {
        if (codeRequestState === "sent") {
            inputRefs.current[0]?.focus();
        }
    }, [codeRequestState]);

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    const handleSendCode = async () => {
        setIsSendingCode(true);
        setCodeRequestState("sending");
        // Reset attempts when sending/resending code
        setAttemptsCount(0);
        setVerificationError("");
        setCode(Array(6).fill(""));

        // Mock API call
        setTimeout(() => {
            const isResend = codeRequestState === "sent";
            toast.success(
                isResend
                    ? "Verification code resent successfully."
                    : "Verification code sent successfully."
            );
            setCodeRequestState("sent");
            setRemainingTime(300);
            startTimer();
            setIsSendingCode(false);
        }, 1000);
    };

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (verificationError) {
            setVerificationError("");
        }
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto submit when all fields are filled
        if (newCode.every((digit) => digit !== "") && !isLoading) {
            handleVerify(newCode.join(""));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (verificationCode: string) => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        setVerificationError("");

        // Mock Verification Logic
        setTimeout(() => {
            if (verificationCode === "123456") {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsVerified(true);
                toast.success("Identity verified successfully!");
                if (onSuccess) {
                    onSuccess();
                } else {
                    // Router push to admin/cards as requested if used standalone
                    router.push("/internal-portal-Trx13/cards");
                }
                return;
            } else {
                toast.error("Verification failed. Please try again.");
                setIsLoading(false);
                setVerificationError("Invalid verification code. Try 123456.");
                setCode(Array(6).fill(""));
                inputRefs.current[0]?.focus();
                setAttemptsCount(prev => prev + 1);
            }
        }, 1000);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        const newCode = Array(6).fill("");

        for (let i = 0; i < pastedText.length; i++) {
            newCode[i] = pastedText[i] || "";
        }

        setCode(newCode);

        if (pastedText.length === 6) {
            // Handle paste verification using our internal function
            handleVerify(pastedText);
        }
    };
    const canResend = attemptsCount >= MAX_ATTEMPTS || remainingTime === 0;

    return (
        <Card className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full dark:bg-backgroundSecondary max-w-md space-y-8  p-8 rounded-xl shadow-md">
                {/* Logo */}
                <div className="flex justify-center">
                    <TranxBitLogo
                        variant={resolvedTheme === "dark" ? "light" : "dark"}
                        size="medium"
                    />
                </div>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold  ">Confirm Your Identity</h1>
                </div>

                {/* Security Message */}
                <Card className="border bg-background  rounded-lg p-4 text-center  shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                        <Shield className="h-5 w-5 text-gray-700 dark:text-gray-300 mr-2" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            Security Verification
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        We&apos;ve detected an attempt to access a secure area of the
                        application. For your security, we&apos;ve sent a 6-digit
                        verification code to your organization email.
                    </p>
                </Card>

                {/* Send Code Button or Code Input */}
                {codeRequestState === "not-sent" || codeRequestState === "sending" ? (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-muted-foreground text-sm mb-4">
                                Click the button below to receive a verification code at{" "}
                                <span className="font-bold">{user?.email}</span>
                            </p>
                            <button
                                onClick={handleSendCode}
                                disabled={isSendingCode}
                                className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isSendingCode ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border border-current border-t-transparent"></div>
                                        <span>Sending Code...</span>
                                    </>
                                ) : (
                                    <span>Send Verification Code</span>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-muted-foreground text-sm">
                                Enter the code sent to{" "}
                                <span className="font-bold">{user?.email}</span>
                            </p>
                        </div>

                        <div className="flex justify-center space-x-3">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleInputChange(index, e.target.value.replace(/\D/g, ""))
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    disabled={isLoading}
                                    className="w-12 h-12 text-center text-xl font-semibold bg-white dark:bg-background text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 disabled:opacity-50 shadow-sm"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Help Text and Timer - Only show when code is sent */}
                {codeRequestState === "sent" && (
                    <div className="text-center space-y-3">
                        <div className="flex items-center justify-center">
                            <div className="text-muted-foreground text-sm font-medium">
                                Code expires in:{" "}
                                <span
                                    className={`${remainingTime < 60 ? "text-red-500 dark:text-red-400" : ""
                                        }`}
                                >
                                    {formatTime(remainingTime)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center space-y-3">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Can&apos;t find the email? Check your spam folder.
                            </p>

                            <button
                                onClick={handleSendCode}
                                disabled={isSendingCode || !canResend}
                                className={`text-sm px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center space-x-2 ${canResend && !isSendingCode
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {isSendingCode ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border border-current border-t-transparent"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <span>Resend Code</span>
                                )}
                            </button>

                            {!canResend && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {attemptsCount >= MAX_ATTEMPTS
                                        ? `Wait ${formatTime(remainingTime)} to resend`
                                        : `Resend available after ${MAX_ATTEMPTS - attemptsCount
                                        } more failed attempts or when timer expires`}
                                </p>
                            )}

                            {attemptsCount >= MAX_ATTEMPTS &&
                                remainingTime === 0 &&
                                !isSendingCode && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Please request a new verification code
                                    </p>
                                )}
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => (window.location.href = "/")}
                    disabled={isLoading}
                    className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 w-full py-3 disabled:opacity-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Main Application</span>
                </button>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center mt-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-gray-600 border-t-gray-800 dark:border-t-gray-300"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                            Verifying your code...
                        </p>
                    </div>
                )}

                {/* Verification Success */}
                {isVerified && (
                    <div className="text-center mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p className="text-green-700 dark:text-green-300 font-medium">
                            Code verified successfully! Redirecting...
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {verificationError && (
                    <div className="text-center mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <p className="text-red-600 dark:text-red-300 text-sm">
                            {verificationError}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default AdminAuthCode;
