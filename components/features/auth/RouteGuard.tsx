"use client";

import { useEffect, ReactNode, useState, Suspense, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api/auth";
// import { toast } from "sonner";
import LoadingAnimation from "../LoadingAnimation";
import { AdminBaseRoute } from "@/components/layout/side-bar";
interface RouteGuardProps {
  children: ReactNode;
}

const authRoutes = ["/auth"];

const publicRoutes = ["/blog", "/", "/reset-password", "/home"];

const restrictedRoutes = ["/buy-giftcards"];

// Create a separate component for the route guard logic
function RouteGuardInner({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const [authState, setAuthState] = useState<
    "checking" | "authorized" | "unauthorized"
  >("checking");
  const [isLoading, setIsLoading] = useState(false);
  const isCheckingRef = useRef(false);

  const isPublicRoute = (path: string): boolean => {
    // Check exact matches first
    if (publicRoutes.includes(path)) {
      return true;
    }

    // Check for nested routes under public paths
    return publicRoutes.some((route) =>
      // Check if the current path starts with a public route prefix
      // but make sure we're checking complete segments (using /)
      path.startsWith(route + "/"),
    );
  };

  // 1. Enforce Redirects (Sync-ish)
  // If we have a token and are on /auth, get out immediately.
  useEffect(() => {
    if (token && pathname === "/auth") {
      const mode = searchParams.get("mode");
      if (mode !== "verify-email") {
        router.replace("/dashboard");
      }
    }

    // Handle restricted routes
    const isRestricted = restrictedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    );

    if (isRestricted) {
      router.replace("/dashboard");
    }
  }, [token, pathname, router, searchParams]);

  // 2. Auth Validation (Async)
  // ALWAYS fetch user from API if token exists, never rely solely on cache
  useEffect(() => {
    const checkAuth = async () => {
      if (isCheckingRef.current) {
        return;
      }

      // If on auth page without token, immediately authorize (no loading needed)
      if (pathname === "/auth") {
        if (searchParams.get("mode") === "verify-email") {
          setAuthState("authorized");
        } else if (!token) {
          setAuthState("authorized");
        } else {
          setAuthState("checking");
        }
        return;
      }

      // CASE: No token
      if (!token) {
        if (!authRoutes.includes(pathname) && !isPublicRoute(pathname)) {
          router.replace("/auth");
          return;
        }
        setAuthState("authorized");
        return;
      }

      // CASE: Has token + valid page (e.g. Dashboard)
      setAuthState("checking");
      isCheckingRef.current = true;
      try {
        const response = await authApi.getUser();
        if (response.status && response.data.user) {
          useAuthStore.getState().setAuth(response.data.user, token);

          // Handle server-side redirects (e.g. verify-email enforcement)
          const destination = response.data.to;
          if (destination === "verify-email") {
            router.replace(
              `/auth?mode=verify-email&email=${encodeURIComponent(
                response.data.user.email,
              )}`,
            );
            return;
          }

          setAuthState("authorized");
        } else {
          // If response is not valid, treat as unauthorized
          setAuthState("unauthorized");
          useAuthStore.getState().clearAuth();
          router.replace("/auth");
        }
      } catch (error) {
        setAuthState("unauthorized");
        useAuthStore.getState().clearAuth();
        router.replace("/auth");
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkAuth();
  }, [token, pathname]);


  // Show loading screen while checking auth or during explicit loading states
  if (isLoading || authState === "checking") {
    return <LoadingAnimation />;
  }

  // Don't render anything if not authorized
  if (authState !== "authorized") {
    return null;
  }

  return <>{children}</>;
}

// Main component wrapped in Suspense
export function RouteGuard({ children }: RouteGuardProps) {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <RouteGuardInner>{children}</RouteGuardInner>
    </Suspense>
  );
}
