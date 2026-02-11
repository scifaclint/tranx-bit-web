import type { Metadata } from "next";
import AuthClient from "@/app/(auth)/auth/auth-client";

export const metadata: Metadata = {
  title: "Login or Sign Up",
  description: "Securely access your TranXbit account or join our platform to start trading gift cards instantly.",
};

export default function AuthPage() {
  return <AuthClient />;
}
