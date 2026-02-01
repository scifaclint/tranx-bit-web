
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TranXbit - Gift Card Exchange Platform",
  description: "A platform for exchanging gift cards securely and efficiently.",
};

import TawkToWidgetWrapper from "@/components/services/TawkWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <TawkToWidgetWrapper />
        <Toaster
          position="bottom-right"
          visibleToasts={3}
          richColors
          theme="light"
          toastOptions={{
            style: {
              background: "var(--toastBackgroundColor)",
              color: "var(--bodyColor)",
              border: "1px solid var(--borderColorPrimary)",
            },
            className: "dark:bg-toastBackgroundColor dark:text-bodyColor dark:border-borderColorPrimary",
          }}
        />
      </body>
    </html>
  );
}
