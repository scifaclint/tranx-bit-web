"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";

export const useLogout = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // const router = useRouter();
    const { clearAuth } = useAuthStore();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Optional: Wait for API logout if needed, but always clear local session
            await authApi.logout();
        } catch (error) {
            // We still clear local session even if API fails
        } finally {
            clearAuth();
            setIsLoggingOut(false);
            // router.replace("/auth");
            window.location.href = "/auth";
            toast.success("Logged out successfully");
        }
    };

    return {
        handleLogout,
        isLoggingOut,
    };
};
