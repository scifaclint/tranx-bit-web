"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Environment, Float, Text3D, Center } from "@react-three/drei";
import { useTheme } from "next-themes";
import { ParticleStream } from "./particle-stream";
import { GeometricCard } from "./geometric-card";
import * as THREE from "three";

// Floating Currency Symbols
function FloatingSymbol({
    position,
    rotation,
    scale = 1,
    type = "coin"
}: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale?: number;
    type?: "coin" | "gem";
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={position} rotation={new THREE.Euler(...rotation)} scale={scale}>
                {type === "coin" ? (
                    // Ring/Coin representation
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.4, 0.1, 16, 32]} />
                        <meshStandardMaterial
                            color={isDark ? "#fbbf24" : "#f59e0b"} // Gold
                            metalness={1}
                            roughness={0.1}
                            emissive={isDark ? "#fbbf24" : "#d97706"}
                            emissiveIntensity={0.4}
                        />
                    </mesh>
                ) : (
                    // Gem/Diamond representation
                    <mesh>
                        <octahedronGeometry args={[0.5]} />
                        <meshStandardMaterial
                            color={isDark ? "#38bdf8" : "#0ea5e9"} // Cyan
                            metalness={0.9}
                            roughness={0.1}
                            emissive={isDark ? "#38bdf8" : "#0284c7"}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                )}
            </group>
        </Float>
    );
}

function Scene() {
    const { theme } = useTheme();
    const { viewport } = useThree();
    const isDark = theme === "dark";
    const isMobile = viewport.width < 7;

    // Responsive Scaling
    const cardScale = isMobile ? 0.6 : 0.9; // Smaller cards on mobile
    const symbolScale = isMobile ? 0.4 : 0.6;

    // Responsive Positions (X, Y, Z)
    // Mobile: Tighter spread (X +/- 2)
    // Desktop: Wide spread (X +/- 7)
    const leftX = isMobile ? -2.2 : -7;
    const leftInnerX = isMobile ? -1.8 : -5;
    const rightX = isMobile ? 2.2 : 7;
    const rightInnerX = isMobile ? 1.8 : 6;

    return (
        <>
            {/* Dynamic Lighting */}
            <ambientLight intensity={isDark ? 0.4 : 0.7} />
            <directionalLight
                position={[10, 5, 5]}
                intensity={isDark ? 2 : 1.5}
                color={isDark ? "#a5b4fc" : "#ffffff"}
            />

            <pointLight position={[-10, 0, -5]} intensity={2} color="#4f46e5" />
            <pointLight position={[5, -5, 0]} intensity={1.5} color="#fbbf24" /> {/* Gold uplight */}

            <Environment preset={isDark ? "city" : "studio"} />

            {/* 1. BACKGROUND: Fast Flowing Data Stream */}
            <ParticleStream />

            {/* 2. MIDGROUND: Floating Glass Cards (The 'Products') */}
            {/* Left Cluster */}
            <GeometricCard
                position={[leftX, isMobile ? 3 : 1, -2]}
                rotation={[0.2, 0.5, 0]}
                scale={cardScale}
                color={isDark ? "#6366f1" : "#a5b4fc"}
                imagePath="/brands/logo-amazon.svg"
            />
            <GeometricCard
                position={[leftInnerX, isMobile ? -3.5 : -2, -1]}
                rotation={[-0.2, 0.3, 0.2]}
                scale={cardScale * 0.8}
                color={isDark ? "#8b5cf6" : "#c4b5fd"}
                imagePath="/brands/apple-11.svg"
            />

            {/* Right Cluster */}
            <GeometricCard
                position={[rightX, isMobile ? 2.5 : 2, -3]}
                rotation={[0, -0.4, -0.1]}
                scale={cardScale * 1.1}
                color={isDark ? "#4f46e5" : "#818cf8"}
                imagePath="/brands/steam-1.svg"
            />
            <GeometricCard
                position={[rightInnerX, isMobile ? -3 : -1, 0]}
                rotation={[0.1, -0.6, 0.1]}
                scale={cardScale}
                color={isDark ? "#3b82f6" : "#93c5fd"}
                imagePath="/brands/playstation-6.svg"
            />

            {/* 3. FOREGROUND accents: Currency Symbols */}
            <FloatingSymbol position={[isMobile ? -1 : -3, 3, 1]} rotation={[0, 1, 0]} type="coin" scale={symbolScale} />
            <FloatingSymbol position={[isMobile ? 1.5 : 8, -2, 2]} rotation={[1, 0, 0]} type="coin" scale={symbolScale} />
            <FloatingSymbol position={[0, 4, -4]} rotation={[0, 0, 1]} type="gem" scale={symbolScale * 0.8} />


            {/* Post Processing */}
            <EffectComposer>
                <Bloom
                    luminanceThreshold={isDark ? 0.3 : 0.7}
                    mipmapBlur
                    intensity={isDark ? 0.6 : 0.3}
                    radius={0.6}
                />
            </EffectComposer>
        </>
    );
}

export function Hero3DScene() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="absolute inset-0 w-full h-full bg-background" />;
    }

    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 12], fov: 45 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    toneMapping: THREE.ReinhardToneMapping,
                    toneMappingExposure: 1.5
                }}
                performance={{ min: 0.5 }}
            >
                <fog attach="fog" args={[theme === 'dark' ? '#020617' : '#ffffff', 5, 25]} />
                {/* Removed solid background to allow CSS gradients behind Canvas */}

                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}
