// js/data/moves.js — Move data (sections 8.4, 8.5, 9.1)

// BATTLE1 moves: base values for LEGACY profile
export const battle1Moves = {
  M1: { label: 'BLUR BG',     type: 'AI_LIGHT', base: { prog: 18, batt: 12, heat: 25 } },
  M2: { label: 'CLEAN VOICE', type: 'AI_LIGHT', base: { prog: 16, batt: 10, heat: 22 } },
  M3: { label: 'EXPORT VIDEO', type: 'GFX',     base: { prog: 22, batt: 14, heat: 30 } },
  M4: { label: 'CAPTIONS',    type: 'AI_LIGHT', base: { prog: 14, batt: 9,  heat: 20 } },
};

// BATTLE2 moves: base values (prog 20 for all, section 8.5)
export const battle2Moves = {
  M1: { type: 'AI_HEAVY', base: { prog: 20, batt: 15, heat: 30 } },
  M2: { type: 'AI_HEAVY', base: { prog: 20, batt: 14, heat: 28 } },
  M3: { type: 'GFX',      base: { prog: 20, batt: 12, heat: 22 } },
  M4: { type: 'CPU',      base: { prog: 20, batt: 9,  heat: 16 } },
};

// Persona labels for BATTLE2 (section 9.1)
export const personaMoveLabels = {
  student: { M1: 'SUMMARISE', M2: 'TRANSLATE', M3: 'MAKE SLIDES', M4: 'FIND FILES' },
  creator: { M1: 'PHOTO CLEAN', M2: 'BG SWAP', M3: 'EXPORT 4K', M4: 'CAPTIONS' },
  gamer:   { M1: 'AI HIGHLIGHT', M2: 'TRANSLATE', M3: 'BOOST FPS', M4: 'SAVE REPLAY' },
};

// Gym BATTLE3 moves (Real Intel Core Ultra Series 3 vs AMD Ryzen AI Championship)
export const gymMoveLabels = {
  student: { M1: 'OPENVINO LLM', M2: 'LIVE NOTES',  M3: 'XE3 SLIDES',  M4: '75WH RUN' },
  creator: { M1: 'LOCAL AI',     M2: 'RAW DENOISE', M3: 'ARC B390 4K', M4: 'MULTI-EXPORT' },
  gamer:   { M1: 'XESS AI',      M2: 'AUTO CLIP',   M3: 'XE3 ULTRA',   M4: 'STREAM ENC' },
};

// Rival scripts (section 8.4, 8.5 + Gym Stage 2)
export const rivalScripts = {
  // BATTLE1 main path: rival is GO
  battle1_main: ['M1', 'M2', 'M4', 'M3', 'M1', 'M2'],
  // BATTLE1 fork path: rival is LEGACY
  battle1_fork: ['M3', 'M1', 'M2', 'M4'],
  // BATTLE2: rival is GO (fake laptop fight)
  battle2: ['M1', 'M2', 'M1', 'M3', 'M2', 'M4'],
  // BATTLE3: Gym Championship rival is AMD Ryzen AI
  battle3: ['M1', 'M2', 'M1', 'M3', 'M2', 'M4'],
};
