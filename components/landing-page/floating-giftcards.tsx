"use client";

import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface FloatingGiftcardProps {
    imagePath: string;
    position: [number, number, number];
    index: number;
    mousePosition: { x: number; y: number };
}

export function FloatingGiftcard({
    imagePath,
    position,
    index,
    mousePosition,
}: FloatingGiftcardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { theme } = useTheme();

    // Load texture
    const texture = useLoader(TextureLoader, imagePath);

    // Generate unique animation parameters for this card
    const animationParams = useMemo(() => {
        const seed = index * 0.5;
        return {
            floatSpeed: 0.5 + Math.sin(seed) * 0.3, // 0.2 - 0.8
            floatAmplitude: 0.3 + Math.cos(seed) * 0.2, // 0.1 - 0.5
            rotationSpeed: 0.1 + Math.sin(seed * 2) * 0.05, // 0.05 - 0.15
            phaseOffset: seed * Math.PI, // Random starting phase
            tiltX: (Math.sin(seed * 3) * Math.PI) / 12, // Random tilt
            tiltZ: (Math.cos(seed * 4) * Math.PI) / 12,
        };
    }, [index]);

    // Animation loop
    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // Floating animation (up and down)
        const floatY =
            Math.sin(time * animationParams.floatSpeed + animationParams.phaseOffset) *
            animationParams.floatAmplitude;
        meshRef.current.position.y = position[1] + floatY;

        // Continuous rotation
        meshRef.current.rotation.y += animationParams.rotationSpeed * 0.01;

        // Mouse parallax effect
        const parallaxStrength = 0.1;
        const targetRotationX =
            animationParams.tiltX + mousePosition.y * parallaxStrength;
        const targetRotationZ =
            animationParams.tiltZ - mousePosition.x * parallaxStrength;

        // Smooth lerp to target rotation
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
            meshRef.current.rotation.x,
            targetRotationX,
            0.05
        );
        meshRef.current.rotation.z = THREE.MathUtils.lerp(
            meshRef.current.rotation.z,
            targetRotationZ,
            0.05
        );
    });

    // Theme-aware material properties
    const isDark = theme === "dark";

    return (
        <mesh ref={meshRef} position={position}>
            {/* Card geometry - standard credit card aspect ratio */}
            <planeGeometry args={[1.6, 1, 32, 32]} />

            {/* Material with texture */}
            <meshStandardMaterial
                map={texture}
                transparent
                side={THREE.DoubleSide}
                emissive={isDark ? "#ffffff" : "#000000"}
                emissiveIntensity={isDark ? 0.15 : 0}
                metalness={0.3}
                roughness={0.4}
            />
        </mesh>
    );
}
