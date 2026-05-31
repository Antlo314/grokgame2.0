'use client';

import React, { useEffect, useState } from 'react';
import { audio } from '../lib/game/AudioManager';
import { X, Play, Volume2, VolumeX, Home, List } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onReturnToTitle: () => void;
}

export default function PauseMenu({ onResume, onReturnToTitle }: PauseMenuProps) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(audio.isCurrentlyMuted());

  // Listen for pause event from game
  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setMuted(audio.isCurrentlyMuted());
    };
    window.addEventListener('pause-game', handler);
    return () => window.removeEventListener('pause-game', handler);
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleResume();
      }
      if ((e.key === 'm' || e.key === 'M') && open) {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleResume = () => {
    setOpen(false);
    onResume();
  };

  const handleToggleMute = () => {
    const newMuted = audio.toggleMute();
    setMuted(newMuted);
  };

  const handleReturnToTitle = () => {
    setOpen(false);
    onReturnToTitle();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85" onClick={handleResume}>
      <div 
        className="glass-panel w-full max-w-md mx-4 p-8 retro-border" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="eyebrow tracking-[3px]">LUMEN ARCHIVE</div>
            <div className="text-3xl font-semibold tracking-tight">PAUSED</div>
          </div>
          <button onClick={handleResume} className="text-[#64748b] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleResume}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-xl border border-[#00f2fe]/40 hover:bg-[#00f2fe]/10 text-left transition-colors group"
          >
            <Play className="text-[#00f2fe] group-hover:scale-110 transition" size={20} />
            <span className="font-medium">RESUME</span>
          </button>

          <button 
            onClick={handleToggleMute}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-left transition-colors"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            <span className="font-medium">{muted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
            <span className="ml-auto text-xs text-[#64748b] font-mono">M</span>
          </button>

          <button 
            onClick={handleReturnToTitle}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-left transition-colors text-[#ff9f00]"
          >
            <Home size={20} />
            <span className="font-medium">RETURN TO TITLE</span>
          </button>
        </div>

        {/* Controls reminder */}
        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-[#64748b] font-mono tracking-widest">
          <div className="mb-2 text-[#00f2fe]">CONTROLS</div>
          <div>WASD / Arrows — Move</div>
          <div>E — Interact / Talk</div>
          <div>J — Journal &nbsp;&nbsp; I — Inventory</div>
          <div>ESC — Pause</div>
        </div>

        <div className="text-center mt-6 text-[10px] text-[#475569] tracking-[2px]">
          POWERED BY LUMEN LABS
        </div>
      </div>
    </div>
  );
}
