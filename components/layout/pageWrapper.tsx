import React, { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return <main className="min-h-screen bg-gray-50 dark:bg-sideBarBackground">{children}</main>;
}
