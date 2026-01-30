
import { create } from "zustand";

type AuthMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-success"
  | "verify-email";

interface AuthStore {
  authMode: AuthMode;
  setAuthMode: (state: AuthMode) => void;
  initializeFromUrl: () => void;
}

export const useAuthMode = create<AuthStore>((set) => ({
  authMode: "login", // Always start with "login" for SSR
  setAuthMode: (state) => set({ authMode: state }),
  initializeFromUrl: () => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const path = window.location.pathname;

    if (mode === "register" || mode === "signup" || path === "/register" || path === "/signup") {
      set({ authMode: "register" });
    } else if (mode === "forgot-password" || path === "/forgot-password") {
      set({ authMode: "forgot-password" });
    } else if (mode === "verify-email") {
      set({ authMode: "verify-email" });
    } else if (mode === "reset-success") {
      set({ authMode: "reset-success" });
    }

  },
}));
