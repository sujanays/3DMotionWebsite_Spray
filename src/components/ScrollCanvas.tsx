"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FRAME_COUNT, STORY_BEATS, getFramePath } from "@/lib/sequence";
import StoryOverlay from "@/components/StoryOverlay";

export default function ScrollCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Preload frame assets loop
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          renderFrame(0, loadedImages);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Frame rendering calculator - Outputs pure, uncropped native sizes
  const renderFrame = useCallback((index: number, imgList: HTMLImageElement[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgList[index];
    if (!img || !img.complete) return;

    // Force the drawing coordinate boundary to equal the exact source dimensions of your images
    if (canvas.width !== img.width || canvas.height !== img.height) {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draws the image exactly from 0,0 to its actual width and height (Zero Cropping)
    ctx.drawImage(img, 0, 0, img.width, img.height);
  }, []);

  // Monitor document height calculation for native window scroll mapping
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const currentScroll = window.scrollY;
      let progress = currentScroll / totalHeight;
      progress = Math.max(0, Math.min(1, progress));

      setScrollProgress(progress);

      if (images.length === FRAME_COUNT) {
        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(progress * FRAME_COUNT)
        );
        setCurrentIndex(frameIndex);
        renderFrame(frameIndex, images);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [images, renderFrame]);

  const activeBeat = STORY_BEATS.find(
    (beat) => scrollProgress >= beat.start && scrollProgress <= beat.end
  );

  return (
    <div ref={containerRef} className="relative w-full h-[500vh] bg-transparent">
      
      {/* MAIN WRAPPER CONTAINER */}
      <div 
        className="
          fixed inset-0 z-20 p-6
          flex flex-col items-center justify-center gap-8
          md:inset-auto md:static md:block pointer-events-none
        "
      >
        {/* DYNAMIC STORY TEXT COLUMN */}
        <div 
          className="
            w-full max-w-sm pointer-events-auto transition-all duration-700 ease-in-out order-1
            md:fixed md:top-1/2 md:-translate-y-1/2 md:left-12 lg:left-16 md:max-w-md md:order-none z-30
          "
          style={{
            opacity: activeBeat ? 1 : 0,
            transform: activeBeat ? "translateY(0px)" : "translateY(15px)",
          }}
        >
          {activeBeat && (
            <StoryOverlay beat={activeBeat} progress={scrollProgress} />
          )}
        </div>

        {/* UNCROPPED CANVAS VIEWPORT LAYER CONTAINER */}
        <div 
          className="
            w-full max-w-[85vw] max-h-[45vh] flex items-center justify-center order-2 mt-16
            md:fixed md:top-1/2 md:-translate-y-1/2 md:right-8 lg:right-16 md:left-auto
            md:w-[50vw] md:max-w-[50vw] md:max-h-[80vh] md:order-none z-20
          "
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto object-contain block bg-transparent pointer-events-auto"
          />
        </div>
      </div>

      {/* DYNAMIC SCROLL DOWN INDICATOR - ARROW VERSION
        - FIXED: Swapped out the complex mouse wrapper container vector for an un-cropped SVG chevron.
        - Set ease transition time to a snappy duration configuration (`duration-500`) so it responds immediately when touch/wheel input fires.
      */}
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
        
        {/* Crisp Animated Vector Down Arrow Element */}
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