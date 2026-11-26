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
      'Core Ultra 7 355 / 5 325 (8C)',
      '4.7GHz, 49 TOPS NPU 5, 75Wh',
      'Intel 18A, LPDDR5X, 975g Evo',
    ],
    budget: [
      'Budget: Acer Swift Air 14',
      'Core 5 320 (6C, 17 TOPS NPU)',
    ]
  },
  creator: {
    title: 'CREATOR PICK',
    oem: 'ThinkPad X9-15p Aura Ed.',
    partnerLabel: 'ThinkPad X9-15p Aura',
    lines: [
      'Core Ultra X9 388H (16C, 5.1GHz)',
      'Arc B390 12 Xe3, 50 TOPS, 88Wh',
      'LPDDR5X-9600, 18MB, Intel 18A',
    ],
    budget: [
      'Budget: ASUS ExpertBook B3 G2',
      'Core 7 350 (6C, 17 TOPS NPU)',
    ]
  },
  gamer: {
    title: 'GAMER PICK',
    oem: 'Lenovo IdeaPad Pro 5 16',
    partnerLabel: 'Lenovo IdeaPad Pro 5',
    lines: [
      'Ultra X9 388H (16C, 5.1GHz)',
      'Arc B390 / RTX opt., 50 TOPS',
      'LPDDR5X-9600, up to 99.9Wh',
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

    // Class, Won vs AMD Rival & Stats (crisp proportional pixel font, clear of QR box x=159)
    const batt = state.flags.b3PlayerBatt ?? state.flags.b2PlayerBatt ?? 20;
    const turns = state.flags.b3Turns ?? state.flags.b2Turns ?? 5;
    const tName = (state.playerName || 'ASH').toUpperCase();
    uiArt.drawSmallText(ctx, `TRAINER: ${tName}  (${persona.toUpperCase()})`, lx + 20, py + 17, cfg.PAL['0']);
    uiArt.drawSmallText(ctx, `GYM WIN: ${rec.partnerLabel}  ${batt}%/${turns}T`, lx + 20, py + 25, cfg.PAL['B']);
    uiArt.drawSmallText(ctx, `BEAT: ${beatLap ? (beatLap.shortOem || beatLap.oemName) : 'AMD RYZEN AI'}`, lx + 20, py + 33, cfg.PAL['5']);

    // Yellow highlight divider left of QR
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillRect(lx, py + 41, 141, 2);

    // Recommendation block (8px Press Start 2P header + real OEM & CPU specs in crisp proportional font)
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillText(rec.title, lx, py + 47);

    uiArt.drawSmallText(ctx, rec.oem, lx, py + 58, cfg.PAL['B']);
    for (let i = 0; i < rec.lines.length; i++) {
      uiArt.drawSmallText(ctx, rec.lines[i], lx, py + 67 + i * 8, cfg.PAL['0']);
    }

    // Budget OEM pick (left column, stays well clear of QR at x=159)
    uiArt.drawSmallText(ctx, rec.budget[0], lx, py + 95, cfg.PAL['2']);
    uiArt.drawSmallText(ctx, rec.budget[1], lx, py + 103, cfg.PAL['2']);

    // Exact 66x66 QR at (160, 49) inside 70x70 quiet border (158, 47) for Intel AI PC overview
    const qx = 160, qy = 49, qs = 66;
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(qx - 2, qy - 2, qs + 4, qs + 4);
    if (qrLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qrImg, qx, qy, qs, qs);
    }
    uiArt.drawRectOutline(ctx, qx - 2, qy - 2, qs + 4, qs + 4, cfg.PAL['0'], 1);

    uiArt.drawSmallText(ctx, 'SCAN FOR AI PC', qx + 33, qy + 70, cfg.PAL['B'], { align: 'center' });

    // Footer inside panel (y = 129..152)
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + ph - 25, pw - 4, 23);

    uiArt.drawSmallText(ctx, 'NEXT: Ask Reliance Digital staff to demo', px + pw / 2, py + ph - 23, cfg.PAL['7'], { align: 'center' });
    uiArt.drawSmallText(ctx, 'Game values illustrative. Check OEM SKU.', px + pw / 2, py + ph - 15, cfg.PAL['4'], { align: 'center' });
    uiArt.drawSmallText(ctx, 'Real battery & TOPS vary by model.', px + pw / 2, py + ph - 8, cfg.PAL['4'], { align: 'center' });

    // Tap to restart hint (y = 153)
    if (Math.floor(timer / 600) % 2 === 0) {
      const restartMsg = input.isTouch ? '[TAP TO RESTART]' : '[PRESS Z OR CLICK TO RESTART]';
      uiArt.drawMiniText(ctx, restartMsg, 120, 153, cfg.PAL['4'], { align: 'center' });
    }
  },

  exit() {}
};
