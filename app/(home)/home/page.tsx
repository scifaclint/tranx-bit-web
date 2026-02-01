"use client";

import dynamic from "next/dynamic";
import { HeroPage } from "@/components/landing-page/hero-page";
import BrandCarousel from "@/components/design/Brand-carousel-animated";
import { LandingFAQ } from "@/components/landing-page/landing-faq";
import { LandingFooter } from "@/components/landing-page/landing-footer";

// Lazy load heavy 3D components
const TrustPulseSection = dynamic(
  () =>
    import("@/components/landing-page/trust-pulse-section").then(
      (m) => m.TrustPulseSection,
    ),
  { ssr: false, loading: () => <div className="h-96" /> },
);
const TestimonialMarquee = dynamic(
  () =>
    import("@/components/landing-page/testimonial-marquee").then(
      (m) => m.TestimonialMarquee,
    ),
  { ssr: false, loading: () => <div className="h-96" /> },
);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroPage />
      <TrustPulseSection />
      <BrandCarousel />
      <TestimonialMarquee />
      <LandingFAQ />
      <LandingFooter />
    </main>
  );
}
