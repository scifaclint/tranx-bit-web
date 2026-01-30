"use client";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores";
import { useRouter, usePathname } from "next/navigation";
import LoadingAnimation from "@/components/features/LoadingAnimation";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import PinSetupDialog from "@/components/modals/pin-set-up";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
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
          // User is admin, now check if PIN is set
          if (response.data.isPinSet) {
            setIsVerified(true);
            setIsChecking(false);
          } else {
            // Admin but PIN not set - show modal
            setShowPinModal(true);
            setIsChecking(false);
          }
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

  // If PIN is not set, show the modal and prevent dashboard access
  if (!isVerified && showPinModal) {
    return (
      <>
        <LoadingAnimation />
        <PinSetupDialog
          open={showPinModal}
          onOpenChange={(open) => {
            if (!open) {
              // If they close the modal without setting PIN, redirect them away
              router.replace(previousPathRef.current);
            }
          }}
          onPinSet={() => {
            setIsVerified(true);
            setShowPinModal(false);
            toast.success("PIN configured successfully");
          }}
        />
      </>
    );
  }

  if (!isVerified) {
    return null;
  }

  return <>{children}</>;
}
