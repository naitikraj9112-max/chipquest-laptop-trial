// js/core/input.js — Input handling (section 3.3)
import { cfg } from '../config.js';

const keysDown = {};
let touchDpad = null; // 'up'|'down'|'left'|'right' or null
let aPressed = false;
let bPressed = false;
let aPressedThisFrame = false;
let bPressedThisFrame = false;
let anyInputThisFrame = false;
let lastInputTime = Date.now();
let isTouchDevice = false;
let dpadEl, aBtnEl, bBtnEl, muteEl;

export const input = {
  get isTouch() { return isTouchDevice; },
  get lastInput() { return lastInputTime; },

  dir() {
    if (keysDown['ArrowUp'] || keysDown['w'] || keysDown['W'] || touchDpad === 'up') return 'up';
    if (keysDown['ArrowDown'] || keysDown['s'] || keysDown['S'] || touchDpad === 'down') return 'down';
    if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A'] || touchDpad === 'left') return 'left';
    if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D'] || touchDpad === 'right') return 'right';
    return null;
  },

  aJustPressed() {
    const v = aPressedThisFrame;
    aPressedThisFrame = false;
    return v;
  },

  bJustPressed() {
    const v = bPressedThisFrame;
    bPressedThisFrame = false;
    return v;
  },

  anyInput() {
    const v = anyInputThisFrame;
    anyInputThisFrame = false;
    return v;
  },

  resetFrame() {
    aPressedThisFrame = false;
    bPressedThisFrame = false;
    anyInputThisFrame = false;
  },

  init(canvas) {
    // Keyboard
    window.addEventListener('keydown', e => {
      keysDown[e.key] = true;
      lastInputTime = Date.now();
      anyInputThisFrame = true;

      if (['z', 'Z', 'Enter', ' '].includes(e.key)) {
        aPressedThisFrame = true;
        aPressed = true;
      }
      if (['x', 'X', 'Escape'].includes(e.key)) {
        bPressedThisFrame = true;
        bPressed = true;
      }
      if (e.key === 'm' || e.key === 'M') {
        if (window.CQ && window.CQ.audio) {
          window.CQ.audio.setMuted(!window.CQ.audio.isMuted());
          const muteBtn = document.getElementById('btn-mute');
          if (muteBtn) muteBtn.textContent = window.CQ.audio.isMuted() ? '🔇' : '🔊';
        }
      }
      // Prevent scrolling with arrow keys/space
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      keysDown[e.key] = false;
    });

    // Touch detection
    window.addEventListener('touchstart', () => {
      isTouchDevice = true;
      showTouchControls();
    }, { once: true });

    // Setup touch controls (hidden by default)
    setupTouchControls();

    // Canvas tap = A button (for dialogue advancement on touch, section 3.3)
    canvas.addEventListener('click', e => {
      e.preventDefault();
      aPressedThisFrame = true;
      aPressed = true;
      lastInputTime = Date.now();
      anyInputThisFrame = true;
      if (window.CQ && window.CQ.audio) window.CQ.audio.unlock();
    });
  }
};

function showTouchControls() {
  const controls = document.getElementById('touch-controls');
  if (controls) controls.style.display = 'flex';
}

function setupTouchControls() {
  const controls = document.getElementById('touch-controls');
  if (!controls) return;

  // D-pad
  dpadEl = document.getElementById('dpad');
  aBtnEl = document.getElementById('btn-a');
  bBtnEl = document.getElementById('btn-b');
  muteEl = document.getElementById('btn-mute');

  if (dpadEl) {
    const dirs = ['up', 'down', 'left', 'right'];
    dirs.forEach(dir => {
      const btn = dpadEl.querySelector(`.dpad-${dir}`);
      if (!btn) return;
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        touchDpad = dir;
        lastInputTime = Date.now();
        anyInputThisFrame = true;
        if (window.CQ && window.CQ.audio) window.CQ.audio.unlock();
      });
      btn.addEventListener('touchend', e => {
        e.preventDefault();
        if (touchDpad === dir) touchDpad = null;
      });
      btn.addEventListener('touchcancel', e => {
        if (touchDpad === dir) touchDpad = null;
      });
    });
  }

  if (aBtnEl) {
    aBtnEl.addEventListener('touchstart', e => {
      e.preventDefault();
      aPressedThisFrame = true;
      aPressed = true;
      lastInputTime = Date.now();
      anyInputThisFrame = true;
      if (window.CQ && window.CQ.audio) window.CQ.audio.unlock();
    });
    aBtnEl.addEventListener('touchend', e => {
      e.preventDefault();
      aPressed = false;
    });
  }

  if (bBtnEl) {
    bBtnEl.addEventListener('touchstart', e => {
      e.preventDefault();
      bPressedThisFrame = true;
      bPressed = true;
      lastInputTime = Date.now();
      anyInputThisFrame = true;
      if (window.CQ && window.CQ.audio) window.CQ.audio.unlock();
    });
    bBtnEl.addEventListener('touchend', e => {
      e.preventDefault();
      bPressed = false;
    });
  }

  if (muteEl) {
    muteEl.addEventListener('click', e => {
      e.preventDefault();
      if (window.CQ && window.CQ.audio) {
        window.CQ.audio.setMuted(!window.CQ.audio.isMuted());
        muteEl.textContent = window.CQ.audio.isMuted() ? '🔇' : '🔊';
      }
    });
  }
}
