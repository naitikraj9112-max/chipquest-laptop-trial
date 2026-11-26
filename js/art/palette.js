// js/art/palette.js — Art system (sections 3.5, 3.7, 10)
import { cfg } from '../config.js';

const spriteCache = {};

export const art = {
  init() {
    // Pre-render any needed sprite caches
  },

  // Draw a sprite at x,y (section 3.7)
  draw(ctx, id, x, y, opts = {}) {
    const { flipX = false } = opts;
    const spriteData = art.getSpriteData(id);
    if (!spriteData) return;

    const { canvas: sCanvas, w, h } = spriteData;
    if (flipX) {
      ctx.save();
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(sCanvas, 0, 0);
      ctx.restore();
    } else {
      ctx.drawImage(sCanvas, x, y);
    }
  },

  // Draw a tile
  drawTile(ctx, tileId, x, y) {
    art.draw(ctx, tileId, x, y);
  },

  // Draw a UI box (section 10)
  drawBox(ctx, x, y, w, h, style = 'dialog') {
    const styles = {
      dialog: { fill: cfg.PAL['4'], border: cfg.PAL['0'], shadow: cfg.PAL['1'] },
      panel: { fill: cfg.PAL['3'], border: cfg.PAL['0'], shadow: cfg.PAL['1'] },
      card: { fill: cfg.PAL['4'], border: cfg.PAL['B'], shadow: null, header: cfg.PAL['B'] },
    };
    const s = styles[style] || styles.dialog;

    // Shadow
    if (s.shadow) {
      ctx.fillStyle = s.shadow;
      ctx.fillRect(x + 2, y + 2, w, h);
    }

    // Fill
    ctx.fillStyle = s.fill;
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = s.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // Header strip for card
    if (s.header) {
      ctx.fillStyle = s.header;
      ctx.fillRect(x + 2, y + 2, w - 4, 12);
    }
  },

  // Get/create cached sprite canvas
  getSpriteData(id) {
    if (spriteCache[id]) return spriteCache[id];

    // Try to find the sprite definition
    const spriteDefs = window._spriteData || {};
    const def = spriteDefs[id];
    if (!def) return null;

    const rows = def;
    const h = rows.length;
    const w = rows[0].length;

    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const octx = offscreen.getContext('2d');

    for (let py = 0; py < h; py++) {
      const row = rows[py] || '';
      for (let px = 0; px < w; px++) {
        const key = row[px] || '.';
        if (key === '.') continue;
        const hex = cfg.PAL[key.toUpperCase()];
        if (hex) {
          octx.fillStyle = hex;
          octx.fillRect(px, py, 1, 1);
        }
      }
    }

    spriteCache[id] = { canvas: offscreen, w, h };
    return spriteCache[id];
  },

  clearCache() {
    Object.keys(spriteCache).forEach(k => delete spriteCache[k]);
  }
};
