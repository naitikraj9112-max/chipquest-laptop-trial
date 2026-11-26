// js/core/state.js — Game state (section 3.8)

export function createInitialState() {
  return {
    scene: 'TITLE',
    player: { x: 9, y: 12, dir: 'up' },
    canLeave: false,
    flags: {
      guideMet: false,
      starter: null,       // 'nova' | 'aura_go'
      b1Winner: null,      // 'player' | 'rival'
      persona: null,       // 'student' | 'creator' | 'gamer'
      b2Winner: null,
      b2PlayerBatt: null,
      b2Turns: null,
      gymUnlocked: false,
      gymEntered: false,
      b3Winner: null,
      b3PlayerBatt: null,
      b3Turns: null,
      gymBadgeShown: false,
    },
    laptops: {
      player: null,
      rival: null,
    }
  };
}

export const state = createInitialState();

export function resetState() {
  Object.assign(state, createInitialState());
}
