// js/world/tilemap.js — Store map (section 6)
import { cfg } from '../config.js';

const MAP_DATA = [
  '####################',
  '#WW.WW.WW.WW.WW.WW#',
  '#...SSSS....SSSS...#',
  '#..................#',
  '#..SSSS......SSSS..#',
  '#..................#',
  '#........TT........#',
  '#..................#',
  '#..SSSS......CCCCC.#',
  '#..................#',
  '#,,,,,,,,,,,,,,,,,,#',
  '#..................#',
  '#P.................P#',
  '#########DD#########',
];

const TILE_MAP = {
  '#': 'tile_wall',
  '.': 'tile_floor',
  ',': 'tile_carpet',
  'W': 'tile_poster',
  'S': 'tile_shelf',
  'C': 'tile_counter',
  'T': 'tile_table',
  'P': 'tile_plant',
  'D': 'tile_door',
  '@': 'tile_floor',
};

const WALKABLE = {
  'tile_floor': true,
  'tile_carpet': true,
  'tile_wall': false,
  'tile_poster': false,
  'tile_shelf': false,
  'tile_counter': false,
  'tile_table': false,
  'tile_plant': false,
  'tile_door': false,
};

const COLS = 20;
const ROWS = 14;

export const tilemap = {
  cols: COLS,
  rows: ROWS,
  
  getTile(col, row) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 'tile_wall';
    const ch = MAP_DATA[row]?.[col] || '#';
    return TILE_MAP[ch] || 'tile_floor';
  },

  isWalkable(col, row) {
    const tile = tilemap.getTile(col, row);
    return WALKABLE[tile] === true;
  },

  getInteraction(col, row) {
    const tile = tilemap.getTile(col, row);
    if (tile === 'tile_table') {
      if (col === 9 && row === 6) return 'laptop_nova';
      if (col === 10 && row === 6) return 'laptop_aura_go';
      return null;
    }
    if (tile === 'tile_shelf') return 'shelf';
    if (tile === 'tile_counter') return 'counter';
    if (tile === 'tile_plant') return 'plant';
    if (tile === 'tile_door') return 'door';
    return null;
  },

  draw(ctx, camX, camY) {
    const startCol = Math.max(0, Math.floor(camX / cfg.TILE));
    const startRow = Math.max(0, Math.floor(camY / cfg.TILE));
    const endCol = Math.min(COLS - 1, startCol + Math.ceil(cfg.LOGICAL_W / cfg.TILE) + 1);
    const endRow = Math.min(ROWS - 1, startRow + Math.ceil(cfg.LOGICAL_H / cfg.TILE) + 1);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = tilemap.getTile(c, r);
        const sx = c * cfg.TILE - camX;
        const sy = r * cfg.TILE - camY;
        
        if (window.CQ && window.CQ.art) {
          window.CQ.art.drawTile(ctx, tileId, sx, sy);
        } else {
          // Fallback: draw colored rects
          const colors = {
            'tile_floor': cfg.PAL['F'],
            'tile_carpet': cfg.PAL['6'],
            'tile_wall': cfg.PAL['B'],
            'tile_poster': cfg.PAL['7'],
            'tile_shelf': cfg.PAL['2'],
            'tile_counter': cfg.PAL['E'],
            'tile_table': cfg.PAL['3'],
            'tile_plant': cfg.PAL['9'],
            'tile_door': cfg.PAL['E'],
          };
          ctx.fillStyle = colors[tileId] || cfg.PAL['0'];
          ctx.fillRect(sx, sy, cfg.TILE, cfg.TILE);
        }
      }
    }
  }
};
