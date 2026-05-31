// Tiny typed event bus for Phaser <-> React communication
// Used for cinematic triggers (show-dialogue, play-cutscene, open-inventory, etc.)

type GameEventMap = {
  'show-dialogue': { speaker: string; text: string; portraitConfig?: any };
  'play-cutscene': { videoId: string; onComplete?: () => void };
  'open-journal': {};
  'open-inventory': {};
  'attune-complete': { artifactId: string };
  'player-move': { x: number; y: number };
};

type EventCallback<K extends keyof GameEventMap> = (data: GameEventMap[K]) => void;

class GameEventBus {
  private listeners = new Map<keyof GameEventMap, Set<EventCallback<any>>>();

  on<K extends keyof GameEventMap>(event: K, cb: EventCallback<K>) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb as any);
  }

  off<K extends keyof GameEventMap>(event: K, cb: EventCallback<K>) {
    this.listeners.get(event)?.delete(cb as any);
  }

  emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]) {
    this.listeners.get(event)?.forEach((cb) => (cb as any)(data));
  }

  clear() {
    this.listeners.clear();
  }
}

export const gameEventBus = new GameEventBus();
export default gameEventBus;
