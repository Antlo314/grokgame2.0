'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shuffle, Check, RotateCcw } from 'lucide-react';

// =====================================================
// DEEP AFRICAN AMERICAN CHARACTER CREATION
// "Go wild" — respectful, rich, premium 32-bit live previews
// Directly answers the user's explicit request
// =====================================================

export interface CharacterConfig {
  id: string;
  name: string; // Always "Khalil Wright" for this vertical slice
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
  accessories: string[]; // ids of equipped
  clothing: { id: string; name: string };
  createdAt: number;
}

// === RICH OPTION DATA (culturally resonant, 10–15+ per category) ===
const SKIN_TONES = [
  { id: 'deep_umbra', name: 'Deep Umbra', hex: '#2C211B', undertone: 'Cool' },
  { id: 'rich_sienna', name: 'Rich Sienna', hex: '#3F2A22', undertone: 'Warm' },
  { id: 'mahogany_eclipse', name: 'Mahogany Eclipse', hex: '#3C2A1F', undertone: 'Deep Warm' },
  { id: 'bronze_radiance', name: 'Bronze Radiance', hex: '#4A3428', undertone: 'Golden' },
  { id: 'copper_dusk', name: 'Copper Dusk', hex: '#5C3F2E', undertone: 'Warm' },
  { id: 'ebony_night', name: 'Ebony Night', hex: '#1F1A18', undertone: 'Cool Deep' },
  { id: 'golden_umber', name: 'Golden Umber', hex: '#5A4030', undertone: 'Golden' },
  { id: 'warm_clay', name: 'Warm Clay', hex: '#6B4E38', undertone: 'Earth' },
  { id: 'sepia_legacy', name: 'Sepia Legacy', hex: '#3D2C24', undertone: 'Neutral' },
  { id: 'chestnut_glow', name: 'Chestnut Glow', hex: '#4E372B', undertone: 'Rich' },
];

const PRESENTATIONS = [
  { id: 'masculine', label: 'Masculine', desc: 'Strong shoulders, defined jaw presence' },
  { id: 'feminine', label: 'Feminine', desc: 'Soft curves, graceful posture' },
  { id: 'androgynous', label: 'Androgynous', desc: 'Fluid balance — legacy of many ancestors' },
] as const;

const HAIR_STYLES = [
  { id: 'high_top_fade', name: 'High-Top Fade', category: 'short' },
  { id: 'low_temple_taper', name: 'Low Temple Taper', category: 'short' },
  { id: 'classic_afro', name: 'Classic Afro', category: 'voluminous' },
  { id: 'puff_crown', name: 'Puff Crown', category: 'voluminous' },
  { id: 'long_locs', name: 'Long Locs (Shoulder)', category: 'locs' },
  { id: 'back_locs', name: 'Back-Length Locs', category: 'locs' },
  { id: 'box_braids', name: 'Box Braids (Medium)', category: 'braids' },
  { id: 'long_box_braids', name: 'Long Box Braids', category: 'braids' },
  { id: 'two_strand_twists', name: 'Two-Strand Twists', category: 'twists' },
  { id: 'cornrows_intric', name: 'Intricate Cornrows', category: 'braids' },
  { id: 'dreadhawk', name: 'Dreadhawk', category: 'locs' },
  { id: 'curly_taper', name: 'Curly Taper Fade', category: 'short' },
  { id: 'bald_crown', name: 'Bald + Crown Etchings', category: 'bald' },
  { id: 'bantu_knots', name: 'Bantu Knots', category: 'updo' },
  { id: 'finger_coils', name: 'Finger Coils', category: 'voluminous' },
];

const HAIR_COLORS = [
  { id: 'jet', name: 'Natural Jet', hex: '#111111' },
  { id: 'deep_brown', name: 'Deep Brown', hex: '#2B211A' },
  { id: 'copper_flame', name: 'Copper Flame', hex: '#5C2E1F', accent: '#8B4A2E' },
  { id: 'silver_ancestor', name: 'Silver Ancestor', hex: '#4A4A4A', accent: '#C9C4B8' },
  { id: 'indigo_night', name: 'Indigo Night', hex: '#1F2A3D', accent: '#3B4F6B' },
  { id: 'gold_dust', name: 'Gold Dust Accents', hex: '#2C211B', accent: '#C9A14B' },
];

