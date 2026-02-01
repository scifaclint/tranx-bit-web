"use client";

import { Hero3DScene } from "./hero-3d-scene";
import { HeroContent } from "./hero-content";

export function HeroPage() {
    return (
        <section className="relative w-full h-screen overflow-hidden bg-background">
            {/* Background Atmosphere - Left weighted as requested */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                {/* Primary glow (Top Left) */}
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px]" />

                {/* Center secondary glow */}
                <div className="absolute top-[20%] left-[5%] w-[45%] h-[45%] rounded-full bg-primary/5 dark:bg-primary/[0.03] blur-[100px]" />

                {/* Small right accent - tapers off */}
                <div className="absolute bottom-[10%] left-[40%] w-[30%] h-[30%] rounded-full bg-blue-400/[0.08] dark:bg-blue-400/5 blur-[80px]" />
            </div>

            {/* 3D Background Scene */}
            <Hero3DScene />

            {/* Content Overlay */}
            <HeroContent />
        </section>
    );
}
