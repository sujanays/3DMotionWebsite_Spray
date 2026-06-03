"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORY_BEATS, getBeatOpacity } from "@/lib/sequence";
import StoryOverlay from "@/components/StoryOverlay";

// --- SEQUENCE 1 SETUP (Motion Element) ---
const FRAME_COUNT = 135;
const getFramePath = (index: number) => {
  const frameNum = String(index + 1).padStart(5, "0");
  return `/motionelement/frames${frameNum}.png`;
};

// --- SEQUENCE 2 SETUP (Metal Element) ---
const METAL_FRAME_COUNT = 145;
const getMetalFramePath = (index: number) => {
  const frameNum = String(index + 1).padStart(5, "0");
  return `/shocase/metal${frameNum}.png`;
};

// --- SEQUENCE 3 SETUP (Wrap Element) ---
const PACK_FRAME_COUNT = 67;
const getpackFramePath = (index: number) => {
  const frameNum = String(index + 1).padStart(5, "0");
  return `/wrapframes/wp${frameNum}.png`;
};

export default function ScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [motionImages, setMotionImages] = useState<HTMLImageElement[]>([]);
  const [metalImages, setMetalImages] = useState<HTMLImageElement[]>([]);
  const [packImages, setPackImages] = useState<HTMLImageElement[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Triple Sequence Simultaneous Preloading Engine
  useEffect(() => {
    const loadedMotion: HTMLImageElement[] = [];
    let motionCount = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        motionCount++;
        if (motionCount === FRAME_COUNT && loadedMotion[0]) {
          renderFrame(loadedMotion[0], 1.0, 1.0);
        }
      };
      loadedMotion.push(img);
    }
    setMotionImages(loadedMotion);

    const loadedMetal: HTMLImageElement[] = [];
    let metalCount = 0;
    for (let i = 0; i < METAL_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getMetalFramePath(i);
      img.onload = () => { metalCount++; };
      loadedMetal.push(img);
    }
    setMetalImages(loadedMetal);

    const loadedPack: HTMLImageElement[] = [];
    let packCount = 0;
    for (let i = 0; i < PACK_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getpackFramePath(i);
      img.onload = () => { packCount++; };
      loadedPack.push(img);
    }
    setPackImages(loadedPack);
  }, []);

  // Performance-optimized Canvas Renderer with central transformation scaling matrices
  const renderFrame = useCallback((img: HTMLImageElement, opacity: number = 1.0, scaleFactor: number = 1.0) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;

    if (scaleFactor === 1.0) {
      ctx.drawImage(img, 0, 0, img.width, img.height);
    } else {
      const targetWidth = img.width * scaleFactor;
      const targetHeight = img.height * scaleFactor;
      const offsetX = (img.width - targetWidth) / 2;
      const offsetY = (img.height - targetHeight) / 2;

      ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);
    }
    
    ctx.globalAlpha = 1.0;
  }, []);

  // Tracking native document viewport scrolls with multi-phase crossfades
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const currentScroll = window.scrollY;
      let progress = currentScroll / totalHeight;
      progress = Math.max(0, Math.min(1, progress));

      setScrollProgress(progress);

      // Shared uniform sizing configurations
      const reducedScale = 0.75; 

      // --- TRIPLE-SEQUENCE HIGH FIDELITY BREAKPOINTS ---
      const checkpoint1 = 0.40; // Break between Sequence 1 and 2
      const checkpoint2 = 0.70; // Break between Sequence 2 and 3
      const blendRange = 0.05;  // Explicit fade distance threshold (5% scroll window)

      if (progress < checkpoint1 - blendRange) {
        // Phase 1: Pure Sequence 1 Playing
        if (motionImages.length === FRAME_COUNT) {
          const localProgress = progress / checkpoint1;
          const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(localProgress * FRAME_COUNT));
          renderFrame(motionImages[frameIndex], 1.0, 1.0);
        }
      } 
      else if (progress >= checkpoint1 - blendRange && progress < checkpoint1) {
        // Phase 2: Sequence 1 Fading OUT
        if (motionImages.length === FRAME_COUNT) {
          const finalFrame = motionImages[FRAME_COUNT - 1];
          const opacity = 1 - (progress - (checkpoint1 - blendRange)) / blendRange;
          renderFrame(finalFrame, Math.max(0, opacity), 1.0);
        }
      } 
      else if (progress >= checkpoint1 && progress <= checkpoint1 + blendRange) {
        // Phase 3: Sequence 2 Fading IN
        if (metalImages.length === METAL_FRAME_COUNT) {
          const firstFrame = metalImages[0];
          const opacity = (progress - checkpoint1) / blendRange;
          renderFrame(firstFrame, Math.min(1, opacity), reducedScale);
        }
      } 
      else if (progress > checkpoint1 + blendRange && progress < checkpoint2 - blendRange) {
        // Phase 4: Pure Sequence 2 Playing
        if (metalImages.length === METAL_FRAME_COUNT) {
          const localProgress = (progress - checkpoint1) / (checkpoint2 - checkpoint1);
          const frameIndex = Math.min(METAL_FRAME_COUNT - 1, Math.floor(localProgress * METAL_FRAME_COUNT));
          renderFrame(metalImages[frameIndex], 1.0, reducedScale);
        }
      } 
      else if (progress >= checkpoint2 - blendRange && progress < checkpoint2) {
        // Phase 5: Sequence 2 Fading OUT
        if (metalImages.length === METAL_FRAME_COUNT) {
          const finalFrame = metalImages[METAL_FRAME_COUNT - 1];
          const opacity = 1 - (progress - (checkpoint2 - blendRange)) / blendRange;
          renderFrame(finalFrame, Math.max(0, opacity), reducedScale);
        }
      } 
      else if (progress >= checkpoint2 && progress <= checkpoint2 + blendRange) {
        // Phase 6: Sequence 3 Fading IN
        if (packImages.length === PACK_FRAME_COUNT) {
          const firstFrame = packImages[0];
          const opacity = (progress - checkpoint2) / blendRange;
          renderFrame(firstFrame, Math.min(1, opacity), reducedScale);
        }
      } 
      else {
        // Phase 7: Pure Sequence 3 Playing
        if (packImages.length === PACK_FRAME_COUNT) {
          const localProgress = (progress - checkpoint2) / (1.0 - checkpoint2);
          const frameIndex = Math.min(PACK_FRAME_COUNT - 1, Math.floor(localProgress * PACK_FRAME_COUNT));
          renderFrame(packImages[frameIndex], 1.0, reducedScale);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [motionImages, metalImages, packImages, renderFrame]);

  // Normalize progress timeline specifically mapped against Sequence 1 track range
  const motionTimelineProgress = Math.min(1, scrollProgress / 0.40);

  // Sequence 2 Text Config Block
  const metalBeatPlaceholder = {
    id: "metal-beat",
    start: 0.40,
    end: 0.70,
    headline: "Metal Process Active",
    body: ["Executing precise sequence parameters across structural components."],
    align: "left" as const
  };

  // Sequence 3 Text Config Block
  const packBeatPlaceholder = {
    id: "pack-beat",
    start: 0.70,
    end: 1.0,
    headline: "Packaging Enclosure Complete",
    body: ["Securing structural wrap matrices across active parameters."],
    align: "left" as const
  };

  const metalOpacity = getBeatOpacity(scrollProgress, metalBeatPlaceholder.start, metalBeatPlaceholder.end, 0.05);
  const packOpacity = getBeatOpacity(scrollProgress, packBeatPlaceholder.start, packBeatPlaceholder.end, 0.05);

  return (
    <div ref={containerRef} className="relative w-full h-[900vh] bg-transparent">
      
      {/* FIXED CONTAINER: Increased mobile padding-top (pt-24) to push text down from the screen edge */}
      <div 
        className="
          fixed inset-0 z-20 p-6 pt-32
          flex flex-col items-center justify-start gap-4
          md:justify-center md:gap-8 md:inset-0 md:fixed md:block pointer-events-none
        "
      >
        {/* TEXT CONTAINER: Shifted to min-h-[140px] to organically pull the canvas images closer */}
        <div 
          className="
            w-full max-w-sm pointer-events-auto relative min-h-[140px]
            md:fixed md:top-1/2 md:-translate-y-1/2 md:left-12 lg:left-16 md:max-w-md md:min-h-0 md:h-auto z-30
          "
        >
          {/* SEQUENCE 1 TEXT INTERLOCK */}
          {scrollProgress <= 0.36 && STORY_BEATS.map((beat) => {
            const opacity = getBeatOpacity(motionTimelineProgress, beat.start, beat.end, 0.05);
            if (opacity === 0) return null;

            return (
              <div
                key={beat.id}
                className="transition-all duration-300 ease-out absolute inset-x-0 top-0 md:inset-auto md:static"
                style={{
                  opacity: opacity,
                  transform: `translateY(${(1 - opacity) * 12}px)`,
                }}
              >
                <StoryOverlay beat={beat} progress={motionTimelineProgress} />
              </div>
            );
          })}

          {/* SEQUENCE 2 TEXT INTERLOCK */}
          {scrollProgress >= 0.36 && scrollProgress < 0.70 && metalOpacity > 0 && (
            <div
              key={metalBeatPlaceholder.id}
              className="transition-all duration-500 ease-out absolute inset-x-0 top-0 md:inset-auto md:static"
              style={{
                opacity: metalOpacity,
                transform: `translateY(${(1 - metalOpacity) * 8}px)`,
              }}
            >
              <StoryOverlay beat={metalBeatPlaceholder} progress={(scrollProgress - 0.40) / 0.30} />
            </div>
          )}

          {/* SEQUENCE 3 TEXT INTERLOCK */}
          {scrollProgress >= 0.66 && packOpacity > 0 && (
            <div
              key={packBeatPlaceholder.id}
              className="transition-all duration-500 ease-out absolute inset-x-0 top-0 md:inset-auto md:static"
              style={{
                opacity: packOpacity,
                transform: `translateY(${(1 - packOpacity) * 8}px)`,
              }}
            >
              <StoryOverlay beat={packBeatPlaceholder} progress={(scrollProgress - 0.70) / 0.30} />
            </div>
          )}
        </div>

        {/* IMAGE CANVAS CONTAINER */}
        <div 
          className="
            w-full max-w-[85vw] max-h-[45vh] flex items-center justify-center
            md:fixed md:top-1/2 md:-translate-y-1/2 md:right-8 lg:right-16 md:left-auto
            md:w-[50vw] md:max-w-[50vw] md:max-h-[80vh] z-20 mt-0
          "
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto object-contain block bg-transparent pointer-events-auto"
          />
        </div>
      </div>

      {/* ARROW INDICATOR PROMPT */}
      <div 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1.5 pointer-events-none transition-all duration-500 ease-in-out select-none"
        style={{
          opacity: scrollProgress > 0 ? 0 : 1,
          transform: scrollProgress > 0 ? "translateY(15px)" : "translateY(0px)",
        }}
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-400 uppercase opacity-80">
          Scroll
        </span>
        <svg 
          className="w-5 h-5 text-cyan-400 animate-bounce" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}