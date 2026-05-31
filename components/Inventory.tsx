'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '../lib/store/gameStore';
import { INITIAL_ARTIFACTS, INITIAL_UPGRADES } from '../lib/game/types';
import { X, Zap, Shield, Sparkles } from 'lucide-react';

type Tab = 'artifacts' | 'upgrades';

export default function Inventory() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('upgrades');

  const discoveredIds = useGameStore((s) => s.discoveredArtifacts);
  const equippedIds = useGameStore((s) => s.equippedUpgrades);
  const attuneArtifact = useGameStore((s) => s.attuneArtifact);
  const equipUpgrade = useGameStore((s) => s.equipUpgrade);
  const unequipUpgrade = useGameStore((s) => s.unequipUpgrade);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('open-inventory', openHandler);

    const closeHandler = () => setOpen(false);
    window.addEventListener('close-overlays', closeHandler);

    return () => {
      window.removeEventListener('open-inventory', openHandler);
      window.removeEventListener('close-overlays', closeHandler);
    };
  }, []);

  // ESC support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const availableArtifacts = INITIAL_ARTIFACTS.filter(a => discoveredIds.includes(a.id));
  const availableUpgrades = INITIAL_UPGRADES; // In full game we'd filter discovered ones

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80" 
      onClick={() => setOpen(false)}
    >
      <div 
        className="glass-panel w-full max-w-[860px] mx-4 p-7 retro-border" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="eyebrow tracking-[3px]">LUMEN ARCHIVE // POWER & RELICS</div>
            <div className="text-3xl font-semibold tracking-[-1px] mt-1">INVENTORY</div>
          </div>
          <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-white p-2 -mr-2">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setTab('upgrades')}
            className={`px-8 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-all
              ${tab === 'upgrades' 
                ? 'text-[#00f2fe] border-[#00f2fe] bg-[#00f2fe]/5' 
                : 'text-[#64748b] border-transparent hover:text-[#00f2fe]'}`}
          >
            <Zap size={16} /> UPGRADES <span className="text-xs opacity-60">({equippedIds.length} equipped)</span>
          </button>
          <button
            onClick={() => setTab('artifacts')}
            className={`px-8 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px transition-all
              ${tab === 'artifacts' 
                ? 'text-[#ff9f00] border-[#ff9f00] bg-[#ff9f00]/5' 
                : 'text-[#64748b] border-transparent hover:text-[#ff9f00]'}`}
          >
            <Sparkles size={16} /> ARTIFACTS <span className="text-xs opacity-60">({availableArtifacts.length} found)</span>
          </button>
        </div>

        {/* UPGRADES TAB */}
        {tab === 'upgrades' && (
          <div>
            {equippedIds.length === 0 && (
              <div className="py-10 text-center text-[#64748b]">
                No upgrades attuned yet.<br />Find relics in the world and attune to awaken their power.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equippedIds.map(id => {
                const upgrade = INITIAL_UPGRADES.find(u => u.id === id);
                if (!upgrade) return null;

                return (
                  <div key={id} className="border border-[#00f2fe]/50 bg-black/30 p-5 rounded-xl group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#00f2fe]/20 flex items-center justify-center">
                        <Zap className="text-[#00f2fe]" size={18} />
                      </div>
                      <div className="font-semibold text-lg text-white tracking-tight">{upgrade.name}</div>
                      <div className="ml-auto text-[10px] px-3 py-px rounded-full bg-[#00f2fe]/10 text-[#00f2fe] font-mono tracking-widest">EQUIPPED</div>
                    </div>

                    <div className="text-sm text-[#d1d5db] leading-snug">{upgrade.effect}</div>
                    <div className="italic text-xs text-[#94a3b8] mt-3 border-t border-white/10 pt-3">“{upgrade.flavor}”</div>

                    <button
                      onClick={() => unequipUpgrade(id)}
                      className="mt-4 text-xs text-[#64748b] hover:text-red-400 transition-colors"
                    >
                      UNEQUIP
                    </button>
                  </div>
                );
              })}

              {/* Show all possible upgrades for the vertical slice */}
              {availableUpgrades
                .filter(u => !equippedIds.includes(u.id))
                .map(upgrade => (
                  <div key={upgrade.id} className="border border-white/10 bg-black/20 p-5 rounded-xl opacity-75 hover:opacity-100 transition-all">
                    <div className="font-semibold tracking-tight mb-1.5">{upgrade.name}</div>
                    <div className="text-sm text-[#94a3b8]">{upgrade.effect}</div>
                    <button
                      onClick={() => equipUpgrade(upgrade.id)}
                      className="mt-4 text-xs btn btn-ghost px-4 py-1"
                    >
                      EQUIP
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ARTIFACTS TAB */}
        {tab === 'artifacts' && (
          <div className="space-y-4">
            {availableArtifacts.length === 0 && (
              <div className="py-8 text-center text-[#64748b]">
                No artifacts discovered yet. Explore the 32-bit world.
              </div>
            )}

            {INITIAL_ARTIFACTS.map(artifact => {
              const isFound = discoveredIds.includes(artifact.id);
              const isAttuned = equippedIds.includes(artifact.grantedUpgradeId);

              return (
                <div 
                  key={artifact.id} 
                  className={`border p-5 rounded-xl transition-all ${isAttuned ? 'border-[#7fff00]/50 bg-[#7fff00]/5' : isFound ? 'border-[#ff9f00]/40' : 'border-white/10 opacity-40'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-[#ff9f00]"><Sparkles size={18} /></div>
                    <div className="font-semibold text-xl tracking-[-0.3px]">{artifact.name}</div>
                    {isAttuned && <div className="ml-auto text-xs px-3 py-px rounded bg-[#7fff00]/20 text-[#7fff00] font-mono">ATTUNED</div>}
                  </div>

                  <div className="text-[#d1d5db] text-[15px] leading-relaxed">{artifact.lore}</div>

                  {isFound && !isAttuned && (
                    <button 
                      onClick={() => {
                        attuneArtifact(artifact.id);
                        // Keep inventory open so they can see the result
                      }}
                      className="mt-4 btn btn-gold text-sm px-6 py-2"
                    >
                      ATTUNE TO THIS MEMORY
                    </button>
                  )}

                  {isAttuned && (
                    <div className="text-xs text-[#7fff00] mt-3 font-mono tracking-widest">THIS MEMORY NOW LIVES IN YOU</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-[10px] text-[#475569] mt-6 pt-4 border-t border-white/10 font-mono tracking-[1.5px] flex justify-between">
          <div>PRESS I AGAIN OR ESC TO CLOSE • CHANGES TAKE EFFECT IMMEDIATELY IN THE WORLD</div>
          <div>POWERED BY LUMEN LABS</div>
        </div>
      </div>
    </div>
  );
}
