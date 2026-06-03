export const FRAME_COUNT = 135; // Total images in motionelement
export const SCROLL_HEIGHT_VH = 600; // Total scrollable length[cite: 14]

export const getFramePath = (index: number) => {
  const frameNum = (index + 1).toString().padStart(5, "0"); // Pad to exactly 5 digits
  return `/motionelement/frames${frameNum}.png`;            // Matches framesXXXXX.png
};

export const STORY_BEATS = [
  {
    id: "beat-1",
    start: 0.1,
    end: 0.35,
    headline: "First Phase",
    body: ["Equally timed text sequence blending with galaxy."],
    align: "left" as const
  },
  {
    id: "beat-2",
    start: 0.4,
    end: 0.65,
    headline: "Second Phase",
    body: ["Blending smooth image transitions with 3D space."],
    align: "left" as const
  },
  {
    id: "beat-3",
    start: 0.7,
    end: 0.95,
    headline: "Final Phase",
    body: ["Transitioning through the 135 frame sequence."],
    align: "left" as const
  }
];

export const getFrameIndex = (progress: number) => {
  return Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
};

export const getBeatOpacity = (progress: number, start: number, end: number, buffer = 0.05) => {
  if (progress < start - buffer || progress > end + buffer) return 0;
  if (progress < start) return (progress - (start - buffer)) / buffer;
  if (progress > end) return 1 - (progress - end) / buffer;
  return 1;
};