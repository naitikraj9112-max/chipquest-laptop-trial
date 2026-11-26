// js/core/loop.js — Game loop (section 3.2, 12)
import { cfg } from '../config.js';
import { sceneManager } from './sceneManager.js';
import { input } from './input.js';
import { state, resetState } from './state.js';
import { uiArt } from '../art/ui.js';

let canvas, ctx;
let lastTime = 0;
let running = false;
let scale = 1;
let offsetX = 0, offsetY = 0;
let debugMode = false;
let idleResetting = false;

export const loop = {
  get canvas() { return canvas; },
  get ctx() { return ctx; },
  get scale() { return scale; },
  get offsetX() { return offsetX; },
  get offsetY() { return offsetY; },

  init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    canvas.width = cfg.LOGICAL_W;
    canvas.height = cfg.LOGICAL_H;
    ctx.imageSmoothingEnabled = false;

    // URL params
    const params = new URLSearchParams(window.location.search);
    debugMode = params.get('debug') === '1';

    resize();
    window.addEventListener('resize', resize);

    // Pause when hidden (section 12)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(tick);
      }
    });
  },

  start() {
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  },

  stop() {
    running = false;
  }
};

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  scale = Math.max(1, Math.floor(Math.min(w / cfg.LOGICAL_W, h / cfg.LOGICAL_H)));
  const sw = cfg.LOGICAL_W * scale;
  const sh = cfg.LOGICAL_H * scale;
  offsetX = Math.floor((w - sw) / 2);
  offsetY = Math.floor((h - sh) / 2);
  
  canvas.style.width = sw + 'px';
  canvas.style.height = sh + 'px';
  canvas.style.left = offsetX + 'px';
  canvas.style.top = offsetY + 'px';
}

function tick(now) {
  if (!running) return;
  
  let dt = now - lastTime;
  lastTime = now;
  // Clamp dt to 50ms (section 12)
  if (dt > 50) dt = 50;

  // Idle reset (section 12)
  if (Date.now() - input.lastInput > cfg.IDLE_RESET_S * 1000) {
    if (!idleResetting && sceneManager.currentId && sceneManager.currentId !== 'TITLE') {
      idleResetting = true;
      window.CQ?.fx?.wipeOut(cfg.WIPE_MS).then(() => {
        resetState();
        sceneManager.switchTo('TITLE');
        window.CQ?.fx?.wipeIn(cfg.WIPE_MS);
        idleResetting = false;
      });
    }
  } else {
    idleResetting = false;
  }

  // Update — scenes poll input during their update
  sceneManager.update(dt);
  if (window.CQ && window.CQ.fx) window.CQ.fx.update(dt);

  // Reset unconsumed input flags AFTER update
  input.resetFrame();

  // Draw
  ctx.clearRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

  // Apply shake to the whole scene
  const shakeOff = window.CQ?.fx?.shakeOffset;
  if (shakeOff && (shakeOff.x || shakeOff.y)) {
    ctx.save();
    ctx.translate(shakeOff.x, shakeOff.y);
  }

  sceneManager.draw(ctx);

  if (shakeOff && (shakeOff.x || shakeOff.y)) {
    ctx.restore();
  }

  if (window.CQ && window.CQ.fx) window.CQ.fx.draw(ctx);

  // Debug (section 3.9: FPS, tile coords)
  if (debugMode) {
    const fps = dt > 0 ? Math.round(1000 / dt) : 60;
    const coords = sceneManager.currentId === 'STORE' ? ` (${state.player.x},${state.player.y})` : '';
    uiArt.drawMiniText(ctx, `FPS:${fps}${coords}`, 2, 2, cfg.PAL['8']);
  }

  requestAnimationFrame(tick);
}
