"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Eye, EyeOff, Check, X } from "lucide-react";
// import { toast } from "sonner";
import { motion } from "framer-motion";

// import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

interface ResetPasswordFormProps {
  email: string;
  token: string;
}

interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<PasswordValidation>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });
  const router = useRouter();

  useEffect(() => {
    const validatePassword = () => {
      setValidation({
        hasMinLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        passwordsMatch: password === passwordConfirmation && password !== "",
      });
    };

    validatePassword();
  }, [password, passwordConfirmation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!validation.passwordsMatch) {
    //   toast.error("Passwords don't match");
    //   return;
    // }

    // if (!Object.values(validation).every(Boolean)) {
    //   toast.error("Please ensure your password meets all requirements");
    //   return;
    // }

    // setIsLoading(true);

    // try {
    //   const response = await authApi.resetPassword({
    //     token,
    //     email,
    //     password,
    //     password_confirmation: passwordConfirmation,
    //   });

    //   toast.success("Password Reset Successful");
    //   router.push("/auth");
    // } catch (error: any) {
    //   toast.error(
    //     error.response?.data?.message ||
    //       "Something went wrong. Please try again."
    //   );
    //   setIsLoading(false);
    // }
  };

  const ValidationItem = ({
    isValid,
    text,
  }: {
    isValid: boolean;
    text: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      {isValid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={isValid ? "text-green-500" : "text-red-500"}>
        {text}
      </span>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-borderColorPrimary focus-visible:outline-none pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid gap-2 p-2 bg-background/50 rounded-lg"
          >
            <ValidationItem
              isValid={validation.hasMinLength}
              text="At least 8 characters"
            />
            <ValidationItem
              isValid={validation.hasUpperCase}
              text="At least one uppercase letter"
            />
            <ValidationItem
              isValid={validation.hasLowerCase}
              text="At least one lowercase letter"
            />
            <ValidationItem
              isValid={validation.hasNumber}
              text="At least one number"
            />
            <ValidationItem
              isValid={validation.hasSpecialChar}
              text="At least one special character"
            />
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          className="border-borderColorPrimary focus-visible:outline-none"
        />
        {passwordConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm"
          >
            {validation.passwordsMatch ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span
              className={
                validation.passwordsMatch ? "text-green-500" : "text-red-500"
              }
            >
              Passwords match
            </span>
          </motion.div>
        )}
      </div>

      <Button
        variant="secondary"
        type="submit"
        className="w-full bg-black text-white"
        disabled={isLoading || !Object.values(validation).every(Boolean)}
      >
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Resetting Password...
          </motion.div>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
}
