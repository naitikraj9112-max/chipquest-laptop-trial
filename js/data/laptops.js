// js/data/laptops.js — Laptop data (sections 4, 8.2)

const proMultipliers = {
  AI_HEAVY: { prog: 1.2,  batt: 0.40, heat: 0.35, engine: 'NPU' },
  AI_LIGHT: { prog: 1.0,  batt: 0.30, heat: 0.20, engine: 'NPU' },
  GFX:      { prog: 1.15, batt: 0.50, heat: 0.5,  engine: 'GPU' },
  CPU:      { prog: 1.1,  batt: 0.60, heat: 0.6,  engine: 'CPU' },
};

const amdCompMultipliers = {
  AI_HEAVY: { prog: 0.85, batt: 0.65, heat: 0.65, engine: 'NPU' },
  AI_LIGHT: { prog: 1.0,  batt: 0.40, heat: 0.30, engine: 'NPU' },
  GFX:      { prog: 1.0,  batt: 0.60, heat: 0.60, engine: 'GPU' },
  CPU:      { prog: 1.0,  batt: 0.70, heat: 0.70, engine: 'CPU' },
};

export const laptops = {
  nova: {
    id: 'nova',
    name: 'NOVA X',
    oemName: 'NOVA X',
    profile: 'LEGACY',
    desc: 'Older chip, no NPU',
    chipLine: 'BONUS: FREE BAG + RGB PAD!',
    look: 5,
    priceTag: 'SALE -30%',
    offerTag: '+ FREE MERCH!',
    battery: '???',
    aiSpeed: '???',
    // Multipliers (section 8.2): LEGACY = x1 for all
    multipliers: {
      AI_HEAVY: { prog: 1.0, batt: 1.0, heat: 1.0, engine: 'CPU' },
      AI_LIGHT: { prog: 1.0, batt: 1.0, heat: 1.0, engine: 'CPU' },
      GFX:      { prog: 1.0, batt: 1.0, heat: 1.0, engine: 'CPU' },
      CPU:      { prog: 1.0, batt: 1.0, heat: 1.0, engine: 'CPU' },
    }
  },
  aura_go: {
    id: 'aura_go',
    name: 'AURA GO',
    oemName: 'AURA GO',
    profile: 'GO',
    desc: 'Intel Core Series 3 (6C, 17 NPU TOPS, Xe3)',
    chipLine: 'Intel Core Series 3 (17 TOPS NPU 5)',
    specSub: '6C (2P+4LPE), 2 Xe3, 10-28W',
    look: 3,
    priceTag: 'FAIR',
    battery: '???',
    aiSpeed: '???',
    multipliers: {
      AI_HEAVY: { prog: 0.7,  batt: 0.85, heat: 0.8,  engine: 'NPU' },
      AI_LIGHT: { prog: 1.0,  batt: 0.35, heat: 0.25, engine: 'NPU' },
      GFX:      { prog: 1.0,  batt: 0.60, heat: 0.6,  engine: 'GPU' },
      CPU:      { prog: 1.0,  batt: 0.70, heat: 0.7,  engine: 'CPU' },
    }
  },
  aura_pro: {
    id: 'aura_pro',
    name: 'AURA PRO',
    oemName: 'Intel Core Ultra Series 3',
    profile: 'PRO',
    desc: 'Intel Core Ultra Series 3 (18A, NPU 5 50 TOPS, Arc B390, Evo)',
    chipLine: 'Core Ultra Series 3, 50 TOPS, Evo',
    hudSpec: 'Ultra 3 | 18A | 50TOPS',
    look: 4,
    priceTag: 'PREMIUM',
    battery: '???',
    aiSpeed: '???',
    multipliers: proMultipliers,
  },
  // Stage 2 Real OEM Matchups (chosen by PC-DEX vs Rival AMD Direct Competitor)
  intel_student: {
    id: 'intel_student',
    name: 'YOGA SLIM 7',
    oemName: 'Lenovo Yoga Slim 7 Ultra 14',
    profile: 'PRO',
    brand: 'INTEL',
    hudSpec: 'Ultra 7 355 8C/49T/75Wh',
    shortSpec: 'Core Ultra 7 355 (8C 4.7GHz, 18A), 49T NPU 5, 75Wh, 975g',
    multipliers: proMultipliers,
  },
  amd_student: {
    id: 'amd_student',
    name: 'SWIFT 14 AMD',
    oemName: 'Acer Swift 14 AI (SFG14-64)',
    shortOem: 'Acer Swift 14 AI (AMD)',
    profile: 'COMP_AMD',
    brand: 'AMD',
    hudSpec: 'Ryzen AI 7 350/860M/75Wh',
    shortSpec: 'Ryzen AI 7 350 (8C/16T 5.0GHz), 50T XDNA 2, 860M, 75Wh',
    multipliers: amdCompMultipliers,
  },
  intel_creator: {
    id: 'intel_creator',
    name: 'THINKPAD X9',
    oemName: 'ThinkPad X9-15p Aura Ed.',
    profile: 'PRO',
    brand: 'INTEL',
    hudSpec: 'X9 388H 16C/B390/88Wh',
    shortSpec: 'Ultra X9 388H (16C 5.1GHz, 18A), Arc B390, 50T NPU, 88Wh',
    multipliers: proMultipliers,
  },
  amd_creator: {
    id: 'amd_creator',
    name: 'ZENBOOK S 16',
    oemName: 'ASUS Zenbook S 16 (UM5606)',
    shortOem: 'ASUS Zenbook S 16 (AMD)',
    profile: 'COMP_AMD',
    brand: 'AMD',
    hudSpec: 'HX 370 12C/890M/78Wh',
    shortSpec: 'Ryzen AI 9 HX 370 (12C/24T 5.1GHz), 50T, 890M, LP5X-7500, 78Wh',
    multipliers: amdCompMultipliers,
  },
  intel_gamer: {
    id: 'intel_gamer',
    name: 'IDEAPAD PRO 5',
    oemName: 'Lenovo IdeaPad Pro 5 16',
    profile: 'PRO',
    brand: 'INTEL',
    hudSpec: 'X9 388H 16C/B390/99.9Wh',
    shortSpec: 'Ultra X9 388H (16C 5.1GHz, 18A), Arc B390 12 Xe3, up to 99.9Wh',
    multipliers: proMultipliers,
  },
  amd_gamer: {
    id: 'amd_gamer',
    name: 'ZEPHYRUS G16',
    oemName: 'ROG Zephyrus G16 (GA605)',
    shortOem: 'ROG Zephyrus G16 (AMD)',
    profile: 'COMP_AMD',
    brand: 'AMD',
    hudSpec: 'HX 370 12C/890M/90Wh',
    shortSpec: 'Ryzen AI 9 HX 370 (12C/24T 5.1GHz), 50T XDNA 2, 90Wh',
    multipliers: amdCompMultipliers,
  },
};

export function getStage2Pair(persona = 'student') {
  const pairs = {
    student: { player: 'intel_student', rival: 'amd_student' },
    creator: { player: 'intel_creator', rival: 'amd_creator' },
    gamer:   { player: 'intel_gamer',   rival: 'amd_gamer' },
  };
  return pairs[persona] || pairs.student;
}
