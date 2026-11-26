// js/battle/ui.js — Battle UI rendering (section 8.7)
import { cfg } from '../config.js';
import { uiArt } from '../art/ui.js';

export class BattleUI {
  constructor(engine, battleId) {
    this.engine = engine;
    this.battleId = battleId;
    this.selectedMove = 0; // 0-3 for 2x2 grid
    this.showingMenu = false;
    this.messageQueue = [];
    this.currentMessage = null;
    this.messageTimer = 0;
    this.onMessagesDone = null;

    // Tween state
    this.displayPlayer = { task: 0, batt: engine.player.batt, heat: 0 };
    this.displayRival = { task: 0, batt: engine.rival.batt, heat: 0 };
    this.tweenTimer = 0;
    this.tweening = false;

    // Animation state
    this.playerShake = 0;
    this.rivalShake = 0;
    this.wifiDropBanner = false;
    this.wifiDropTimer = 0;

    // Battle-specific bg colors
    this.bgStyle = battleId === 'BATTLE1' ? 'battle1' : 'battle2';
  }

  queueMessage(text, autoAdvance = true) {
    this.messageQueue.push({ text, autoAdvance });
    if (!this.currentMessage) this.advanceMessage();
  }

  advanceMessage() {
    if (this.messageQueue.length === 0) {
      this.currentMessage = null;
      this.showingMenu = true;
      if (this.onMessagesDone) {
        const cb = this.onMessagesDone;
        this.onMessagesDone = null;
        cb();
      }
      return;
    }
    this.currentMessage = this.messageQueue.shift();
    this.messageTimer = 0;
    this.showingMenu = false;
  }

  update(dt) {
    // Tween bars
    this.tweenBar('task', this.engine.player, this.displayPlayer, dt);
    this.tweenBar('batt', this.engine.player, this.displayPlayer, dt);
    this.tweenBar('heat', this.engine.player, this.displayPlayer, dt);
    this.tweenBar('task', this.engine.rival, this.displayRival, dt);
    this.tweenBar('batt', this.engine.rival, this.displayRival, dt);
    this.tweenBar('heat', this.engine.rival, this.displayRival, dt);

    // Message auto-advance
    if (this.currentMessage) {
      this.messageTimer += dt;
      if (this.currentMessage.autoAdvance && this.messageTimer >= cfg.BATTLE_MSG_MS) {
        this.advanceMessage();
      }
    }

    // Wifi drop banner
    if (this.wifiDropBanner) {
      this.wifiDropTimer += dt;
      if (this.wifiDropTimer > 2000) {
        this.wifiDropBanner = false;
      }
    }

    // Shake decay
    if (this.playerShake > 0) this.playerShake = Math.max(0, this.playerShake - dt);
    if (this.rivalShake > 0) this.rivalShake = Math.max(0, this.rivalShake - dt);
  }

  tweenBar(prop, actual, display, dt) {
    const diff = actual[prop] - display[prop];
    if (Math.abs(diff) < 0.5) {
      display[prop] = actual[prop];
    } else {
      display[prop] += diff * Math.min(1, dt / cfg.BAR_TWEEN_MS * 3);
    }
  }

  handleInput(dir) {
    if (!this.showingMenu) return;
    if (dir === 'up' && this.selectedMove >= 2) {
      this.selectedMove -= 2;
      if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
    }
    if (dir === 'down' && this.selectedMove < 2) {
      this.selectedMove += 2;
      if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
    }
    if (dir === 'left' && this.selectedMove % 2 === 1) {
      this.selectedMove -= 1;
      if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
    }
    if (dir === 'right' && this.selectedMove % 2 === 0) {
      this.selectedMove += 1;
      if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
    }
  }

  handleA() {
    if (this.currentMessage && !this.currentMessage.autoAdvance) {
      this.advanceMessage();
      return 'message_advanced';
    }
    if (this.showingMenu) {
      return 'move_selected';
    }
    return null;
  }

  getSelectedMoveId() {
    return ['M1', 'M2', 'M3', 'M4'][this.selectedMove];
  }

  showWifiDrop() {
    this.wifiDropBanner = true;
    this.wifiDropTimer = 0;
  }

  draw(ctx) {
    // Background
    this.drawBackground(ctx);

    // Enemy panel (6,6,120x46)
    this.drawPanel(ctx, 6, 6, this.engine.rival.name, this.displayRival, this.engine.rival);

    // Enemy sprite at (170,8) 48x32
    this.drawLaptopSprite(ctx, this.engine.rivalLaptopId, 170, 8, this.rivalShake);

    // Player sprite at (22,62) 48x32
    this.drawLaptopSprite(ctx, this.engine.playerLaptopId, 22, 62, this.playerShake);

    // Player panel (114,58,120x46)
    this.drawPanel(ctx, 114, 58, this.engine.player.name, this.displayPlayer, this.engine.player);

    // Bottom box
    this.drawBottomBox(ctx);

    // Wifi drop banner
    if (this.wifiDropBanner) {
      this.drawWifiDropBanner(ctx);
    }
  }