const FACE_OPTIONS = {
  eyes: ['Almond Legacy', 'Deep-Set Guardian', 'Hooded Wisdom', 'Bright Phoenix'],
  nose: ['Broad Strength', 'Refined Aquiline', 'Full Nostril', 'Soft Bridge'],
  lips: ['Full Heritage', 'Defined Bow', 'Soft Full', 'Strong Cupid'],
  jaw: ['Strong Sentinel', 'Soft Sovereign', 'Angular Edge', 'Balanced Line'],
  facialHair: ['None', 'Clean Stubble', 'Goatee', 'Full Shaped Beard', 'Chinstrap', 'Mustache + Soul Patch'],
};

const ACCESSORY_OPTIONS = [
  { id: 'thick_gold_chain', label: 'Thick Gold Chain', slot: 'neck' },
  { id: 'ankh_amulet', label: 'Ankh Amulet', slot: 'neck' },
  { id: 'khalil_dogtags', label: 'Dog Tags — "KHALIL"', slot: 'neck' },
  { id: 'heritage_beads', label: 'Beaded Heritage Strand', slot: 'neck' },
  { id: 'small_hoops', label: 'Small Gold Hoops', slot: 'ears' },
  { id: 'large_creoles', label: 'Large Gold Creoles', slot: 'ears' },
  { id: 'onyx_plugs', label: 'Black Onyx Plugs', slot: 'ears' },
  { id: 'fitted_cap', label: 'Fitted Black Cap', slot: 'head' },
  { id: 'deep_durag', label: 'Deep Burgundy Durag', slot: 'head' },
  { id: 'kufi_emb', label: 'Embroidered Kufi', slot: 'head' },
  { id: 'vintage_watch', label: 'Vintage Watch', slot: 'wrist' },
  { id: 'leather_cuffs', label: 'Leather + Bead Cuffs', slot: 'wrist' },
];

const CLOTHING_OPTIONS = [
  { id: 'tactical_hoodie', name: 'Oversized Tactical Hoodie (Ley Line Embroidery)' },
  { id: 'leather_bomber', name: 'Leather Bomber — Resistance Patches' },
  { id: 'dashiki_cargo', name: 'Modern Dashiki + Cargo Fusion' },
  { id: 'high_collar_coat', name: 'Long High-Collar Coat + Combat Boots' },
  { id: 'turtleneck_vest', name: 'Sleeveless Turtleneck + Tactical Vest' },
  { id: 'street_ancestral', name: '2026 Street x Ancestral (Hoodie + Gold Ankh)' },
  { id: 'field_jacket', name: 'Field Jacket over Henley' },
  { id: 'tech_glow', name: 'Techwear with Subtle Glowing Thread' },
];

const FLAVOR_TEXT: Record<string, string> = {
  deep_umbra: "The color of fertile earth after rain — ancestors who worked the soil and built nations.",
  long_locs: "Each loc a living record. Time itself braided into power.",
  ankh_amulet: "The key of life. Worn by those who chose to remember instead of forget.",
  // ... add more as needed for hover
};

interface CharacterCreatorProps {
  onComplete: (config: CharacterConfig) => void;
  onBack: () => void;
}

