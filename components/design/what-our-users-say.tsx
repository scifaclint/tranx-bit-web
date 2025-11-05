"use client";

import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the testimonial interface
interface Testimonial {
  id: number;
  name: string;
  image?: string;
  initials: string;
  message: string;
  source: string;
  rating: number;
}

// Sample testimonials data
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    image: "/testimonials/user1.jpg",
    initials: "SJ",
    message:
      "TranXbit made selling my unused gift cards so easy! I got paid within minutes and the rates were better than any other platform I've used.",
    source: "Facebook",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    image: "/testimonials/user2.jpg",
    initials: "MC",
    message:
      "I was skeptical at first, but TranXbit proved to be trustworthy. Their verification process is quick and the customer service is top-notch.",
    source: "Twitter",
    rating: 5,
  },
  {
    id: 3,
    name: "Jessica Patel",
    initials: "JP",
    message:
      "As someone who regularly deals with gift cards, I've found TranXbit to be the most reliable platform. The transaction fees are reasonable and transparent.",
    source: "Discord",
    rating: 4,
  },
  {
    id: 4,
    name: "Robert Williams",
    image: "/testimonials/user4.jpg",
    initials: "RW",
    message:
      "I've been using TranXbit for over a year now, and I've never had any issues. The platform is intuitive and the payout options are flexible.",
    source: "Instagram",
    rating: 5,
  },
  {
    id: 5,
    name: "Emma Davis",
    initials: "ED",
    message:
      "The security features on TranXbit give me peace of mind. I know my transactions are safe and my personal information is protected.",
    source: "Trustpilot",
    rating: 5,
  },
];

export default function WhatOurUsersSay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Check scroll buttons visibility on mount and on window resize
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = clientWidth * 0.8;

      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Wait for scrolling to complete before checking button visibility
      setTimeout(checkScrollButtons, 500);
    }
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          size={16}
          className={cn(
            "fill-current",
            index < rating ? "text-yellow-400" : "text-gray-300"
          )}
        />
      ));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our community about their experience buying and selling
            gift cards on TranXbit
          </p>
        </div>

        <div className="relative">
          {/* Left scroll button */}
          <button
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg transition-all duration-300",
              !canScrollLeft
                ? "opacity-0 cursor-default"
                : "opacity-100 hover:bg-gray-50"
            )}
            disabled={!canScrollLeft}
            aria-label="Scroll testimonials left"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Testimonials container */}
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-6 pb-6 px-2 snap-x snap-mandatory scrollbar-hide"
            onScroll={checkScrollButtons}
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-[280px] md:min-w-[380px] flex-shrink-0 snap-center"
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300 bg-white border-gray-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-gray-700 mb-4">
                      &ldquo;{testimonial.message}&rdquo;
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {testimonial.image ? (
                          <AvatarImage
                            src={testimonial.image}
                            alt={testimonial.name}
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                            {testimonial.initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-xs text-gray-500">
                          via {testimonial.source}
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>

          {/* Right scroll button */}
          <button
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg transition-all duration-300",
              !canScrollRight
                ? "opacity-0 cursor-default"
                : "opacity-100 hover:bg-gray-50"
            )}
            disabled={!canScrollRight}
            aria-label="Scroll testimonials right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