  drawBackground(ctx) {
    if (this.bgStyle === 'battle1') {
      // Diagonal stripes DUSK/INK with ORANGE edge
      ctx.fillStyle = cfg.PAL['0']; // INK
      ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);
      ctx.strokeStyle = cfg.PAL['1']; // DUSK
      ctx.lineWidth = 2;
      for (let i = -cfg.LOGICAL_H; i < cfg.LOGICAL_W + cfg.LOGICAL_H; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - cfg.LOGICAL_H, cfg.LOGICAL_H);
        ctx.stroke();
      }
      // Orange edge
      ctx.strokeStyle = cfg.PAL['6'];
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, cfg.LOGICAL_W - 4, 108);
    } else {
      // INK with CYAN circuit grid
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);
      ctx.strokeStyle = cfg.PAL['A'];
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.15;
      for (let x = 0; x < cfg.LOGICAL_W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 112); ctx.stroke();
      }
      for (let y = 0; y < 112; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cfg.LOGICAL_W, y); ctx.stroke();
      }
      // Small circuit nodes
      for (let x = 0; x < cfg.LOGICAL_W; x += 20) {
        for (let y = 0; y < 112; y += 20) {
          ctx.fillStyle = cfg.PAL['A'];
          ctx.fillRect(x - 1, y - 1, 3, 3);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  drawPanel(ctx, px, py, name, display, actual) {
    // Panel background
    ctx.fillStyle = cfg.PAL['0'];
    ctx.globalAlpha = 0.7;
    ctx.fillRect(px, py, 120, 46);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = cfg.PAL['4'];
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, 120, 46);

    // Name
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['4'];
    ctx.textBaseline = 'top';
    ctx.fillText(name, px + 4, py + 3);

    // Engine icon (small text)
    if (actual.lastEngine) {
      ctx.fillStyle = cfg.PAL['A'];
      ctx.font = '6px monospace';
      ctx.fillText(actual.lastEngine, px + 90, py + 4);
    }

    // TASK bar
    this.drawBar(ctx, 'TASK', px + 4, py + 14, display.task, 100, cfg.PAL['8']);
    // BATT bar
    const battColor = display.batt >= 50 ? cfg.PAL['8'] : display.batt >= 20 ? cfg.PAL['7'] : cfg.PAL['5'];
    this.drawBar(ctx, 'BATT', px + 4, py + 25, display.batt, 100, battColor);
    // HEAT bar
    const heatColor = display.heat < 60 ? cfg.PAL['A'] : cfg.PAL['5'];
    this.drawBar(ctx, 'HEAT', px + 4, py + 36, display.heat, 100, heatColor);

    // Warning icon for high heat
    if (actual.heat >= 60) {
      ctx.fillStyle = cfg.PAL['5'];
      ctx.font = '6px monospace';
      ctx.fillText('!', px + 110, py + 37);
    }
  }

  drawBar(ctx, label, x, y, value, max, color) {
    // Label
    ctx.font = '6px monospace';
    ctx.fillStyle = cfg.PAL['3'];
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, y);

    // Bar background
    const bx = x + 28;
    ctx.fillStyle = cfg.PAL['1'];
    ctx.fillRect(bx, y, 80, 6);

    // Bar fill
    const fillW = Math.max(0, Math.floor((value / max) * 80));
    ctx.fillStyle = color;
    ctx.fillRect(bx, y, fillW, 6);

    // Border
    ctx.strokeStyle = cfg.PAL['2'];
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, y, 80, 6);

    // Value text
    ctx.fillStyle = cfg.PAL['4'];
    ctx.font = '6px monospace';
    ctx.fillText(Math.floor(value), bx + 82, y);
  }

  drawLaptopSprite(ctx, laptopId, x, y, shake) {
    const sx = shake > 0 ? Math.floor((Math.random() - 0.5) * 4) : 0;
    const spriteId = `spr_laptop_${laptopId}`;
    if (window.CQ && window.CQ.art) {
      window.CQ.art.draw(ctx, spriteId, x + sx, y);
    } else {
      // Fallback colored rect
      const colors = { nova: cfg.PAL['C'], aura_go: cfg.PAL['2'], aura_pro: cfg.PAL['1'] };
      ctx.fillStyle = colors[laptopId] || cfg.PAL['2'];
      ctx.fillRect(x + sx, y, 48, 32);
      ctx.strokeStyle = cfg.PAL['0'];
      ctx.strokeRect(x + sx, y, 48, 32);
      ctx.fillStyle = cfg.PAL['4'];
      ctx.font = '6px monospace';
      const name = laptopId === 'nova' ? 'NOVA' : laptopId === 'aura_go' ? 'AURA GO' : 'AURA PRO';
      ctx.fillText(name, x + sx + 4, y + 14);
    }
  }

  drawBottomBox(ctx) {
    // Bottom box (0,112,240x48)
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(0, 112, 240, 48);
    ctx.strokeStyle = cfg.PAL['0'];
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 113, 238, 46);

    if (this.currentMessage) {
      // Show message
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = cfg.PAL['0'];
      ctx.textBaseline = 'top';
      const lines = uiArt.wrapText(this.currentMessage.text, 28);
      for (let i = 0; i < Math.min(2, lines.length); i++) {
        ctx.fillText(lines[i], 12, 122 + i * 14);
      }
    } else if (this.showingMenu) {
      // 2x2 move menu
      const moves = this.engine.getPlayerMoves();
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textBaseline = 'top';

      for (let i = 0; i < moves.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const mx = 16 + col * 108;
        const my = 122 + row * 16;

        // Cursor
        if (i === this.selectedMove) {
          ctx.fillStyle = cfg.PAL['5']; // RED cursor
          ctx.beginPath();
          ctx.moveTo(mx - 10, my + 1);
          ctx.lineTo(mx - 4, my + 4);
          ctx.lineTo(mx - 10, my + 7);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = cfg.PAL['0'];
        // Truncate to 12 chars
        const label = moves[i].label.substring(0, 12);
        ctx.fillText(label, mx, my);
      }
    }
  }

  drawWifiDropBanner(ctx) {
    ctx.fillStyle = cfg.PAL['0'];
    ctx.globalAlpha = 0.85;
    ctx.fillRect(30, 45, 180, 30);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = cfg.PAL['5'];
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 45, 180, 30);

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['5'];
    ctx.textBaseline = 'top';
    ctx.fillText('WI-FI DROPPED!', 50, 55);
  }
}
