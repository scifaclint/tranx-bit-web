"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores";
import { useRouter, usePathname } from "next/navigation";
import LoadingAnimation from "@/components/features/LoadingAnimation";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const hasCheckedRef = useRef(false);
  const previousPathRef = useRef<string>("/dashboard");

  // Store previous non-admin path for fallback
  useEffect(() => {
    if (pathname && !pathname.startsWith("/internal-portal-Trx13")) {
      previousPathRef.current = pathname;
    }
  }, [pathname]);

  // Verify admin access
  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) return;

    const verifyAdmin = async () => {
      // Check basic auth first
      if (!token) {
        setIsChecking(false);
        router.replace("/auth");
        return;
      }

      hasCheckedRef.current = true;
      setIsChecking(true);

      try {
        const response = await authApi.verifyAdmin();

        if (response.status && response.data?.role === "admin") {
          // User is verified admin
          setIsVerified(true);
          setIsChecking(false);
        } else {
          // Not an admin
          toast.error(
            response.error || "Access denied: Admin privileges required"
          );
          router.replace(previousPathRef.current);
        }
      } catch (error: any) {
        // API call failed (403, 500, etc.)
        const errorMessage =
          error?.response?.data?.error || "Unable to verify admin access";
        toast.error(errorMessage);
        router.replace(previousPathRef.current);
      }
    };

    verifyAdmin();
  }, [token, router]);

  if (isChecking) {
    return <LoadingAnimation />;
  }

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}
