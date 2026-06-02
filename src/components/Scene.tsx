"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

import Galaxy from "./Galaxy";
import SprayCan from "./SprayCan";
import Particles from "./Particles";
import Text3DSection from "./Text3DSection";
import PostProcessing from "./PostProcessing";

interface SceneProps {
  scrollProgress: number;
  isLoaded: boolean;
}

export default function Scene({ scrollProgress, isLoaded }: SceneProps) {
  const [shake, setShake] = useState(0);
  
  // Shared structural references for spatial logic
  const canPosRef = useRef(new THREE.Vector3(-12, 5, 4));
  const isSprayingRef = useRef(false);

  const handleSetShake = useCallback((v: number) => {
    setShake(v);
    if (v > 0) setTimeout(() => setShake(0), 180);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full select-none pointer-events-auto bg-black">
      <Canvas
        id="main-canvas"
        className="w-full h-full"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
        }}
        // Adjusted position Z from 14 to 17 to give the 3D text comfortable framing boundaries
        camera={{ fov: 55, near: 0.1, far: 200, position: [0, 1.2, 17.5] }}
      >
        {/* Lights */}
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 15, 10]} intensity={0.6} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#00d4ff" />

        <Suspense fallback={null}>
          <group>
            {/* Interactive Background Stars */}
            <Galaxy scrollProgress={scrollProgress} />

            {/* Core Animated Typography */}
            <Text3DSection
              scrollProgress={scrollProgress}
              sprayPos={canPosRef.current}
              setCameraShake={handleSetShake}
            />

            {/* Spray Floating Canister Asset */}
            <SprayCan
              scrollProgress={scrollProgress}
              canPosRef={canPosRef}
              isSprayingRef={isSprayingRef}
            />

            {/* Dynamic Volumetric Mist & Sparks Layer */}
            <Particles
              scrollProgress={scrollProgress}
              sprayPos={canPosRef.current}
              isSpraying={isSprayingRef.current}
            />
          </group>

          {/* Cinematic Compositing Post Filters */}
          <PostProcessing scrollProgress={scrollProgress} />
        </Suspense>

        {/* OrbitControls configured with the pulled back zoom framing depth */}
        <OrbitControls
          enableZoom={false}       // Keeps camera locked at the new standard depth layout
          enablePan={false}        // Prevents users from breaking target lookAt tracking
          enableDamping={true}     // Adds premium weight profile to dragging actions
          dampingFactor={0.05}     // Speed profile of drag friction glide
          rotateSpeed={0.8}        // Adjusts drag sensitivity
          target={[0, 1.5, 0]}     // Framed slightly higher up on Y axis to match text elevation limits
        />
      </Canvas>
    </div>
  );
}