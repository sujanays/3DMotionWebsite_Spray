"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── GLSL Simplex Noise ───────────────────────────────────────────────────────
const simplexNoiseGLSL = `
  vec4 _permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 _taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0*C.xxx;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = _permute(_permute(_permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 xs = x_ * ns.x + ns.yyyy;
    vec4 ys = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(xs) - abs(ys);
    vec4 b0 = vec4(xs.xy, ys.xy);
    vec4 b1 = vec4(xs.zw, ys.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = _taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// ─── Text/Surface Shader ─────────────────────────────────────────────────────
const buildTextShader = () => ({
  uniforms: {
    uTime:           { value: 0 },
    uScrollProgress: { value: 0 },
    uSprayPos:       { value: new THREE.Vector3(-20, 20, 0) },
  },
  vertexShader: `
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uScrollProgress;
    uniform vec3 uSprayPos;
    varying vec3 vWorldPos;
    varying vec3 vNormal;

    ${simplexNoiseGLSL}

    void main() {
      float noise = snoise(vWorldPos * 0.9) * 0.5;
      float sprayDist = distance(vWorldPos, uSprayPos);

      float progress = clamp((uScrollProgress - 0.2) / 0.4, 0.0, 1.0);
      float revealLine = smoothstep(0.7, 0.1, uSprayPos.x - vWorldPos.x + noise * 0.2);
      float revealHalo = smoothstep(0.5, 0.05, 0.9 - sprayDist);
      float paintEdge = clamp(max(revealLine, revealHalo) * progress, 0.0, 1.0);

      vec3 dark = vec3(0.015, 0.01, 0.025);
      
      vec3 neonA = vec3(0.0, 0.83, 1.0);   // Neon Blue
      vec3 neonB = vec3(0.58, 0.0, 1.0);   // Electric Purple
      vec3 painted = mix(neonA, neonB, sin(vWorldPos.x * 0.5 + uTime * 2.0) * 0.5 + 0.5);

      if (uScrollProgress >= 0.9) {
        paintEdge = 1.0;
      }

      float metal = pow(max(dot(vNormal, normalize(vec3(0.4, 0.8, 0.9))), 0.0), 1.7);
      vec3 base = dark + vec3(0.04 * metal + noise * 0.01);
      vec3 col = mix(base, painted, paintEdge * 0.85);

      float glow = paintEdge * (0.35 + sin(uTime * 3.3 + vWorldPos.x) * 0.04);
      if (uScrollProgress >= 0.9) {
        glow = 0.0;
      }
      
      float ndl = max(0.2, dot(vNormal, normalize(vec3(0.5, 1.0, 0.8))));
      col = col * ndl + painted * glow * 0.35;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
});

// ─── Edge Contour Shader ─────────────────────────────────────────────────────
const buildOutlineShader = () => ({
  uniforms: {
    uTime:           { value: 0 },
    uScrollProgress: { value: 0 },
    uSprayPos:       { value: new THREE.Vector3(-20, 20, 0) },
  },
  vertexShader: `
    varying vec3 vWorldPos;
    varying vec3 vPos;
    void main() {
      vPos = position;
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uScrollProgress;
    uniform vec3 uSprayPos;
    varying vec3 vWorldPos;
    varying vec3 vPos;

    void main() {
      float isActive = smoothstep(0.52, 0.7, uScrollProgress);
      float pulse = pow(sin(vPos.x * 1.2 - uTime * 7.5) * 0.5 + 0.5, 12.0);
      float neonGlow = 1.0 - smoothstep(0.0, 1.6, distance(vWorldPos, uSprayPos));
      float edgeEnergy = pulse * max(isActive, neonGlow);

      vec3 col = mix(vec3(0.0, 0.83, 1.0), vec3(0.58, 0.0, 1.0), pulse);
      float intensity = 0.12 + edgeEnergy * 0.8;
      
      if (uScrollProgress >= 0.9) {
        intensity = 0.0;
      }
      
      gl_FragColor = vec4(col * intensity, intensity * 0.45);
    }
  `,
});

// ─── Definition of Substrate Pieces ──────────────────────────────────────────
// Different types of structural configurations to resemble a mechanical fabrication
type ShapeType = "plate" | "pillar" | "ring" | "block";

interface SubstrateItem {
  type: ShapeType;
  x: number;
  args: any[];
  rot?: [number, number, number];
}

