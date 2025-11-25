"use client";
import LoadingAnimation from "@/components/features/LoadingAnimation";
import DashboardPage from "@/components/pages/dashboardPage";
import { useState, useEffect } from "react";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="">
      {isLoading ? <LoadingAnimation /> : <DashboardPage />}
    </div>
  );
}
