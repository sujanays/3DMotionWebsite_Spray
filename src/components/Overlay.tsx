"use client";

import { useEffect, useState } from "react";

interface OverlayProps {
  scrollProgress: number; // 0 to 1
  isLoaded: boolean;
  setIsLoaded: (val: boolean) => void;
}

export default function Overlay({ scrollProgress, isLoaded, setIsLoaded }: OverlayProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate premium asset load
  useEffect(() => {
    if (isLoaded) return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 600); // smooth fade
          return 100;
        }
        // Quadratic-like slowing for realism
        const increment = Math.max(1, Math.floor((100 - prev) * 0.15));
        return prev + increment;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isLoaded, setIsLoaded]);

  // Determine current active stage based on scrollProgress (0 to 1)
  const getStageInfo = () => {
    if (scrollProgress < 0.2) {
      return {
        number: "I",
        title: "THE GENERESIS",
        desc: "Extruded 3D characters drop individually from the void with physics-inspired weight.",
      };
    } else if (scrollProgress < 0.6) {
      return {
        number: "II",
        title: "THE DEPOSITION",
        desc: "A metallic spray canister traces a spline, painting the surface in organic neon blue.",
      };
    } else if (scrollProgress < 0.8) {
      return {
        number: "III",
        title: "THE EDGE OF LIGHT",
        desc: "Emissive electricity propagates along the contours of the typography, igniting the contours.",
      };
    } else if (scrollProgress < 0.9) {
      return {
        number: "IV",
        title: "THE EPICENTER",
        desc: "The spray canister descends to screen center, drawing space dust into its charging core.",
      };
    } else {
      return {
        number: "V",
        title: "FINAL ARTIFACT",
        desc: "The typography moves to structural focal display, illuminated completely in stable electric neon paint.",
      };
    }
  };

  const stage = getStageInfo();

  return (
    <>
      {/* 1. LUXURY PRELOADER SCREEN */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-black p-8 transition-all duration-1000 ease-in-out ${
          isLoaded ? "opacity-0 pointer-events-none translate-y-[-10px]" : "opacity-100"
        }`}
      >
        <div />
        
        {/* Loader Center Text */}
        <div className="text-center select-none">
          <h1 className="text-4xl font-extralight tracking-[0.4em] text-white opacity-90 transition-all uppercase sm:text-5xl">
            NANJUNDESHWARA ENTERPRISES
          </h1>
          <p className="mt-4 text-xs font-light tracking-[0.6em] text-cyan-400 opacity-80">
            INDUSTRIAL PROTECTIVE POWDER APPLICATION 
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="flex flex-col items-center w-full max-w-[280px] gap-4 mb-8">
          <div className="flex justify-between w-full text-[10px] font-mono tracking-widest text-neutral-500">
            <span>INIT SYSTEM</span>
            <span className="text-cyan-400 font-medium">{loadingProgress}%</span>
          </div>
          <div className="relative h-[2px] w-full bg-neutral-900 overflow-hidden rounded-full">
            <div
              className="absolute h-full left-0 top-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-white transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="text-[9px] font-light tracking-[0.3em] text-neutral-600 animate-pulse uppercase">
            Loading GPU Assets
          </span>
        </div>
      </div>

      {/* 2. PERSISTENT LUXURY UI */}
      <div
        className={`fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-6 sm:p-10 text-white font-sans transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Top Header - Fades out immediately after Phase 1 finishes (scrollProgress > 0.2) */}
        <header 
          className={`flex items-center justify-between pointer-events-auto transition-all duration-700 ${
            scrollProgress > 0.2 ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100"
          }`}
        >
          <div className="flex flex-col">
            <span className="text-sm font-light tracking-[0.4em] uppercase">PEENYA & LAGGERE</span>
            <span className="text-[9px] font-light tracking-[0.5em] text-cyan-400 uppercase mt-0.5">
              .
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="#about"
              className="text-[10px] font-light tracking-widest text-neutral-400 hover:text-white transition-colors duration-300 hidden md:block"
            >
              DIGITAL ART INSTALLATION
            </a>
            <div className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </header>

        {/* Right Corner Progress Strip */}
        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-40">
          <div className="h-24 w-[1px] bg-neutral-800 relative overflow-hidden">
            <div
              className="absolute w-full bg-cyan-400 top-0 left-0 transition-all duration-100 ease-out"
              style={{ height: `${scrollProgress * 100}%`, minHeight: "4px" }}
            />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400/90 rotate-90 translate-y-3 origin-center">
            {Math.round(scrollProgress * 100).toString().padStart(3, "0")}
          </span>
        </div>

        {/* Left Bottom Corner: Dynamic Scrolling Narrative */}
        <div className="max-w-xs md:max-w-sm flex flex-col gap-3 pointer-events-auto backdrop-blur-[2px] bg-black/10 p-4 rounded-lg border border-neutral-900/10">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-6 w-6 rounded-full border border-cyan-400/30 text-[10px] font-mono text-cyan-400">
              {stage.number}
            </span>
            <span className="text-[10px] font-mono tracking-[0.4em] text-neutral-400 uppercase">
              PHASE STAGE
            </span>
          </div>
          
          <h2 className="text-lg font-light tracking-widest text-white uppercase transition-all duration-500">
            {stage.title}
          </h2>
          
          <p className="text-xs font-light leading-relaxed text-neutral-400 transition-all duration-500">
            {stage.desc}
          </p>
        </div>

        {/* Bottom Bar: Instructions and Prompts */}
        <footer className="flex items-end justify-between">
          <div className="flex gap-4 text-[9px] font-mono text-neutral-600 tracking-wider">
            <span>NANJUNDESHWARA</span>
            <span>ENTERPRISES</span>
            <span>PEENYA | LAGGERE</span>
          </div>

          {/* Scroll Down Prompt */}
          <div
            className={`flex flex-col items-center gap-2 transition-all duration-700 ${
              scrollProgress > 0.05 ? "opacity-0 translate-y-4" : "opacity-80"
            }`}
          >
            <span className="text-[9px] font-light tracking-[0.4em] text-cyan-400 animate-pulse uppercase">
              Scroll to Begin
            </span>
            <div className="relative h-10 w-[1px] bg-neutral-800 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-cyan-400 animate-infinite-scroll" />
            </div>
          </div>
        </footer>
      </div>

      {/* Global CSS for the scroll dot animation */}
      <style jsx global>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(200%);
          }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 1.8s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
        }
      `}</style>
    </>
  );
}