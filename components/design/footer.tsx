import { Linkedin, Twitter, Facebook, Github, Youtube } from "lucide-react";
import TranxBitLogo from "./tranx-bit-logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-gray-400 py-14 shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)]">
      {/* 3D background effect elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-pink-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-60 h-60 bg-blue-900/20 rounded-full blur-3xl"></div>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTMwIDMwaDMwVjBoLTMwdjMwek0wIDYwaDMwVjMwSDB2MzB6IiBmaWxsPSIjMjAyMDIwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <TranxBitLogo variant="light" size="medium" />
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-8 mb-8 text-sm px-4">
          <a href="#" className="relative group px-2 py-1">
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            <span className="relative text-gray-300 group-hover:text-white transition-colors">
              Terms of Service
            </span>
          </a>
          <a href="#" className="relative group px-2 py-1">
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            <span className="relative text-gray-300 group-hover:text-white transition-colors">
              Privacy Policy
            </span>
          </a>
          <a href="#" className="relative group px-2 py-1">
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            <span className="relative text-gray-300 group-hover:text-white transition-colors">
              FAQs
            </span>
          </a>
          <a href="#" className="relative group px-2 py-1">
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            <span className="relative text-gray-300 group-hover:text-white transition-colors">
              API
            </span>
          </a>
        </div>

        {/* Copyright and contact */}
        <div className="text-center mb-8 px-4">
          <div className="inline-block relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-pink-500/10 to-yellow-400/10 rounded-lg blur-sm"></div>
            <p className="relative text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
              © {currentYear} TranXbit. All Rights Reserved. Contact us at{" "}
              <a
                href="mailto:contact@tranxbit.com"
                className="text-indigo-300 hover:text-white transition-colors"
              >
                contact@tranxbit.com
              </a>
            </p>
          </div>
        </div>

        {/* Social icons */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-yellow-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex justify-center gap-7 py-3 px-6 relative">
            <a href="#" className="group relative p-2" aria-label="LinkedIn">
              <div className="absolute -inset-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-300 group-hover:scale-105"></div>
              <Linkedin
                size={24}
                className="text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              />
            </a>
            <a href="#" className="group relative p-2" aria-label="Twitter">
              <div className="absolute -inset-2 bg-sky-500 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-300 group-hover:scale-105"></div>
              <Twitter
                size={24}
                className="text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]"
              />
            </a>
            <a href="#" className="group relative p-2" aria-label="Facebook">
              <div className="absolute -inset-2 bg-indigo-600 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-300 group-hover:scale-105"></div>
              <Facebook
                size={24}
                className="text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
              />
            </a>
            <a href="#" className="group relative p-2" aria-label="GitHub">
              <div className="absolute -inset-2 bg-gray-700 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-300 group-hover:scale-105"></div>
              <Github
                size={24}
                className="text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]"
              />
            </a>
            <a href="#" className="group relative p-2" aria-label="YouTube">
              <div className="absolute -inset-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-30 blur transition-all duration-300 group-hover:scale-105"></div>
              <Youtube
                size={24}
                className="text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              />
            </a>
          </div>
        </div>
        {/* Decorative line */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Bottom decorative edge */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 opacity-40"></div>
    </footer>
  );
}
