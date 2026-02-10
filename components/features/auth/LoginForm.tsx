"use client";
import { useState, useMemo } from "react";
import { extractErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, y: -20 },
};

interface LoginFormProps {
  onSwitchMode: () => void;
  onForgotPassword: () => void;
  onVerify: (email: string) => void;
}

export function LoginForm({
  onSwitchMode,
  onForgotPassword,
  onVerify,
}: LoginFormProps) {
  const [identifier, setIdentifier] = useState(""); // Can be username or email
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth, setUser } = useAuthStore();
  const router = useRouter();

  const identifierType = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(identifier.trim()) ? "email" : "username";
  }, [identifier]);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      toast.error("Please enter your username or email");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Add a 2 second delay to simulate connecting to backend
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const results = await authApi.login({
        identifier: identifier.trim(),
        identifierType: identifierType,
        password: password,
      });

      if (results.status && results.data) {
        if (results.data.to === "verify-email") {
          onVerify(results.data.user.email);
          setIsLoading(false);
          return;
        }

        if (results.data.to === "reactivate-account") {
          setUser(results.data.user);
          router.push("/pending-delete");
          setIsLoading(false);
          return;
        }
        setAuth(results.data.user, results.data.token);
        toast.success("Login successful");
        router.replace("/dashboard");
        return;
      } else {
        throw new Error(results.error || "Login failed");
      }
    } catch (error: any) {
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 flex flex-col justify-center max-w-md mx-auto w-full py-8"
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <Input
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            autoComplete="username"
            className="bg-backgroundSecondary border-borderColorPrimary hover:border-neutral-400 focus:border-bodyColor transition-all duration-300 focus-visible:outline-none h-12"
          />
        </div>

        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            autoComplete="current-password"
            className="bg-backgroundSecondary border-borderColorPrimary hover:border-neutral-400 focus:border-bodyColor transition-all duration-300 focus-visible:outline-none h-12"
          />
        </div>

        <div className="flex justify-between items-center pt-1 pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-password"
              checked={showPassword}
              onCheckedChange={(checked) => setShowPassword(checked as boolean)}
              className="bg-backgroundSecondary border-borderColorPrimary focus-visible:outline-none"
            />
            <label
              htmlFor="show-password"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Show password
            </label>
          </div>
          <Button
            type="button"
            variant="link"
            className="text-sm text-muted-foreground hover:underline"
            onClick={onForgotPassword}
          >
            Forgot Password?
          </Button>
        </div>

        <Button
          variant="secondary"
          type="button"
          onClick={handleSubmit}
          className="w-full bg-black hover:bg-neutral-900 hover:scale-[1.01] active:scale-[0.99] text-white h-12 mt-6 transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>

      {/* Register Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Don&apos;t have an account yet?{" "}
        </span>
        <Button
          variant="link"
          onClick={onSwitchMode}
          className="text-foreground underline font-medium p-0"
        >
          Register
        </Button>
      </div>

      {/* Terms */}
      <div className="text-center text-xs text-muted-foreground">
        By continuing, you agree to TranxBit&apos;s{" "}
        <Link href="/terms-of-service" target="_blank" className="underline">
          Terms of Service
        </Link>{" "}
        &{" "}
        <Link href="/privacy-policy" target="_blank" className="underline">
          Privacy Policy
        </Link>
      </div>
    </motion.div>
  );
}
