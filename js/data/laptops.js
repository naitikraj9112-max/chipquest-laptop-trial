// js/data/laptops.js — Laptop data (sections 4, 8.2)

export const laptops = {
  nova: {
    id: 'nova',
    name: 'NOVA X',
    profile: 'LEGACY',
    desc: 'Older chip, no NPU',
    chipLine: '',
    look: 5,
    priceTag: 'SALE -20%',
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
    profile: 'GO',
    desc: 'Intel Core Series 3, AI-ready, NPU up to 17 TOPS',
    chipLine: 'Intel Core Series 3, AI-ready',
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
    profile: 'PRO',
    desc: 'Intel Core Ultra Series 3, Evo, NPU up to 50 TOPS',
    chipLine: 'Intel Core Ultra Series 3, Evo',
    look: 4,
    priceTag: 'PREMIUM',
    battery: '???',
    aiSpeed: '???',
    multipliers: {
      AI_HEAVY: { prog: 1.2,  batt: 0.40, heat: 0.35, engine: 'NPU' },
      AI_LIGHT: { prog: 1.0,  batt: 0.30, heat: 0.20, engine: 'NPU' },
      GFX:      { prog: 1.15, batt: 0.50, heat: 0.5,  engine: 'GPU' },
      CPU:      { prog: 1.1,  batt: 0.60, heat: 0.6,  engine: 'CPU' },
    }
  }
};
