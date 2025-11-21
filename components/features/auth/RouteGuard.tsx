"use client";

import { useEffect, ReactNode, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authApi, User } from "@/lib/api/auth";
// import { toast } from "sonner";
import LoadingAnimation from "../LoadingAnimation";

interface RouteGuardProps {
  children: ReactNode;
}

const authRoutes = ["/auth"];

const publicRoutes = ["/blog"];

// Create a separate component for the route guard logic
function RouteGuardInner({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, setAuth, clearAuth } = useAuthStore();
  const [authState, setAuthState] = useState<
    "checking" | "authorized" | "unauthorized"
  >("checking");
  const [isLoading, setIsLoading] = useState(false);

  const isPublicRoute = (path: string): boolean => {
    // Check exact matches first
    if (publicRoutes.includes(path)) {
      return true;
    }

    // Check for nested routes under public paths
    return publicRoutes.some((route) =>
      // Check if the current path starts with a public route prefix
      // but make sure we're checking complete segments (using /)
      path.startsWith(route + "/")
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      const callback = searchParams.get("callback");
      const tokenFromUrl = searchParams.get("token");

      if (callback === "google" && tokenFromUrl) {
        setAuth({} as User, tokenFromUrl);
        setIsLoading(true);

        try {
          const response = await authApi.getUser();
          // console.log(response, 'google auth response')
          setAuth(response.data.user, tokenFromUrl, response.plan);

          router.replace("/dashboard");
        } catch (error: any) {
          // toast.error(error.response.data.error || error.response.data.message || 'Failed to load your data');

          clearAuth();
          router.replace("/auth");
        } finally {
          setIsLoading(false);
        }

        return;
      }

      // Special case: If we're on the auth page with verify-email mode
      if (pathname === "/auth" && searchParams.get("mode") === "verify-email") {
        setAuthState("authorized");
        return;
      }

      // CASE 1: No token - only allow access to auth routes and public routes
      if (!token) {
        if (!authRoutes.includes(pathname) && !isPublicRoute(pathname)) {
          // Save current path before redirecting to auth
          // console.log('redirecting to auth');
          router.replace("/auth");
          return;
        }
        setAuthState("authorized");
        return;
      }

      setAuthState("authorized");
    };

    setAuthState("checking");
    checkAuth();
    // }, [pathname, token, searchParams]);
  }, [token, searchParams]);

  useEffect(() => {
    const storeCurrentPath = () => {
      if (pathname !== "/auth") {
        sessionStorage.setItem("returnUrl", pathname + window.location.search);
        // console.log(pathname + window.location.search,'this is the resolved return url');
      }
    };

    // CASE 2: Has token and trying to access other routes aside auth
    if (token && !authRoutes.includes(pathname)) {
      // console.log('Token exits fast refresh');
      storeCurrentPath();
      const returnUrl = sessionStorage.getItem("returnUrl");
      if (returnUrl) {
        sessionStorage.removeItem("returnUrl");

        router.replace(returnUrl);

        return;
      }
      setAuthState("authorized");
      return;
    }
  }, [token]);

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
