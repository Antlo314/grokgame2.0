'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '../../lib/store/gameStore';
import { CharacterConfig } from '../../lib/game/types';
import DialogueBox from '../../components/DialogueBox';
import Journal from '../../components/Journal';
import Inventory from '../../components/Inventory';
import VideoCutscene from '../../components/VideoCutscene';
import PauseMenu from '../../components/PauseMenu';
import EndingScreen from '../../components/EndingScreen';

// Dynamically import Phaser only on client (avoids SSR issues)
const PhaserGame = dynamic(() => import('./PhaserGame'), { ssr: false });

export default function PlayPage() {
  const character = useGameStore((s) => s.character);
  const [loadedCharacter, setLoadedCharacter] = useState<CharacterConfig | null>(null);
  const [activeCutscene, setActiveCutscene] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Load character from title flow (localStorage) or store
  useEffect(() => {
    if (character) {
      setLoadedCharacter(character);
      return;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('discovery_character');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as CharacterConfig;
          useGameStore.getState().setCharacter(parsed);
          setLoadedCharacter(parsed);
        } catch (e) {
          console.warn('Failed to load character config');
        }
      }
    }
  }, [character]);

  // Global ESC handler for overlays (Journal, Inventory, Dialogue)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCutscene) {
          setActiveCutscene(null);
        } else {
          window.dispatchEvent(new CustomEvent('close-overlays'));
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [activeCutscene]);

  // Listen for 'play-cutscene' events from Phaser / CinematicManager
  useEffect(() => {
    const handler = (e: any) => {
      const videoId = e.detail?.videoId || e.videoId;
      if (videoId) setActiveCutscene(videoId);
    };
    window.addEventListener('play-cutscene', handler as any);
    return () => window.removeEventListener('play-cutscene', handler as any);
  }, []);

  // Pause / Resume handlers
  const handlePause = () => {
    setIsPaused(true);
    window.dispatchEvent(new CustomEvent('pause-game'));
  };

  const handleResume = () => {
    setIsPaused(false);
    // Tell the game it can resume
    window.dispatchEvent(new CustomEvent('resume-game'));
  };

  const handleReturnToTitle = () => {
    window.location.href = '/';
  };

  if (!loadedCharacter) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-center p-8">
        <div>
          <div className="text-[#00f2fe] text-xs tracking-[3px] mb-3">LUMEN ARCHIVE</div>
          <div className="text-3xl mb-4">No character found.</div>
          <a href="/" className="btn btn-primary">RETURN TO TITLE + CREATE KHALIL</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Cinematic top bar */}
      <div className="h-9 border-b border-white/10 bg-[#07080c] flex items-center justify-between px-6 text-xs font-mono tracking-[2px] z-50">
        <div>LUMEN ARCHIVE • DISCOVERY v0.1 • 32-BIT ENGINE</div>
        <div className="text-[#ff9f00]">POWERED BY LUMEN LABS</div>
        <div>ATLANTA 2026 • KHALIL WRIGHT</div>
      </div>

      <div className="flex-1 flex items-center justify-center relative bg-[#050508]">
        {/* The real Phaser game (320x240 → 3x upscale) */}
        <div className="relative" style={{ width: '960px', height: '720px' }}>
          <PhaserGame character={loadedCharacter} />

          {/* Permanent CRT + letterbox overlays (Lumen cinematic language) */}
          <div className="crt-overlay" style={{ width: '960px', height: '720px' }} />
          <div className="letterbox top" style={{ width: '960px' }} />
          <div className="letterbox bottom" style={{ width: '960px' }} />

          {/* Dialogue / Memory overlay (receives events from scenes) */}
          <DialogueBox />

          {/* Journal + Inventory (open with J / I or from game) */}
          <Journal />
          <Inventory />

          {/* Pause Menu */}
          <PauseMenu 
            onResume={handleResume} 
            onReturnToTitle={handleReturnToTitle} 
          />

          {/* Ending Screen (triggered after first attunement) */}
          <EndingScreen />

          {/* Full-screen cinematic video cutscenes (32-bit CRT treatment) */}
          {activeCutscene && (
            <VideoCutscene 
              videoId={activeCutscene} 
              onComplete={() => setActiveCutscene(null)} 
            />
          )}
        </div>
      </div>

      {/* Bottom terminal status */}
      <div className="h-8 border-t border-white/10 bg-[#07080c] flex items-center px-6 text-[10px] font-mono text-[#64748b] z-50">
        SUBJECT: KHALIL WRIGHT — STATUS: AWAKENING • WALK WITH PURPOSE • J / I FOR ARCHIVE
      </div>
    </div>
  );
}

