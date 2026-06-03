"use client";

import { useRef, useEffect } from "react";

export default function ScrollPadButton() {
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = (direction: "up" | "down") => {
    if (scrollInterval.current) return;

    const scrollAmount = direction === "up" ? -12 : 12; 
    
    const performScroll = () => {
      window.scrollBy({
        top: scrollAmount,
        behavior: "auto", 
      });
      scrollInterval.current = requestAnimationFrame(performScroll) as unknown as NodeJS.Timeout;
    };

    scrollInterval.current = requestAnimationFrame(performScroll) as unknown as NodeJS.Timeout;
  };

  const stopScrolling = () => {
    if (scrollInterval.current) {
      cancelAnimationFrame(scrollInterval.current as unknown as number);
      scrollInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopScrolling();
  }, []);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none pointer-events-auto">
      {/* Contextual indicator text */}
      <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-400 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
        Hold to Navigate
      </span>

      {/* Side-by-Side Arrow Panel Controls */}
      <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2 rounded-2xl backdrop-blur-md shadow-2xl">
        
        {/* UP ARROW BUTTON */}
        <button
          onTouchStart={() => startScrolling("up")}
          onTouchEnd={stopScrolling}
          onMouseDown={() => startScrolling("up")}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
          className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-neutral-900/50 hover:bg-neutral-800 text-white active:scale-90 active:border-cyan-500/50 active:text-cyan-400 transition-all cursor-pointer select-none"
          title="Scroll Up"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
          </svg>
        </button>

        {/* DOWN ARROW BUTTON */}
        <button
          onTouchStart={() => startScrolling("down")}
          onTouchEnd={stopScrolling}
          onMouseDown={() => startScrolling("down")}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
          onMouseLeave={stopScrolling}
          className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 bg-neutral-900/50 hover:bg-neutral-800 text-white active:scale-90 active:border-cyan-500/50 active:text-cyan-400 transition-all cursor-pointer select-none"
          title="Scroll Down"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 animate-pulse"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
        </button>

      </div>
    </div>
  );
}