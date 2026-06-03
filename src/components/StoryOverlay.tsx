"use client";

import { getBeatOpacity, type StoryBeat } from "@/lib/sequence";

type StoryOverlayProps = {
  beat: StoryBeat;
  progress: number;
};

export default function StoryOverlay({ beat, progress }: StoryOverlayProps) {
  // Use a smooth 0.05 fade buffer mapping matching our new configuration
  const opacity = getBeatOpacity(progress, beat.start, beat.end, 0.05);

  if (opacity <= 0.01) return null;

  return (
    <div 
      style={{ opacity }}
      className="absolute inset-y-0 left-0 flex flex-col justify-center items-start pl-6 md:pl-16 lg:pl-24 max-w-xl transition-opacity duration-150 ease-out"
    >
      <div className="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/10 backdrop-blur-md space-y-3">
        <h2 className="text-white font-sans font-bold text-2xl md:text-4xl tracking-tight uppercase bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
          {beat.headline}
        </h2>
        {beat.body && beat.body.map((paragraph, i) => (
          <p key={i} className="text-xs md:text-sm font-mono text-neutral-400 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}