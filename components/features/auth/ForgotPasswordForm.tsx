"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formVariants } from "@/lib/utils";
import { Loader } from "lucide-react";
import { toast } from "sonner";

// import { authApi } from "@/lib/api/auth";

interface ForgotPasswordFormProps {
  onSwitchMode: () => void;
  onSuccess: (email: string) => void;
}

export function ForgotPasswordForm({
  onSwitchMode,
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Password reset logic will be implemented when backend is ready
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Password reset link has been sent to your email", {
        description: "Please check your inbox and follow the instructions to reset your password.",
      });
      onSuccess(email);
    } catch (error: any) {
      toast.error("Failed to send reset link", {
        description: error?.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">Forgot Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you instructions to reset
          your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-borderColorPrimary focus-visible:outline-none"
        />

        <Button
          variant="secondary"
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center text-sm">
        <Button
          variant="link"
          onClick={onSwitchMode}
          className="text-muted-foreground hover:text-foreground"
        >
          Back to Login
        </Button>
      </div>
    </motion.div>
  );
}
