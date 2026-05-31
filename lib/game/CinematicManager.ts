import Phaser from 'phaser';
import { gameEventBus } from './GameEventBus';

// Lightweight CinematicManager for orchestrating high-impact sequences
// Used for artifact attunement, memory flashbacks, etc.
// For v1 we do powerful in-engine sequences (chunky 32-bit figures, timed beats, letterboxing via events)

export class CinematicManager {
  private scene: Phaser.Scene;
  private isPlaying = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async playAttunementSequence(artifactId: string, onComplete: () => void) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const cam = this.scene.cameras.main;

    // 1. Cinematic slow-down
    this.scene.time.delayedCall(180, () => {
      gameEventBus.emit('show-dialogue', {
        speaker: 'THE ARCHIVE',
        text: "You have found what was never meant to be lost.",
      });
    });

    // 2. Play the real transformation video cutscene first (high cinematic impact)
    this.scene.time.delayedCall(900, () => {
      // Dispatch to React shell
      window.dispatchEvent(new CustomEvent('play-cutscene', { 
        detail: { videoId: 'transformation' } 
      }));
    });

    // 3. After video ends, continue with in-engine memory stage (or we can skip to onComplete)
    // For now we chain the powerful 32-bit memory silhouettes after the video
    this.scene.time.delayedCall(10500, () => {
      this.createMemoryStage();

      const beats = [
        { delay: 400, speaker: "GRIOT'S VOICE", text: "They took the drums. They took the names. They took the land." },
        { delay: 2100, speaker: "GRIOT'S VOICE", text: "But they could not take the rhythm that lives in the blood." },
        { delay: 3900, speaker: "GRIOT'S VOICE", text: "You are the continuation. You are the resistance that remembers." },
        { delay: 5600, speaker: "KHALIL (AWAKENING)", text: "I hear you... I carry you." },
      ];

      beats.forEach((beat, index) => {
        this.scene.time.delayedCall(beat.delay, () => {
          gameEventBus.emit('show-dialogue', { speaker: beat.speaker, text: beat.text });
          if (index === 1 || index === 2) this.pulseAncestralFigures();
        });
      });

      this.scene.time.delayedCall(8200, () => {
        this.clearMemoryStage();
        this.isPlaying = false;
        onComplete();
      });
    });
  }

  private memoryGraphics: Phaser.GameObjects.Graphics[] = [];

  private createMemoryStage() {
    const { width, height } = this.scene.scale;

    // Darker ancestral layer
    const veil = this.scene.add.graphics();
    veil.fillStyle(0x0a0c12, 0.65);
    veil.fillRect(0, 0, 320, 240);
    this.memoryGraphics.push(veil);

    // Chunky ancestral silhouettes (community / resistance figures)
    const fig1 = this.scene.add.graphics();
    fig1.fillStyle(0x2C211B, 0.9);
    fig1.fillRect(80, 110, 18, 42);   // body
    fig1.fillCircle(89, 102, 8);     // head
    this.memoryGraphics.push(fig1);

    const fig2 = this.scene.add.graphics();
    fig2.fillStyle(0x3F2A22, 0.85);
    fig2.fillRect(130, 115, 16, 38);
    fig2.fillCircle(138, 108, 7);
    this.memoryGraphics.push(fig2);

    const fig3 = this.scene.add.graphics();
    fig3.fillStyle(0x4A3428, 0.9);
    fig3.fillRect(175, 108, 20, 45);
    fig3.fillCircle(185, 100, 8);
    this.memoryGraphics.push(fig3);

    // Central glowing relic / memory focus
    const relic = this.scene.add.graphics();
    relic.fillStyle(0xff9f00, 0.7);
    relic.fillCircle(160, 95, 6);
    relic.fillStyle(0xff9f00, 0.25);
    relic.fillCircle(160, 95, 14);
    this.memoryGraphics.push(relic);

    // Ley lines connecting figures (32-bit thick)
    const lines = this.scene.add.graphics();
    lines.lineStyle(2, 0x00f2fe, 0.5);
    lines.lineBetween(89, 115, 138, 118);
    lines.lineBetween(138, 118, 185, 112);
    this.memoryGraphics.push(lines);
  }

  private pulseAncestralFigures() {
    this.memoryGraphics.forEach((g, i) => {
      if (i < 3) { // the figures
        this.scene.tweens.add({
          targets: g,
          alpha: { from: 0.6, to: 1 },
          duration: 280,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
      }
    });
  }

  private clearMemoryStage() {
    this.memoryGraphics.forEach(g => g.destroy());
    this.memoryGraphics = [];
  }

  /** Play any generated video cutscene (e.g. from Journal replay or future moments) */
  playVideoCutscene(videoId: string, onComplete?: () => void) {
    window.dispatchEvent(new CustomEvent('play-cutscene', { 
      detail: { videoId } 
    }));
    // Note: onComplete will be called by the React VideoCutscene component
    if (onComplete) {
      // Simple timeout fallback in case component doesn't fire (can be improved with a shared event)
      setTimeout(onComplete, 14000);
    }
  }
}
