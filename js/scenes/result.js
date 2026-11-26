// js/scenes/result.js — Trainer Card / Result screen (section 9.3)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state, resetState } from '../core/state.js';
import { uiArt } from '../art/ui.js';
import { laptops, getStage2Pair } from '../data/laptops.js';

const recommendations = {
  student: {
    title: 'STUDENT PICK',
    oem: 'Lenovo Yoga Slim 7 Ultra 14',
    partnerLabel: 'Yoga Slim 7 Ultra 14',
    lines: [
      'CPU: Core Ultra 7 355 / 5 325',
      '8C 4.7GHz, 47-49 TOPS NPU 5',
      'Intel 18A, LP5X, 75Wh, 975g',
    ],
    budget: [
      'Budget: Acer Swift Air 14',
      'Core 5 320 (6C, 17 NPU TOPS)',
    ]
  },
  creator: {
    title: 'CREATOR PICK',
    oem: 'ThinkPad X9-15p Aura Ed.',
    partnerLabel: 'ThinkPad X9-15p Aura',
    lines: [
      'Core Ultra X9 388H (16C, 5.1GHz)',
      'Arc B390 12 Xe3, 50T NPU, 88Wh',
      'LP5X-9600, 18MB, Intel 18A',
    ],
    budget: [
      'Budget: ASUS ExpertBook B3 G2',
      'Core 7 350 (6C, 17 NPU TOPS)',
    ]
  },
  gamer: {
    title: 'GAMER PICK',
    oem: 'Lenovo IdeaPad Pro 5 16',
    partnerLabel: 'Lenovo IdeaPad Pro 5',
    lines: [
      'Ultra X9 388H (16C, 5.1GHz)',
      'Arc B390 12 Xe3 / RTX opt., 50T',
      'LP5X-9600, up to 99.9Wh, 18A',
    ],
    budget: [
      'Budget: ASUS Vivobook 15 X1504',
      'Core 5 320 / 7 350 (17 TOPS)',
    ]
  }
};

let timer = 0;
let restarting = false;
const qrImg = new Image();
let qrLoaded = false;
qrImg.onload = () => { qrLoaded = true; };
qrImg.src = 'assets/qr.png';

export const ResultScene = {
  enter() {
    timer = 0;
    restarting = false;
    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_RESULT', { fadeMs: 300 });
    }
  },

  update(dt) {
    timer += dt;

    // Tap to restart
    if (!restarting && input.aJustPressed() && timer > 800) {
      restarting = true;
      if (window.CQ) {
        window.CQ.audio.playSfx('sfx_confirm');
        window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
          resetState();
          window.CQ.sceneManager.switchTo('TITLE');
          window.CQ.fx.wipeIn(cfg.WIPE_MS);
        });
      }
    }
  },

  draw(ctx) {
    // Background INK letterbox, panel WHITE/BLUE/YELLOW (section 9.3, 10)
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

    // Panel 224x144 at (8,8)
    const px = 8, py = 8, pw = 224, ph = 144;
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(px, py, pw, ph);
    uiArt.drawRectOutline(ctx, px, py, pw, ph, cfg.PAL['B'], 2);

    // Header
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + 2, pw - 4, 14);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['7']; // YELLOW
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText('TRAINER CARD', px + pw / 2, py + 5);
    ctx.textAlign = 'left';

    const persona = state.flags.persona || 'student';
    const rec = recommendations[persona];
    const pair = getStage2Pair(persona);
    const beatLap = laptops[pair.rival];
    const lx = px + 6; // x=14

    // Persona icon (16x16 at (14, 26))
    const iconId = `icon_${persona}`;
    if (window.CQ && window.CQ.art) {
      const iconData = window.CQ.art.getSpriteData(iconId);
      if (iconData) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(iconData.canvas, lx, py + 18, 16, 16);
      }
    }

    // Class, Won vs AMD Rival & Stats (crisp 3x5 micro font fits cleanly above QR y=44)
    const batt = state.flags.b2PlayerBatt ?? 20;
    const turns = state.flags.b2Turns ?? 5;
    uiArt.drawMicroText(ctx, `CLASS: ${persona.toUpperCase()}  (BATT:${batt}% T:${turns})`, lx + 20, py + 18, cfg.PAL['0']);
    uiArt.drawMicroText(ctx, `WON: ${rec.partnerLabel}`, lx + 20, py + 25, cfg.PAL['B']);
    uiArt.drawMicroText(ctx, `BEAT: ${beatLap ? (beatLap.shortOem || beatLap.oemName) : 'AMD RYZEN AI'}`, lx + 20, py + 32, cfg.PAL['5']);

    // Yellow highlight divider left of QR
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillRect(lx, py + 41, 148, 2);

    // Recommendation block (8px crisp Press Start 2P header + real OEM & CPU specs in 3x5 micro font)
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillText(rec.title, lx, py + 48);

    uiArt.drawMicroText(ctx, rec.oem, lx, py + 59, cfg.PAL['B']);
    for (let i = 0; i < rec.lines.length; i++) {
      uiArt.drawMicroText(ctx, rec.lines[i], lx, py + 67 + i * 8, cfg.PAL['0']);
    }

    // Budget OEM pick (left column, stays well clear of QR at x=168)
    uiArt.drawMicroText(ctx, rec.budget[0], lx, py + 94, cfg.PAL['2']);
    uiArt.drawMicroText(ctx, rec.budget[1], lx, py + 102, cfg.PAL['2']);

    // QR 56x56 at (168, 44) per section 9.3 with crisp INK border
    const qx = 168, qy = 44;
    if (qrLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrImg, qx, qy, 56, 56);
    } else {
      ctx.fillStyle = cfg.PAL['4'];
      ctx.fillRect(qx, qy, 56, 56);
    }
    uiArt.drawRectOutline(ctx, qx, qy, 56, 56, cfg.PAL['0'], 1);

    uiArt.drawMicroText(ctx, 'SCAN OR ASK', qx + 28, qy + 59, cfg.PAL['B'], { align: 'center' });
    uiArt.drawMicroText(ctx, 'STAFF', qx + 28, qy + 66, cfg.PAL['B'], { align: 'center' });

    // Footer inside panel (y = 126..150)
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + ph - 26, pw - 4, 24);

    uiArt.drawMicroText(ctx, 'NEXT: Ask Reliance Digital staff to demo', px + pw / 2, py + ph - 24, cfg.PAL['7'], { align: 'center' });
    uiArt.drawMicroText(ctx, 'Game values illustrative. Verify OEM SKU.', px + pw / 2, py + ph - 16, cfg.PAL['4'], { align: 'center' });
    uiArt.drawMicroText(ctx, 'Real battery & TOPS vary by configuration.', px + pw / 2, py + ph - 9, cfg.PAL['4'], { align: 'center' });

    // Tap to restart hint (y = 153)
    if (Math.floor(timer / 600) % 2 === 0) {
      const restartMsg = input.isTouch ? '[TAP TO RESTART]' : '[PRESS Z OR CLICK TO RESTART]';
      uiArt.drawMiniText(ctx, restartMsg, 120, 153, cfg.PAL['4'], { align: 'center' });
    }
  },

  exit() {}
};
