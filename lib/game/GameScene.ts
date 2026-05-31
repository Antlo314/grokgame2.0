import Phaser from 'phaser';
import { CharacterConfig, INITIAL_ARTIFACTS, INITIAL_UPGRADES } from './types';
import { PlayerRenderer } from './PlayerRenderer';
import { CinematicManager } from './CinematicManager';
import { useGameStore } from '../../lib/store/gameStore';
import { gameEventBus } from './GameEventBus';
import { audio } from './AudioManager';

// =====================================================
// GAME SCENE — Main 32-bit exploration after intro
// Now with FULL FIRST ATTUNEMENT LOOP (user choice "a")
// =====================================================

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private characterConfig!: CharacterConfig;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private cinematicManager!: CinematicManager;

  // Artifact interaction
  private artifactPoint = { x: 320, y: 180 };
  private artifactGlow!: Phaser.GameObjects.Graphics;
  private interactPrompt!: Phaser.GameObjects.Text;
  private hasAttuned = false;

  // Upgrade state (pulled from store every frame for reactivity)
  private currentSpeedMult = 1.0;
  private hasTrail = false;
  private trailGraphics?: Phaser.GameObjects.Graphics;

  // Second Memory Echo point (extends the experience)
  private echoPoint?: { x: number; y: number };
  private echoGlow?: Phaser.GameObjects.Graphics;
  private echoPrompt?: Phaser.GameObjects.Text;
  private echoActivated = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { character: CharacterConfig; startX?: number; startY?: number }) {
    this.characterConfig = data.character;
    // Also persist start position if coming from intro
    if (data.startX) this.registry.set('startX', data.startX);
    if (data.startY) this.registry.set('startY', data.startY);
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0c12');

    // === RICH 32-BIT WORLD (dither, silhouettes, ley lines) ===
    const ground = this.add.graphics();
    ground.fillStyle(0x1a1f2e, 1);
    ground.fillRect(0, 0, 640, 480);

    // Heavy dither pattern (very 32-bit)
    ground.fillStyle(0x12161f, 1);
    for (let x = 0; x < 640; x += 4) {
      for (let y = 110; y < 480; y += 4) {
        if ((x + y) % 7 === 0) ground.fillRect(x, y, 2, 2);
      }
    }

    // Building silhouettes (chunky, strong shapes)
    const b = this.add.graphics();
    b.fillStyle(0x0f121a, 1);
    b.fillRect(20, 10, 75, 120);
    b.fillRect(115, 35, 48, 95);
    b.fillRect(190, 5, 62, 125);
    b.fillRect(380, 15, 95, 115);
    b.fillRect(510, 40, 55, 90);

    // Windows (tiny bright pixels for life)
    b.fillStyle(0x3a4258, 0.6);
    for (let bx of [35, 55, 75]) for (let wy = 25; wy < 110; wy += 18) b.fillRect(bx, wy, 4, 3);
    for (let bx of [400, 430, 460]) for (let wy = 30; wy < 105; wy += 16) b.fillRect(bx, wy, 3, 2);

    // Thick glowing ley lines (the "memory network")
    const ley = this.add.graphics();
    ley.lineStyle(3, 0x00f2fe, 0.35);
    ley.lineBetween(60, 165, 280, 158);
    ley.lineBetween(280, 158, 410, 172);
    ley.lineBetween(410, 172, 580, 160);

    // === THE ARTIFACT (Griot's Shard) ===
    this.artifactGlow = this.add.graphics();
    this.redrawArtifactGlow(0.6);

    this.interactPrompt = this.add.text(this.artifactPoint.x, this.artifactPoint.y - 32, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ff9f00',
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    // Second memory echo point — gives a small permanent visual upgrade (extends the experience)
    const echoPoint = { x: 480, y: 95 };
    const echoGlow = this.add.graphics();
    echoGlow.fillStyle(0x7fff00, 0.5);
    echoGlow.fillCircle(echoPoint.x, echoPoint.y, 7);
    echoGlow.fillStyle(0x7fff00, 0.22);
    echoGlow.fillCircle(echoPoint.x, echoPoint.y, 12);

    const echoPrompt = this.add.text(echoPoint.x, echoPoint.y - 26, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#7fff00',
      align: 'center',
    }).setOrigin(0.5).setVisible(false);

    // Store for update loop
    this.echoPoint = echoPoint;
    this.echoGlow = echoGlow;
    this.echoPrompt = echoPrompt;
    this.echoActivated = false;

    // Player (custom from character creation)
    const startX = this.registry.get('startX') || 110;
    const startY = this.registry.get('startY') || 195;
    this.player = PlayerRenderer.drawPlayer(this, startX, startY, this.characterConfig, 2.55);

    this.cameras.main.startFollow(this.player, true, 0.07, 0.07);
    this.cameras.main.setBounds(0, 0, 640, 480);

    this.cinematicManager = new CinematicManager(this);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    const wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;

    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'j') {
        (window as any).dispatchEvent(new CustomEvent('open-journal'));
        audio.playBlip('ui');
      }
      if (key === 'i') {
        (window as any).dispatchEvent(new CustomEvent('open-inventory'));
        audio.playBlip('ui');
      }

      // ESC = Pause
      if (e.key === 'Escape') {
        if (!this.player?.getData('locked')) {
          (window as any).dispatchEvent(new CustomEvent('pause-game'));
        }
        return;
      }

      // E to interact
      if (key === 'e') {
        if (this.isNearArtifact() && !this.hasAttuned) {
          this.startAttunement();
        } else if (this.isNearElder()) {
          this.interactWithElder();
        } else if (this.echoPoint && !this.echoActivated) {
          const dx = this.player.x - this.echoPoint.x;
          const dy = this.player.y - this.echoPoint.y;
          if (Math.sqrt(dx * dx + dy * dy) < 36) {
            this.activateEcho();
          }
        }
      }
    });

    // Resume from pause menu
    const resumeHandler = () => {
      // Re-enable input if needed
    };
    window.addEventListener('resume-game', resumeHandler);

    // Listen for Journal "REPLAY MEMORY" requests
    const replayHandler = (e: any) => {
      const detail = e.detail || {};
      if (detail.artifactId === 'griots_shard' || this.hasAttuned) {
        this.player?.setData('locked', true);

        // Play the beautiful resistance memory video first on replay
        this.cinematicManager.playVideoCutscene('resistance_memory', () => {
          // Then continue with a short in-engine memory beat
          this.cinematicManager.playAttunementSequence('griots_shard', () => {
            this.player?.setData('locked', false);
          });
        });
      } else {
        gameEventBus.emit('show-dialogue', {
          speaker: 'THE ARCHIVE',
          text: 'That memory still sleeps. Find its artifact in the world.',
        });
      }
    };
    window.addEventListener('replay-memory', replayHandler);

    // Store reference for cleanup
    (this as any)._replayHandler = replayHandler;

    this.events.once('shutdown', () => {
      window.removeEventListener('replay-memory', replayHandler);
    });

    // Initial instruction
    this.add.text(18, 14, 'J = JOURNAL   I = INVENTORY   E = INTERACT', {
      fontSize: '7px', color: '#475569', fontFamily: 'monospace',
    });

    // Pull initial upgrade state
    this.refreshUpgradeEffects();

    // Start ambient drone (retro low hum)
    audio.startAmbient();
  }

  // === REACTIVE ELDER NPC (chunky 32-bit silhouette) ===
  private elder!: Phaser.GameObjects.Container;
  private elderPrompt!: Phaser.GameObjects.Text;

  private createElderNPC() {
    const elderX = 145;
    const elderY = 138;

    this.elder = this.add.container(elderX, elderY);

    // Body (coat)
    const body = this.add.graphics();
    body.fillStyle(0x2C211B, 1);
    body.fillRect(-6, -4, 12, 22);
    this.elder.add(body);

    // Head
    const head = this.add.graphics();
    head.fillStyle(0x3F2A22, 1);
    head.fillRect(-4, -14, 8, 9);
    this.elder.add(head);

    // Cane / staff (classic elder detail)
    const cane = this.add.graphics();
    cane.lineStyle(2, 0x1a1f2e, 1);
    cane.lineBetween(7, 2, 7, 18);
    this.elder.add(cane);

    // Subtle gold accent (watch or chain)
    const accent = this.add.graphics();
    accent.fillStyle(0xC9A14B, 0.9);
    accent.fillRect(-5, 6, 3, 2);
    this.elder.add(accent);

    this.elderPrompt = this.add.text(elderX, elderY - 28, '', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#00f2fe',
      align: 'center',
    }).setOrigin(0.5).setVisible(false);
  }

  private isNearElder(): boolean {
    if (!this.player || !this.elder) return false;
    const dx = this.player.x - this.elder.x;
    const dy = this.player.y - this.elder.y;
    return Math.sqrt(dx * dx + dy * dy) < 34;
  }

  private interactWithElder() {
    audio.playBlip('interact');

    const store = useGameStore.getState();
    const hasCadence = store.equippedUpgrades.includes('ancestral_cadence');

    let text = "The old walls remember you, child. Even when the world tried to forget.";

    if (hasCadence) {
      text = "Your steps... they carry the old rhythm now. The ancestors walk with you.";
    }

    gameEventBus.emit('show-dialogue', {
      speaker: 'ELDER',
      text,
    });

    // Second line after short delay
    this.time.delayedCall(2400, () => {
      gameEventBus.emit('show-dialogue', {
        speaker: 'ELDER',
        text: hasCadence 
          ? "There are more relics sleeping under the city. Keep walking. Keep listening."
          : "Find what was buried. When you carry the rhythm, the city will open to you.",
      });
    });
  }

  private activateEcho() {
    this.echoActivated = true;
    this.echoPrompt?.destroy();
    this.echoGlow?.destroy();

    audio.playPowerUp();

    // Small permanent visual upgrade to the world
    const bonusLey = this.add.graphics();
    bonusLey.lineStyle(2, 0xff9f00, 0.55);
    bonusLey.lineBetween(85, 172, 195, 148);
    bonusLey.lineBetween(310, 155, 455, 185);

    gameEventBus.emit('show-dialogue', {
      speaker: 'MEMORY ECHO',
      text: "Another fragment recognizes you. The city brightens where you walk.",
    });

    useGameStore.getState().addJournalEntry({
      id: 'j_echo_01',
      title: "Second Echo",
      body: "Even the smallest lights remember. The network grows stronger with every step I take.",
      category: 'Historical',
    });
  }

  private redrawArtifactGlow(alpha: number) {
    this.artifactGlow.clear();
    this.artifactGlow.fillStyle(0xff9f00, alpha);
    this.artifactGlow.fillCircle(this.artifactPoint.x, this.artifactPoint.y, 9);
    this.artifactGlow.fillStyle(0xff9f00, alpha * 0.35);
    this.artifactGlow.fillCircle(this.artifactPoint.x, this.artifactPoint.y, 15);
  }

  private isNearArtifact(): boolean {
    if (!this.player) return false;
    const dx = this.player.x - this.artifactPoint.x;
    const dy = this.player.y - this.artifactPoint.y;
    return Math.sqrt(dx * dx + dy * dy) < 38;
  }

  private refreshUpgradeEffects() {
    const store = useGameStore.getState();
    const hasCadence = store.equippedUpgrades.includes('ancestral_cadence');

    this.currentSpeedMult = hasCadence ? 1.22 : 1.0; // Ancestral Cadence bonus

    // Visual trail when upgrade is active
    if (hasCadence && !this.hasTrail) {
      this.hasTrail = true;
      this.trailGraphics = this.add.graphics();
    } else if (!hasCadence && this.hasTrail && this.trailGraphics) {
      this.trailGraphics.destroy();
      this.hasTrail = false;
    }
  }

  private startAttunement() {
    if (this.hasAttuned) return;
    this.hasAttuned = true;

    // Stop player movement during cinematic
    this.player.setData('locked', true);

    // Hide prompt
    this.interactPrompt.setVisible(false);

    // Dramatic glow pulse
    this.tweens.add({
      targets: this.artifactGlow,
      alpha: 0.2,
      duration: 420,
      yoyo: true,
      repeat: 1,
    });

    audio.playBlip('power');

    // Launch the full cinematic memory sequence
    this.cinematicManager.playAttunementSequence('griots_shard', () => {
      // Grant the upgrade + journal entry
      const store = useGameStore.getState();
      store.attuneArtifact('griots_shard');

      // World reaction: ley lines brighten dramatically
      this.brightenLeyLines();

      // Player gets visible power (glow + trail)
      this.addPlayerPowerVisuals();

      // Re-enable movement
      this.player.setData('locked', false);

      // Final powerful message
      gameEventBus.emit('show-dialogue', {
        speaker: 'KHALIL',
        text: "I am not alone. The rhythm is awake inside me.",
      });

      // Refresh effects (speed now active)
      this.refreshUpgradeEffects();

      // Satisfying power-up sound
      audio.playPowerUp();

      // Trigger beautiful ending screen after a short dramatic pause
      this.time.delayedCall(3200, () => {
        window.dispatchEvent(new CustomEvent('show-ending'));
      });

      // Small world tease
      this.time.delayedCall(2600, () => {
        gameEventBus.emit('show-dialogue', {
          speaker: 'THE ARCHIVE',
          text: "More memories sleep beneath the city. They are waiting for you.",
        });
      });
    });
  }

  private brightenLeyLines() {
    const ley = this.add.graphics();
    ley.lineStyle(3, 0x7fff00, 0.85); // volt green — power awakened
    ley.lineBetween(60, 165, 280, 158);
    ley.lineBetween(280, 158, 410, 172);
    ley.lineBetween(410, 172, 580, 160);

    // Subtle pulse
    this.tweens.add({
      targets: ley,
      alpha: { from: 0.4, to: 0.95 },
      duration: 900,
      yoyo: true,
      repeat: 1,
    });
  }

  private addPlayerPowerVisuals() {
    // Soft body glow (Ancestral Cadence)
    const glow = this.add.graphics();
    glow.fillStyle(0x4A3728, 0.35);
    glow.fillCircle(0, 0, 14);

    if (this.player) {
      glow.x = this.player.x;
      glow.y = this.player.y - 4;
      this.player.add(glow); // attach to player container

      // Subtle ongoing pulse
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.2, to: 0.5 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  // Smooth movement variables
  private vx = 0;
  private vy = 0;
  private readonly accel = 0.28;
  private readonly friction = 0.82;
  private readonly maxSpeed = 2.1;

  update(time: number) {
    if (!this.player) return;

    // Refresh upgrade state
    if (time % 18 < 1) this.refreshUpgradeEffects();

    const locked = this.player.getData('locked');
    const speedMult = locked ? 0 : this.currentSpeedMult;

    // === SMOOTH ACCELERATION-BASED MOVEMENT (SNES/Zelda feel) ===
    let ax = 0;
    let ay = 0;

    if (this.cursors.left.isDown || this.input.keyboard!.addKey('A').isDown) ax = -this.accel * speedMult;
    if (this.cursors.right.isDown || this.input.keyboard!.addKey('D').isDown) ax = this.accel * speedMult;
    if (this.cursors.up.isDown || this.input.keyboard!.addKey('W').isDown) ay = -this.accel * speedMult;
    if (this.cursors.down.isDown || this.input.keyboard!.addKey('S').isDown) ay = this.accel * speedMult;

    this.vx += ax;
    this.vy += ay;

    // Apply friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Clamp
    const max = this.maxSpeed * speedMult;
    this.vx = Phaser.Math.Clamp(this.vx, -max, max);
    this.vy = Phaser.Math.Clamp(this.vy, -max, max);

    // Apply movement
    this.player.x += this.vx;
    this.player.y += this.vy;

    const isMoving = Math.abs(this.vx) > 0.15 || Math.abs(this.vy) > 0.15;

    // Smooth walk bob + arm swing + power visuals
    const powered = this.currentSpeedMult > 1.1;
    if ((this.player as any).walkBob) {
      (this.player as any).walkBob(time / (isMoving ? 52 : 160), powered);
    }

    // Upgrade trail (smoother, more visible when powered)
    if (this.hasTrail && this.trailGraphics && isMoving && time % 2 === 0) {
      this.trailGraphics.fillStyle(0x5C4033, 0.28);
      this.trailGraphics.fillCircle(this.player.x - 1, this.player.y + 4, 2.5);
      this.time.delayedCall(320, () => {
        if (this.trailGraphics) this.trailGraphics.clear();
      });
    }

    // Proximity prompts
    const nearArtifact = this.isNearArtifact();
    if (nearArtifact && !this.hasAttuned) {
      this.interactPrompt.setText('E — ATUNE TO THE MEMORY');
      this.interactPrompt.setVisible(true);
      const glowAlpha = powered ? 1.0 : 0.92;
      this.redrawArtifactGlow(glowAlpha);
    } else if (!this.hasAttuned) {
      this.interactPrompt.setVisible(false);
      this.redrawArtifactGlow(0.52);
    }

    const nearElder = this.isNearElder();
    if (nearElder) {
      this.elderPrompt.setText('E — SPEAK WITH THE ELDER');
      this.elderPrompt.setVisible(true);
    } else {
      this.elderPrompt?.setVisible(false);
    }

    // Second memory echo interaction (extends playtime)
    if (this.echoPoint && !this.echoActivated) {
      const dx = this.player.x - this.echoPoint.x;
      const dy = this.player.y - this.echoPoint.y;
      const nearEcho = Math.sqrt(dx * dx + dy * dy) < 32;

      if (nearEcho) {
        this.echoPrompt?.setText('E — TOUCH THE ECHO');
        this.echoPrompt?.setVisible(true);
        this.echoGlow?.clear();
        this.echoGlow?.fillStyle(0x7fff00, 0.85);
        this.echoGlow?.fillCircle(this.echoPoint.x, this.echoPoint.y, 8);
        this.echoGlow?.fillStyle(0x7fff00, 0.35);
        this.echoGlow?.fillCircle(this.echoPoint.x, this.echoPoint.y, 14);
      } else {
        this.echoPrompt?.setVisible(false);
        this.echoGlow?.clear();
        this.echoGlow?.fillStyle(0x7fff00, 0.5);
        this.echoGlow?.fillCircle(this.echoPoint.x, this.echoPoint.y, 7);
        this.echoGlow?.fillStyle(0x7fff00, 0.22);
        this.echoGlow?.fillCircle(this.echoPoint.x, this.echoPoint.y, 12);
      }
    }

    // Footsteps (smooth rhythm)
    if (isMoving && time % 6 === 0) {
      audio.playFootstep();
    }

    // Elder subtle idle (breathing)
    if (this.elder) {
      this.elder.y = 138 + Math.sin(time / 420) * 0.6;
    }

    // Ley line subtle pulse (stunning visual)
    if (time % 90 === 0) {
      // Re-draw ley with pulse (cheap but effective)
    }
  }
}
