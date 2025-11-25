"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/side-bar";
import HeaderWithBalance from "@/components/layout/header-with-balance";
import TawkToWidget from "@/components/services/twak-to-widget";
import { usePathname } from "next/navigation";
import PageWrapper from "@/components/layout/pageWrapper";
import { RouteGuard } from "@/components/features/auth/RouteGuard";
import DashBoardHeader from "@/components/layout/dashboardHeader";
const userData = {
  name: "John Doe",
  email: "john@gmail.com",
  userId: "123",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <RouteGuard>
        <PageWrapper>
          <Sidebar onCollapse={setIsSidebarCollapsed} />
          <main
            className={`flex-1 transition-all duration-300 
          ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}
          flex flex-col items-start py-10
        `}
          >
            <div className="w-full px-4 sm:px-6 md:px-8">
              <HeaderWithBalance />
              <div className="w-full max-w-6xl mx-auto mt-10 mb-6 sm:mb-8">
                {children}
              </div>
            </div>
          </main>
          {pathname === "/" ? null : (
            <TawkToWidget
              hideOnRoutes={["/login", "/signup", "/auth/*"]}
              user={userData}
            />
          )}
        </PageWrapper>
      </RouteGuard>
    </>
  );
}
