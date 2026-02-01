"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
    {
        question: "How long does payout take?",
        answer: "Most payouts are processed within 5-30 minutes of card verification. Depending on your chosen withdrawal method, funds typically arrive in your account instantly."
    },
    {
        question: "What cards do you accept?",
        answer: "We accept 100+ global brands including Amazon, iTunes, Google Play, Steam, Vanilla, Visa/Mastercard, Sephora, and many more. Both physical cards and e-codes are welcome."
    },
    {
        question: "Is it safe to sell my cards here?",
        answer: "Absolutely. All uploaded gift cards are fully encrypted and stored in our secure, isolated vaults. Your card data is protected with military-grade encryption and only accessed during automated verification."
    },
    {
        question: "What payment methods do you support?",
        answer: "We support instant payouts via Mobile Money (all networks) and major Cryptocurrencies including Bitcoin (BTC), USDT (ERC20/TRC20), and Litecoin (LTC)."
    },
    {
        question: "Do you charge any fees?",
        answer: "We pride ourselves on transparency. There are zero hidden fees. We charge a minimal platform fee of 1-2% depending on the brand, which is always shown upfront before you trade."
    }
];

export function LandingFAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section className="w-full py-24 px-6 md:px-8 bg-background relative overflow-hidden">
            {/* Subtle Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight uppercase"
                    >
                        FAQ
                    </motion.h2>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
                            className={cn(
                                "group rounded-2xl border transition-all duration-200",
                                activeIndex === i
                                    ? "border-primary/40 bg-card/50 backdrop-blur-md shadow-lg shadow-primary/5"
                                    : "border-border/50 bg-card/20 hover:border-border"
                            )}
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left"
                            >
                                <span className={cn(
                                    "font-semibold text-lg transition-colors",
                                    activeIndex === i ? "text-primary" : "text-foreground"
                                )}>
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: activeIndex === i ? 45 : 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        activeIndex === i ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <Plus size={20} />
                                </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                                {activeIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
