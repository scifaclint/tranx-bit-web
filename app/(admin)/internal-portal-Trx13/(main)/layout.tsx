"use client";
import { useState } from "react";

import Sidebar from "@/components/layout/side-bar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar userType="admin" onCollapse={setIsSidebarCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 
          ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
          flex flex-col items-start py-10
        `}
      >
        <div className="w-full max-w-6xl mx-auto mt-10 mb-6 sm:mb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
