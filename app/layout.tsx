
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
  metadataBase: new URL("https://tranxbit.com"),
  title: {
    default: "TranXbit - Secure Gift Card Exchange Platform",
    template: "%s | TranXbit",
  },
  description: "The safest and fastest way to buy and sell gift cards. 24/7 support and competitive rates for iTunes, Amazon, Sephora, and more.",
  keywords: ["gift card exchange", "buy gift cards", "sell gift cards", "secure payments", "instant cash"],
  authors: [{ name: "TranXbit Team" }],
  creator: "TranXbit",
  publisher: "TranXbit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tranxbit.com",
    siteName: "TranXbit",
    title: "TranXbit - Secure Gift Card Exchange Platform",
    description: "The safest and fastest way to buy and sell gift cards. 24/7 support and competitive rates.",
    images: [
      {
        url: "/logo-light.png", // Assuming this is a good representation
        width: 800,
        height: 600,
        alt: "TranXbit Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TranXbit - Secure Gift Card Exchange Platform",
    description: "The safest and fastest way to buy and sell gift cards.",
    images: ["/logo-light.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TranXbit",
  "url": "https://tranxbit.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://tranxbit.com/home?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TranXbit",
  "url": "https://tranxbit.com",
  "logo": "https://tranxbit.com/logo-light.png",
  "sameAs": [
    "https://facebook.com/tranxbit", // Placeholder or from existing social-icons.tsx
    "https://discord.gg/tranxbit"
  ]
};

import TawkToWidgetWrapper from "@/components/services/TawkWrapper";
import { GoogleAnalytics } from '@next/third-parties/google';

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <GoogleAnalytics gaId="G-S0QJ8B2HVB" />
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
