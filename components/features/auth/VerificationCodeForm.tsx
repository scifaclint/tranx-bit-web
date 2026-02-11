"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
interface VerificationCodeFormProps {
  email: string;
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, y: -20 },
};

export function VerificationCodeForm({
  email,
  onSuccess,
  onBackToLogin,
}: VerificationCodeFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    setError("");

    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (value && index === 5 && newCode.every((digit) => digit !== "")) {
      handleVerify(newCode, email);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeArray: string[], email: string) => {
    setIsVerifying(true);
    setError("");

    try {
      // Validate that all elements exist and are strings
      if (!codeArray || codeArray.length !== 6) {
        throw new Error("Invalid code format");
      }

      // Filter out any undefined/null values and check length
      const validDigits = codeArray.filter(
        (digit) => digit !== undefined && digit !== null && digit !== ""
      );

      if (validDigits.length !== 6) {
        throw new Error("Please enter all 6 digits");
      }

      const verificationCode = validDigits.join("");

      // Additional safety check for numeric values
      if (!/^\d{6}$/.test(verificationCode)) {
        throw new Error("Code must contain only numbers");
      }

      const formattedCode = `TR-${verificationCode}`;
      const results = await authApi.verifyEmail({
        email: email,
        code: formattedCode,
      });
      if (results.status) {
        setAuth(results.data.user, results.data.token);
        sendGAEvent({ event: "sign_up", value: "verification_success" });
        router.replace("/dashboard");
      }
      // onSuccess();
    } catch (error: any) {
      setError(error.message || "Verification failed. Please try again.");
      toast.error(`${error.message || "Please check your code and try again"}`);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);

    try {
      await authApi.resendVerification({ email });
      setCountdown(30);
      toast.success("Verification code sent");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error: any) {
      toast.error(
        `${error.response?.data?.message ||
        "Failed to send code. Please try again."
        }`
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      // await authApi.logout();
      clearAuth();
      onBackToLogin();
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData) {
      const digits = pastedData.slice(0, 6).split("");
      const newCode = [...code];

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });

      setCode(newCode);

      // Focus last filled input or 6th input
      const nextIndex = Math.min(index + digits.length, 5);
      inputs.current[nextIndex]?.focus();

      // Auto-submit if complete
      if (newCode.every((d) => d !== "")) {
        handleVerify(newCode, email);
      }
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl xs:text-2xl font-semibold text-foreground">
          Enter Verification Code
        </h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification code to
        </p>
        <p className="font-medium text-foreground">{email}</p>
      </div>

      {/* Code Input Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          {/* Prefix */}
          <div className="flex items-center">
            <span className="text-lg xs:text-xl font-semibold text-foreground">
              TR -
            </span>
          </div>

          {/* Code Inputs */}
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit || ""}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              disabled={isVerifying}
              className="w-8 h-10 xs:w-12 xs:h-14 text-center text-lg font-semibold border border-borderColorPrimary rounded-lg 
                focus:outline-none transition-colors
                bg-background text-foreground
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* Verifying Status */}
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Verifying your code...</span>
          </div>
        )}
      </div>

      {/* Resend Code Section */}
      <div className="text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          {countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-foreground underline font-medium p-0"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="mt-4 text-sm"
        >
          <LogOut className="w-3 h-3 mr-2" />
          Use a different account
        </Button>
      </div>
    </motion.div>
  );
}
