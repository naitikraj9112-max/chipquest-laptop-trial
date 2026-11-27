// js/world/entity.js — NPC and player entities (section 6)
import { cfg } from '../config.js';
import { state } from '../core/state.js';

export class Entity {
  constructor(id, col, row, dir = 'down', spriteBase = '') {
    this.id = id;
    this.col = col;
    this.row = row;
    this.dir = dir;
    this.spriteBase = spriteBase; // e.g. 'spr_player'
    this.frame = 0; // 0=stand, 1 and 2 = walk
    this.moving = false;
    this.moveTimer = 0;
    this.fromX = col * cfg.TILE;
    this.fromY = row * cfg.TILE;
    this.toX = col * cfg.TILE;
    this.toY = row * cfg.TILE;
    this.x = col * cfg.TILE;
    this.y = row * cfg.TILE;
    this.walkFrame = 1;
    this.visible = true;
  }

  get spriteId() {
    const base = (this.spriteBase === 'spr_player' && state.playerGender === 'girl') ? 'spr_player_girl' : this.spriteBase;
    const d = this.dir === 'right' ? 'left' : this.dir;
    return `${base}_${d}_${this.frame}`;
  }

  get flipX() {
    return this.dir === 'right';
  }

  startMove(dir, tilemap, entities) {
    if (this.moving) return false;
    
    this.dir = dir;
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const newCol = this.col + dx;
    const newRow = this.row + dy;

    // Check walkability
    if (!tilemap.isWalkable(newCol, newRow)) return false;

    // Check entity collision
    for (const e of entities) {
      if (e !== this && e.visible && e.col === newCol && e.row === newRow) return false;
    }

    this.moving = true;
    this.moveTimer = 0;
    this.fromX = this.col * cfg.TILE;
    this.fromY = this.row * cfg.TILE;
    this.col = newCol;
    this.row = newRow;
    this.toX = newCol * cfg.TILE;
    this.toY = newRow * cfg.TILE;
    this.walkFrame = this.walkFrame === 1 ? 2 : 1;
    this.frame = this.walkFrame;

    // SFX
    if (window.CQ) window.CQ.audio.playSfx('sfx_step');

    return true;
  }

  update(dt) {
    if (this.moving) {
      this.moveTimer += dt;
      const t = Math.min(1, this.moveTimer / cfg.STEP_MS);
      this.x = this.fromX + (this.toX - this.fromX) * t;
      this.y = this.fromY + (this.toY - this.fromY) * t;
      // Alternate two distinct walk frames smoothly within each step
      const altFrame = this.walkFrame === 1 ? 2 : 1;
      this.frame = t < 0.5 ? this.walkFrame : altFrame;
      if (t >= 1) {
        this.moving = false;
        this.x = this.toX;
        this.y = this.toY;
        this.frame = 0;
      }
    }
  }

  draw(ctx, camX, camY) {
    if (!this.visible) return;
    const sx = Math.floor(this.x - camX);
    const sy = Math.floor(this.y - camY);
    
    if (window.CQ && window.CQ.art) {
      window.CQ.art.draw(ctx, this.spriteId, sx, sy, { flipX: this.flipX });
    } else {
      // Fallback colored rect
      ctx.fillStyle = this.id === 'player' ? cfg.PAL['B'] : 
                      this.id === 'guide' ? cfg.PAL['4'] : cfg.PAL['5'];
      ctx.fillRect(sx + 2, sy + 2, 12, 14);
    }
  }

  face(dir) {
    this.dir = dir;
  }

  teleport(col, row) {
    this.col = col;
    this.row = row;
    this.x = col * cfg.TILE;
    this.y = row * cfg.TILE;
    this.fromX = this.x;
    this.fromY = this.y;
    this.toX = this.x;
    this.toY = this.y;
    this.moving = false;
    this.frame = 0;
  }
}

export const entityManager = {
  entities: [],

  add(entity) {
    this.entities.push(entity);
    return entity;
  },

  remove(id) {
    this.entities = this.entities.filter(e => e.id !== id);
  },

  get(id) {
    return this.entities.find(e => e.id === id);
  },

  update(dt) {
    for (const e of this.entities) e.update(dt);
  },

  draw(ctx, camX, camY) {
    // Sort by Y for overlap
    const sorted = [...this.entities].sort((a, b) => a.y - b.y);
    for (const e of sorted) e.draw(ctx, camX, camY);
  },

  clear() {
    this.entities = [];
  }
};
