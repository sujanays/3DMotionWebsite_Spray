"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Custom shader for the interactive deep-space galaxy
const GalaxyShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uColorBlue: { value: new THREE.Color("#00D4FF") },
    uColorCyan: { value: new THREE.Color("#39E7FF") },
    uColorWhite: { value: new THREE.Color("#FFFFFF") },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uScrollProgress;
    attribute float aSize;
    attribute float aRandom;
    attribute vec3 aSpiralParams; // radius, angleOffset, speed
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float radius = aSpiralParams.x;
      float angleOffset = aSpiralParams.y;
      float speed = aSpiralParams.z;

      // 1. Calculate slow galaxy rotation over time
      float angle = angleOffset + uTime * 0.05 * speed;
      
      // 2. Add subtle gravity swirl attraction as text activates
      // As scroll increases, particles slightly contract/gravitate toward center coordinates
      float contraction = 1.0 - (uScrollProgress * 0.15 * (1.0 - smoothstep(10.0, 30.0, radius)));
      float activeRadius = radius * contraction;
      
      // Spiral math (X and Z form the flat galaxy disc, Y is height noise)
      vec3 pos = vec3(0.0);
      pos.x = activeRadius * cos(angle);
      pos.z = activeRadius * sin(angle);
      pos.y = position.y + sin(angle * 2.0 + uTime * 0.2) * 0.8 * aRandom;

      // 3. Energy wave ripple based on explosion stage (scroll > 0.9)
      if (uScrollProgress > 0.9) {
        float explosionFactor = (uScrollProgress - 0.9) / 0.1; // 0 to 1
        float waveProgress = explosionFactor * 45.0; // expanding wave radius
        float distToCenter = length(pos);
        
        // Ring ripple displacement
        float wave = sin(distToCenter - waveProgress * 2.0) * 2.5 * (1.0 - smoothstep(0.0, 15.0, abs(distToCenter - waveProgress)));
        pos.y += wave;
        pos.x += wave * cos(angle) * 0.5;
        pos.z += wave * sin(angle) * 0.5;
      }

      // Calculate camera space coordinates
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // 4. Star size and depth attenuation (closer particles are larger)
      gl_PointSize = aSize * (30.0 / -mvPosition.z);

      // 5. Blended Color distribution (Neon blue core, cyan arms, white stars)
      if (aRandom < 0.45) {
        vColor = vec3(0.0, 0.83, 1.0); // Neon Blue
      } else if (aRandom < 0.85) {
        vColor = vec3(0.22, 0.9, 1.0);  // Cyan
      } else {
        vColor = vec3(1.0, 1.0, 1.0);  // White sparks
      }

      // Volumetric atmospheric fade based on distance
      vAlpha = smoothstep(50.0, 15.0, length(pos));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // 1. Draw glowing circular soft stars (fade edges)
      vec2 centerUv = gl_PointCoord - vec2(0.5);
      float dist = length(centerUv);
      
      if (dist > 0.5) {
        discard;
      }

      // Soft circular Gaussian-like falloff
      float glow = smoothstep(0.5, 0.0, dist);
      glow = pow(glow, 2.5); // sharpen center

      gl_FragColor = vec4(vColor, glow * vAlpha * 0.95);
    }
  `,
};

interface GalaxyProps {
  scrollProgress: number; // 0 to 1
}

export default function Galaxy({ scrollProgress }: GalaxyProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const particleCount = 6000;

  // Generate procedural spiral coordinates and parameters
  const [positions, sizes, randoms, spiralParams] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    const rnd = new Float32Array(particleCount);
    const params = new Float32Array(particleCount * 3); // radius, angleOffset, speed

    const branches = 4; // 4 spiral arms

    for (let i = 0; i < particleCount; i++) {
      // Branch offset
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      
      // Radius distribution: dense near center, sparse near outer edges
      const radius = Math.pow(Math.random(), 2.0) * 32.0 + 0.2;
      
      // Curved spiral arm wrap
      const spinAngle = radius * 0.22;
      const randomX = (Math.random() - 0.5) * (1.2 + radius * 0.08);
      const randomY = (Math.random() - 0.5) * (0.8 + radius * 0.04);
      const randomZ = (Math.random() - 0.5) * (1.2 + radius * 0.08);

      // Save baseline height into geometry positions
      pos[i * 3 + 0] = randomX;
      pos[i * 3 + 1] = randomY; // height noise
      pos[i * 3 + 2] = randomZ;

      sz[i] = Math.random() * 2.8 + 0.5; // star size
      rnd[i] = Math.random();

      // Spiral parameters to be computed dynamically on GPU
      params[i * 3 + 0] = radius;
      params[i * 3 + 1] = branchAngle + spinAngle;
      params[i * 3 + 2] = Math.random() * 0.6 + 0.4; // speed multiplier
    }

    return [pos, sz, rnd, params];
  }, []);

  // Update uniforms in render loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smoothly interpolate scroll progress for visual inertia
      const currentVal = materialRef.current.uniforms.uScrollProgress.value;
      materialRef.current.uniforms.uScrollProgress.value = THREE.MathUtils.lerp(
        currentVal,
        scrollProgress,
        0.08
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          args={[randoms, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpiralParams"
          args={[spiralParams, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[GalaxyShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
