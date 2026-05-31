import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterConfig, GameState, JournalEntry, SEED_JOURNAL, INITIAL_ARTIFACTS, INITIAL_UPGRADES } from '../game/types';

interface GameStore extends GameState {
  setCharacter: (char: CharacterConfig) => void;
  discoverArtifact: (artifactId: string) => void;
  attuneArtifact: (artifactId: string) => void;
  equipUpgrade: (upgradeId: string) => void;
  unequipUpgrade: (upgradeId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'timestamp'>) => void;
  reset: () => void;
}

const initialState: GameState = {
  character: null,
  discoveredArtifacts: [],
  equippedUpgrades: [],
  journal: [...SEED_JOURNAL],
  currentLocation: 'The Sprawl — 2026',
  playtime: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCharacter: (char) => set({ character: char }),

      discoverArtifact: (id) => {
        const { discoveredArtifacts } = get();
        if (!discoveredArtifacts.includes(id)) {
          set({ discoveredArtifacts: [...discoveredArtifacts, id] });
        }
      },

      attuneArtifact: (id) => {
        const { discoveredArtifacts, equippedUpgrades, journal } = get();
        const artifact = INITIAL_ARTIFACTS.find(a => a.id === id);
        if (!artifact) return;

        // Move to upgrades if not already
        const newEquipped = equippedUpgrades.includes(artifact.grantedUpgradeId)
          ? equippedUpgrades
          : [...equippedUpgrades, artifact.grantedUpgradeId];

        // Add journal entry
        const newEntry: JournalEntry = {
          id: `j_artifact_${id}_${Date.now()}`,
          title: artifact.name,
          body: artifact.lore + "\n\n" + artifact.memoryText.join("\n\n"),
          category: 'Artifact',
          timestamp: Date.now(),
          replayable: true,
          artifactId: id,
        };

        set({
          discoveredArtifacts: discoveredArtifacts.filter(a => a !== id), // remove from "found but un-attuned"
          equippedUpgrades: newEquipped,
          journal: [...journal, newEntry],
        });
      },

      equipUpgrade: (id) => {
        const { equippedUpgrades } = get();
        if (!equippedUpgrades.includes(id)) {
          set({ equippedUpgrades: [...equippedUpgrades, id] });
        }
      },

      unequipUpgrade: (id) => {
        set(state => ({
          equippedUpgrades: state.equippedUpgrades.filter(u => u !== id),
        }));
      },

      addJournalEntry: (entry) => {
        set(state => ({
          journal: [...state.journal, { ...entry, timestamp: Date.now() }],
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'discovery-game-state',
      partialize: (state) => ({
        character: state.character,
        discoveredArtifacts: state.discoveredArtifacts,
        equippedUpgrades: state.equippedUpgrades,
        journal: state.journal,
      }),
    }
  )
);
