"use client";
import LandingHeader from "@/components/landing-page/landing-header";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      {children}
    </>
  );
}
