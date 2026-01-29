"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useAuthStore } from "@/stores";
import { authApi, User } from "@/lib/api/auth";

interface UserContextType {
    user: User | null;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, setUser } = useAuthStore();

    const refreshUser = useCallback(async () => {
        try {
            const response = await authApi.getUser();
            if (response.status && response.data.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            // Silent error handling
        }
    }, [setUser]);

    return (
        <UserContext.Provider value={{ user, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
