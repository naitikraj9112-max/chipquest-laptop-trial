// js/scenes/result.js — Trainer Card / Result screen (section 9.3)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { resetState } from '../core/state.js';

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

export const ResultScene = {
  enter() {
    timer = 0;
    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_RESULT', { fadeMs: 300 });
    }
  },

  update(dt) {
    timer += dt;

    // Tap to restart
    if (input.aJustPressed() && timer > 1000) {
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
    // Background: WHITE and BLUE with YELLOW highlights
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

    // Panel 224x144 at (8,8)
    const px = 8, py = 4, pw = 224, ph = 152;
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = cfg.PAL['B'];
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    // Header
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + 2, pw - 4, 16);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['7']; // YELLOW
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText('TRAINER CARD', px + pw / 2, py + 6);
    ctx.textAlign = 'left';

    const persona = state.flags.persona || 'student';
    const rec = recommendations[persona];

    // Left column
    const lx = px + 8;
    let ly = py + 24;

    // Persona icon
    const iconId = `icon_${persona}`;
    if (window.CQ && window.CQ.art) {
      const iconData = window.CQ.art.getSpriteData(iconId);
      if (iconData) {
        ctx.drawImage(iconData.canvas, lx, ly, 24, 24);
      }
    }

    ly += 28;
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillText(`CLASS: ${persona.toUpperCase()}`, lx, ly);
    ly += 12;
    ctx.fillText('PARTNER: AURA PRO', lx, ly);
    ly += 12;

    const batt = state.flags.b2PlayerBatt ?? 38;
    ctx.fillText(`BATTERY LEFT: ${batt}%`, lx, ly);
    ly += 12;

    const turns = state.flags.b2Turns ?? 5;
    ctx.fillText(`TURNS: ${turns}`, lx, ly);

    // QR area (right side)
    const qx = px + 148, qy = py + 28;
    // QR placeholder
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(qx, qy, 56, 56);
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(qx + 2, qy + 2, 52, 52);

    // QR pattern (simple)
    ctx.fillStyle = cfg.PAL['0'];
    // Corner squares
    for (const [ox, oy] of [[4,4],[4,42],[42,4]]) {
      ctx.fillRect(qx + ox, qy + oy, 10, 10);
      ctx.fillStyle = cfg.PAL['4'];
      ctx.fillRect(qx + ox + 2, qy + oy + 2, 6, 6);
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(qx + ox + 4, qy + oy + 4, 2, 2);
    }
    // Random dots
    for (let i = 0; i < 30; i++) {
      const dx = 16 + ((i * 7 + 3) % 28);
      const dy = 4 + ((i * 11 + 5) % 48);
      ctx.fillRect(qx + dx, qy + dy, 2, 2);
    }

    ctx.font = '5px monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.textAlign = 'center';
    ctx.fillText('SCAN OR ASK', qx + 28, qy + 58);
    ctx.fillText('STAFF', qx + 28, qy + 64);
    ctx.textAlign = 'left';

    // Recommendation block
    const ry = py + 94;
    ctx.fillStyle = cfg.PAL['7']; // YELLOW highlight
    ctx.fillRect(px + 4, ry, pw - 8, 2);

    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillText(rec.title, lx, ry + 6);

    ctx.font = '6px monospace';
    ctx.fillStyle = cfg.PAL['0'];
    for (let i = 0; i < rec.lines.length; i++) {
      ctx.fillText(rec.lines[i], lx, ry + 18 + i * 10);
    }

    // Budget line
    ctx.font = '6px monospace';
    ctx.fillStyle = cfg.PAL['2'];
    ctx.fillText('Tight budget? Ask about', lx, ry + 50);
    ctx.fillText('Core Series 3 (AI-ready).', lx, ry + 58);

    // Footer
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + ph - 24, pw - 4, 22);

    ctx.font = '5px monospace';
    ctx.fillStyle = cfg.PAL['4'];
    ctx.textAlign = 'center';
    ctx.fillText('NEXT: Ask staff to demo it', px + pw / 2, py + ph - 22);
    ctx.fillText('Game values are illustrative.', px + pw / 2, py + ph - 14);
    ctx.fillText('Real battery/speed vary by PC.', px + pw / 2, py + ph - 7);
    ctx.textAlign = 'left';

    // Tap to restart hint (blinking)
    if (Math.floor(timer / 600) % 2 === 0) {
      ctx.font = '6px monospace';
      ctx.fillStyle = cfg.PAL['2'];
      ctx.textAlign = 'center';
      ctx.fillText('[TAP TO RESTART]', 120, py + ph + 2);
      ctx.textAlign = 'left';
    }
  },

  exit() {}
};
