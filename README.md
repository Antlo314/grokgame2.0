# DISCOVERY
**A Cinematic 32-Bit RPG Vertical Slice**  
**Powered by Lumen Labs**

> “The hero the world needs was forged in the memories they tried to erase.”

**DISCOVERY** is a premium, emotionally resonant, fully cinematic top-down 32-bit RPG experience built as a short, marketable vertical slice. It blends the deliberate pacing and visual language of classic SNES-era Zelda with modern 2026 production values and deep, respectful storytelling centered on African American resilience and ancestral power.

This is not a prototype. It is a complete, polished 15–25 minute experience designed to feel like the opening chapter of something much larger.

---

## Experience Highlights

- **Stunning 32-bit visuals** — 320×240 internal resolution, heavy dither, limited per-area palettes, chunky silhouettes, and authentic CRT/scanline treatment.
- **Deep African American character creation** — 10 skin tones, 15+ hair styles (locs, braids, afros, cornrows, twists, fades, etc.), presentation options, facial features, culturally resonant accessories, and 2026 urban-mystic clothing. Your choices are rendered live as the in-game sprite using pure procedural layered graphics.
- **Cinematic from the first frame** — Slow, deliberate opening that teaches controls naturally, rich inner monologue, and four high-impact Imagine-generated video cutscenes.
- **Meaningful systems** — Artifact attunement that grants permanent upgrades with both mechanical (speed) and visual (glow + trails) impact. Reactive world and dialogue.
- **Premium Lumen Labs presentation** — Every screen (title, character creator, pause, journal, inventory, ending) uses the exact obsidian + electric + gold design language from Lumen’s 2026 branding.

---

## Controls

| Key          | Action                     |
|--------------|----------------------------|
| WASD / Arrows | Move                      |
| E            | Interact / Talk to NPC    |
| J            | Open Journal              |
| I            | Open Inventory            |
| ESC          | Pause                     |
| M            | Toggle Audio (in pause)   |

---

## How to Run Locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

1. Create your Khalil Wright (go wild — the sprite will reflect every choice).
2. Begin the journey.
3. Experience the full first attunement loop, including real video cutscenes and reactive systems.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAntlo314%2Fgrokgame2.0)

One-click deploy to Vercel. The project is already optimized for it (long-term video caching is configured).

**Recommended settings on Vercel:**
- Framework: Next.js (auto-detected)
- Root Directory: `.`
- No environment variables required

The four video cutscenes are pre-committed and will be served with proper caching headers.

---

## Tech Stack

- **Next.js 16** + TypeScript + Tailwind
- **Phaser 3** — custom 32-bit rendering pipeline (procedural character + world)
- **Zustand** — single source of truth with persistence
- **Framer Motion** — cinematic UI transitions
- **Web Audio API** — all retro sounds generated live (no assets)
- **4 Imagine-generated video cutscenes** with heavy 32-bit CRT treatment

Design system is deliberately matched to Lumen Labs’ 2026 premium identity (obsidian, electric cyan, volt green, gold).

---

## Current Scope (Vertical Slice)

- Complete title screen + deep character creation
- Cinematic slow-walk tutorial intro
- One fully realized artifact attunement with video + memory sequence + permanent upgrade
- Rich, tabbed Journal with replayable memories
- Functional Inventory with attune/equip
- Reactive Elder NPC with upgrade-aware dialogue
- Smooth acceleration-based movement
- Full WebAudio (footsteps, ambient drone, power-ups, UI blips)
- Four high-quality video cutscenes
- Beautiful Pause Menu + cinematic ending screen

---

## What’s Next (Future Builds)

- Additional artifacts and attunements
- Larger, more layered world
- More reactive NPCs and branching memory sequences
- Mobile touch-optimized version
- Expanded Lumen Archive (cloud saves via Firebase)

---

## Credits

**A Lumen Labs Experience**  
Built as a demonstration of cinematic interactive storytelling at the highest level.

---

**The Archive is listening.**  
**The rhythm is awake.**

*2026*
