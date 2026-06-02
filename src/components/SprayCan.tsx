"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface SprayCanProps {
  scrollProgress: number; // 0 to 1
  canPosRef: React.MutableRefObject<THREE.Vector3>;
  isSprayingRef: React.MutableRefObject<boolean>;
}

export default function SprayCan({ scrollProgress, canPosRef, isSprayingRef }: SprayCanProps) {
  const canRef = useRef<THREE.Group>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  // 1. Define the 3D spline path for painting "LOREM IPSUM"
  // The text spans from X = -10 to X = 10. The spline waves in front of it.
  const spline = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12, 5, 4),    // Spawn starting position
      new THREE.Vector3(-10, 1.2, 2.2),  // Start of 'L'
      new THREE.Vector3(-8, -1.0, 2.0),
      new THREE.Vector3(-5, 1.6, 2.3),   // Painting 'O', 'R'
      new THREE.Vector3(-2, -1.2, 2.1),
      new THREE.Vector3(1, 1.5, 2.4),    // Painting 'E', 'M'
      new THREE.Vector3(4, -1.0, 2.0),   // Painting 'I', 'P'
      new THREE.Vector3(7, 1.4, 2.3),    // Painting 'S', 'U'
      new THREE.Vector3(9, -1.2, 2.1),   // Painting 'M'
      new THREE.Vector3(11, 2, 3),      // Spline end overshoot
    ]);
  }, []);

  // Update can position, rotation, and spraying state based on scrollProgress
  useFrame((state) => {
    if (!canRef.current) return;

    const can = canRef.current;
    const targetPos = new THREE.Vector3();
    let spraying = false;

    if (scrollProgress < 0.2) {
      // Stage 1: Load/Fallen letters (Can is hidden above the viewport)
      targetPos.set(0, 12, 0);
      spraying = false;
    } else if (scrollProgress >= 0.2 && scrollProgress < 0.6) {
      // Stage 2: Spray painting text along the spline path
      const pathT = (scrollProgress - 0.2) / 0.4; // Map 20%-60% scroll to 0-1 path progress
      spline.getPointAt(pathT, targetPos);

      const interpolated = can.position.clone().lerp(targetPos, 0.12);
      can.position.copy(interpolated);

      const targetLookAt = new THREE.Vector3(targetPos.x + 0.5, 0, 0);
      can.lookAt(targetLookAt);
      can.rotateX(0.4);
      can.rotateY(Math.sin(state.clock.elapsedTime * 4.0) * 0.1);
      spraying = true;

    } else if (scrollProgress >= 0.6 && scrollProgress < 0.8) {
      spline.getPointAt(1.0, targetPos);
      const factor = (scrollProgress - 0.6) / 0.2;
      targetPos.lerp(new THREE.Vector3(0, 1.8, 2.5), factor);

      const interpolated = can.position.clone().lerp(targetPos, 0.12);
      can.position.copy(interpolated);
      can.lookAt(new THREE.Vector3(0, 0, 6));
      can.rotateX(0.1);
      spraying = false;

    } else if (scrollProgress >= 0.8 && scrollProgress < 0.9) {
      const factor = (scrollProgress - 0.8) / 0.1;
      targetPos.set(0, -0.2, 1.8);

      const interpolated = can.position.clone().lerp(targetPos, 0.16);
      can.position.copy(interpolated);
      can.rotation.set(0.1, state.clock.elapsedTime * 2.5, 0);

      const vibration = factor * 0.08 * Math.sin(state.clock.elapsedTime * 65.0);
      can.position.x += vibration;
      can.position.y += vibration * 0.7;
      can.position.z += vibration * 0.4;
      spraying = false;

    } else {
      targetPos.set(0, -9999, 0);
      const interpolated = can.position.clone().lerp(targetPos, 0.2);
      can.position.copy(interpolated);
      spraying = false;
    }

    // Save actual current position to ref so that particles can spawn from nozzle
    // The nozzle is located at the top-front of the can, about +1.3Y relative to can pivot
    const nozzleWorldOffset = new THREE.Vector3(0, 1.35, -0.3).applyQuaternion(can.quaternion);
    canPosRef.current.copy(can.position).add(nozzleWorldOffset);
    
    // Save spraying state to ref for particle emission
    isSprayingRef.current = spraying;

    // Control spotlight glow intensity based on spraying active state
    if (spotLightRef.current) {
      spotLightRef.current.intensity = spraying ? 15.0 + Math.sin(state.clock.elapsedTime * 30.0) * 4.0 : 0.0;
    }
  });

  return (
    <group ref={canRef}>
      {/* 3D PROCEDURALLY MODELED CAN ASSEMBLY */}
      
      {/* A. CAN BODY (Reflective Brushed Metal Cylinder) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 2.2, 32]} />
        <meshStandardMaterial
          color="#39E7FF"
          metalness={1.0}
          roughness={0.12}
          emissive="#005A70"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Luxury Procedural Label Overlay (a slightly wider thin cylinder wrapping the body) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.705, 0.705, 1.5, 32]} />
        <meshStandardMaterial
          color="#030303"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* B. DOME SHOULDER (Curved Top Transition) */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial
          color="#88a8b8"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* C. VALVE RIM (Thin metallic collar) */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial
          color="#bbd0e0"
          metalness={1.0}
          roughness={0.2}
        />
      </mesh>

      {/* D. PLASTIC CAP NOZZLE ACTUATOR */}
      <group position={[0, 1.35, 0]}>
        {/* Main actuator body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
          <meshStandardMaterial
            color="#111111" // Sleek black plastic
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        
        {/* Spray button insert (Red valve cap top) */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
          <meshStandardMaterial
            color="#FF3366" // Hot crimson accent
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>

        {/* Small Nozzle hole pointing forward/outward (-Z is forward for lookAt) */}
        <mesh position={[0, 0.02, -0.175]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 8]} />
          <meshStandardMaterial
            color="#00D4FF" // Glowing paint deposit
            emissive="#00D4FF"
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>

      {/* E. ACTIVE SPRAY VALVE LIGHTING */}
      {/* Spotlight pointing straight out of the nozzle (-Z direction) */}
      <spotLight
        ref={spotLightRef}
        position={[0, 1.35, -0.22]}
        angle={0.5}
        penumbra={0.6}
        intensity={0}
        color="#39E7FF"
        distance={8.0}
      />
    </group>
  );
}
