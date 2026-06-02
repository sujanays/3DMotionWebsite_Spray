"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Combined Chromatic Aberration + Vignette shader
const ChromaVignetteShader = {
  uniforms: {
    tDiffuse:           { value: null },
    uOffset:            { value: 0.002 },
    uVignetteDarkness:  { value: 1.2 },
    uVignetteOffset:    { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    uniform float uVignetteDarkness;
    uniform float uVignetteOffset;
    varying vec2 vUv;

    void main() {
      // Chromatic aberration (RGB shift)
      vec4 cR = texture2D(tDiffuse, vUv + vec2(uOffset, 0.0));
      vec4 cG = texture2D(tDiffuse, vUv);
      vec4 cB = texture2D(tDiffuse, vUv - vec2(uOffset, 0.0));
      vec4 color = vec4(cR.r, cG.g, cB.b, cG.a);

      // Vignette
      vec2 uv = vUv - 0.5;
      float vignette = smoothstep(uVignetteOffset, uVignetteOffset - 0.5, length(uv) * uVignetteDarkness);
      color.rgb *= mix(1.0, vignette, 0.75);

      gl_FragColor = color;
    }
  `,
};

interface PostProcessingProps {
  scrollProgress: number;
}

export default function PostProcessing({ scrollProgress }: PostProcessingProps) {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloom, chromaVignette } = useMemo(() => {
    const comp = new EffectComposer(gl);

    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.75,  // Reduced baseline strength
      0.5,   // radius
      0.15   // threshold
    );
    comp.addPass(bloomPass);

    const cvPass = new ShaderPass(ChromaVignetteShader);
    cvPass.renderToScreen = true;
    comp.addPass(cvPass);

    return { composer: comp, bloom: bloomPass, chromaVignette: cvPass };
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);

  useFrame((state) => {
    const sp = scrollProgress;

    let strength = 0.85; 
    let aberration = 0.0012;

    if (sp >= 0.7 && sp < 0.8) {
      const f = (sp - 0.7) / 0.1;
      strength = 0.85 + f * 0.4;
    } else if (sp >= 0.8 && sp < 0.9) {
      const f = (sp - 0.8) / 0.1;
      strength = 1.25 + f * 0.55;
      aberration = 0.0012 + f * 0.0018;
    } else if (sp >= 0.9) {
      // Complete removal of post-processing bloom glow at final rest layout
      strength = 0.0;
      aberration = 0.0;
    }

    bloom.strength = strength;
    chromaVignette.uniforms.uOffset.value = aberration;

    composer.render();
  }, 1);

  return null;
}