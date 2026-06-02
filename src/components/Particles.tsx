"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// 1. SHADER FOR NOZZLE MIST & SPARKS (Paints particles from nozzle)
const SprayParticleShader = {
  uniforms: {
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uSprayPos: { value: new THREE.Vector3(0, 5, 0) },
    uIsSpraying: { value: 0.0 }, // 0 = off, 1 = active
  },
  vertexShader: `
    uniform float uTime;
    uniform float uScrollProgress;
    uniform vec3 uSprayPos;
    uniform float uIsSpraying;
    attribute vec3 aVelocity;
    attribute float aRandom;
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      float lifetime = 1.2;
      float localTime = mod(uTime * 1.5 + aRandom * lifetime, lifetime);

      vec3 pos = vec3(-9999.0);

      if (uIsSpraying > 0.5 && uScrollProgress < 0.8) {
        pos = uSprayPos + (aVelocity * localTime * 2.2);
        pos.y -= localTime * localTime * 0.5; 
        pos.x += sin(pos.y * 3.0 + uTime) * 0.15 * aRandom;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      gl_PointSize = (12.0 * (1.0 - (localTime / lifetime))) * (20.0 / -mvPosition.z);

      vAlpha = (1.0 - (localTime / lifetime)) * uIsSpraying * (1.0 - smoothstep(0.6, 0.8, uScrollProgress));

      // Color variation: Blend between deep violet and high-intensity electric purple
      if (aRandom < 0.5) {
        vColor = vec3(0.0, 0.83, 1.0);   // Electric Purple
        } else {
          vColor = vec3(0.36, 0.05, 0.76); // Deep Royal Violet
      }
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float dist = length(uv);
      if (dist > 0.5) {
        discard;
      }
      
      float intensity = smoothstep(0.5, 0.0, dist);
      intensity = pow(intensity, 1.8); 

      gl_FragColor = vec4(vColor, intensity * vAlpha * 0.85);
    }
  `,
};

// 2. SHADER FOR NEON FIREWORK EXPLOSION (Shockwave rings and plasma streaks)
const ExplosionShader = {
  uniforms: {
    uTime: { value: 0 },
    uExplosionProgress: { value: 0 }, 
  },
  vertexShader: `
    uniform float uTime;
    uniform float uExplosionProgress;
    attribute vec3 aDir; 
    attribute float aRandom;
    attribute float aType; 
    varying float vAlpha;
    varying vec3 vColor;
    varying float vType;

    void main() {
      vType = aType;
      vec3 pos = vec3(0.0);

      if (uExplosionProgress > 0.0) {
        if (aType < 0.5) {
          float ringSpeed = 26.0;
          float currentRadius = uExplosionProgress * ringSpeed;
          
          pos.x = currentRadius * aDir.x;
          pos.z = currentRadius * aDir.z;
          pos.y = sin(currentRadius * 0.8 + aRandom * 6.28) * 0.8 * (1.0 - uExplosionProgress);
        } else {
          float sphereSpeed = 32.0;
          float factor = pow(uExplosionProgress, 0.7);
          pos = aDir * factor * sphereSpeed;
          
          pos.x += sin(pos.y * 0.5 + uTime * 5.0) * 0.3 * aRandom;
          pos.z += cos(pos.x * 0.5 + uTime * 5.0) * 0.3 * aRandom;
        }
      } else {
        pos = vec3(-9999.0);
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float baseSize = (aType < 0.5) ? 14.0 : 8.0;
      gl_PointSize = baseSize * (1.0 - uExplosionProgress) * (20.0 / -mvPosition.z);

      vAlpha = (1.0 - uExplosionProgress);

      // Explosive shockwaves themed with deep violet and sharp purple highlights
      if (aType < 0.5) {
        if (aRandom < 0.75) {
          vColor = vec3(0.58, 0.0, 1.0);   // Electric Purple
        } else {
          vColor = vec3(1.0, 0.85, 1.0);  // Soft White Core with Violet Tint
        }
      } else {
        if (aRandom < 0.65) {
          vColor = vec3(0.36, 0.05, 0.76); // Deep Royal Violet
        } else {
          vColor = vec3(1.0, 1.0, 1.0);   // Bright White Spark
        }
      }
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vColor;
    varying float vType;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float dist = length(uv);
      if (dist > 0.5) {
        discard;
      }
      
      float intensity = smoothstep(0.5, 0.0, dist);
      
      if (vType > 0.5) {
        intensity = pow(intensity, 2.5); 
      } else {
        intensity = pow(intensity, 1.5); 
      }

      gl_FragColor = vec4(vColor, intensity * vAlpha * 0.95);
    }
  `,
};

