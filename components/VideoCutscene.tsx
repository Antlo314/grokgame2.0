'use client';

import React, { useEffect, useRef, useState } from 'react';

interface VideoCutsceneProps {
  videoId: string; // e.g. "transformation", "hero_awakening"
  onComplete: () => void;
}

export default function VideoCutscene({ videoId, onComplete }: VideoCutsceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSrc = `/videos/${videoId}.mp4`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete();
    };

    const handleCanPlay = () => {
      video.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay blocked — allow manual start
        setIsPlaying(false);
      });
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('canplay', handleCanPlay);

    // Try to load
    video.load();

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoId, onComplete]);

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.play().then(() => setIsPlaying(true));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Heavy 32-bit CRT + Letterbox treatment */}
      <div className="relative w-full max-w-[1280px] aspect-video overflow-hidden border-[12px] border-[#1a1f2e] shadow-2xl">
        {/* The actual video */}
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover pixelated"
          muted
          playsInline
          preload="auto"
        />

        {/* 32-bit CRT overlays */}
        <div className="absolute inset-0 pointer-events-none crt-overlay" />
        <div className="absolute inset-0 pointer-events-none scanlines-strong" style={{ opacity: 0.18 }} />

        {/* Lumen Archive terminal header (very 32-bit cinematic) */}
        <div className="absolute top-0 left-0 right-0 h-9 bg-black/80 border-b border-[#00f2fe]/40 flex items-center px-5 z-10">
          <div className="flex items-center gap-3 text-xs font-mono tracking-[2.5px] text-[#00f2fe]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
            LUMEN ARCHIVE — RECOVERED MEMORY SEQUENCE
          </div>
          <div className="ml-auto text-[10px] text-[#ff9f00] tracking-widest">32-BIT FMV • 2026</div>
        </div>

        {/* Bottom letterbox bar with subtle info */}
        <div className="absolute bottom-0 left-0 right-0 h-9 bg-black/70 border-t border-white/10 flex items-center px-5 text-[10px] font-mono text-[#64748b] z-10">
          POWERED BY LUMEN LABS • ANCESTRAL TRANSMISSION
        </div>

        {/* Manual play fallback if autoplay blocked */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20" onClick={handleManualPlay}>
            <div className="text-center">
              <div className="text-[#00f2fe] text-sm tracking-[3px] mb-2 font-mono">PRESS TO BEGIN TRANSMISSION</div>
              <button className="btn btn-primary px-10 py-3 text-lg">PLAY MEMORY SEQUENCE</button>
            </div>
          </div>
        )}
      </div>

      {/* Global CRT vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 180px rgba(0,0,0,0.7)',
        mixBlendMode: 'multiply'
      }} />
    </div>
  );
}
