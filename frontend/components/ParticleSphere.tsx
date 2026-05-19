"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate points on the surface of a sphere
function generateSpherePoints(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Random points on a sphere using spherical coordinates
    const theta = Math.random() * Math.PI * 2;
    // Math.acos to ensure even distribution across the sphere surface
    const phi = Math.acos((Math.random() * 2) - 1);
    
    // Convert spherical to cartesian
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    const offset = i * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
  }
  return positions;
}

const Sphere = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 4000; // Dense enough to look high-tech
  const radius = 2.8;

  // useMemo ensures we only generate the points once
  const positions = useMemo(() => generateSpherePoints(count, radius), []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Slow, majestic rotation
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 25;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ff6b6b"
          size={0.018}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  );
};

export default function ParticleSphere() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none mix-blend-screen opacity-50 flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        {/* Subtle ambient lighting isn't needed for PointMaterial but good practice */}
        <ambientLight intensity={0.5} />
        <Sphere />
      </Canvas>
    </div>
  );
}
