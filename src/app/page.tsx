"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Overlay from "@/components/Overlay"; 
import ScrollPadButton from "@/components/ScrollPadButton";
import ContactPage from "@/components/contacts"; // Imports your self-contained contact component

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContact, setShowContact] = useState(false); // Manages contact overlay visibility
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
      {/* 3D WebGL Canvas Layer */}
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
            
            {/* Contact Button (Bottom Left) */}
            <button
              onClick={() => setShowContact(true)}
              className="
                relative -top-4 sm:-top-6 md:-top-8
                px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3
                text-xs sm:text-sm md:text-base
                rounded-full
                bg-white/60 text-black
                font-mono font-bold tracking-wider md:tracking-widest uppercase
                hover:scale-105 transition-all
                shadow-[0_0_30px_rgba(255,255,255,0.3)]
                pointer-events-auto
                flex items-center justify-center gap-2
              "
            >
              Contact
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0"
              >
                <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Work Process Button (Bottom Right) */}
            <Link href="/work-process" className="pointer-events-auto">
              <button
                className="
                  relative -top-4 sm:-top-6 md:-top-8
                  px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3
                  text-xs sm:text-sm md:text-base
                  rounded-full
                  bg-white/60 text-black
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

      {/* FULL SCREEN CONTACT OVERLAY SYSTEM */}
      {showContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-[fadeIn_0.25s_ease-out_forwards]">
          
          {/* Top-Right Sticky Dismiss Button */}
          <button 
            onClick={() => setShowContact(false)}
            className="fixed top-6 right-6 z-50 bg-white/10 hover:bg-white/20 hover:text-cyan-400 text-white rounded-full px-5 py-2.5 font-mono text-xs tracking-wider transition-all shadow-xl border border-white/10 active:scale-95"
          >
            ✕ CLOSE
          </button>

          {/* Mounts your galaxy space backdrop and responsive cards */}
          <ContactPage />
        </div>
      )}

      {/* Tall Scroll Tracker Container */}
      <div ref={scrollContainerRef} className="h-[500vh] w-full pointer-events-none relative z-10" />
    </>
  );
}