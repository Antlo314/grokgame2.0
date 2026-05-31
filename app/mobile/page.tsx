'use client';

import React from 'react';

// Touch-first version of Discovery.
// Same Phaser game instance (or lighter variant) + virtual controls.
// For vertical slice this is a functional stub with clear "full parity coming" messaging.

export default function MobilePlay() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col">
      <div className="p-4 text-center border-b border-white/10">
        <div className="eyebrow">MOBILE — TOUCH OPTIMIZED</div>
        <div className="text-xl mt-1 font-semibold">DISCOVERY</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="text-4xl mb-4">📱</div>
          <h2 className="text-2xl font-bold mb-3">Touch-First Build Coming</h2>
          <p className="text-[#94a3b8] text-sm leading-relaxed">
            The full 32-bit cinematic experience with virtual joystick, large action buttons, and simplified overlays is being built in parallel with the PC version.
            <br /><br />
            For the best first playthrough, use a desktop browser with keyboard + mouse.
          </p>
          <a href="/play" className="btn btn-primary mt-8 inline-block">PLAY PC VERSION INSTEAD</a>
        </div>
      </div>

      <div className="p-4 text-center text-[10px] text-[#475569] border-t border-white/10">
        POWERED BY LUMEN LABS • 32-BIT ENGINE
      </div>
    </div>
  );
}
