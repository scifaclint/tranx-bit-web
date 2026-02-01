"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Shield, Headphones, Zap } from "lucide-react";
import { DataPulseCore } from "./trust-pulse-3d";

const TRUST_STATS = [
    { value: "$1M+", label: "Total Volume" },
    { value: "10,000+", label: "Happy Users" },
    { value: "99.8%", label: "Success Rate" },
    { value: "< 5 min", label: "Avg Payout" },
];

const BADGES = [
    { icon: Shield, title: "Secure Platform", desc: "PCI-DSS compliant security" },
    { icon: Headphones, title: "24/7 Support", desc: "Ready when you are" },
    { icon: Zap, title: "Instant Payouts", desc: "No delays, ever" },
];

export function TrustPulseSection() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full py-32 px-6 md:px-8 overflow-hidden bg-background"
        >
            {/* Background Gradient - Premium depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.08),transparent_70%)] pointer-events-none" />

            {/* 3D Pulse Centerpiece */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] pointer-events-none opacity-50">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <DataPulseCore />
                </Canvas>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
                {/* Main Stats Grid */}
                <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-24">
                    {TRUST_STATS.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                            className="flex flex-col items-center text-center space-y-2"
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                {stat.value}
                            </h2>
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Pro Badges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {BADGES.map((badge, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                            className="relative group p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden active:scale-95 transition-transform"
                        >
                            {/* Card Cursor Glow */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, hsla(var(--primary) / 0.1), transparent 80%)`,
                                }}
                            />

                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:rotate-3">
                                    <badge.icon size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{badge.title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">{badge.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
