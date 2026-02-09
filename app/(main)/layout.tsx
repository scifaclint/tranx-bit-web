"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/side-bar";
import UserHeader from "@/components/layout/user-header";
import { usePathname } from "next/navigation";
import PageWrapper from "@/components/layout/pageWrapper";
import { RouteGuard } from "@/components/features/auth/RouteGuard";
import QueryProvider from "@/components/providers/queryProvider";
import { UserProvider } from "@/components/providers/userProvider";
import { ConnectionStatus } from "@/components/connection-status";
import AnnouncementBanner from "@/components/features/ui/AnnouncementBanner";
import { useUIStore } from "@/hooks/useUIStore";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { showAnnouncement } = useUIStore();

  // Demo effect to show announcement
  useEffect(() => {
    showAnnouncement({
      message: "🎉 We've updated our dashboard with new features! improved card validation status.",
      type: "info",
      actionLabel: "Learn More",
      actionUrl: "#",
      id: "demo-announcement-1",
    });
  }, [showAnnouncement]);


  return (
    <>
      <QueryProvider>
        <UserProvider>
          <RouteGuard>
            <PageWrapper>
              <Sidebar
                onCollapse={setIsSidebarCollapsed}
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
              />
              <main
                className={`flex-1 transition-all duration-300 min-w-0
              ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
              flex flex-col items-start min-h-screen bg-background
            `}
              >
                {/* <AnnouncementBanner /> */}
                <UserHeader onOpenMobileMenu={() => setIsMobileOpen(true)} />
                <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                  <div className="w-full max-w-6xl mx-auto">
                    {children}
                  </div>
                </div>
              </main>
              <ConnectionStatus />
            </PageWrapper>
          </RouteGuard >
        </UserProvider>
      </QueryProvider>
    </>
  );
}
