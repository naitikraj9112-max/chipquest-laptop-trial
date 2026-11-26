// js/scenes/result.js — Trainer Card / Result screen (section 9.3)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state, resetState } from '../core/state.js';
import { uiArt } from '../art/ui.js';

const recommendations = {
  student: {
    title: 'STUDENT PICK',
    lines: [
      'Core Ultra 5 or higher',
      'Evo badge, 16GB RAM+',
      'Long battery, offline AI',
    ]
  },
  creator: {
    title: 'CREATOR PICK',
    lines: [
      'Core Ultra 7 or higher',
      'Evo badge, 16GB RAM+, SSD',
      'More AI + graphics power',
    ]
  },
  gamer: {
    title: 'GAMER PICK',
    lines: [
      'Core Ultra X-series',
      'Strongest Intel graphics',
      'Evo badge, 16GB RAM+',
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

    // Class & partner stats (crisp 4x6 pixel font)
    uiArt.drawMiniText(ctx, `CLASS: ${persona.toUpperCase()}`, lx + 20, py + 19, cfg.PAL['0']);
    uiArt.drawMiniText(ctx, 'PARTNER: AURA PRO', lx + 20, py + 28, cfg.PAL['0']);

    const batt = state.flags.b2PlayerBatt ?? 38;
    const turns = state.flags.b2Turns ?? 5;
    uiArt.drawMiniText(ctx, `BATTERY LEFT: ${batt}%`, lx, py + 38, cfg.PAL['0']);
    uiArt.drawMiniText(ctx, `TURNS: ${turns}`, lx, py + 47, cfg.PAL['0']);

    // Yellow highlight divider left of QR
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillRect(lx, py + 55, 144, 2);

    // Recommendation block (8px crisp Press Start 2P header + 4x6 crisp lines)
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillText(rec.title, lx, py + 60);

    for (let i = 0; i < rec.lines.length; i++) {
      uiArt.drawMiniText(ctx, rec.lines[i], lx, py + 72 + i * 8, cfg.PAL['0']);
    }

    // Budget line (left column)
    uiArt.drawMiniText(ctx, 'Tight budget? Ask about', lx, py + 99, cfg.PAL['2']);
    uiArt.drawMiniText(ctx, 'Core Series 3 (AI-ready).', lx, py + 107, cfg.PAL['2']);

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

    uiArt.drawMiniText(ctx, 'SCAN OR ASK', qx + 28, qy + 59, cfg.PAL['B'], { align: 'center' });
    uiArt.drawMiniText(ctx, 'STAFF', qx + 28, qy + 66, cfg.PAL['B'], { align: 'center' });

    // Footer inside panel (y = 126..150)
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + ph - 26, pw - 4, 24);

    uiArt.drawMiniText(ctx, 'NEXT: Ask staff to demo it', px + pw / 2, py + ph - 24, cfg.PAL['7'], { align: 'center' });
    uiArt.drawMiniText(ctx, 'Game values are illustrative.', px + pw / 2, py + ph - 16, cfg.PAL['4'], { align: 'center' });
    uiArt.drawMiniText(ctx, 'Real battery/speed vary by PC.', px + pw / 2, py + ph - 9, cfg.PAL['4'], { align: 'center' });

    // Tap to restart hint (y = 153)
    if (Math.floor(timer / 600) % 2 === 0) {
      uiArt.drawMiniText(ctx, '[TAP TO RESTART]', 120, 153, cfg.PAL['4'], { align: 'center' });
    }
  },

  exit() {}
};
