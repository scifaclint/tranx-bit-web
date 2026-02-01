"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "next-themes";

export function ParticleStream() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { theme } = useTheme();
  const { viewport } = useThree();
  const isDark = theme === "dark";

  // Configuration
  const count = 250; // Reduced from 600 for better performance
  const particleSize = 0.15;

  // Create dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate initial random positions/velocities
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100; // Random starting time
      const speed = 0.1 + Math.random() * 0.2; // Slower speed range
      const radius = 5 + Math.random() * 5; // Much wider stream spread
      const yOffset = (Math.random() - 0.5) * 8; // Taller vertical spread
      const rotationSpeed = (Math.random() - 0.5) * 0.01; // Slower rotation
      temp.push({ t, speed, radius, yOffset, rotationSpeed });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Skip update for some particles to reduce CPU load
      if (i % 3 !== 0) {
        // For skipped particles, only update matrix occasionally
        if (Math.floor(time * 10) % 3 !== 0) return;
      }
      // Update time for this particle
      particle.t += particle.speed * 0.001; // Ultra slow flow

      // Calculate path (Sine wave flow)
      // Mobile: Tighter curve, Desktop: Very Wide
      const isMobile = viewport.width < 7;
      const xFactor = isMobile ? 5 : 12; // Much wider spread

      // Parametric equation for the stream
      const x = Math.sin(particle.t * 0.3) * xFactor; // Slower wave freq
      const z = Math.cos(particle.t * 0.2) * 3 - 8; // Push back for depth
      const y = Math.cos(particle.t * 0.3) * 3 + particle.yOffset;

      // Position
      dummy.position.set(x, y, z);

      // Rotation (continuous tumbling)
      dummy.rotation.x += particle.rotationSpeed;
      dummy.rotation.y += particle.rotationSpeed;
      dummy.rotation.z += particle.rotationSpeed;

      // Scale (breathing effect) - simplified
      const scale = 0.95; // Removed sine calculation for performance
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Colors
  const color = isDark ? "#6366f1" : "#a5b4fc"; // Indigo
  const emissive = isDark ? "#4f46e5" : "#818cf8";

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[particleSize, 0]} />{" "}
      {/* Diamond/Gem shape */}
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={isDark ? 0.8 : 0.2}
        roughness={0.2}
        metalness={0.8}
      />
    </instancedMesh>
  );
}
