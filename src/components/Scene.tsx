"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// FIXED: Explicit named import from the standard drei library core
import { OrbitControls } from "@react-three/drei";

import Galaxy from "./Galaxy";
import SprayCan from "./SprayCan";
import Particles from "./Particles";
import Text3DSection from "./Text3DSection";
import PostProcessing from "./PostProcessing";

interface SceneProps {
  scrollProgress: number;
  isLoaded: boolean;
  minimal?: boolean; 
}

export default function Scene({ scrollProgress, isLoaded, minimal = false }: SceneProps) {
  const [shake, setShake] = useState(0);
  
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
        camera={{ position: [0, 0, 17] }}
      >
        <ambientLight intensity={0.2} />
        
        <Suspense fallback={null}>
          <group position={[0, shake * 0.1, 0]}>
            <Galaxy scrollProgress={scrollProgress} />

            {!minimal && (
              <>
                <Text3DSection
                  scrollProgress={scrollProgress}
                  sprayPos={canPosRef.current}
                  setCameraShake={handleSetShake}
                />
                <SprayCan
                  scrollProgress={scrollProgress}
                  canPosRef={canPosRef}
                  isSprayingRef={isSprayingRef}
                />
                <Particles
                  scrollProgress={scrollProgress}
                  sprayPos={canPosRef.current}
                  isSpraying={isSprayingRef.current}
                />
              </>
            )}
          </group>

          <PostProcessing scrollProgress={scrollProgress} />
        </Suspense>

        {/* FIXED: Standardized canvas listener context mapping */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.8}
          target={[0, 1.5, 0]}
        />
      </Canvas>
    </div>
  );
}