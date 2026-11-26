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

  queueMessage(text, autoAdvance = true, tag = null) {
    this.messageQueue.push({ text, autoAdvance, tag });
    if (!this.currentMessage) this.advanceMessage();
  }

  advanceMessage() {
    if (this.messageQueue.length === 0) {
      this.currentMessage = null;
      if (this.onMessagesDone) {
        const cb = this.onMessagesDone;
        this.onMessagesDone = null;
        cb();
      } else {
        this.showingMenu = true;
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

    // Enemy panel (6,4,124x49)
    this.drawPanel(ctx, 6, 4, this.engine.rivalLaptop, this.displayRival, this.engine.rival);

    // Enemy sprite at (174,8) 48x32
    this.drawLaptopSprite(ctx, this.engine.rivalLaptopId, 174, 8, this.rivalShake);

    // Player sprite at (20,62) 48x32
    this.drawLaptopSprite(ctx, this.engine.playerLaptopId, 20, 62, this.playerShake);

    // Player panel (110,56,124x49)
    this.drawPanel(ctx, 110, 56, this.engine.playerLaptop, this.displayPlayer, this.engine.player);

    // Bottom box
    this.drawBottomBox(ctx);

    // Wifi drop banner
    if (this.wifiDropBanner) {
      this.drawWifiDropBanner(ctx);
    }
  }

  drawBackground(ctx) {
    if (this.bgStyle === 'battle1') {
      // Diagonal stripes DUSK/INK with ORANGE edge (pure palette colors, crisp rects)
      ctx.fillStyle = cfg.PAL['0']; // INK
      ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);
      ctx.fillStyle = cfg.PAL['1']; // DUSK
      for (let y = 0; y < 112; y += 2) {
        for (let x = -112; x < cfg.LOGICAL_W; x += 12) {
          ctx.fillRect(x + (112 - y) / 2, y, 4, 2);
        }
      }
      // Orange edge
      ctx.strokeStyle = cfg.PAL['6'];
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, cfg.LOGICAL_W - 2, 110);
    } else {
      // INK with BLUE/CYAN circuit grid (pure palette colors)
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);
      ctx.fillStyle = cfg.PAL['1'];
      for (let x = 0; x < cfg.LOGICAL_W; x += 20) {
        ctx.fillRect(x, 0, 1, 112);
      }
      for (let y = 0; y < 112; y += 20) {
        ctx.fillRect(0, y, cfg.LOGICAL_W, 1);
      }
      // Circuit nodes in BLUE/CYAN
      for (let x = 0; x < cfg.LOGICAL_W; x += 20) {
        for (let y = 0; y < 112; y += 20) {
          ctx.fillStyle = cfg.PAL['B'];
          ctx.fillRect(x - 1, y - 1, 3, 3);
        }
      }
    }
  }

  drawPanel(ctx, px, py, laptopObj, display, actual) {
    const pw = 124, ph = 49;
    // Solid palette panel background (INK fill, crisp WHITE border)
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(px, py, pw, ph);
    uiArt.drawRectOutline(ctx, px, py, pw, ph, cfg.PAL['4'], 1);

    // Name (crisp 4x6 pixel mini font so full OEM names never collide with engine icon at px+112)
    const nameColor = laptopObj.brand === 'AMD' ? cfg.PAL['6'] : cfg.PAL['4'];
    uiArt.drawMiniText(ctx, laptopObj.name, px + 4, py + 3, nameColor);

    // Engine icon 8x8 beside actor's name (section 8.7)
    if (actual.lastEngine && window.CQ && window.CQ.art) {
      const engineIcon = `icon_${actual.lastEngine.toLowerCase()}`;
      window.CQ.art.draw(ctx, engineIcon, px + 112, py + 2);
    }

    // Real spec subtitle in compact 3x5 micro font (if available)
    if (laptopObj.hudSpec) {
      const specColor = laptopObj.brand === 'AMD' ? cfg.PAL['5'] : cfg.PAL['A'];
      uiArt.drawMicroText(ctx, laptopObj.hudSpec, px + 4, py + 11, specColor);
    } else if (laptopObj.id === 'nova') {
      uiArt.drawMicroText(ctx, 'NO NPU - LEGACY CPU', px + 4, py + 11, cfg.PAL['D']);
    } else if (laptopObj.id === 'aura_go') {
      uiArt.drawMicroText(ctx, 'Core Ser.3 | 17T NPU', px + 4, py + 11, cfg.PAL['A']);
    }

    // TASK bar (LIME)
    this.drawBar(ctx, 'TASK', px + 4, py + 19, display.task, 100, cfg.PAL['8']);

    // BATT bar (LIME >= 50, YELLOW 21-49, flashes RED <= 20)
    const lowBattFlash = actual.batt <= 20 && Math.floor(Date.now() / 250) % 2 === 1;
    const battColor = actual.batt <= 20
      ? (lowBattFlash ? cfg.PAL['1'] : cfg.PAL['5'])
      : display.batt >= 50 ? cfg.PAL['8'] : cfg.PAL['7'];
    this.drawBar(ctx, 'BATT', px + 4, py + 28, display.batt, 100, battColor);

    // HEAT bar (CYAN < 60, RED + icon_warn >= 60)
    const heatColor = display.heat < 60 ? cfg.PAL['A'] : cfg.PAL['5'];
    this.drawBar(ctx, 'HEAT', px + 4, py + 37, display.heat, 100, heatColor);

    // Warning icon 8x8 for high heat (section 8.7)
    if (actual.heat >= 60 && window.CQ && window.CQ.art) {
      window.CQ.art.draw(ctx, 'icon_warn', px + 113, py + 36);
    }
  }

  drawBar(ctx, label, x, y, value, max, color) {
    // Crisp 4x6 pixel label (fits inside x..x+27)
    uiArt.drawMiniText(ctx, label, x, y + 1, cfg.PAL['3']);

    // Bar 82x6 at x+28
    const bx = x + 28;
    ctx.fillStyle = cfg.PAL['1'];
    ctx.fillRect(bx, y, 82, 6);

    // Bar fill (inside 1px border)
    const fillW = Math.max(0, Math.floor((value / max) * 80));
    ctx.fillStyle = color;
    ctx.fillRect(bx + 1, y + 1, fillW, 4);

    // Crisp 1px border
    uiArt.drawRectOutline(ctx, bx, y, 82, 6, cfg.PAL['2'], 1);
  }

  drawLaptopSprite(ctx, laptopId, x, y, shake) {
    const sx = shake > 0 ? Math.floor((Math.random() - 0.5) * 4) : 0;
    const spriteId = laptopId.startsWith('amd_')
      ? 'spr_laptop_amd'
      : laptopId.startsWith('intel_')
        ? 'spr_laptop_aura_pro'
        : `spr_laptop_${laptopId}`;
    if (window.CQ && window.CQ.art) {
      window.CQ.art.draw(ctx, spriteId, x + sx, y);
      // Animate NOVA X's flashy RGB display while battery remains
      if (laptopId === 'nova') {
        const actor = this.engine.playerLaptopId === 'nova' ? this.engine.player : this.engine.rival;
        if (actor && actor.batt > 0) {
          const phase = Math.floor(Date.now() / 180) % 4;
          const cols = ['A', 'D', '7', 'C'];
          for (let b = 0; b < 5; b++) {
            const h = 3 + ((phase + b) % 4) * 2;
            ctx.fillStyle = cfg.PAL[cols[(phase + b) % 4]];
            ctx.fillRect(x + sx + 9 + b * 6, y + 14 - h, 4, h);
          }
          for (let k = 0; k < 6; k++) {
            ctx.fillStyle = cfg.PAL[cols[(phase + k) % 4]];
            ctx.fillRect(x + sx + 5 + k * 5, y + 20, 4, 1);
          }
        }
      }
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
    uiArt.drawRectOutline(ctx, 0, 112, 240, 48, cfg.PAL['0'], 2);
    uiArt.drawRectOutline(ctx, 2, 114, 236, 44, cfg.PAL['1'], 1);

    if (this.currentMessage) {
      // Optional move effectiveness badge + message text
      const tag = this.currentMessage.tag;
      if (tag) {
        const bw = tag.label.length * 5 + 8;
        ctx.fillStyle = cfg.PAL[tag.bg] || cfg.PAL['B'];
        ctx.fillRect(10, 117, bw, 10);
        uiArt.drawMiniText(ctx, tag.label, 14, 119, cfg.PAL[tag.fg] || cfg.PAL['4']);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['0'];
        ctx.textBaseline = 'top';
        const lines = uiArt.wrapText(this.currentMessage.text, 28);
        if (lines.length === 1) {
          ctx.fillText(lines[0], 10, 134);
        } else {
          for (let i = 0; i < Math.min(2, lines.length); i++) {
            ctx.fillText(lines[i], 10, 130 + i * 13);
          }
        }
      } else {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['0'];
        ctx.textBaseline = 'top';
        const lines = uiArt.wrapText(this.currentMessage.text, 28);
        for (let i = 0; i < Math.min(2, lines.length); i++) {
          ctx.fillText(lines[i], 12, 122 + i * 14);
        }
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

        // Cursor (icon_cursor 8x8 beside selected label per section 8.7)
        if (i === this.selectedMove) {
          if (window.CQ && window.CQ.art) {
            window.CQ.art.draw(ctx, 'icon_cursor', mx - 10, my);
          } else {
            ctx.fillStyle = cfg.PAL['5'];
            ctx.fillRect(mx - 8, my + 2, 4, 4);
          }
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
    ctx.fillRect(24, 44, 192, 30);
    ctx.strokeStyle = cfg.PAL['5'];
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 44, 192, 30);

    if (window.CQ && window.CQ.art) {
      window.CQ.art.draw(ctx, 'icon_wifi_off', 36, 55);
    }

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['5'];
    ctx.textBaseline = 'top';
    ctx.fillText('WI-FI DROPPED!', 52, 55);
  }
}
