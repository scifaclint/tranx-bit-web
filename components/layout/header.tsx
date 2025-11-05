"use client";
import TranxBitLogo from "../design/tranx-bit-logo";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useAuthMode } from "@/stores/ui-authState";
import { useRouter } from "next/navigation";

// Navigation links array for easy mapping
const navigationLinks = [
  { name: "Buy GiftCards", href: "/buy-giftcards" },
  { name: "SellGiftCards", href: "/sell-giftcards" },
  { name: "Faqs", href: "/faqs" },
];

export function Header() {
  const router = useRouter();
  const { setAuthMode } = useAuthMode();
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="bg-white rounded-full shadow-xl border border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <div className="flex-shrink-0">
            <TranxBitLogo variant="dark" size="medium" />
          </div>
        </Link>
        <nav className="hidden lg:flex gap-6 items-center">
          {navigationLinks.map((link) => (
            <Button
              key={link.name}
              asChild
              variant="ghost"
              className="p-0 h-auto text-sm font-medium text-gray-600 hover:bg-transparent relative group"
            >
              <Link href={link.href} prefetch={false} className="relative">
                <span className="relative z-10">{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
              </Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setAuthMode("login");
              router.push("/auth");
            }}
            variant="ghost"
            className="text-sm bg-white text-gray-700 hover:bg-gray-50 rounded-full px-4 py-2 font-medium border border-gray-200 transition-all duration-300 hover:shadow-sm hover:border-gray-300 hover:scale-105"
          >
            Login
          </Button>
          <div className="relative inline-flex items-center justify-center group">
            <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"></div>
            {/* Signup button with glow effect and arrow animation */}
            <Button
              onClick={() => {
                setAuthMode("register");
                router.push("/auth");
              }}
              className="relative bg-gray-900 px-8 py-3 rounded-xl text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
            >
              Signup
              <svg
                className="stroke-white stroke-2"
                fill="none"
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path
                  className="transition opacity-0 group-hover:opacity-100"
                  d="M0 5h7"
                ></path>
                <path
                  className="transition group-hover:translate-x-[3px]"
                  d="M1 1l4 4-4 4"
                ></path>
              </svg>
            </Button>
          </div>
        </div>
        <Button variant="ghost" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
    </header>
  );
}
