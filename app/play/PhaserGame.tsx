'use client';

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { CharacterConfig } from '../../lib/game/types';
import { IntroCinematicScene } from '../../lib/game/IntroCinematicScene';
import { GameScene } from '../../lib/game/GameScene';

interface PhaserGameProps {
  character: CharacterConfig;
}

export default function PhaserGame({ character }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    // 320x240 internal resolution — true 32-bit console feel
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 320,
      height: 240,
      parent: containerRef.current,
      pixelArt: true,
      roundPixels: true,
      physics: { default: 'arcade', arcade: { debug: false } },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 320,
        height: 240,
      },
      backgroundColor: '#0a0c12',
      scene: [IntroCinematicScene, GameScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Pass character into the first scene
    game.scene.start('IntroCinematicScene', { character });

    // Expose for debug / future React bridges
    (window as any).discoveryGame = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [character]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full border-[12px] border-[#1a1f2e] shadow-2xl overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
