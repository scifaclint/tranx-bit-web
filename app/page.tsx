"use client";

// import { useEffect, useState } from "react";
import HeroSection from "@/components/design/hero-section";
import GiftCardFeatures from "@/components/design/feature-section";
import BrandCarousel from "@/components/design/Brand-carousel-animated";
import GetStarted from "@/components/design/get-started";
import Footer from "@/components/design/footer";
import LandingPageLayout from "@/components/design/landing-layout";
import TranxbitFAQ from "@/components/design/faq";

export default function Home() {


  return (
    <>
      <LandingPageLayout />

      <main className="bg-[#f9f9f9]">
        <div className="mb-2">
          <HeroSection />
        </div>
        <div className="bg-[#f9f9f9]">
          <GiftCardFeatures />
        </div>
        <BrandCarousel />
        <GetStarted />
        <TranxbitFAQ />
      </main>
      <Footer />
    </>
  );
}
