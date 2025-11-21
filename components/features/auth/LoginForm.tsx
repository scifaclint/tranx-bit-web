"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
// import { sendGAEvent } from "@next/third-parties/google";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    //   toast.error("Please enter a valid email address");
    //   return;
    // }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const results = await authApi.login({
        username,
        password,
      });
      if (results && results.data.to === "verify-email") {
        onVerify(results.data.user.email);
        return;
      }
      setAuth(results.data.user, results.data.token);
      router.replace("/dashboard");
      setIsLoading(false);
    } catch (error: any) {
      setPassword("");
      toast.error("Login failed", {
        description:
          error?.message || "Please check your credentials and try again.",
      });
      setIsLoading(false);
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
      {/* Google Sign In */}
      {/* <GoogleButton /> */}

      {/* Divider */}
      {/* <div className="relative ">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div> */}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="border-borderColorPrimary focus-visible:outline-none h-12"
          />
        </div>

        <div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-borderColorPrimary focus-visible:outline-none h-12"
          />
        </div>

        <div className="flex justify-between items-center pt-1 pb-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-password"
              checked={showPassword}
              onCheckedChange={(checked) => setShowPassword(checked as boolean)}
              className="border focus-visible:outline-none"
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
          type="submit"
          className="w-full bg-black hover:bg-gray-900 text-white h-12 mt-6"
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
      </form>

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
