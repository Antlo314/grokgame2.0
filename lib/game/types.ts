// =====================================================
// DISCOVERY — Core Type Definitions
// 32-bit Cinematic RPG — Lumen Labs
// =====================================================

export interface CharacterConfig {
  id: string;
  name: string;
  presentation: 'masculine' | 'feminine' | 'androgynous';
  skinTone: { id: string; name: string; hex: string; undertone: string };
  hairStyle: { id: string; name: string; category: string };
  hairColor: { id: string; name: string; hex: string; accent?: string };
  face: {
    eyes: string;
    nose: string;
    lips: string;
    jaw: string;
    facialHair: string;
  };
  accessories: string[];
  clothing: { id: string; name: string };
  createdAt: number;
}

export type ArtifactCategory = 'Memory' | 'Resilience' | 'Creation' | 'Legacy';

export interface Artifact {
  id: string;
  name: string;
  lore: string;
  category: ArtifactCategory;
  memoryText: string[]; // beats for cinematic dialogue
  grantedUpgradeId: string;
}

export interface Upgrade {
  id: string;
  name: string;
  effect: string;
  flavor: string;
  mechanical: {
    speedMultiplier?: number;
    interactionRadius?: number;
    glowColor?: string;
  };
  visual: {
    trailColor?: string;
    bodyGlow?: string;
  };
}

export type JournalCategory = 'Personal' | 'Historical' | 'Artifact' | 'Quest';

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  category: JournalCategory;
  timestamp: number;
  replayable?: boolean; // can re-trigger memory sequence
  artifactId?: string;
}

export interface GameState {
  character: CharacterConfig | null;
  discoveredArtifacts: string[];
  equippedUpgrades: string[];
  journal: JournalEntry[];
  currentLocation: string;
  playtime: number;
}

export const INITIAL_ARTIFACTS: Artifact[] = [
  {
    id: 'griots_shard',
    name: "Griot's Shard",
    lore: "A fragment of an ancient talking drum. When the world tried to silence our stories, this piece kept the rhythm alive.",
    category: 'Memory',
    memoryText: [
      "They came for the drums first.",
      "But rhythm lives in the blood.",
      "You are hearing what they could never erase.",
    ],
    grantedUpgradeId: 'ancestral_cadence',
  },
];

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'ancestral_cadence',
    name: "Ancestral Cadence",
    effect: "+18% movement speed. Earth-tone foot trails.",
    flavor: "The old ones walked with purpose. Now you do too.",
    mechanical: { speedMultiplier: 1.18 },
    visual: { trailColor: '#4A3728', bodyGlow: '#5C4033' },
  },
  {
    id: 'griots_resonance',
    name: "Griot's Resonance",
    effect: "NPCs within range react to your presence. New dialogue branches.",
    flavor: "Your voice carries the weight of generations.",
    mechanical: { interactionRadius: 1.6 },
    visual: { bodyGlow: '#00C4D0' },
  },
];

export const SEED_JOURNAL: JournalEntry[] = [
  {
    id: 'j_personal_01',
    title: "What They Tried to Erase",
    body: "I used to think history was something that happened to other people. Tonight the walls of the old archive spoke my name. Khalil Wright. They have always known me.",
    category: 'Personal',
    timestamp: Date.now() - 1000 * 60 * 8,
  },
  {
    id: 'j_historical_01',
    title: "The Weight We Carry Forward",
    body: "Every step I take now feels heavier and lighter at the same time. The ancestors did not survive so we could be comfortable. They survived so we could be dangerous — dangerous to forgetting.",
    category: 'Historical',
    timestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: 'j_artifact_griots_shard',
    title: "Griot's Shard — First Attunement",
    body: "The fragment sang when I touched it.\n\nThey took the drums. They took the names. They took the land.\nBut they could not take the rhythm that lives in the blood.\n\nI am the continuation. I am the resistance that remembers.",
    category: 'Artifact',
    timestamp: Date.now(),
    replayable: true,
    artifactId: 'griots_shard',
  },
];
