// js/world/camera.js — Camera following player (section 6)
import { cfg } from '../config.js';
import { tilemap } from './tilemap.js';

export const camera = {
  x: 0,
  y: 0,

  follow(entity, map = tilemap) {
    // Center camera on entity, clamped to map bounds
    const mapW = map.cols * cfg.TILE;
    const mapH = map.rows * cfg.TILE;
    
    let cx = entity.x + cfg.TILE / 2 - cfg.LOGICAL_W / 2;
    let cy = entity.y + cfg.TILE / 2 - cfg.LOGICAL_H / 2;

    cx = Math.max(0, Math.min(cx, mapW - cfg.LOGICAL_W));
    cy = Math.max(0, Math.min(cy, mapH - cfg.LOGICAL_H));

    this.x = Math.floor(cx);
    this.y = Math.floor(cy);
  },

  reset() {
    this.x = 0;
    this.y = 0;
  }
};
