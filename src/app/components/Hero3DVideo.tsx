"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Play, Pause } from "lucide-react";

interface Scene {
  id: string;
  tag: string;
  location: string;
  specs: string;
  url: string;
}

const scenes: Scene[] = [
  {
    id: "01",
    tag: "SCENE 01 / PRECISION HAIRCRAFT",
    location: "BANDRA ATELIER",
    specs: "35MM · F/1.8 · 60 FPS",
    url: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "02",
    tag: "SCENE 02 / BOTANICAL HYDRA-FACIAL",
    location: "INDIRANAGAR SUITE",
    specs: "50MM · F/2.0 · 60 FPS",
    url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "03",
    tag: "SCENE 03 / BESPOKE GLOSS & FINISH",
    location: "SOUTH EXTENSION",
    specs: "85MM · F/1.4 · 60 FPS",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function Hero3DVideo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timecode, setTimecode] = useState("00:01:24:08");
  const [progress, setProgress] = useState(0);

  // 3D Tilt Physics using Motion Values & Springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
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

  // Real-time video timecode ticker & automatic continuous scene transition
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSceneIndex((current) => (current + 1) % scenes.length);
          return 0;
        }
        return prev + 1.25;
      });

      const now = new Date();
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      const frames = String(Math.floor((now.getMilliseconds() / 1000) * 60)).padStart(2, "0");
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
        className="group relative border border-[#722F37]/30 bg-[#F1E8DC] p-3 shadow-2xl transition-shadow duration-500 hover:shadow-[0_25px_50px_-12px_rgba(114,47,55,0.25)]"
      >
        {/* Dynamic 3D Glare Sheen Layer */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.25) 0%, transparent 65%)`,
          }}
        />

        {/* Video Canvas Container (100% full-bleed aspect-[3/4]) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#302326]">
          {/* Stacked Scene Layers with GPU Cross-Fade (Zero Blank Frames) */}
          {scenes.map((scene, idx) => {
            const isActive = activeSceneIndex === idx;
            return (
              <div
                key={scene.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={scene.url}
                  alt={scene.tag}
                  className={`h-full w-full object-cover brightness-[0.98] contrast-[1.05] transition-transform duration-[10000ms] ease-out ${
                    isActive && isPlaying ? "scale-110 translate-x-[-1%] translate-y-[-1%]" : "scale-100"
                  }`}
                  loading="eager"
                  onError={(e) => {
                    // Safe fallback if network hiccups
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=85";
                  }}
                />
              </div>
            );
          })}

          {/* Balanced Cinematic Vignette Overlay (Text is legible, imagery is bright) */}
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/65 via-black/10 to-black/45" />

          {/* Viewfinder 4 Corner Optical Brackets */}
          <div className="pointer-events-none absolute inset-3 z-20 border border-white/15">
            <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-[#D7A7B1]" />
            <span className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-[#D7A7B1]" />
            <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-[#D7A7B1]" />
            <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-[#D7A7B1]" />
          </div>

          {/* Viewfinder 3D Floating HUD (translateZ for physical depth) */}
          <div
            style={{ transform: "translateZ(35px)" }}
            className="absolute inset-0 z-20 pointer-events-none p-5 flex flex-col justify-between"
          >
            {/* Top Viewfinder Bar */}
            <div className="flex items-center justify-between font-mono text-[10px] font-bold text-white tracking-widest">
              {/* REC Beacon & Sensor Status */}
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPlaying ? "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-gray-400"
                  }`}
                />
                <span>{isPlaying ? "REC · 4K" : "PAUSED"}</span>
              </div>

              {/* Optical Shutter & ISO Telemetry */}
              <div className="hidden sm:block text-[9px] text-white/80 bg-black/50 px-2 py-1 border border-white/10">
                {activeScene.specs}
              </div>

              {/* Live Running Timecode */}
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/20 tabular-nums">
                {timecode}
              </div>
            </div>

            {/* Viewfinder Center Crosshair Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="relative h-12 w-12 border border-white/50">
                <span className="absolute top-1/2 left-0 h-[1px] w-full bg-white/70 -translate-y-1/2" />
                <span className="absolute left-1/2 top-0 w-[1px] h-full bg-white/70 -translate-x-1/2" />
              </div>
            </div>

            {/* Bottom Viewfinder HUD & Real-Time Audio Meters */}
            <div className="space-y-3">
              <div className="flex items-end justify-between font-mono text-[10px] text-white">
                <div className="bg-black/40 backdrop-blur-sm p-1.5 -ml-1 border-l-2 border-[#D7A7B1]">
                  <p className="text-[9px] text-[#D7A7B1] tracking-[0.2em] uppercase font-bold">
                    {activeScene.location}
                  </p>
                  <p className="font-bold tracking-wider mt-0.5">{activeScene.tag}</p>
                </div>

                {/* Animated Equalizer Waveform */}
                <div className="flex items-end gap-1 h-5 bg-black/60 px-2 py-1 border border-white/20">
                  {[45, 95, 60, 100, 75, 50].map((height, i) => (
                    <span
                      key={i}
                      style={{
                        height: isPlaying ? `${height}%` : "20%",
                        transition: "height 300ms ease-in-out",
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

        {/* Interactive Playback Tray & Camera Scene Switcher */}
        <div
          style={{ transform: "translateZ(20px)" }}
          className="mt-3 flex items-center justify-between border-t border-[#722F37]/15 pt-2.5 font-mono text-[10px] font-bold uppercase text-[#722F37]"
        >
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 border border-[#722F37]/30 bg-white px-3 py-1 tracking-wider transition hover:border-[#722F37] hover:bg-[#F8F4E7] active:scale-95"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
          </button>

          {/* Scene Angle Switchers */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#776760] tracking-wider hidden sm:inline">ANGLE:</span>
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setProgress(0);
                }}
                className={`border px-2.5 py-1 tracking-wider transition active:scale-95 ${
                  activeSceneIndex === idx
                    ? "border-[#722F37] bg-[#722F37] text-white shadow-sm"
                    : "border-[#722F37]/30 bg-white text-[#722F37] hover:border-[#722F37]"
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
