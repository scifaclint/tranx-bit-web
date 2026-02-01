"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import "flag-icons/css/flag-icons.min.css";

const TESTIMONIALS = [
    { name: "Kwame A.", location: "Accra", countryCode: "gh", text: "Fastest payout I've ever used in Ghana!" },
    { name: "Chidi O.", location: "Lagos", countryCode: "ng", text: "Truly secure and reliable. The rates are the best in Nigeria." },
    { name: "Amara E.", location: "Abuja", countryCode: "ng", text: "Instant payment to my wallet. No delays at all." },
    { name: "Kofi B.", location: "Kumasi", countryCode: "gh", text: "Selling my Amazon cards was so smooth. Highly recommended." },
    { name: "Tunde W.", location: "Ibadan", countryCode: "ng", text: "TranXbit is a game changer for traders in NG." },
    { name: "Efua M.", location: "Takoradi", countryCode: "gh", text: "Best rates for my gift cards. Fast and secure." },
];

export function TestimonialMarquee() {
    // Double the testimonials for seamless loop
    const doubledTestimonials = [...TESTIMONIALS, ...TESTIMONIALS];

    return (
        <div className="w-full py-10 bg-muted/30 border-y border-border/40 overflow-hidden relative">
            <motion.div
                className="flex items-center gap-16 whitespace-nowrap"
                animate={{
                    x: [0, -50 * TESTIMONIALS.length + "%"],
                }}
                transition={{
                    x: {
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    },
                }}
            >
                {doubledTestimonials.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 shrink-0">
                        <div className="flex gap-0.5 mr-2">
                            {[...Array(5)].map((_, starI) => (
                                <Star key={starI} size={10} className="fill-primary text-primary" />
                            ))}
                        </div>
                        <span className={`fi fi-${item.countryCode} rounded-sm shadow-sm scale-110`} />
                        <span className="text-[11px] font-bold text-foreground ml-1">
                            {item.name}
                        </span>
                        <span className="text-[10px] text-primary/60 font-medium">
                            ({item.location})
                        </span>
                        <span className="text-[11px] text-muted-foreground mr-6">
                            "{item.text}"
                        </span>
                    </div>
                ))}
            </motion.div>

            {/* Side Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </div>
    );
}