const METALLIC_SUBSTRATES: SubstrateItem[] = [
  { type: "plate",  x: -11.0, args: [0.4, 2.8, 1.4] },                     // Heavy left endplate bulkhead
  { type: "pillar", x: -8.8,  args: [0.25, 0.25, 2.5, 4], rot: [0, 0, 0] }, // Squared vertical pillar
  { type: "ring",   x: -6.6,  args: [0.9, 1.2, 0.5, 6], rot: [0, 0, 0] },  // Hexagonal framework junction
  { type: "block",  x: -4.5,  args: [1.3, 0.4, 1.0] },                     // Horizontal frame tracker
  { type: "pillar", x: -2.3,  args: [0.15, 0.15, 2.5, 8] },                // Conduit channel tube
  { type: "block",  x: 0.0,   args: [1.5, 1.5, 1.5] },                     // Central alignment main anchor block
  { type: "plate",  x: 2.3,   args: [2.0, 0.3, 0.8] },                     // Horizontal runner cross bar
  { type: "ring",   x: 4.5,   args: [0.8, 1.1, 0.6, 16], rot: [Math.PI/2, 0, 0] }, // Cylindrical mechanical coupler
  { type: "pillar", x: 6.8,   args: [0.3, 0.3, 2.4, 4], rot: [0, 0, Math.PI/4] }, // Rotated structural column
  { type: "block",  x: 9.0,   args: [1.2, 1.2, 0.5] },                     // Frontal mesh mounting backing
  { type: "plate",  x: 11.2,  args: [0.4, 2.8, 1.4] },                     // Heavy right endplate bulkhead
];

interface Props {
  scrollProgress: number;
  sprayPos: THREE.Vector3;
  setCameraShake: (val: number) => void;
}

export default function Text3DSection({ scrollProgress, sprayPos, setCameraShake }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const textMat = useMemo(() => new THREE.ShaderMaterial({
    ...buildTextShader(), transparent: false,
  }), []);

  const outlineMat = useMemo(() => new THREE.ShaderMaterial({
    ...buildOutlineShader(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useEffect(() => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;

    // Initialize initial scatter positions falling from space
    children.forEach((c) => {
      c.position.y = 22;
      c.rotation.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      );
      c.scale.set(1.05, 1.05, 1.05);
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-driver",
        start: "top top",
        end: "20% top",
        scrub: 1.5,
      },
    });

    METALLIC_SUBSTRATES.forEach((_, i) => {
      const meshGroup = children[i];
      if (!meshGroup) return;

      tl.to(
        meshGroup.position,
        {
          y: -0.5,
          duration: 1.0,
          ease: "bounce.out",
          onUpdate() {
            const y = meshGroup.position.y;
            if (y < 0.5 && y > -0.1) {
              setCameraShake(0.09); // Impact slam effect on layout assembly
            }
          },
        },
        i * 0.08
      )
      .to(
        meshGroup.rotation,
        {
          x: METALLIC_SUBSTRATES[i].rot?.[0] ?? 0,
          y: METALLIC_SUBSTRATES[i].rot?.[1] ?? 0,
          z: METALLIC_SUBSTRATES[i].rot?.[2] ?? 0,
          duration: 1.1,
          ease: "power3.out",
        },
        i * 0.08
      )
      .to(
        meshGroup.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.1,
          ease: "elastic.out(1, 0.5)",
        },
        i * 0.08
      );
    });

    return () => { tl.kill(); };
  }, [setCameraShake]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    textMat.uniforms.uTime.value           = t;
    textMat.uniforms.uScrollProgress.value = scrollProgress;
    textMat.uniforms.uSprayPos.value.copy(sprayPos);

    outlineMat.uniforms.uTime.value           = t;
    outlineMat.uniforms.uScrollProgress.value = scrollProgress;
    outlineMat.uniforms.uSprayPos.value.copy(sprayPos);

    if (groupRef.current) {
      if (scrollProgress >= 0.6) {
        const factor = Math.min(1.0, (scrollProgress - 0.6) / 0.3);
        const targetY = -0.5 + factor * 7.5; 
        
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          targetY,
          0.08
        );
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          -0.5,
          0.1
        );
      }
    }
  });

  // Helper renderer to pick corresponding geometries cleanly
  const renderGeometry = (item: SubstrateItem) => {
    switch (item.type) {
      case "plate":
      case "block":
        return <boxGeometry args={item.args as [number, number, number]} />;
      case "pillar":
        return <cylinderGeometry args={item.args as [number, number, number, number]} />;
      case "ring":
        return <cylinderGeometry args={item.args as [number, number, number, number]} />; // Acts as industrial couplers
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <group ref={groupRef}>
      {METALLIC_SUBSTRATES.map((item, i) => (
        <group key={i} position={[item.x, 22, 0]}>
          {/* Main solid structural object body layer */}
          <mesh material={textMat}>
            {renderGeometry(item)}
          </mesh>
          
          {/* Outer wireframe neon emission glow layout layer */}
          <mesh material={outlineMat}>
            {renderGeometry(item)}
          </mesh>
        </group>
      ))}
    </group>
  );
}