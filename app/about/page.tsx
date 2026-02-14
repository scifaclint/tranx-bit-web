"use client";

import { useState, useEffect } from "react";
import LandingHeader from "@/components/landing-page/landing-header";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Headphones,
  CheckCircle2,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "mission", title: "Our Mission" },
  { id: "why-us", title: "Why Choose Us" },
  { id: "commitment", title: "Our Commitment" },
  { id: "contact", title: "Get In Touch" },
];

export default function AboutUsPage() {
  const [activeSection, setActiveSection] = useState("mission");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-100px 0px -40% 0px" },
    );

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <LandingHeader />

      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-24">
        {/* Hero Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-zinc-500 text-sm mb-4"
          >
            <Link
              href="/"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>About Us</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter"
          >
            ABOUT <span className="text-zinc-400">TRANXBIT</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="h-1.5 w-24 bg-black dark:bg-white mt-8"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-zinc-500 max-w-xl text-lg"
          >
            Bridging the gap between those who need liquid cash and businesses
            seeking flexible payment alternatives.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-1 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-4">
                Quick Links
              </p>
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-3",
                    activeSection === section.id
                      ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg"
                      : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  )}
                >
                  <span
                    className={cn(
                      "w-1 h-4 rounded-full transition-all",
                      activeSection === section.id
                        ? "bg-zinc-400"
                        : "bg-transparent",
                    )}
                  />
                  {section.title}
                </button>
              ))}
            </div>
          </aside>

          {/* Content Body */}
          <div className="flex-1 space-y-20 max-w-3xl">
            {/* Introduction */}
            <section className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">What We Do</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                  TranxBit is a fintech platform that enables individuals to
                  exchange gift cards and vouchers for cash equivalents. We also
                  partner with businesses to provide discounted gift cards as
                  flexible payment alternatives. Operating across Ghana and
                  Nigeria, we've built a trusted ecosystem that serves thousands
                  of users daily.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl">
                <p className="font-bold text-lg">
                  Making financial flexibility accessible to everyone.
                </p>
              </div>
            </section>

            {/* Section 1: Mission */}
            <section id="mission" className="scroll-mt-24 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                  <Zap className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Our Mission
                </h2>
              </div>
              <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                <p>
                  We believe that gift cards shouldn't just be gifts—they should
                  be financial tools. Our mission is to empower individuals with
                  quick access to cash and help businesses unlock new payment
                  channels.
                </p>
                <p>
                  By creating a seamless platform where gift cards transform
                  into cash instantly, we're solving a real need in the market.
                  We serve both sides: users who need liquidity and businesses
                  looking for cost-effective payment alternatives.
                </p>
              </div>
            </section>

            {/* Section 2: Why Choose Us */}
            <section id="why-us" className="scroll-mt-24 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Why Choose Us
                </h2>
              </div>
              <div className="space-y-4">
                {[
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Security & Compliance",
                    desc: "We take data protection seriously with industry-grade encryption, KYC verification, and full AML compliance across Ghana and Nigeria.",
                  },
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Fast & Reliable",
                    desc: "Get your cash in minutes, not days. Our streamlined process ensures quick transactions with minimal friction.",
                  },
                  {
                    icon: <Globe className="w-6 h-6" />,
                    title: "Trusted by Thousands",
                    desc: "Operating in Ghana and Nigeria, we've built a reputation for reliability, transparency, and fair value.",
                  },
                  {
                    icon: <Headphones className="w-6 h-6" />,
                    title: "Always Here to Help",
                    desc: "Our dedicated support team is ready to assist via live chat, email, or other channels whenever you need us.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 group-hover:border-black dark:group-hover:border-white transition-all flex gap-4"
                  >
                    <div className="text-black dark:text-white shrink-0 mt-1">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-black dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Commitment */}
            <section id="commitment" className="scroll-mt-24 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Our Commitment
                </h2>
              </div>
              <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="font-bold text-black dark:text-white text-sm mb-2">
                      Security First
                    </p>
                    <p className="text-sm">
                      Your data and funds are protected with enterprise-grade
                      security measures.
                    </p>
                  </div>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="font-bold text-black dark:text-white text-sm mb-2">
                      100% Transparent
                    </p>
                    <p className="text-sm">
                      Clear pricing, honest policies, and no hidden fees. Ever.
                    </p>
                  </div>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="font-bold text-black dark:text-white text-sm mb-2">
                      Fully Compliant
                    </p>
                    <p className="text-sm">
                      We comply with all AML and regulatory requirements in our
                      operating regions.
                    </p>
                  </div>
                  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <p className="font-bold text-black dark:text-white text-sm mb-2">
                      User-Focused
                    </p>
                    <p className="text-sm">
                      Your success is our success. We're constantly improving
                      based on feedback.
                    </p>
                  </div>
                </div>
                <p className="text-base p-4 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 italic">
                  Read more about our privacy practices in our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-bold text-black dark:text-white hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/terms-of-service"
                    className="font-bold text-black dark:text-white hover:underline"
                  >
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* Section 4: Contact */}
            <section id="contact" className="scroll-mt-24 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Get In Touch
                </h2>
              </div>
              <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                <p>
                  Have questions about TranxBit? Want to partner with us? Our
                  team is here to help.
                </p>
                <div className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-2xl flex justify-between items-center gap-6 flex-col sm:flex-row">
                  <div>
                    <p className="text-sm uppercase tracking-widest opacity-75 font-bold mb-2">
                      Contact Us
                    </p>
                    <a
                      href="mailto:contact@tranxbit.com"
                      className="text-2xl font-black hover:underline flex items-center gap-2"
                    >
                      contact@tranxbit.com
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Footer */}
            <div className="pt-12 text-center">
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black tracking-widest text-xs uppercase shadow-2xl hover:shadow-xl transition-all"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 py-12">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
            © 2026 TranxBit Platform. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy-policy"
              className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest font-bold"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
