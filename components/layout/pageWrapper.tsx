import React, { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return <div className="min-h-screen flex bg-gray-50 dark:bg-sideBarBackground">{children}</div>;
}
