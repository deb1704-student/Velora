"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { Play, Pause, Maximize2, Volume2, Sparkles, Film } from "lucide-react";

const scenes = [
  {
    id: "01",
    tag: "SCENE 01 / PRECISION HAIRCRAFT",
    location: "BANDRA ATELIER",
    fps: "60 FPS",
    url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "02",
    tag: "SCENE 02 / BOTANICAL HYDRA-FACIAL",
    location: "INDIRANAGAR SUITE",
    fps: "60 FPS",
    url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "03",
    tag: "SCENE 03 / BESPOKE GLOSS & FINISH",
    location: "SOUTH EXTENSION",
    fps: "60 FPS",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function Hero3DVideo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timecode, setTimecode] = useState("00:01:24:08");
  const [progress, setProgress] = useState(0);

  // 3D Tilt Physics using Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for natural physical weight
  const springConfig = { damping: 20, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Real-time timecode & continuous scene loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSceneIndex((current) => (current + 1) % scenes.length);
          return 0;
        }
        return prev + 1.2;
      });

      // Update frame timecode
      const d = new Date();
      const secs = String(d.getSeconds()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const frames = String(Math.floor((d.getMilliseconds() / 1000) * 60)).padStart(2, "0");
      setTimecode(`00:${mins}:${secs}:${frames}`);
    }, 60);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeScene = scenes[activeSceneIndex];

  return (
    <div className="w-full [perspective:1200px]">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative border border-[#722F37]/30 bg-[#F1E8DC] p-3 shadow-2xl transition-shadow duration-300 hover:shadow-[0_25px_50px_-12px_rgba(114,47,55,0.25)]"
      >
        {/* Dynamic 3D Glare Sheen Layer */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.25) 0%, transparent 65%)`,
          }}
        />

        {/* Video Canvas Container (100% full-bleed aspect-[3/4]) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#241719]">
          {/* Looping Cinematic Animated Layer (Ken Burns breathing motion) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.url}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{
                opacity: 1,
                scale: isPlaying ? [1.02, 1.1, 1.02] : 1.05,
                x: isPlaying ? [0, -8, 0] : 0,
                y: isPlaying ? [0, -6, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                opacity: { duration: 0.6 },
                scale: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
              }}
              className="absolute inset-0 h-full w-full"
            >
              <img
                src={activeScene.url}
                alt={activeScene.tag}
                className="h-full w-full object-cover grayscale contrast-125 brightness-95"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>

          {/* Film Grain & Cinematic Vignette Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50" />

          {/* Viewfinder 3D Floating UI (translateZ) */}
          <div
            style={{ transform: "translateZ(35px)" }}
            className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between"
          >
            {/* Top Viewfinder Bar */}
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-white tracking-widest">
              {/* REC Dot & Status */}
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20">
                <span className={`h-2 w-2 rounded-full ${isPlaying ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
                <span>{isPlaying ? "REC · 4K" : "PAUSED"}</span>
              </div>

              {/* Live Running Timecode */}
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20 tabular-nums">
                {timecode}
              </div>
            </div>

            {/* Viewfinder Center Crosshair Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="relative h-12 w-12 border border-white/40">
                <span className="absolute top-1/2 left-0 h-[1px] w-full bg-white/50 -translate-y-1/2" />
                <span className="absolute left-1/2 top-0 w-[1px] h-full bg-white/50 -translate-x-1/2" />
              </div>
            </div>

            {/* Bottom Viewfinder HUD & Equalizer */}
            <div className="space-y-3">
              <div className="flex items-end justify-between font-mono text-[10px] text-white">
                <div>
                  <p className="text-[9px] text-[#D7A7B1] tracking-[0.2em] uppercase">
                    {activeScene.location}
                  </p>
                  <p className="font-bold tracking-wider mt-0.5">{activeScene.tag}</p>
                </div>

                {/* Animated Equalizer Waveform */}
                <div className="flex items-end gap-1 h-4 bg-black/60 px-2 py-1 border border-white/20">
                  {[40, 90, 60, 100, 75, 45].map((height, i) => (
                    <motion.span
                      key={i}
                      animate={isPlaying ? { height: ["20%", `${height}%`, "20%"] } : { height: "20%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + i * 0.15,
                        ease: "easeInOut",
                      }}
                      className="w-1 bg-[#D7A7B1]"
                    />
                  ))}
                </div>
              </div>

              {/* Progress Scrubber Bar */}
              <div className="relative h-1 w-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-[#D7A7B1] transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Playback & Scene Selector Tray */}
        <div
          style={{ transform: "translateZ(25px)" }}
          className="mt-3 flex items-center justify-between border-t border-[#722F37]/15 pt-2.5 font-mono text-[10px] font-bold uppercase text-[#722F37]"
        >
          {/* Play/Pause Control */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 border border-[#722F37]/30 bg-white px-2.5 py-1 tracking-wider hover:border-[#722F37]"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
          </button>

          {/* Scene Selectors */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#776760] mr-1 hidden sm:inline">ANGLE:</span>
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setProgress(0);
                }}
                className={`border px-2 py-0.5 tracking-wider transition ${
                  activeSceneIndex === idx
                    ? "border-[#722F37] bg-[#722F37] text-white"
                    : "border-[#722F37]/30 bg-white hover:border-[#722F37]"
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