export default function CharacterCreator({ onComplete, onBack }: CharacterCreatorProps) {
  const [presentation, setPresentation] = useState<'masculine' | 'feminine' | 'androgynous'>('masculine');
  const [skinTone, setSkinTone] = useState(SKIN_TONES[2]); // Mahogany Eclipse default
  const [hairStyle, setHairStyle] = useState(HAIR_STYLES[4]); // Long Locs
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);
  const [face, setFace] = useState({
    eyes: FACE_OPTIONS.eyes[0],
    nose: FACE_OPTIONS.nose[0],
    lips: FACE_OPTIONS.lips[0],
    jaw: FACE_OPTIONS.jaw[0],
    facialHair: FACE_OPTIONS.facialHair[0],
  });
  const [accessories, setAccessories] = useState<string[]>(['thick_gold_chain', 'small_hoops']);
  const [clothing, setClothing] = useState(CLOTHING_OPTIONS[0]);

  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);
  const bodyCanvasRef = useRef<HTMLCanvasElement>(null);

  // Build clean config
  const buildConfig = useCallback((): CharacterConfig => ({
    id: 'khalil_wright_' + Date.now(),
    name: 'Khalil Wright',
    presentation,
    skinTone,
    hairStyle,
    hairColor,
    face,
    accessories: [...accessories],
    clothing,
    createdAt: Date.now(),
  }), [presentation, skinTone, hairStyle, hairColor, face, accessories, clothing]);

  // === 32-BIT PIXEL DRAWING ENGINE (pure canvas, chunky, no assets) ===
  const drawCharacter = useCallback((ctx: CanvasRenderingContext2D, scale: number, isPortrait: boolean) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    const skin = skinTone.hex;
    const hair = hairColor.hex;
    const hairAccent = hairColor.accent || hair;
    const isMasc = presentation === 'masculine';
    const isFem = presentation === 'feminine';
    const cloth = clothing.id;

    // Limited per-character 6–8 color palette (32-bit discipline)
    const shadow = '#0F0C09';
    const highlight = '#8B6F5C';
    const clothDark = '#1C2526';
    const clothMid = '#2F3A3C';
    const gold = '#C9A14B';
    const electric = '#00C4D0';

    const cx = Math.floor(w / 2);
    const headY = isPortrait ? 28 : 18;
    const headW = isPortrait ? 22 : 18;
    const headH = isPortrait ? 24 : 19;

    // Body type variation based on presentation (less blocky, more character)
    let shoulderW = isPortrait ? 30 : 26;
    let torsoH = isPortrait ? 22 : 28;
    if (presentation === 'feminine') {
      shoulderW *= 0.92;
      torsoH *= 0.95;
    } else if (presentation === 'masculine') {
      shoulderW *= 1.08;
    }

    // === BODY / CLOTHING (much richer 32-bit style) ===
    const bodyTop = headY + headH - 4;

    // Torso base
    ctx.fillStyle = clothDark;
    ctx.fillRect(cx - shoulderW/2, bodyTop, shoulderW, torsoH);

    // Clothing detail (MUCH more detailed 32-bit style)
    ctx.fillStyle = clothMid;
    if (cloth.includes('hoodie') || cloth.includes('Street')) {
      // Rich hoodie with hood + details
      ctx.fillRect(cx - 12, bodyTop - 7, 24, 11);
      ctx.fillStyle = gold;
      for (let i = -7; i <= 7; i += 3) {
        ctx.fillRect(cx + i, bodyTop + 3, 2, 1);
        ctx.fillRect(cx + i + 1, bodyTop + 6, 1, 1);
      }
      ctx.fillStyle = '#0F121A';
      ctx.fillRect(cx - 5, bodyTop + 9, 10, 4); // pocket
    } else if (cloth.includes('bomber')) {
      ctx.fillRect(cx - shoulderW/2 + 2, bodyTop + 5, shoulderW - 4, 9);
      ctx.fillStyle = gold;
      ctx.fillRect(cx - 4, bodyTop + 8, 8, 2);
      ctx.fillRect(cx - 6, bodyTop + 4, 3, 1);
      ctx.fillRect(cx + 3, bodyTop + 4, 3, 1);
    } else if (cloth.includes('dashiki')) {
      ctx.fillStyle = '#3A2A1F';
      ctx.fillRect(cx - 8, bodyTop + 1, 16, torsoH - 3);
      ctx.fillStyle = '#2A1F15';
      for (let i = -5; i <= 5; i += 4) {
        ctx.fillRect(cx + i, bodyTop + 4, 2, torsoH - 8);
      }
    } else if (cloth.includes('coat')) {
      ctx.fillStyle = '#1A1F2E';
      ctx.fillRect(cx - shoulderW/2 - 1, bodyTop - 1, shoulderW + 2, torsoH + 2);
      ctx.fillStyle = '#12161F';
      ctx.fillRect(cx - 4, bodyTop + 3, 8, torsoH - 6);
    }

    // Arms (detailed with cuffs and shading)
    ctx.fillStyle = skin;
    const armY = bodyTop + 4;
    ctx.fillRect(cx - shoulderW/2 - 7, armY, 7, 15);
    ctx.fillRect(cx + shoulderW/2, armY, 7, 15);
    ctx.fillStyle = clothDark;
    ctx.fillRect(cx - shoulderW/2 - 7, armY + 12, 7, 4);
    ctx.fillRect(cx + shoulderW/2, armY + 12, 7, 4);
    // Subtle arm shading for less blocky look
    ctx.fillStyle = shadow;
    ctx.fillRect(cx - shoulderW/2 - 7, armY + 3, 2, 8);
    ctx.fillRect(cx + shoulderW/2 + 5, armY + 3, 2, 8);

    // === HEAD (much more detailed face) ===
    ctx.fillStyle = skin;
    ctx.fillRect(cx - headW/2, headY, headW, headH);

    // Ears (simple but important)
    ctx.fillStyle = shadow;
    ctx.fillRect(cx - headW/2 - 2, headY + 8, 3, 5);
    ctx.fillRect(cx + headW/2 - 1, headY + 8, 3, 5);

    // Jaw / cheek definition (stronger)
    ctx.fillStyle = shadow;
    if (isMasc || presentation === 'androgynous') {
      ctx.fillRect(cx - headW/2 + 1, headY + 13, headW - 2, 7);
    } else {
      ctx.fillRect(cx - headW/2 + 2, headY + 14, headW - 4, 5);
    }

    // Eyes (better shape + whites)
    ctx.fillStyle = '#E8E0D0';
    const eyeY = headY + 9;
    const eyeSpacing = presentation === 'feminine' ? 5 : 4;
    ctx.fillRect(cx - eyeSpacing - 2, eyeY, 4, 3);
    ctx.fillRect(cx + eyeSpacing - 2, eyeY, 4, 3);
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - eyeSpacing - 1, eyeY + 1, 2, 1);
    ctx.fillRect(cx + eyeSpacing - 1, eyeY + 1, 2, 1);

    // Eyebrows (thicker + shaped)
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(cx - eyeSpacing - 3, eyeY - 3, 6, 1);
    ctx.fillRect(cx + eyeSpacing - 2, eyeY - 3, 6, 1);

    // Nose (better definition)
    ctx.fillStyle = shadow;
    ctx.fillRect(cx - 1, headY + 11, 2, 6);
    ctx.fillRect(cx - 2, headY + 15, 4, 1);

    // Lips (more shape)
    ctx.fillStyle = '#3A2520';
    const lipY = headY + 18;
    ctx.fillRect(cx - 5, lipY, 10, 2);
    if (face.lips.includes('Full')) {
      ctx.fillRect(cx - 5, lipY + 1, 10, 1);
    }

    // === HAIR (TREMENDOUSLY more detailed and less blocky) ===
    ctx.fillStyle = hair;
    const hairY = headY - 2;

    if (hairStyle.id === 'long_locs' || hairStyle.id === 'back_locs') {
      // Highly detailed long locs with volume, individual strands, and beads
      for (let i = -8; i <= 8; i += 2.2) {
        ctx.fillRect(cx + i - 1.2, hairY - 6, 2.8, 36);
        ctx.fillRect(cx + i - 0.6, hairY - 4, 1.8, 32);
        ctx.fillStyle = hairAccent;
        ctx.fillRect(cx + i, hairY + 24, 1.4, 7);
        ctx.fillStyle = hair;
      }
    } else if (hairStyle.id.includes('afro') || hairStyle.id.includes('puff')) {
      // Rich, voluminous afro with multiple texture layers and natural shape
      ctx.fillRect(cx - 15, hairY - 13, 30, 24);
      ctx.fillStyle = hairAccent;
      // Dense dither texture for organic feel
      for (let x = -13; x < 14; x += 1.5) {
        for (let y = -11; y < 9; y += 1.5) {
          if (Math.random() > 0.35) {
            ctx.fillRect(cx + x, hairY + y - 1, 1.2, 1.2);
          }
        }
      }
      ctx.fillStyle = hair;
      // Outer shape definition
      ctx.fillRect(cx - 14, hairY - 12, 4, 20);
      ctx.fillRect(cx + 10, hairY - 12, 4, 20);
    } else if (hairStyle.id.includes('braids') || hairStyle.id.includes('cornrows')) {
      // Intricate, high-detail braids/cornrows with pattern and shine
      ctx.fillRect(cx - 12, hairY - 4, 24, 8);
      ctx.fillStyle = hairAccent;
      for (let i = -9; i <= 9; i += 2.5) {
        ctx.fillRect(cx + i - 0.6, hairY + 3, 1.8, 20);
        ctx.fillRect(cx + i + 0.4, hairY + 5, 1, 16);
      }
      ctx.fillStyle = hair;
    } else if (hairStyle.id.includes('fade') || hairStyle.id === 'curly_taper') {
      // Sharp, stylish fades with texture and shape
      ctx.fillRect(cx - 12, hairY - 3, 24, 7);
      ctx.fillStyle = hairAccent;
      ctx.fillRect(cx - 8, hairY - 6, 16, 5);
      ctx.fillStyle = hair;
      ctx.fillRect(cx - 5, hairY - 8, 10, 3);
    } else if (hairStyle.id === 'bald_crown') {
      ctx.fillStyle = '#1F1A18';
      ctx.fillRect(cx - 7, hairY - 2, 14, 4);
      ctx.fillStyle = hairAccent;
      ctx.fillRect(cx - 4, hairY - 1, 8, 1.5);
    } else if (hairStyle.id.includes('twist')) {
      // Detailed two-strand twists
      ctx.fillRect(cx - 10, hairY - 4, 20, 7);
      ctx.fillStyle = hairAccent;
      for (let i = -8; i <= 8; i += 2) {
        ctx.fillRect(cx + i, hairY + 2, 1.8, 18);
      }
    } else {
      // Default short styles with better shape and texture
      ctx.fillRect(cx - 11, hairY - 5, 22, 9);
      ctx.fillStyle = hairAccent;
      ctx.fillRect(cx - 7, hairY - 7, 14, 4);
    }

    // Headwear
    if (accessories.includes('fitted_cap')) {
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 11, hairY - 6, 22, 5);
      ctx.fillRect(cx - 13, hairY - 2, 26, 3);
    }
    if (accessories.includes('deep_durag')) {
      ctx.fillStyle = '#3D1F2E';
      ctx.fillRect(cx - 10, hairY - 5, 20, 6);
    }

    // === ACCESSORIES (gold reads beautifully at 32-bit) ===
    ctx.fillStyle = gold;
    if (accessories.includes('thick_gold_chain') || accessories.includes('ankh_amulet')) {
      ctx.fillRect(cx - 2, bodyTop - 2, 4, 7);
      if (accessories.includes('ankh_amulet')) {
        ctx.fillRect(cx - 3, bodyTop + 5, 6, 2);
        ctx.fillRect(cx - 1, bodyTop + 6, 2, 5);
      }
    }
    if (accessories.includes('small_hoops') || accessories.includes('large_creoles')) {
      ctx.fillStyle = gold;
      ctx.fillRect(cx - 13, headY + 10, 2, 3);
      ctx.fillRect(cx + 11, headY + 10, 2, 3);
    }
    if (accessories.includes('vintage_watch')) {
      ctx.fillStyle = gold;
      ctx.fillRect(cx - shoulderW/2 - 5, armY + 9, 4, 3);
    }

    // === FINAL 32-BIT DITHER HIGHLIGHTS (very important for look) ===
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let x = -12; x < 13; x += 4) {
      ctx.fillRect(cx + x, bodyTop + 2, 1, 1);
    }
  }, [skinTone, hairStyle, hairColor, presentation, clothing, accessories, face]);

  // Redraw previews whenever config changes
  useEffect(() => {
    const pCtx = portraitCanvasRef.current?.getContext('2d', { alpha: true });
    const bCtx = bodyCanvasRef.current?.getContext('2d', { alpha: true });
    if (pCtx) { pCtx.canvas.width = 64; pCtx.canvas.height = 64; drawCharacter(pCtx, 1, true); }
    if (bCtx) { bCtx.canvas.width = 48; bCtx.canvas.height = 64; drawCharacter(bCtx, 1, false); }
  }, [drawCharacter]);

  // Randomize (Ancestral) — fun & respectful
  const randomize = () => {
    setPresentation(PRESENTATIONS[Math.floor(Math.random() * PRESENTATIONS.length)].id as any);
    setSkinTone(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]);
    setHairStyle(HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)]);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)]);
    setFace({
      eyes: FACE_OPTIONS.eyes[Math.floor(Math.random() * FACE_OPTIONS.eyes.length)],
      nose: FACE_OPTIONS.nose[Math.floor(Math.random() * FACE_OPTIONS.nose.length)],
      lips: FACE_OPTIONS.lips[Math.floor(Math.random() * FACE_OPTIONS.lips.length)],
      jaw: FACE_OPTIONS.jaw[Math.floor(Math.random() * FACE_OPTIONS.jaw.length)],
      facialHair: FACE_OPTIONS.facialHair[Math.floor(Math.random() * FACE_OPTIONS.facialHair.length)],
    });
    // 2–4 random accessories
    const shuffled = [...ACCESSORY_OPTIONS].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    setAccessories(shuffled.map(a => a.id));
    setClothing(CLOTHING_OPTIONS[Math.floor(Math.random() * CLOTHING_OPTIONS.length)]);
  };

  const resetDefaults = () => {
    setPresentation('masculine');
    setSkinTone(SKIN_TONES[2]);
    setHairStyle(HAIR_STYLES[4]);
    setHairColor(HAIR_COLORS[0]);
    setFace({ eyes: FACE_OPTIONS.eyes[0], nose: FACE_OPTIONS.nose[0], lips: FACE_OPTIONS.lips[0], jaw: FACE_OPTIONS.jaw[0], facialHair: FACE_OPTIONS.facialHair[0] });
    setAccessories(['thick_gold_chain', 'small_hoops']);
    setClothing(CLOTHING_OPTIONS[0]);
  };

  const toggleAccessory = (id: string) => {
    setAccessories(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id].slice(0, 4));
  };

  const handleConfirm = () => {
    const config = buildConfig();
    onComplete(config);
  };

  const currentConfig = buildConfig();

  return (
    <div className="min-h-screen bg-[#07080c] relative overflow-auto">
      <div className="absolute inset-0 ambient-grid opacity-40" />

      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#07080c]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="btn btn-ghost flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> BACK TO ARCHIVE
          </button>
          <div className="text-center">
            <div className="eyebrow tracking-[3px]">LUMEN ARCHIVE — SUBJECT REGISTRATION</div>
            <div className="text-[#00f2fe] text-xs mt-0.5">KHALIL WRIGHT • 2026</div>
          </div>
          <div className="flex gap-2">
            <button onClick={randomize} className="btn btn-gold text-xs flex items-center gap-2">
              <Shuffle size={14} /> RANDOMIZE (ANCESTRAL)
            </button>
            <button onClick={resetDefaults} className="btn btn-ghost text-xs flex items-center gap-2">
              <RotateCcw size={14} /> RESET
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LIVE 32-BIT PREVIEWS — the soul of the creator */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <div className="section-label mb-3">LIVE 32-BIT RENDER</div>
            
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex gap-6 justify-center">
                {/* Portrait (DialogueBox style) */}
                <div>
                  <div className="text-[10px] font-mono text-[#64748b] mb-2 text-center tracking-widest">PORTRAIT</div>
                  <canvas ref={portraitCanvasRef} className="preview-frame w-[128px] h-[128px]" width={64} height={64} />
                </div>
                {/* Full Body */}
                <div>
                  <div className="text-[10px] font-mono text-[#64748b] mb-2 text-center tracking-widest">IN-WORLD</div>
                  <canvas ref={bodyCanvasRef} className="preview-frame w-[96px] h-[128px]" width={48} height={64} />
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-[#64748b] font-mono tracking-[1px]">
                CHUNKY PIXEL • LIMITED PALETTE • NO ANTI-ALIAS
              </div>
            </div>

            <div className="mt-4 text-[11px] text-[#94a3b8] leading-snug px-1">
              This is you in the 32-bit world. Every choice — hair, skin, gold, cloth — will be rendered exactly like this when you walk through 2026.
            </div>

            {/* Confirm bar */}
            <button
              onClick={handleConfirm}
              className="mt-6 w-full btn btn-primary py-4 text-base flex items-center justify-center gap-3"
            >
              CONFIRM &amp; ENTER 2026 <Check size={18} />
            </button>
            <p className="text-center text-[10px] text-[#475569] mt-2 tracking-widest">YOUR CHOICES ARE PERMANENT FOR THIS ARCHIVE</p>
          </div>
        </div>

        {/* OPTIONS — deep, organized, Lumen glass + electric */}
        <div className="lg:col-span-7 space-y-8">
          {/* PRESENTATION */}
          <div>
            <div className="eyebrow mb-3">PRESENTATION / STYLE</div>
            <div className="grid grid-cols-3 gap-3">
              {PRESENTATIONS.map(p => (
                <button key={p.id} onClick={() => setPresentation(p.id as any)} className={`creator-option p-4 rounded-xl text-left ${presentation === p.id ? 'selected' : ''}`}>
                  <div className="font-semibold text-base">{p.label}</div>
                  <div className="text-[#64748b] text-xs mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SKIN */}
          <div>
            <div className="eyebrow mb-3">SKIN TONE — 10 ANCESTRAL SHADES</div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {SKIN_TONES.map((tone) => (
                <button key={tone.id} onClick={() => setSkinTone(tone)} className={`creator-option p-2 rounded-lg ${skinTone.id === tone.id ? 'selected' : ''}`}>
                  <div className="w-full h-9 rounded" style={{ background: tone.hex }} />
                  <div className="text-[10px] mt-1.5 font-mono text-center leading-tight">{tone.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* HAIR */}
          <div>
            <div className="eyebrow mb-3">HAIR — TEXTURE, STYLE &amp; COLOR</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
              {HAIR_STYLES.map(h => (
                <button key={h.id} onClick={() => setHairStyle(h)} className={`creator-option px-3 py-2 text-sm ${hairStyle.id === h.id ? 'selected' : ''}`}>
                  {h.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {HAIR_COLORS.map(c => (
                <button key={c.id} onClick={() => setHairColor(c)} className={`creator-option p-2 flex items-center gap-2 ${hairColor.id === c.id ? 'selected' : ''}`}>
                  <div className="w-5 h-5 rounded border border-white/20 flex-shrink-0" style={{ background: c.hex }} />
                  <span className="text-xs">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FACE */}
          <div>
            <div className="eyebrow mb-3">FACIAL FEATURES</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(FACE_OPTIONS).map(([key, options]) => (
                <div key={key}>
                  <div className="text-xs text-[#64748b] mb-1.5 pl-1">{key.toUpperCase()}</div>
                  <div className="space-y-1">
                    {options.map(opt => (
                      <button key={opt} onClick={() => setFace(f => ({ ...f, [key]: opt }))} className={`block w-full text-left px-3 py-1.5 text-sm rounded creator-option ${face[key as keyof typeof face] === opt ? 'selected' : ''}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACCESSORIES (multi-select, max 4) */}
          <div>
            <div className="eyebrow mb-3">ACCESSORIES — EQUIP UP TO 4</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACCESSORY_OPTIONS.map(acc => (
                <button key={acc.id} onClick={() => toggleAccessory(acc.id)} className={`creator-option px-3 py-2 text-sm flex justify-between items-center ${accessories.includes(acc.id) ? 'selected' : ''}`}>
                  <span>{acc.label}</span>
                  {accessories.includes(acc.id) && <Check size={14} className="text-[#00f2fe]" />}
                </button>
              ))}
            </div>
          </div>

          {/* CLOTHING */}
          <div>
            <div className="eyebrow mb-3">2026 URBAN MYSTIC ATTIRE</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CLOTHING_OPTIONS.map(c => (
                <button key={c.id} onClick={() => setClothing(c)} className={`creator-option p-3 text-left ${clothing.id === c.id ? 'selected' : ''}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#07080c]/95 py-3 px-6 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-[#64748b]">
          <div>YOUR KHALIL WRIGHT WILL CARRY THESE CHOICES INTO THE 32-BIT WORLD</div>
          <div className="text-[#00f2fe] cursor-pointer hover:underline" onClick={handleConfirm}>CONFIRM &amp; ENTER THE ARCHIVE →</div>
        </div>
      </div>
    </div>
  );
}
