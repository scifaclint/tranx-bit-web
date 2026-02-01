"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/side-bar";
import UserHeader from "@/components/layout/user-header";
import PageWrapper from "@/components/layout/pageWrapper";
import AdminGuard from "@/components/features/auth/adminGaurd";
import QueryProvider from "@/components/providers/queryProvider";
import { UserProvider } from "@/components/providers/userProvider";
import { RouteGuard } from "@/components/features/auth/RouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryProvider>
      <UserProvider>
        <RouteGuard>
          <AdminGuard>
            <PageWrapper>
              <Sidebar
                userType="admin"
                onCollapse={setIsSidebarCollapsed}
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
              />
              <main
                className={`flex-1 transition-all duration-300 
                ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
                py-0 lg:py-4 px-0 min-w-0
              `}
              >
                <UserHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                  {children}
                </div>
              </main>
            </PageWrapper>
          </AdminGuard>
        </RouteGuard>
      </UserProvider>
    </QueryProvider>
  );
}
