"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BackgroundShader = {
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    attribute float aSize;
    attribute float aRandom;
    attribute vec3 aSpiralParams;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float radius = aSpiralParams.x;
      float angleOffset = aSpiralParams.y;
      float speed = aSpiralParams.z;

      // Constant, slow cosmic background rotation
      float angle = angleOffset + uTime * 0.03 * speed;
      
      // 1. Generate core flat galaxy disk geometry
      vec3 pos = vec3(0.0);
      pos.x = radius * cos(angle);
      pos.z = radius * sin(angle);
      pos.y = sin(angle * 2.0 + uTime * 0.1) * 0.5 * aRandom;

      // 2. Rotate the entire galaxy to match your reference image perspective
      // This applies a cinematic pitch and roll to angle it diagonally across the frame
      float pitch = -0.45; // Tilt forward/backward
      float roll = 0.65;   // Tilt diagonally across the screen axis

      // Pitch rotation matrix
      mat3 matPitch = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(pitch), -sin(pitch),
        0.0, sin(pitch), cos(pitch)
      );

      // Roll rotation matrix
      mat3 matRoll = mat3(
        cos(roll), -sin(roll), 0.0,
        sin(roll), cos(roll), 0.0,
        0.0, 0.0, 1.0
      );

      pos = matRoll * matPitch * pos;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      gl_PointSize = aSize * (35.0 / -mvPosition.z);

      // Match the premium icy-cyan energy trail colors
      if (aRandom < 0.45) {
        vColor = vec3(0.0, 0.83, 1.0); // Vivid Cyan
      } else if (aRandom < 0.85) {
        vColor = vec3(0.22, 0.9, 1.0); // Bright Icy Blue
      } else {
        vColor = vec3(1.0, 1.0, 1.0);  // Core Starlight White
      }

      vAlpha = smoothstep(60.0, 20.0, length(pos));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 centerUv = gl_PointCoord - vec2(0.5);
      float dist = length(centerUv);
      if (dist > 0.5) discard;
      float glow = pow(smoothstep(0.5, 0.0, dist), 2.5);
      gl_FragColor = vec4(vColor, glow * vAlpha * 0.9);
    }
  `,
};

export default function ContactBG() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const particleCount = 6000; // Boosted density slightly to capture the image depth

  const [positions, sizes, randoms, spiralParams] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    const rnd = new Float32Array(particleCount);
    const params = new Float32Array(particleCount * 3);
    const branches = 3; // Dense cosmic arms matching the image trail

    for (let i = 0; i < particleCount; i++) {
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      const radius = Math.pow(Math.random(), 1.8) * 32.0 + 0.1;
      const spinAngle = radius * 0.18;

      pos[i * 3 + 0] = (Math.random() - 0.5) * (1.5 + radius * 0.05);
      pos[i * 3 + 1] = (Math.random() - 0.5) * (1.0 + radius * 0.02);
      pos[i * 3 + 2] = (Math.random() - 0.5) * (1.5 + radius * 0.05);

      sz[i] = Math.random() * 2.2 + 0.6;
      rnd[i] = Math.random();

      params[i * 3 + 0] = radius;
      params[i * 3 + 1] = branchAngle + spinAngle;
      params[i * 3 + 2] = Math.random() * 0.4 + 0.6;
    }
    return [pos, sz, rnd, params];
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
        <bufferAttribute attach="attributes-aSpiralParams" args={[spiralParams, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[BackgroundShader]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}