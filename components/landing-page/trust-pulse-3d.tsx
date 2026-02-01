"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, FloatProps } from "@react-three/drei";
import * as THREE from "three";

export function DataPulseCore() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Very slow rotation
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
        }
    });

    return (
        <group>
            {/* Outer soft glow */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere args={[1.2, 32, 32]} scale={1}>
                    <MeshDistortMaterial
                        color="#4f46e5" // Primary Indigo
                        speed={2}
                        distort={0.4}
                        transparent
                        opacity={0.05}
                        roughness={1}
                    />
                </Sphere>
            </Float>

            {/* Primary animated core */}
            <Float speed={3} rotationIntensity={1} floatIntensity={1}>
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[0.8, 4]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        emissive="#818cf8"
                        emissiveIntensity={2}
                        wireframe
                        transparent
                        opacity={0.15}
                    />
                </mesh>
            </Float>

            {/* Centered Point Light for the "Pulse" feel */}
            <pointLight
                position={[0, 0, 0]}
                intensity={10}
                color="#818cf8"
                distance={5}
            />
        </group>
    );
}
