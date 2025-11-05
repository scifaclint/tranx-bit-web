// store/authStore.ts
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
}

export const useAuthMode = create<AuthStore>((set) => ({
  authMode: "login", // default
  setAuthMode: (state) => set({ authMode: state }),
}));
