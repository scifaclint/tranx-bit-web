"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/side-bar";

import AdminGuard from "@/components/features/auth/adminGaurd";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-background dark:bg-gray-950">
        <Sidebar userType="admin" onCollapse={setIsSidebarCollapsed} />
        <main
          className={`flex-1 transition-all duration-300 
            ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
            flex flex-col items-start py-10
          `}
        >
          <div className="w-full px-4 sm:px-6 md:px-8">
            <div className="w-full max-w-6xl mx-auto mb-6 sm:mb-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
