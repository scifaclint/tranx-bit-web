
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/queryProvider";
import { ThemeProvider } from "@/components/providers/themeProvider";
import { RouteGuard } from "@/components/features/auth/RouteGuard";
import "./globals.css";
import { ConnectionStatus } from "@/components/connection-status";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RouteGuard>
            <QueryProvider>
              {children}
              <ConnectionStatus />
            </QueryProvider>
          </RouteGuard>
          <TawkToWidgetWrapper />
          <Toaster
            position="bottom-right"
            visibleToasts={3}
            richColors
            theme="system"
            toastOptions={{
              style: {
                background: "var(--toastBackgroundColor)",
                color: "var(--bodyColor)",
                border: "1px solid var(--borderColorPrimary)",
              },
              className: "dark:bg-toastBackgroundColor dark:text-bodyColor dark:border-borderColorPrimary",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
