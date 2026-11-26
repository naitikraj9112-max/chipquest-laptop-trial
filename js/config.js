// js/config.js — SHARED CONTRACT (section 3)
// Frozen constants from the PRD. Do NOT modify without logging in 13.4.

export const cfg = {
  LOGICAL_W: 240,
  LOGICAL_H: 160,
  TILE: 16,
  STEP_MS: 200, // 30% slower walk speed (was 140ms)
  TEXT_CPS: 45,
  TEXT_COLS: 28,
  TEXT_ROWS: 2,
  BAR_TWEEN_MS: 300,
  BATTLE_MSG_MS: 800,
  WIPE_MS: 600,
  IDLE_RESET_S: 60,
  STORE_NAME: 'RELIANCE DIGITAL',
  NEXT_STEP_URL: 'https://www.intel.com/content/www/us/en/products/evo.html',
  
  // Palette (16 colours, section 3.5)
  PAL: {
    '0': '#0F1020', // INK
    '1': '#2B2D4A', // DUSK
    '2': '#5B5F8E', // SLATE
    '3': '#A7ABD6', // MIST
    '4': '#F4F4FA', // WHITE
    '5': '#E63946', // RED
    '6': '#FF8C42', // ORANGE
    '7': '#FFD23F', // YELLOW
    '8': '#7FD35B', // LIME
    '9': '#2BA84A', // GREEN
    'A': '#2EC4F1', // CYAN
    'B': '#0071C5', // BLUE
    'C': '#7B2FF7', // VIOLET
    'D': '#FF4FB0', // PINK
    'E': '#8B5A2B', // WOOD
    'F': '#D9B38C', // SAND
  },

  PAL_NAMES: {
    INK: '#0F1020', DUSK: '#2B2D4A', SLATE: '#5B5F8E', MIST: '#A7ABD6',
    WHITE: '#F4F4FA', RED: '#E63946', ORANGE: '#FF8C42', YELLOW: '#FFD23F',
    LIME: '#7FD35B', GREEN: '#2BA84A', CYAN: '#2EC4F1', BLUE: '#0071C5',
    VIOLET: '#7B2FF7', PINK: '#FF4FB0', WOOD: '#8B5A2B', SAND: '#D9B38C'
  },

  // Scene IDs (section 3.6)
  SCENES: ['TITLE', 'INTRO', 'STORE', 'BATTLE1', 'PERSONA', 'PCDEX', 'BATTLE2', 'RESULT'],

  // Laptop IDs
  LAPTOPS: [
    'nova', 'aura_go', 'aura_pro',
    'intel_student', 'amd_student',
    'intel_creator', 'amd_creator',
    'intel_gamer', 'amd_gamer',
  ],

  // Persona IDs
  PERSONAS: ['student', 'creator', 'gamer'],

  // Move types
  MOVE_TYPES: ['AI_LIGHT', 'AI_HEAVY', 'GFX', 'CPU'],

  // Engines
  ENGINES: ['CPU', 'GPU', 'NPU'],

  // Facings
  FACINGS: ['down', 'up', 'left'],

  // Music IDs
  MUSIC_IDS: ['MUS_TITLE', 'MUS_STORE', 'MUS_RIVAL', 'MUS_BATTLE1', 'MUS_BATTLE2', 'MUS_WIN', 'MUS_LOSE', 'MUS_RESULT'],

  // SFX IDs
  SFX_IDS: ['sfx_blip', 'sfx_confirm', 'sfx_cancel', 'sfx_step', 'sfx_start', 'sfx_card', 'sfx_super', 'sfx_ok', 'sfx_weak', 'sfx_heat', 'sfx_warn', 'sfx_shutdown', 'sfx_complete', 'sfx_wifi_drop'],
};
