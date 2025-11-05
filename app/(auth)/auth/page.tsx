"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import TranxBitLogo from "@/components/design/tranx-bit-logo";
// import Image from "next/image";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { RegisterForm } from "@/components/features/auth/RegisterForms";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { ResetPasswordSuccess } from "@/components/features/auth/ResetPasswordSuccess";
import { VerificationCodeForm } from "@/components/features/auth/VerificationCodeForm";
import { useAuthMode } from "@/stores/ui-authState";
// import { useTheme } from "next-themes";

// import { useAuthCheck } from "@/hooks/use-auth-check";
import TranxBitLoader from "@/components/design/Loading-screen";
// import { sendGAEvent } from "@next/third-parties/google";

type AuthMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-success"
  | "verify-email";

// Create an inner component for the auth page logic
function AuthPageInner() {
  const { authMode, setAuthMode } = useAuthMode();
  const [resetEmail, setResetEmail] = useState<string>("");
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
 
  //   const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const emailParam = params.get("email");

    // Set auth mode and email if provided in URL
    if (mode === "verify-email" && emailParam) {
      setAuthMode("verify-email");
      setEmail(emailParam);
    }
  }, []);

  const handleForgotPassword = () => {
    setAuthMode("forgot-password");
    // sendGAEvent("formSubmission", "forgottenPassword", {
    //   formType: "loginForm",
    // });
  };

  const handleResetSuccess = (email: string) => {
    setResetEmail(email);
    setAuthMode("reset-success");
  };

  const handleVerification = (email: string) => {
    setEmail(email);
    setAuthMode("verify-email");
  };

  const handleRegister = (email: string) => {
    setEmail(email);
    setAuthMode("verify-email");
  };

  const renderAuthContent = () => {
    switch (authMode) {
      case "login":
        return (
          <LoginForm
            onSwitchMode={() => setAuthMode("register")}
            onForgotPassword={handleForgotPassword}
            onVerify={handleVerification}
          />
        );
      case "register":
        return (
          <RegisterForm
            onSwitchMode={() => setAuthMode("login")}
            onRegister={handleRegister}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSwitchMode={() => setAuthMode("login")}
            onSuccess={handleResetSuccess}
          />
        );
      case "reset-success":
        return (
          <ResetPasswordSuccess
            onBackToLogin={() => setAuthMode("login")}
            email={resetEmail}
          />
        );
      case "verify-email":
        return (
          <VerificationCodeForm
            email={email}
            onSuccess={() => {
              // Handle successful verification
              // Maybe redirect to dashboard or show success message
            }}
            onBackToLogin={() => setAuthMode("login")}
          />
        );
    }
  };

  return (
    <div className="max-w-md   mx-auto">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <TranxBitLogo variant="dark" size="medium" />
      </div>

      {/* Auth form container */}
      <div>
        <h2 className="text-muted-foreground mb-6 text-center">
          {authMode === "login" && "Login to your account"}
          {authMode === "register" && "Create new account"}
          {authMode === "forgot-password" && "Reset your password"}
          {authMode === "reset-success" && "Check your email"}
          {authMode === "verify-email" && "Verify your email"}
        </h2>

        <AnimatePresence mode="wait">{renderAuthContent()}</AnimatePresence>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={<TranxBitLoader variant="light" isForm={true} />}>
      <div className="">
        <AuthPageInner />
      </div>
    </Suspense>
  );
}
