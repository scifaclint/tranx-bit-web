"use client";
import { usePathname } from "next/navigation";
import { Header } from "../layout/header";
export default function LandingPageLayout() {
  const pathname = usePathname();
  return (
    <div>
      {pathname === "/" ? (
        <header className="fixed top-0 w-full z-20 right-0 ">
          <Header />
        </header>
      ) : (
        <div></div>
      )}
    </div>
  );
}
