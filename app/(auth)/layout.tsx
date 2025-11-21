"use client";
import { useEffect, useState } from "react";
import TranxBitLoader from "@/components/design/Loading-screen";
import LoadingAnimation from "@/components/features/LoadingAnimation";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth on mount
  const [authState, setAuthState] = useState<
    "checking" | "show-auth" | "redirect"
  >("checking");
  const { token, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authApi.getUser();

          setAuth(response.data.user, token);

          if (response.data.to === "verify-email") {
            setAuthState("show-auth");
            const url = new URL(window.location.href);
            url.searchParams.set("mode", "verify-email");
            url.searchParams.set("email", response.data.user.email);
            window.history.replaceState({}, "", url.toString());
          } else if (response.data.to === "dashboard") {
            router.replace("/dashboard");
          }
        } catch (error) {
          clearAuth();
          setAuthState("show-auth");
        }
      } else {
        setAuthState("show-auth");
      }
    };

    checkAuth();
  }, []);

    // Don't render anything while checking auth
    if (authState === "checking" || authState === "redirect") {
      return <LoadingAnimation />;
    }

  return (
    <div className="flex min-h-screen w-full bg-background dark:bg-gray-950">
      {/* Left - form (exact half) */}
      <div className="w-1/2 flex items-center justify-start bg-background dark:bg-gray-950 p-6 xs:p-10">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>

      {/* Right - animation (exact half) */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        {/* wrapper that constrains and clips the loader */}
        <div className="relative w-full h-full overflow-hidden">
          {/* inner container to center / size the visual area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* TranxBitLoader cannot accept className, so we wrap it */}
            <TranxBitLoader variant="light" isForm />
          </div>
        </div>
      </div>
    </div>
  );
}
