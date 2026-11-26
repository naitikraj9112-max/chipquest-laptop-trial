// js/art/fx.js — Visual effects (sections 3.7, 8.7, 10)
import { cfg } from '../config.js';

let shakeActive = false;
let shakeDuration = 0;
let shakeTimer = 0;
let shakePx = 0;
let shakeOffX = 0;
let shakeOffY = 0;

let flashActive = false;
let flashDuration = 0;
let flashTimer = 0;
let flashColor = cfg.PAL['4'];

let wipeActive = false;
let wipeDirection = 'out'; // 'out' or 'in'
let wipeDuration = 0;
let wipeTimer = 0;
let wipeResolve = null;

export const fx = {
  init() {},

  update(dt) {
    if (shakeActive) {
      shakeTimer += dt;
      if (shakeTimer >= shakeDuration) {
        shakeActive = false;
        shakeOffX = 0;
        shakeOffY = 0;
      } else {
        shakeOffX = Math.floor((Math.random() - 0.5) * shakePx * 2);
        shakeOffY = Math.floor((Math.random() - 0.5) * shakePx * 2);
      }
    }

    if (flashActive) {
      flashTimer += dt;
      if (flashTimer >= flashDuration) {
        flashActive = false;
      }
    }

    if (wipeActive) {
      wipeTimer += dt;
      if (wipeTimer >= wipeDuration) {
        wipeActive = false;
        if (wipeResolve) {
          wipeResolve();
          wipeResolve = null;
        }
      }
    }
  },

  draw(ctx) {
    // Flash overlay
    if (flashActive) {
      const alpha = 1 - (flashTimer / flashDuration);
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = flashColor;
      ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);
      ctx.globalAlpha = 1;
    }

    // Wipe effect (8 horizontal strips)
    if (wipeActive) {
      const progress = Math.min(1, wipeTimer / wipeDuration);
      const stripH = cfg.LOGICAL_H / 8;

      ctx.fillStyle = cfg.PAL['0']; // INK

      for (let i = 0; i < 8; i++) {
        const stripY = i * stripH;
        let stripProgress;

        if (wipeDirection === 'out') {
          // Strips slide in alternately from left and right
          if (i % 2 === 0) {
            const w = progress * cfg.LOGICAL_W;
            ctx.fillRect(0, stripY, w, stripH);
          } else {
            const w = progress * cfg.LOGICAL_W;
            ctx.fillRect(cfg.LOGICAL_W - w, stripY, w, stripH);
          }
        } else {
          // Wipe in: strips slide out
          if (i % 2 === 0) {
            const w = (1 - progress) * cfg.LOGICAL_W;
            ctx.fillRect(0, stripY, w, stripH);
          } else {
            const w = (1 - progress) * cfg.LOGICAL_W;
            ctx.fillRect(cfg.LOGICAL_W - w, stripY, w, stripH);
          }
        }
      }
    }

  },

  shake(ms, px) {
    shakeActive = true;
    shakeDuration = ms;
    shakeTimer = 0;
    shakePx = px;
  },

  flash(ms, key) {
    flashActive = true;
    flashDuration = ms;
    flashTimer = 0;
    flashColor = cfg.PAL[key] || cfg.PAL['4'];
  },

  wipeOut(ms) {
    return new Promise(resolve => {
      wipeActive = true;
      wipeDirection = 'out';
      wipeDuration = ms || cfg.WIPE_MS;
      wipeTimer = 0;
      wipeResolve = resolve;
    });
  },

  wipeIn(ms) {
    return new Promise(resolve => {
      wipeActive = true;
      wipeDirection = 'in';
      wipeDuration = ms || cfg.WIPE_MS;
      wipeTimer = 0;
      wipeResolve = resolve;
    });
  },

  get shakeOffset() { return { x: shakeOffX, y: shakeOffY }; }
};
