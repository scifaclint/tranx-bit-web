"use client";

import { useEffect, ReactNode, useState, Suspense, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authApi } from "@/lib/api/auth";
// import { toast } from "sonner";
import LoadingAnimation from "../LoadingAnimation";
// import { AdminBaseRoute } from "@/components/layout/side-bar";
interface RouteGuardProps {
  children: ReactNode;
}

const authRoutes = ["/auth"];

const publicRoutes = [
  "/blog",
  "/",
  "/reset-password",
  "/home",
  "/terms-of-service",
  "/privacy-policy",
  "/about",
  "/pending-delete"
];

const restrictedRoutes: string[] = [];

// Create a separate component for the route guard logic
function RouteGuardInner({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user, _hasHydrated } = useAuthStore();
  const [authState, setAuthState] = useState<
    "checking" | "authorized" | "unauthorized"
  >(() => {
    // Optimistic check: if we have both token and user, we're likely authorized
    if (token && user) return "authorized";
    return "checking";
  });
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
    if (!_hasHydrated) return;

    if (token && user && pathname === "/auth") {
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

    // NEW: Handle unauthenticated access to private routes
    if (!token && _hasHydrated) {
      if (!authRoutes.includes(pathname) && !isPublicRoute(pathname)) {
        router.replace("/auth");
      }
    }
  }, [token, user, pathname, router, searchParams, _hasHydrated]);

  // 2. Auth Validation (Async)
  // ALWAYS fetch user from API if token exists, never rely solely on cache
  useEffect(() => {
    const checkAuth = async () => {
      if (isCheckingRef.current || !_hasHydrated) {
        return;
      }

      // If on auth page without token, immediately authorize (no loading needed)
      if (pathname === "/auth") {
        if (searchParams.get("mode") === "verify-email") {
          setAuthState("authorized");
        } else if (!token) {
          setAuthState("authorized");
        } else if (!user) {
          // Has token but no user, need to check
          setAuthState("checking");
        }
        // If we have token AND user, we already set "authorized" in useState initializer
        // or it will be handled by the redirect effect above
        return;
      }

      // CASE: No token
      // If we are in a protected layout (where RouteGuard is used) and have no token,
      // we must redirect immediately and NOT authorize the view.
      if (!token) {
        setAuthState("unauthorized");
        if (!authRoutes.includes(pathname) && !isPublicRoute(pathname)) {
          router.replace("/auth");
        }
        return;
      }

      // CASE: Has token + valid page (e.g. Dashboard)
      // Only set to "checking" if we don't have a user cached.
      // If we have both, we valid in background.
      if (!user) {
        setAuthState("checking");
      }

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

          if (destination === "reactivate-account") {
            useAuthStore.getState().setUser(response.data.user);
            router.replace("/pending-delete");
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
        // If it's a 401, the axios interceptor might have already handled it,
        // but we ensure the local state is cleaned up here too.
        setAuthState("unauthorized");
        useAuthStore.getState().clearAuth();
        router.replace("/auth");
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated]); // ⭐ CRITICAL: Do NOT include `token` here to prevent infinite refresh loops

  // Show loading screen while checking auth or during explicit loading states
  if (!_hasHydrated || isLoading || authState === "checking") {
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
