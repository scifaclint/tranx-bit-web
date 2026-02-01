"use client";

import { HeroPage } from "@/components/landing-page/hero-page";
import { TrustPulseSection } from "@/components/landing-page/trust-pulse-section";
import BrandCarousel from "@/components/design/Brand-carousel-animated";
import { LandingFAQ } from "@/components/landing-page/landing-faq";
import { TestimonialMarquee } from "@/components/landing-page/testimonial-marquee";
import { LandingFooter } from "@/components/landing-page/landing-footer";

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
