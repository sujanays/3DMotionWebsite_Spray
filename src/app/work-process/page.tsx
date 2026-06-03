"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ScrollCanvas from "@/components/ScrollCanvas";

// Dynamically import the updated Scene component
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function WorkProcessPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      setScrollProgress(window.scrollY / totalHeight);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative bg-black min-h-screen w-full overflow-x-hidden">
      {/* FIXED: Passed scrollProgress={0} to freeze galaxy warping/scrolling animations */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Scene scrollProgress={0} isLoaded={true} minimal={true} />
      </div>

      {/* Frame Sequence Overlay Canvas Layer - Continues responding to live scrollProgress flawlessly */}
      <div className="relative z-10 w-full">
        <ScrollCanvas />
      </div>
    </main>
  );
}