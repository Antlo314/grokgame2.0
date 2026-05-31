'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../lib/store/gameStore';
import { JournalEntry } from '../lib/game/types';
import { X, Play, BookOpen } from 'lucide-react';

const CATEGORIES: JournalEntry['category'][] = ['Personal', 'Historical', 'Artifact', 'Quest'];

export default function Journal() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<JournalEntry['category']>('Personal');
  const journal = useGameStore((s) => s.journal);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('open-journal', openHandler);

    const closeHandler = () => setOpen(false);
    window.addEventListener('close-overlays', closeHandler);

    return () => {
      window.removeEventListener('open-journal', openHandler);
      window.removeEventListener('close-overlays', closeHandler);
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const filtered = journal.filter(e => e.category === activeTab).sort((a, b) => b.timestamp - a.timestamp);

  const handleReplay = (entry: JournalEntry) => {
    // Emit event for GameScene / CinematicManager to pick up
    window.dispatchEvent(new CustomEvent('replay-memory', { 
      detail: { artifactId: entry.artifactId, title: entry.title } 
    }));
    // Close journal so the cinematic can breathe
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80" 
      onClick={() => setOpen(false)}
    >
      <div 
        className="glass-panel w-full max-w-[920px] mx-4 p-7 retro-border" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <BookOpen className="text-[#00f2fe]" size={22} />
              <div>
                <div className="eyebrow tracking-[3px]">LUMEN ARCHIVE // SUBJECT LOG</div>
                <div className="text-3xl font-semibold tracking-[-1.2px] text-white mt-0.5">THE JOURNAL OF RESISTANCE</div>
              </div>
            </div>
            <div className="text-[#94a3b8] text-sm mt-1 pl-8">What they tried to erase, we carry forward.</div>
          </div>
          <button 
            onClick={() => setOpen(false)} 
            className="text-[#64748b] hover:text-white p-2 -mr-2"
          >
            <X size={22} />
          </button>
        </div>

        {/* Category Tabs - 32-bit / Lumen terminal style */}
        <div className="flex border-b border-white/10 mb-5">
          {CATEGORIES.map(cat => {
            const count = journal.filter(e => e.category === cat).length;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2
                  ${isActive 
                    ? 'text-[#00f2fe] border-[#00f2fe] bg-[#00f2fe]/5' 
                    : 'text-[#64748b] border-transparent hover:text-[#00f2fe] hover:border-[#00f2fe]/40'
                  }`}
              >
                {cat.toUpperCase()}
                {count > 0 && <span className="text-[10px] opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Entries */}
        <div className="max-h-[58vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#64748b]">
              No entries in this category yet.<br />
              The archive is still awakening.
            </div>
          )}

          {filtered.map((entry, index) => (
            <div 
              key={index} 
              className="border-l-4 border-[#00f2fe]/60 pl-5 py-2 bg-black/20 hover:bg-black/30 transition-colors rounded-r"
            >
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-mono text-[10px] tracking-[2px] text-[#ff9f00] bg-[#ff9f00]/10 px-2 py-px rounded">
                  {entry.category}
                </span>
                <span className="font-semibold text-xl tracking-[-0.3px] text-white">{entry.title}</span>
              </div>

              <div className="text-[#d1d5db] leading-relaxed text-[15px] whitespace-pre-line mt-2">
                {entry.body}
              </div>

              {entry.replayable && (
                <button
                  onClick={() => handleReplay(entry)}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-[#ff9f00] hover:text-[#f0d878] transition-colors font-medium"
                >
                  <Play size={15} /> REPLAY MEMORY SEQUENCE
                </button>
              )}

              <div className="text-[10px] text-[#475569] mt-3 font-mono tracking-widest">
                {new Date(entry.timestamp).toLocaleDateString()} — ARCHIVE ENTRY {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-[10px] text-[#475569] font-mono tracking-[1.5px]">
          <div>PRESS J AGAIN OR ESC TO CLOSE</div>
          <div>POWERED BY LUMEN LABS — 32-BIT ARCHIVE</div>
        </div>
      </div>
    </div>
  );
}
