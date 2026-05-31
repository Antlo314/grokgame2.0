'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Users, BookOpen } from 'lucide-react';
import CharacterCreator from '../components/CharacterCreator';

// === CINEMATIC TITLE / INTRO SCREEN ===
// "powered by Lumen Labs" — exact premium Lumen aesthetic + 32-bit touches
// Directly fulfills user request: intro screen + deep AA character creation before game

export default function DiscoveryTitle() {
  const [showCreator, setShowCreator] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleBegin = () => {
    setIsTransitioning(true);
    // Short cinematic hold before creator reveals
    setTimeout(() => {
      setShowCreator(true);
      setIsTransitioning(false);
    }, 420);
  };

  const handleCreatorComplete = (config: any) => {
    // Persist chosen character (will be read by /play)
    if (typeof window !== 'undefined') {
      localStorage.setItem('discovery_character', JSON.stringify(config));
      localStorage.setItem('discovery_character_timestamp', Date.now().toString());
    }
    // Cinematic handoff to game
    setIsTransitioning(true);
    setTimeout(() => {
      window.location.href = '/play';
    }, 680);
  };

  const handleBackToTitle = () => {
    setShowCreator(false);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#f8fafc] overflow-hidden relative">
      {/* Ambient Lumen architectural grid + subtle 32-bit noise */}
      <div className="absolute inset-0 ambient-grid opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(#1a1f2e_0.6px,transparent_1px)] bg-[length:3px_3px] opacity-40" />

      {/* Subtle CRT scanlines (title only) */}
      <div className="absolute inset-0 pointer-events-none scanlines-strong opacity-30" />

      <AnimatePresence mode="wait">
        {!showCreator ? (
          /* ========== TITLE / INTRO SCREEN ========== */
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            {/* Top Lumen branding bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00f2fe] shadow-[0_0_12px_#00f2fe]" />
                <div className="font-mono text-[10px] tracking-[3px] text-[#00f2fe] font-semibold">LUMEN ARCHIVE // 2026</div>
              </div>
              <div className="font-mono text-[10px] tracking-[2px] text-[#94a3b8]">A LUMEN LABS EXPERIENCE</div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
              {/* Centered cinematic content */}
              <div className="max-w-4xl text-center">
                {/* Badge */}
                <div className="hero-badge mx-auto mb-8">
                  <div className="hero-badge-dot" />
                  <span>32-BIT CINEMATIC RPG • VERTICAL SLICE</span>
                </div>

                {/* Main Title — chunky, premium, Lumen Syne style */}
                <h1 className="text-[92px] md:text-[110px] leading-[0.82] font-bold tracking-[-5.5px] mb-3 text-white">
                  DISCOVERY
                </h1>

                {/* Tagline */}
                <p className="text-2xl md:text-3xl text-[#94a3b8] tracking-[-0.6px] mb-4 font-light">
                  The hero the world needs was forged<br />in the memories they tried to erase.
                </p>

                <div className="flex items-center justify-center gap-4 mt-3 mb-12">
                  <div className="h-px w-12 bg-white/20" />
                  <div className="font-mono text-xs tracking-[3px] text-[#00f2fe]">ATLANTA • 2026</div>
                  <div className="h-px w-12 bg-white/20" />
                </div>

                {/* Primary CTA — electric Lumen style */}
                <button
                  onClick={handleBegin}
                  disabled={isTransitioning}
                  className="btn btn-primary text-lg px-14 py-4 disabled:opacity-70 group"
                >
                  BEGIN YOUR JOURNEY
                  <ArrowRight className="group-hover:translate-x-0.5 transition" size={20} />
                </button>

                <p className="mt-4 text-[#64748b] text-sm tracking-wide">
                  A fully cinematic experience • Keyboard + Mouse recommended for first play
                </p>
              </div>

              {/* Bottom features strip — Lumen minimal */}
              <div className="absolute bottom-12 flex items-center gap-10 text-xs font-mono tracking-[1.5px] text-[#64748b]">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#00f2fe]" /> ANCESTRAL AWAKENING
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-[#00f2fe]" /> THE JOURNAL OF RESISTANCE
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#00f2fe]" /> FORGED IN MEMORY
                </div>
              </div>
            </div>

            {/* Footer — "powered by Lumen Labs" (prominent & elegant) */}
            <div className="border-t border-white/10 py-6 px-8">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-y-3 text-center md:text-left">
                <div>
                  <span className="font-mono text-[10px] tracking-[2.5px] text-[#ff9f00]">POWERED BY</span>
                  <span className="ml-2 text-[#f0d878] font-semibold tracking-[-0.2px] text-lg">LUMEN LABS</span>
                </div>
                <div className="text-[#475569] text-xs max-w-[420px]">
                  A vertical slice of what happens when history refuses to stay buried. 
                  Built as an epic, marketable demo of cinematic interactive storytelling.
                </div>
                <div className="font-mono text-[10px] text-[#475569] tracking-widest">v0.1 • 32-BIT ENGINE</div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========== CHARACTER CREATION (full immersive) ========== */
          <CharacterCreator 
            onComplete={handleCreatorComplete} 
            onBack={handleBackToTitle}
          />
        )}
      </AnimatePresence>

      {/* Transition overlay (Lumen electric flash + terminal boot feel) */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="font-mono text-[#00f2fe] text-xs tracking-[4px] mb-4">LUMEN ARCHIVE</div>
              <div className="text-5xl font-bold tracking-[-1.5px] text-white mb-2">SUBJECT: KHALIL WRIGHT</div>
              <div className="text-[#00f2fe] text-sm tracking-[3px]">INITIALIZING 32-BIT RENDER PIPELINE...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
