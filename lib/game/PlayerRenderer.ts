import Phaser from 'phaser';
import { CharacterConfig } from './types';

// =====================================================
// PROCEDURAL 32-BIT PLAYER RENDERER
// Layered chunky Graphics for hair, skin, accessories, clothing
// Called from IntroCinematicScene + GameScene
// This is what makes the character creation "real" in the game world
// =====================================================

export class PlayerRenderer {
  static drawPlayer(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: CharacterConfig,
    scale = 2.5
  ): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);
    container.setScale(scale);

    const skin = config.skinTone.hex;
    const hair = config.hairColor.hex;
    const hairAccent = config.hairColor.accent || hair;
    const gold = '#C9A14B';
    const clothDark = '#1C2526';
    const clothMid = '#2F3A3C';

    // === LEGS (better silhouette) ===
    const legs = scene.add.graphics();
    legs.fillStyle(0x12161f, 1);
    legs.fillRect(-6, 6, 5, 10);
    legs.fillRect(1, 6, 5, 10);
    container.add(legs);

    // === TORSO + CLOTHING (detailed based on choice) ===
    const torso = scene.add.graphics();
    torso.fillStyle(parseInt(clothDark.replace('#', '0x')), 1);
    torso.fillRect(-7, -3, 14, 10);

    const clothingId = config.clothing.id;

    // Hoodie / tactical
    if (clothingId.includes('hoodie') || clothingId.includes('Street')) {
      torso.fillStyle(parseInt(clothMid.replace('#', '0x')), 1);
      torso.fillRect(-8, -5, 16, 7); // hood
      torso.fillStyle(parseInt(gold.replace('#', '0x')), 0.7);
      for (let i = -5; i <= 5; i += 3) torso.fillRect(i, 0, 2, 1); // ley embroidery
    } 
    // Bomber / leather
    else if (clothingId.includes('bomber')) {
      torso.fillStyle(0x3A2A1F, 1);
      torso.fillRect(-7, -2, 14, 8);
      torso.fillStyle(parseInt(gold.replace('#', '0x')), 0.6);
      torso.fillRect(-3, 2, 6, 2); // patch
    } 
    // Dashiki fusion
    else if (clothingId.includes('dashiki')) {
      torso.fillStyle(0x4A3728, 1);
      torso.fillRect(-6, -2, 12, 9);
    } 
    // Long coat
    else if (clothingId.includes('coat')) {
      torso.fillStyle(0x1A1F2E, 1);
      torso.fillRect(-8, -4, 16, 14);
    }

    container.add(torso);

    // === ARMS (better swing) ===
    const leftArm = scene.add.graphics();
    leftArm.fillStyle(parseInt(skin.replace('#', '0x')), 1);
    leftArm.fillRect(-11, 0, 5, 9);
    container.add(leftArm);

    const rightArm = scene.add.graphics();
    rightArm.fillStyle(parseInt(skin.replace('#', '0x')), 1);
    rightArm.fillRect(6, 0, 5, 9);
    container.add(rightArm);

    // === HEAD ===
    const head = scene.add.graphics();
    head.fillStyle(parseInt(skin.replace('#', '0x')), 1);
    head.fillRect(-5, -14, 10, 12);
    container.add(head);

    // === HAIR (much more detailed per style) ===
    const hairGfx = scene.add.graphics();
    hairGfx.fillStyle(parseInt(hair.replace('#', '0x')), 1);

    const style = config.hairStyle.id;

    if (style.includes('loc')) {
      // Long locs - segmented ropes
      for (let i = -6; i <= 6; i += 2.8) {
        hairGfx.fillRect(i - 0.7, -16, 1.6, 20);
        hairGfx.fillStyle(parseInt(hairAccent.replace('#', '0x')), 0.8);
        hairGfx.fillRect(i - 0.3, 2, 0.8, 3); // bead
        hairGfx.fillStyle(parseInt(hair.replace('#', '0x')), 1);
      }
    } else if (style.includes('afro') || style.includes('puff')) {
      hairGfx.fillCircle(0, -11, 9.5);
      hairGfx.fillStyle(parseInt(hairAccent.replace('#', '0x')), 0.55);
      for (let i = -7; i < 8; i += 2.5) for (let j = -8; j < 4; j += 2.5) hairGfx.fillRect(i, j - 11, 1, 1);
    } else if (style.includes('braid') || style.includes('cornrow')) {
      hairGfx.fillRect(-8, -16, 16, 5);
      hairGfx.fillStyle(parseInt(hairAccent.replace('#', '0x')), 0.7);
      for (let i = -6; i <= 6; i += 3) hairGfx.fillRect(i - 0.5, -11, 1.2, 16);
    } else if (style.includes('fade') || style === 'curly_taper') {
      hairGfx.fillRect(-8, -16, 16, 4);
      hairGfx.fillStyle(parseInt(hairAccent.replace('#', '0x')), 0.5);
      hairGfx.fillRect(-5, -18, 10, 3);
    } else if (style === 'bald_crown') {
      hairGfx.fillStyle(0x1F1A18, 1);
      hairGfx.fillRect(-5, -16, 10, 2);
    } else {
      hairGfx.fillRect(-7, -16, 14, 5);
    }
    container.add(hairGfx);

    // === ACCESSORIES (visible) ===
    const accGfx = scene.add.graphics();
    accGfx.fillStyle(parseInt(gold.replace('#', '0x')), 1);

    if (config.accessories.includes('thick_gold_chain') || config.accessories.includes('ankh_amulet')) {
      accGfx.fillRect(-1.5, 2, 3, 6);
      if (config.accessories.includes('ankh_amulet')) {
        accGfx.fillRect(-2.5, 7, 5, 1.5);
        accGfx.fillRect(-0.8, 8, 1.6, 4);
      }
    }
    if (config.accessories.includes('small_hoops') || config.accessories.includes('large_creoles')) {
      accGfx.fillRect(-10, -6, 1.5, 2.5);
      accGfx.fillRect(8.5, -6, 1.5, 2.5);
    }
    container.add(accGfx);

    // === POWER GLOW LAYER (dynamic - updated externally) ===
    const powerGlow = scene.add.graphics();
    powerGlow.fillStyle(0x5C4033, 0.0); // starts invisible
    powerGlow.fillCircle(0, -2, 11);
    container.add(powerGlow);
    (container as any).powerGlow = powerGlow;

    // === IMPROVED WALK ANIMATION ===
    (container as any).walkBob = (frame: number, powered = false) => {
      const bob = Math.sin(frame * 0.55) * (powered ? 1.4 : 1.1);
      container.y = y + bob;

      const swing = Math.sin(frame * 0.65) * (powered ? 0.22 : 0.16);
      leftArm.rotation = swing;
      rightArm.rotation = -swing;

      // Subtle head tilt
      head.rotation = Math.sin(frame * 0.4) * 0.03;

      // Update power glow visibility/intensity
      if (powered) {
        powerGlow.clear();
        powerGlow.fillStyle(0x6B4E38, 0.35 + Math.sin(frame * 0.8) * 0.12);
        powerGlow.fillCircle(0, -2, 11 + Math.sin(frame * 1.1) * 1.5);
      }
    };

    // Store config reference for later upgrades
    (container as any).charConfig = config;

    return container;
  }
}
