"use client";

import { useAuthStore } from "@/stores";
import TawkToWidget from "./twak-to-widget";
import { useMemo } from "react";

export default function TawkToWidgetWrapper() {
    const { user, isAuthenticated } = useAuthStore();

    const tawkUser = useMemo(() => {
        if (!isAuthenticated || !user) return null;

        return {
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
            email: user.email,
            userId: user.id.toString(),
        };
    }, [user, isAuthenticated]);

    return (
        <TawkToWidget
            user={tawkUser}
            hideOnRoutes={[
                "/auth*",
                "/internal-portal-Trx13*",
                "/reset-password*",
                "/sell-giftcards",
                "/transactions",
                "/settings"
            ]}
        />
    );
}
