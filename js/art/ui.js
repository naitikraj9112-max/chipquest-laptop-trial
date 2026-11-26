// js/art/ui.js — UI drawing helpers (sections 7.1, 8.7, 10)
import { cfg } from '../config.js';
import { art } from './palette.js';

export const uiArt = {
  // Draw text at integer coordinates with Press Start 2P font
  drawText(ctx, text, x, y, color = cfg.PAL['4'], size = 8) {
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.fillText(text, Math.floor(x), Math.floor(y));
  },

  // Draw the dialogue textbox (section 7.1)
  drawDialogBox(ctx, speaker, text, showMore = false) {
    // Textbox: x0 y112 w240 h48
    const bx = 0, by = 112, bw = 240, bh = 48;
    
    // Box background
    ctx.fillStyle = cfg.PAL['4']; // WHITE fill
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = cfg.PAL['0']; // INK border
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
    
    // Inner shadow
    ctx.strokeStyle = cfg.PAL['1']; // DUSK inner shadow
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 3, by + 3, bw - 6, bh - 6);

    // Speaker nameplate (section 7.1)
    if (speaker && speaker !== 'narrator' && speaker !== 'system') {
      const npW = speaker.length * 8 + 8;
      ctx.fillStyle = cfg.PAL['0']; // INK fill
      ctx.fillRect(8, 100, npW, 12);
      uiArt.drawText(ctx, speaker, 12, 102, cfg.PAL['4'], 8);
    }

    // Text area: 224 px = 28 cols, 2 rows, line height 14, first row y122
    const lines = uiArt.wrapText(text, 28);
    for (let i = 0; i < Math.min(2, lines.length); i++) {
      uiArt.drawText(ctx, lines[i], 12, 122 + i * 14, cfg.PAL['0'], 8);
    }

    // Blinking more icon at (224, 142)
    if (showMore) {
      const blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        art.draw(ctx, 'icon_more', 224, 142);
      }
    }
  },

  // Draw a battle bar (section 8.7)
  drawBar(ctx, x, y, w, h, value, max, color) {
    // Background
    ctx.fillStyle = cfg.PAL['1']; // DUSK
    ctx.fillRect(x, y, w, h);
    
    // Fill
    const fillW = Math.max(0, Math.floor((value / max) * w));
    ctx.fillStyle = color;
    ctx.fillRect(x, y, fillW, h);
    
    // Border
    ctx.strokeStyle = cfg.PAL['0'];
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  // Word wrap to fit columns
  wrapText(text, cols) {
    if (!text) return [''];
    const words = text.split(' ');
    const lines = [];
    let current = '';
    
    for (const word of words) {
      if (current.length + word.length + (current.length > 0 ? 1 : 0) > cols) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  },

  // Draw a toast message
  drawToast(ctx, text, alpha = 1) {
    const tw = text.length * 8 + 16;
    const tx = Math.floor((240 - tw) / 2);
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(tx, 68, tw, 24);
    ctx.strokeStyle = cfg.PAL['7'];
    ctx.lineWidth = 1;
    ctx.strokeRect(tx, 68, tw, 24);
    uiArt.drawText(ctx, text, tx + 8, 76, cfg.PAL['7'], 8);
    ctx.globalAlpha = 1;
  },

  // Get battery bar color (section 8.7)
  getBattColor(batt) {
    if (batt >= 50) return cfg.PAL['8']; // LIME
    if (batt >= 20) return cfg.PAL['7']; // YELLOW
    return cfg.PAL['5']; // RED
  },

  // Get heat bar color
  getHeatColor(heat) {
    if (heat < 60) return cfg.PAL['A']; // CYAN
    return cfg.PAL['5']; // RED
  }
};
