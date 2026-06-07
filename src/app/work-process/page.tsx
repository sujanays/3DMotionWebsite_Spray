"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ScrollCanvas from "@/components/ScrollCanvas";

// Dynamically import the updated Scene component
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function WorkProcessPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      setScrollProgress(window.scrollY / totalHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if there is a valid history to go back to safely
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to push directly without forcing a page layout refreshment bundle
      router.push("/");
    }
  };

  return (
    <main className="relative bg-black min-h-screen w-full overflow-x-hidden">
      {/* Passed scrollProgress={0} to freeze galaxy warping/scrolling animations */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene scrollProgress={0} isLoaded={true} minimal={true} />
      </div>

      {/* CLICK HANDLER MODIFIED */}
      <button
        onClick={handleBack}
        className="fixed top-6 right-6 z-50 bg-white/10 hover:bg-white/20 hover:text-cyan-400 text-white rounded-full px-5 py-2.5 font-mono text-xs tracking-wider transition-all shadow-xl border border-white/10 active:scale-95 pointer-events-auto select-none"
        aria-label="Return to previous screen"
      >
         ✕ CLOSE
      </button>

      {/* Frame Sequence Overlay Canvas Layer */}
      <div className="relative z-10 w-full">
        <ScrollCanvas />
      </div>
    </main>
  );
}