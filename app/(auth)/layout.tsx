"use client";
import TranxBitLoader from "@/components/design/Loading-screen";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left - form (exact half) */}
      <div className="w-1/2 flex items-center justify-start bg-background p-6 xs:p-10">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>

      {/* Right - animation (exact half) */}
      <div className="w-1/2 hidden md:flex items-center justify-center bg-gray-50 dark:bg-sideBarBackground">
        {/* wrapper that constrains and clips the loader */}
        <div className="relative w-full h-full overflow-hidden">
          {/* inner container to center / size the visual area */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* TranxBitLoader cannot accept className, so we wrap it */}
            <TranxBitLoader variant={mounted && resolvedTheme === "dark" ? "dark" : "light"} isForm />
          </div>
        </div>
      </div>
    </div>
  );
}
