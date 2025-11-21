"use client";

import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import TranxBitLogo from "@/components/design/tranx-bit-logo";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { RegisterForm } from "@/components/features/auth/RegisterForms";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import { ResetPasswordSuccess } from "@/components/features/auth/ResetPasswordSuccess";
import { VerificationCodeForm } from "@/components/features/auth/VerificationCodeForm";
import { useAuthMode } from "@/stores/ui-authState";
import TranxBitLoader from "@/components/design/Loading-screen";

// type AuthMode =
//   | "login"
//   | "register"
//   | "forgot-password"
//   | "reset-success"
//   | "verify-email";

function AuthPageInner() {
  const { authMode, setAuthMode, initializeFromUrl } = useAuthMode();
  const [resetEmail, setResetEmail] = useState<string>("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    initializeFromUrl();
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [initializeFromUrl]);
  const updateUrlMode = (mode: string, emailParam?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);

    // Add email if provided
    if (emailParam) {
      url.searchParams.set("email", emailParam);
    } else {
      url.searchParams.delete("email");
    }

    // Preserve redirect parameter if it exists
    const redirectUrl =
      new URLSearchParams(window.location.search).get("redirect") ||
      new URLSearchParams(window.location.search).get("returnUrl") ||
      new URLSearchParams(window.location.search).get("return");
    if (redirectUrl && !url.searchParams.has("redirect")) {
      url.searchParams.set("redirect", redirectUrl);
    }

    window.history.replaceState({}, "", url.toString());
  };

  const handleSwitchToLogin = () => {
    setAuthMode("login");
    updateUrlMode("login");
  };

  const handleSwitchToRegister = () => {
    setAuthMode("register");
    updateUrlMode("register");
  };

  const handleForgotPassword = () => {
    setAuthMode("forgot-password");
    updateUrlMode("forgot-password");
  };

  const handleResetSuccess = (email: string) => {
    setResetEmail(email);
    setAuthMode("reset-success");
    updateUrlMode("reset-success");
  };

  const handleVerification = (email: string) => {
    setEmail(email);
    setAuthMode("verify-email");
    updateUrlMode("verify-email", email);
  };

  const handleRegister = (email: string) => {
    setEmail(email);
    setAuthMode("verify-email");
    updateUrlMode("verify-email", email);
  };

  const renderAuthContent = () => {
    switch (authMode) {
      case "login":
        return (
          <LoginForm
            onSwitchMode={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
            onVerify={handleVerification}
          />
        );
      case "register":
        return (
          <RegisterForm
            onSwitchMode={handleSwitchToLogin}
            onRegister={handleRegister}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSwitchMode={handleSwitchToLogin}
            onSuccess={handleResetSuccess}
          />
        );
      case "reset-success":
        return (
          <ResetPasswordSuccess
            onBackToLogin={handleSwitchToLogin}
            email={resetEmail}
          />
        );
      case "verify-email":
        return (
          <VerificationCodeForm
            email={email}
            onSuccess={() => {
              // Handle successful verification
            }}
            onBackToLogin={handleSwitchToLogin}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-center gap-2 mb-8">
        <TranxBitLogo variant="dark" size="medium" />
      </div>

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

export default function AuthPage() {
  return (
    <Suspense fallback={<TranxBitLoader variant="light" isForm={true} />}>
      <div className="">
        <AuthPageInner />
      </div>
    </Suspense>
  );
}
