"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Send, ShieldCheck } from "lucide-react";
import { WhatsAppIcon, TelegramIcon } from "../design/social-icons";
import TranxBitLogo from "../design/tranx-bit-logo";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const FOOTER_LINKS = {
  Product: [
    // { name: "How it Works", href: "/how-it-works" },
    { name: "Sell Gift Cards", href: "/sell-giftcards" },
    { name: "Buy Gift Cards", href: "/buy-giftcards" },
    // { name: "Market Rates", href: "/rates" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Contact Support", href: "mailto:tranxbit94@gmail.com" },
    // { name: "Careers", href: "/careers" },
    // { name: "Blog", href: "/blog" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    // { name: "AML/KYC Policy", href: "/aml-kyc" },
    // { name: "Cookie Policy", href: "/cookies" },
  ],
};

const SOCIALS = [
  { icon: WhatsAppIcon, href: "https://wa.me/233534507042", label: "WhatsApp" },
  { icon: TelegramIcon, href: "https://t.me/tranxbit", label: "Telegram" },
];

export function LandingFooter() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoVariant = mounted && theme === "dark" ? "light" : "dark";

  return (
    <footer className="w-full bg-background border-t border-border/40 pt-20 pb-10 px-6 md:px-8 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px  from-transparent via-primary/20 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center group mb-0 relative">
              <div className="transition-transform group-hover:scale-105">
                <TranxBitLogo size="medium" variant={logoVariant} />
              </div>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm max-w-sm leading-relaxed mb-8 relative z-10 ">
              Trade with confidence. Join thousands of users across Nigeria and
              Ghana who trust us for the best rates and instant payouts. Secure,
              transparent, and built for you
            </p>
            <div className="flex items-center gap-4">
              {SOCIALS.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -3, color: "var(--primary)" }}
                  className="p-2 rounded-lg bg-muted/50 text-muted-foreground transition-all border border-border/50"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="col-span-1">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground/80">
                {title}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block relative group/link"
                    >
                      {link.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={14} className="text-green-500" />
            <span>PCI-DSS Compliant & Fully Encrypted</span>
          </div>

          <div className="text-xs text-muted-foreground flex flex-col md:flex-row items-center gap-1 md:gap-4 lg:ml-auto">
            <span>© {new Date().getFullYear()} TranxBit Global Ltd.</span>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-border" />
              {/* <span>Proudly serving Nigeria 🇳🇬 & Ghana 🇬🇭</span> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
