"use client";

import { useRef } from "react";
import { Float, RoundedBox, Image } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface GeometricCardProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    color?: string;
    speed?: number;
    imagePath?: string;
}

export function GeometricCard({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    color,
    speed = 1,
    imagePath,
}: GeometricCardProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const glassColor = color || (isDark ? "#6366f1" : "#e0e7ff");
    const emissiveColor = color || (isDark ? "#4f46e5" : "#c7d2fe");
    const transmission = isDark ? 0.6 : 0.9;

    return (
        <Float
            speed={speed * 0.5} // Slow float
            rotationIntensity={0.2}
            floatIntensity={0.2}
        >
            <group position={position} rotation={new THREE.Euler(...rotation)} scale={scale}>

                {/* 1. Glass Container */}
                <RoundedBox args={[2.2, 1.4, 0.1]} radius={0.1} smoothness={4}>
                    <meshPhysicalMaterial
                        color={glassColor}
                        emissive={emissiveColor}
                        emissiveIntensity={isDark ? 0.2 : 0.05}
                        metalness={0.1}
                        roughness={0.2}
                        transmission={transmission}
                        thickness={1.5}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        ior={1.5}
                    />
                </RoundedBox>

                {/* 2. Brand Image using Drei Image component (Handles SVGs/Textures reliably) */}
                {imagePath && (
                    <Image
                        url={imagePath}
                        position={[0, 0, 0.08]} // Moved forward to ensure visibility
                        scale={[1.5, 0.8]} // Adjust to fit card aspect ratio
                        transparent
                        opacity={1} // Full opacity for visibility
                        toneMapped={false} // Keep colors bright
                    />
                )}

            </group>
        </Float>
    );
}
