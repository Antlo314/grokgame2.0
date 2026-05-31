import Phaser from 'phaser';
import { CharacterConfig } from './types';
import { PlayerRenderer } from './PlayerRenderer';
import { gameEventBus } from './GameEventBus';

// =====================================================
// INTRO CINEMATIC SCENE
// Slow deliberate 2026 walk that teaches controls naturally
// Inner monologue via DialogueBox events
// First artifact discovery moment
// Hands off to GameScene with correct player position + state
// =====================================================

export class IntroCinematicScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private characterConfig!: CharacterConfig;
  private walkPrompt!: Phaser.GameObjects.Text;
  private isWalking = false;
  private cinematicComplete = false;
  private frame = 0;

  constructor() {
    super({ key: 'IntroCinematicScene' });
  }

  init(data: { character: CharacterConfig }) {
    this.characterConfig = data.character;
  }

  create() {
    const { width, height } = this.scale;

    // Deep 2026 night archive street (very limited 32-bit palette)
    this.cameras.main.setBackgroundColor('#0a0c12');

    // Chunky ground dither
    const ground = this.add.graphics();
    ground.fillStyle(0x1a1f2e, 1);
    ground.fillRect(0, 140, 320, 100);
    ground.fillStyle(0x12161f, 1);
    for (let x = 0; x < 320; x += 4) {
      for (let y = 140; y < 240; y += 4) {
        if ((x + y) % 8 === 0) ground.fillRect(x, y, 2, 2);
      }
    }

    // Distant buildings (silhouettes)
    const b1 = this.add.graphics();
    b1.fillStyle(0x0f121a, 1);
    b1.fillRect(20, 40, 48, 100);
    b1.fillRect(80, 70, 36, 70);
    b1.fillRect(200, 30, 70, 110);

    // Ley line glow (subtle)
    const ley = this.add.graphics();
    ley.lineStyle(2, 0x00f2fe, 0.3);
    ley.lineBetween(40, 160, 280, 155);

    // Create the custom player from CharacterCreator config
    this.player = PlayerRenderer.drawPlayer(this, 80, 165, this.characterConfig, 2.8);

    // Slow cinematic camera follow
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
    this.cameras.main.setDeadzone(40, 20);

    // Opening prompt (typewriter style via DOM overlay later; here as simple text)
    this.walkPrompt = this.add.text(160, 60, 'HOLD W OR ↑ TO WALK FORWARD', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#00f2fe',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0.9);

    // Inner monologue kickoff after short hold
    this.time.delayedCall(1400, () => {
      gameEventBus.emit('show-dialogue', {
        speaker: 'KHALIL (INNER)',
        text: "I came here looking for records... not answers. But something in these old walls has been waiting for me.",
      });
    });

    // Keyboard input for forced slow walk tutorial
    const cursors = this.input.keyboard!.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.cinematicComplete) return;

      if ((e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') && !this.isWalking) {
        this.isWalking = true;
        this.walkPrompt.setText('KEEP MOVING... THE ARCHIVE IS BREATHING');
        this.time.delayedCall(1800, () => {
          if (!this.cinematicComplete) {
            gameEventBus.emit('show-dialogue', {
              speaker: 'KHALIL',
              text: "There — under the floorboards. That glow... it's not modern. It's remembering me.",
            });
          }
        });
      }
    });

    // Auto-advance the cinematic after player walks a bit (or timeout fallback)
    this.time.delayedCall(8200, () => {
      if (!this.cinematicComplete) this.completeIntro();
    });

    // Simple update loop for walk bob
    this.events.on('update', this.handleUpdate, this);
  }

  private handleUpdate() {
    this.frame++;
    if (this.player && (this.player as any).walkBob) {
      (this.player as any).walkBob(this.frame);
    }

    // If player has moved far enough, complete
    if (this.player && this.player.x > 210 && !this.cinematicComplete) {
      this.completeIntro();
    }
  }

  private completeIntro() {
    if (this.cinematicComplete) return;
    this.cinematicComplete = true;

    this.walkPrompt.destroy();

    // Hand off to main game with correct player start position
    this.scene.start('GameScene', {
      character: this.characterConfig,
      startX: this.player.x,
      startY: this.player.y,
    });
  }
}
