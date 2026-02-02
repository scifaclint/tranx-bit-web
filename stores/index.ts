import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/api/auth";
// import { toast } from "sonner";

// interface DriveAuthStore {
//   isAuthenticated: boolean;
//   accessToken: string | null;
//   expiresAt: number | null;
//   setAuth: (token: string, expiresIn: number) => void;
//   clearAuth: () => void;
//   checkAndRefreshAuth: () => Promise<boolean>;
// }

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token?: string, plan?: string | null) => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (status: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setAuth: (user: User, token?: string) => {
        if (!user || !token) return;
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },


      setLoading: (status: boolean) => {
        set({ isLoading: status });
      },

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage-tranxbit",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
