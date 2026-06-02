"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Overlay from "@/components/Overlay";

// Dynamically import Scene (WebGL) with no SSR
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

// Register GSAP plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set up scroll listener using GSAP ScrollTrigger
  useEffect(() => {
    if (!isLoaded) return;

    // The scroll container is a tall div that acts as the scroll driver
    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [isLoaded]);

  return (
    <>
      {/* ── Fixed 3D WebGL Canvas ── */}
      <Scene scrollProgress={scrollProgress} isLoaded={isLoaded} />

      {/* ── Fixed Overlay UI (preloader + nav + stage info) ── */}
      <Overlay
        scrollProgress={scrollProgress}
        isLoaded={isLoaded}
        setIsLoaded={setIsLoaded}
      />

      {/* ── Scroll Driver: tall invisible div that creates the scroll height ── */}
      {/* 600vh gives a comfortable scrollable length for all 12 stages */}
      <div
        ref={scrollContainerRef}
        id="scroll-driver"
        style={{ height: "600vh", width: "100%", pointerEvents: "none" }}
        aria-hidden="true"
      />
    </>
  );
}
