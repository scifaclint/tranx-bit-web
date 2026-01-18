import { Suspense } from "react";
import { ResetPasswordContent } from "./reset-password-content";
import LoadingAnimation from "@/components/features/LoadingAnimation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
