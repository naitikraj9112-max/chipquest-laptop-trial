// js/art/ui.js — UI drawing helpers (sections 7.1, 8.7, 10)
import { cfg } from '../config.js';
import { art } from './palette.js';

// Compact 4x6 pixel bitmap font (0 anti-aliasing, pure palette fillRect pixels)
// Rows 0-4: cap/body (4 bits wide), Row 5: descender row
const MINI_FONT = {
  ' ': [0,0,0,0,0,0],
  'A': [6,9,15,9,9,0],
  'B': [14,9,14,9,14,0],
  'C': [7,8,8,8,7,0],
  'D': [14,9,9,9,14,0],
  'E': [15,8,14,8,15,0],
  'F': [15,8,14,8,8,0],
  'G': [7,8,11,9,7,0],
  'H': [9,9,15,9,9,0],
  'I': [14,4,4,4,14,0],
  'J': [7,2,2,10,4,0],
  'K': [9,10,12,10,9,0],
  'L': [8,8,8,8,15,0],
  'M': [9,15,15,9,9,0],
  'N': [9,13,11,9,9,0],
  'O': [6,9,9,9,6,0],
  'P': [14,9,14,8,8,0],
  'Q': [6,9,9,11,7,0],
  'R': [14,9,14,10,9,0],
  'S': [7,8,6,1,14,0],
  'T': [15,4,4,4,4,0],
  'U': [9,9,9,9,6,0],
  'V': [9,9,9,6,6,0],
  'W': [9,9,15,15,9,0],
  'X': [9,9,6,9,9,0],
  'Y': [9,9,6,4,4,0],
  'Z': [15,2,4,8,15,0],
  'a': [0,14,7,9,7,0],
  'b': [8,14,9,9,14,0],
  'c': [0,7,8,8,7,0],
  'd': [1,7,9,9,7,0],
  'e': [0,6,15,8,7,0],
  'f': [3,4,14,4,4,0],
  'g': [0,7,9,7,1,6],
  'h': [8,14,9,9,9,0],
  'i': [4,0,4,4,4,0],
  'j': [2,0,2,2,10,4],
  'k': [8,9,14,10,9,0],
  'l': [12,4,4,4,6,0],
  'm': [0,10,15,9,9,0],
  'n': [0,14,9,9,9,0],
  'o': [0,6,9,9,6,0],
  'p': [0,14,9,14,8,8],
  'q': [0,7,9,7,1,1],
  'r': [0,7,8,8,8,0],
  's': [0,7,12,3,14,0],
  't': [4,14,4,4,3,0],
  'u': [0,9,9,9,7,0],
  'v': [0,9,9,6,6,0],
  'w': [0,9,9,15,9,0],
  'x': [0,9,6,6,9,0],
  'y': [0,9,9,7,1,6],
  'z': [0,15,2,4,15,0],
  '0': [6,9,11,9,6,0],
  '1': [4,12,4,4,14,0],
  '2': [14,1,6,8,15,0],
  '3': [14,1,6,1,14,0],
  '4': [9,9,15,1,1,0],
  '5': [15,8,14,1,14,0],
  '6': [7,8,14,9,6,0],
  '7': [15,1,2,4,4,0],
  '8': [6,9,6,9,6,0],
  '9': [6,9,7,1,14,0],
  ':': [0,4,0,4,0,0],
  '.': [0,0,0,0,4,0],
  ',': [0,0,0,4,4,8],
  '!': [4,4,4,0,4,0],
  '?': [6,9,2,0,2,0],
  '-': [0,0,14,0,0,0],
  '+': [0,4,14,4,0,0],
  '/': [1,2,4,4,8,0],
  '%': [9,2,4,8,9,0],
  '(': [2,4,4,4,2,0],
  ')': [4,2,2,2,4,0],
  '[': [6,4,4,4,6,0],
  ']': [6,2,2,2,6,0],
  '<': [2,4,8,4,2,0],
  '>': [8,4,2,4,8,0],
  '=': [0,14,0,14,0,0],
  '*': [4,14,4,10,0,0],
  '&': [4,10,4,11,6,0],
  "'": [4,4,0,0,0,0],
};

export const uiArt = {
  // Draw crisp 1px pixel-aligned rectangle outline (no half-pixel blur)
  drawRectOutline(ctx, x, y, w, h, color, t = 1) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const iw = Math.floor(w), ih = Math.floor(h);
    ctx.fillStyle = color;
    ctx.fillRect(ix, iy, iw, t);
    ctx.fillRect(ix, iy + ih - t, iw, t);
    ctx.fillRect(ix, iy, t, ih);
    ctx.fillRect(ix + iw - t, iy, t, ih);
  },

  // Draw crisp 4x6 pixel bitmap text (0 anti-aliasing, pure palette colors)
  drawMiniText(ctx, text, x, y, color = cfg.PAL['4'], opts = {}) {
    const str = String(text);
    const step = 5;
    let startX = Math.floor(x);
    const iy = Math.floor(y);
    if (opts.align === 'center') {
      startX = Math.floor(x - (str.length * step - 1) / 2);
    } else if (opts.align === 'right') {
      startX = Math.floor(x - (str.length * step - 1));
    }
    ctx.fillStyle = color;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const glyph = MINI_FONT[ch] || MINI_FONT[ch.toUpperCase()] || MINI_FONT[' '];
      const gx = startX + i * step;
      for (let r = 0; r < 6; r++) {
        const bits = glyph[r];
        if (!bits) continue;
        if (bits & 8) ctx.fillRect(gx, iy + r, 1, 1);
        if (bits & 4) ctx.fillRect(gx + 1, iy + r, 1, 1);
        if (bits & 2) ctx.fillRect(gx + 2, iy + r, 1, 1);
        if (bits & 1) ctx.fillRect(gx + 3, iy + r, 1, 1);
      }
    }
  },

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

  // Word wrap to fit columns (respects explicit newlines)
  wrapText(text, cols) {
    if (!text) return [''];
    const paragraphs = String(text).split('\n');
    const lines = [];

    for (const para of paragraphs) {
      if (!para) {
        lines.push('');
        continue;
      }
      const words = para.split(' ');
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
    }
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
