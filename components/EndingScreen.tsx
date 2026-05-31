'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EndingScreen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('show-ending', handler);
    return () => window.removeEventListener('show-ending', handler);
  }, []);

  const handleReturnToTitle = () => {
    window.location.href = '/';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black">
      <div className="text-center max-w-2xl px-6">
        <div className="eyebrow tracking-[4px] mb-4 text-[#00f2fe]">LUMEN ARCHIVE — TRANSMISSION COMPLETE</div>

        <h1 className="text-6xl font-bold tracking-[-2.5px] mb-4">THE FIRST MEMORY</h1>
        <h2 className="text-4xl tracking-tight text-[#ff9f00] mb-8">HAS AWAKENED</h2>

        <div className="max-w-md mx-auto text-[#d1d5db] text-lg leading-relaxed mb-10">
          What they tried to erase lives on in you.<br />
          The rhythm is awake.<br />
          The Archive is listening.
        </div>

        <div className="text-sm text-[#64748b] mb-8 tracking-widest">
          MORE MEMORIES SLEEP BENEATH THE CITY.<br />
          THEY ARE WAITING.
        </div>

        <button 
          onClick={handleReturnToTitle}
          className="btn btn-primary px-12 py-4 text-lg"
        >
          RETURN TO THE ARCHIVE
        </button>

        <div className="mt-12 text-xs text-[#475569] font-mono tracking-[2px]">
          A LUMEN LABS EXPERIENCE • 2026
        </div>
      </div>

      {/* Subtle CRT overlay */}
      <div className="absolute inset-0 pointer-events-none crt-overlay" style={{ opacity: 0.4 }} />
    </div>
  );
}
