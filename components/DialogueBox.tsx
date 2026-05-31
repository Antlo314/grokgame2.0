'use client';

import React, { useEffect, useState } from 'react';
import { gameEventBus } from '../lib/game/GameEventBus';

// Simple but beautiful 32-bit styled typewriter dialogue overlay
// Receives events from Phaser scenes

export default function DialogueBox() {
  const [visible, setVisible] = useState(false);
  const [speaker, setSpeaker] = useState('');
  const [text, setText] = useState('');
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    const handler = ({ speaker, text }: { speaker: string; text: string }) => {
      setSpeaker(speaker);
      setText(text);
      setDisplayed('');
      setVisible(true);

      // Typewriter
      let i = 0;
      const interval = setInterval(() => {
        i += 2;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, 28);
    };

    gameEventBus.on('show-dialogue', handler);
    return () => gameEventBus.off('show-dialogue', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[80] w-[620px] max-w-[92%]">
      <div className="retro-border p-4 text-sm leading-relaxed">
        <div className="text-[#00f2fe] font-mono text-xs tracking-[2px] mb-1">{speaker}</div>
        <div className="typewriter text-[#f8fafc] min-h-[42px]">{displayed}</div>
        <div className="text-right mt-2">
          <button 
            onClick={() => setVisible(false)} 
            className="text-[#64748b] hover:text-[#00f2fe] text-xs tracking-widest font-mono"
          >
            CONTINUE →
          </button>
        </div>
      </div>
    </div>
  );
}
