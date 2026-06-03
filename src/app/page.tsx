"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Overlay from "@/components/Overlay"; 
import ScrollPadButton from "@/components/ScrollPadButton"; // We will build this next

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const trigger = ScrollTrigger.create({
      trigger: scrollContainerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => setScrollProgress(self.progress),
    });
    return () => trigger.kill();
  }, [isLoaded]);

  return (
    <>
      {/* 3D WebGL Canvas Layer - Captures individual finger gestures directly */}
      <div className="fixed inset-0 z-0 pointer-events-auto touch-none">
        <Scene scrollProgress={scrollProgress} isLoaded={isLoaded} />
      </div>
      
      {/* HUD Content Overlay Layer */}
      <Overlay scrollProgress={scrollProgress} isLoaded={isLoaded} setIsLoaded={setIsLoaded} />

      {/* Main UI Controls Layer */}
      {isLoaded && (
        <>
          {/* Bottom Navigation Buttons */}
          <div className="fixed inset-0 z-20 flex items-end justify-between p-4 sm:p-6 md:p-10 pointer-events-none">
            <button
              className="
                relative -top-4 sm:-top-6 md:-top-8
                px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3
                text-xs sm:text-sm md:text-base
                rounded-full
                bg-white/50 text-black
                font-mono font-bold tracking-wider md:tracking-widest uppercase
                hover:scale-105 transition-all
                shadow-[0_0_30px_rgba(255,255,255,0.3)]
                pointer-events-auto
              "
            >
              Contact Us
            </button>

            <Link href="/work-process" className="pointer-events-auto">
              <button
                className="
                  relative -top-4 sm:-top-6 md:-top-8
                  px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3
                  text-xs sm:text-sm md:text-base
                  rounded-full
                  bg-white/50 text-black
                  font-mono font-bold tracking-wider md:tracking-widest uppercase
                  hover:scale-105 transition-all
                  shadow-[0_0_30px_rgba(255,255,255,0.3)]
                "
              >
                Work Process
              </button>
            </Link>
          </div>

          {/* Dedicated Tactile Mobile Scroll Pad Component */}
          <ScrollPadButton />
        </>
      )}

      {/* Tall Scroll Tracker Container - Set to pointer-events-none so it doesn't block touch gestures */}
      <div ref={scrollContainerRef} className="h-[500vh] w-full pointer-events-none relative z-10" />
    </>
  );
}