interface ParticlesProps {
  scrollProgress: number;
  sprayPos: THREE.Vector3;
  isSpraying: boolean;
}

export default function Particles({ scrollProgress, sprayPos, isSpraying }: ParticlesProps) {
  const sprayMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const explosionMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const sprayCount = 1500;
  const explosionCount = 4500;

  const [sprayPositions, sprayVelocities, sprayRandoms] = useMemo(() => {
    const pos = new Float32Array(sprayCount * 3);
    const vel = new Float32Array(sprayCount * 3);
    const rnd = new Float32Array(sprayCount);

    for (let i = 0; i < sprayCount; i++) {
      pos[i * 3 + 0] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.5 + 0.5); 
      
      const speed = Math.random() * 0.8 + 0.2;
      vel[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = -Math.cos(phi) * speed * 1.5; 
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      rnd[i] = Math.random();
    }

    return [pos, vel, rnd];
  }, []);

  const [expPositions, expDirs, expRandoms, expTypes] = useMemo(() => {
    const pos = new Float32Array(explosionCount * 3);
    const dirs = new Float32Array(explosionCount * 3);
    const rnd = new Float32Array(explosionCount);
    const types = new Float32Array(explosionCount); 

    for (let i = 0; i < explosionCount; i++) {
      pos[i * 3 + 0] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      rnd[i] = Math.random();

      if (i < explosionCount * 0.45) {
        types[i] = 0.0;
        const angle = Math.random() * Math.PI * 2;
        dirs[i * 3 + 0] = Math.cos(angle);
        dirs[i * 3 + 1] = (Math.random() - 0.5) * 0.05; 
        dirs[i * 3 + 2] = Math.sin(angle);
      } else {
        types[i] = 1.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2.0 - 1.0); 
        
        dirs[i * 3 + 0] = Math.sin(phi) * Math.cos(theta);
        dirs[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
        dirs[i * 3 + 2] = Math.cos(phi);
      }
    }

    return [pos, dirs, rnd, types];
  }, []);

  useFrame((state) => {
    if (sprayMaterialRef.current) {
      sprayMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      sprayMaterialRef.current.uniforms.uScrollProgress.value = scrollProgress;
      sprayMaterialRef.current.uniforms.uSprayPos.value.copy(sprayPos);
      
      const targetIsSpraying = isSpraying ? 1.0 : 0.0;
      sprayMaterialRef.current.uniforms.uIsSpraying.value = THREE.MathUtils.lerp(
        sprayMaterialRef.current.uniforms.uIsSpraying.value,
        targetIsSpraying,
        0.15
      );
    }

    if (explosionMaterialRef.current) {
      explosionMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      if (scrollProgress >= 0.9) {
        const factor = (scrollProgress - 0.9) / 0.1; 
        explosionMaterialRef.current.uniforms.uExplosionProgress.value = factor;
      } else {
        explosionMaterialRef.current.uniforms.uExplosionProgress.value = 0.0;
      }
    }
  });

  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sprayPositions, 3]} />
          <bufferAttribute attach="attributes-aVelocity" args={[sprayVelocities, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[sprayRandoms, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={sprayMaterialRef}
          args={[SprayParticleShader]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[expPositions, 3]} />
          <bufferAttribute attach="attributes-aDir" args={[expDirs, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[expRandoms, 1]} />
          <bufferAttribute attach="attributes-aType" args={[expTypes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={explosionMaterialRef}
          args={[ExplosionShader]}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}