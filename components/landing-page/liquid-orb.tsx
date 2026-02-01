"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface LiquidOrbProps {
    position: [number, number, number];
    scale: number;
    speed: number;
    color?: string;
    distort?: number;
}

export function LiquidOrb({
    position,
    scale,
    speed,
    color,
    distort = 0.4,
}: LiquidOrbProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null); // Type 'any' because MeshDistortMaterial types can be tricky
    const { theme } = useTheme();

    const isDark = theme === "dark";

    // Random animation offset
    const offset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Gentle rotation
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.sin(time * 0.2 + offset) * 0.2;
        meshRef.current.rotation.y = Math.cos(time * 0.3 + offset) * 0.2;
    });

    // Theme-based colors
    const finalColor = color || (isDark ? "#4A5FE2" : "#a5b4fc");
    const roughness = isDark ? 0.2 : 0.1;
    const metalness = isDark ? 0.8 : 0.6;

    return (
        <Float
            speed={speed} // Animation speed
            rotationIntensity={1} // XYZ rotation intensity
            floatIntensity={2} // Up/down float intensity
            floatingRange={[-0.2, 0.2]} // Range of y-axis values
        >
            <mesh ref={meshRef} position={position} scale={scale}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    ref={materialRef}
                    color={finalColor}
                    envMapIntensity={1}
                    clearcoat={1}
                    clearcoatRoughness={0}
                    metalness={metalness}
                    roughness={roughness}
                    distort={distort} // Amount of distortion
                    speed={2} // Distortion speed
                />
            </mesh>
        </Float>
    );
}
