// js/world/tilemap.js — Store & Gym maps (section 6 + Stage 2 Gym Arena)
import { cfg } from '../config.js';
import { state } from '../core/state.js';

const MAP_DATA = [
  '#########GG#########',
  '#WW.WW.WW..W.WW.WW.#',
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

const GYM_MAP_DATA = [
  'HHHHHBHHBBBBHHBHHHHH',
  'H,,,,,,PPPPPP,,,,,,H',
  'H,,Q,,,PPPPPP,,,Q,,H',
  'H,,,,,,PRRRRP,,,,,,H',
  'H,,,,,,PPPPPP,,,,,,H',
  'H,,,Q,,,,RR,,,,Q,,,H',
  'H,,,,,,,,RR,,,,,,,,H',
  'H,,,,,,,,RR,,,,,,,,H',
  'H,,,Q,,,,RR,,,,Q,,,H',
  'H,,,,,,,,RR,,,,,,,,H',
  'H,,Q,,,,,RR,,,,,Q,,H',
  'H,,,,,,,,RR,,,,,,,,H',
  'H,,,,,,,,RR,,,,,,,,H',
  'HHHHHHHHHEEHHHHHHHHH',
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
  'G': 'tile_gym_door',
  '@': 'tile_floor',
};

const GYM_TILE_MAP = {
  'H': 'tile_gym_wall',
  'B': 'tile_gym_banner',
  ',': 'tile_gym_floor',
  'R': 'tile_gym_carpet',
  'P': 'tile_gym_pedestal',
  'Q': 'tile_gym_statue',
  'E': 'tile_gym_exit',
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
  'tile_gym_door': false,
  'tile_gym_wall': false,
  'tile_gym_banner': false,
  'tile_gym_floor': true,
  'tile_gym_carpet': true,
  'tile_gym_pedestal': true,
  'tile_gym_statue': false,
  'tile_gym_exit': true,
};

const COLS = 20;
const ROWS = 14;

function createTilemap(data, mapDict, isGym = false) {
  const tm = {
    cols: COLS,
    rows: ROWS,
    isGym,

    getTile(col, row) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return isGym ? 'tile_gym_wall' : 'tile_wall';
      const ch = data[row]?.[col] || (isGym ? 'H' : '#');
      return mapDict[ch] || (isGym ? 'tile_gym_floor' : 'tile_floor');
    },

    isWalkable(col, row) {
      const tile = tm.getTile(col, row);
      if (tile === 'tile_gym_door') return Boolean(state.flags.gymUnlocked);
      return WALKABLE[tile] === true;
    },

    getInteraction(col, row) {
      const tile = tm.getTile(col, row);
      if (tile === 'tile_table') {
        if (col === 9 && row === 6) return 'laptop_nova';
        if (col === 10 && row === 6) return 'laptop_aura_go';
        return null;
      }
      if (tile === 'tile_shelf') return 'shelf';
      if (tile === 'tile_counter') return 'counter';
      if (tile === 'tile_plant') return 'plant';
      if (tile === 'tile_door') return 'door';
      if (tile === 'tile_gym_door') return 'gym_door';
      if (tile === 'tile_gym_statue') return 'gym_statue';
      if (tile === 'tile_gym_banner') return 'gym_banner';
      return null;
    },

    draw(ctx, camX, camY) {
      const startCol = Math.max(0, Math.floor(camX / cfg.TILE));
      const startRow = Math.max(0, Math.floor(camY / cfg.TILE));
      const endCol = Math.min(COLS - 1, startCol + Math.ceil(cfg.LOGICAL_W / cfg.TILE) + 1);
      const endRow = Math.min(ROWS - 1, startRow + Math.ceil(cfg.LOGICAL_H / cfg.TILE) + 1);

      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const tileId = tm.getTile(c, r);
          const sx = c * cfg.TILE - camX;
          const sy = r * cfg.TILE - camY;
          const needsFloorBg = tileId === 'tile_table' || tileId === 'tile_plant';

          if (window.CQ && window.CQ.art) {
            if (needsFloorBg) window.CQ.art.drawTile(ctx, 'tile_floor', sx, sy);
            else if (tileId === 'tile_gym_statue') window.CQ.art.drawTile(ctx, 'tile_gym_floor', sx, sy);
            window.CQ.art.drawTile(ctx, tileId, sx, sy);
          } else {
            if (needsFloorBg) {
              ctx.fillStyle = cfg.PAL['F'];
              ctx.fillRect(sx, sy, cfg.TILE, cfg.TILE);
            } else if (tileId === 'tile_gym_statue') {
              ctx.fillStyle = cfg.PAL['1'];
              ctx.fillRect(sx, sy, cfg.TILE, cfg.TILE);
            }
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
              'tile_gym_door': cfg.PAL['A'],
              'tile_gym_wall': cfg.PAL['1'],
              'tile_gym_banner': cfg.PAL['B'],
              'tile_gym_floor': cfg.PAL['1'],
              'tile_gym_carpet': cfg.PAL['5'],
              'tile_gym_pedestal': cfg.PAL['B'],
              'tile_gym_statue': cfg.PAL['7'],
              'tile_gym_exit': cfg.PAL['A'],
            };
            ctx.fillStyle = colors[tileId] || cfg.PAL['0'];
            ctx.fillRect(sx, sy, cfg.TILE, cfg.TILE);
          }
        }
      }
    }
  };
  return tm;
}

export const tilemap = createTilemap(MAP_DATA, TILE_MAP, false);
export const gymTilemap = createTilemap(GYM_MAP_DATA, GYM_TILE_MAP, true);
