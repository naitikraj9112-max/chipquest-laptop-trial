// js/core/pause.js — In-game pause menu (Escape / Pause button)
import { cfg } from '../config.js';
import { input } from './input.js';
import { resetState } from './state.js';
import { sceneManager } from './sceneManager.js';
import { uiArt } from '../art/ui.js';

let isOpen = false;
let view = 'menu'; // 'menu' | 'controls'
let selectedIdx = 0;
let exiting = false;

const MENU_ITEMS = [
  { id: 'resume', label: 'RESUME' },
  { id: 'controls', label: 'CONTROLS' },
  { id: 'exit', label: 'EXIT GAME' },
];

export const pauseMenu = {
  get isOpen() { return isOpen; },
  get view() { return view; },
  get selectedIndex() { return selectedIdx; },

  open() {
    if (exiting) return;
    isOpen = true;
    view = 'menu';
    selectedIdx = 0;
    input.flush();
    window.CQ?.audio?.playSfx('sfx_confirm');
  },

  close() {
    isOpen = false;
    view = 'menu';
    input.flush();
    window.CQ?.audio?.playSfx('sfx_cancel');
  },

  toggle() {
    if (sceneManager.currentId === 'TITLE' || !sceneManager.currentId) return;
    if (isOpen) {
      if (view === 'controls') {
        view = 'menu';
        input.flush();
        window.CQ?.audio?.playSfx('sfx_cancel');
      } else {
        this.close();
      }
    } else {
      this.open();
    }
  },

  update() {
    if (!isOpen || exiting) return;
    input.markActive();

    if (input.pauseJustPressed()) {
      if (view === 'controls') {
        view = 'menu';
        window.CQ?.audio?.playSfx('sfx_cancel');
      } else {
        this.close();
      }
      input.flush();
      return;
    }

    if (view === 'controls') {
      const click = input.consumeClick();
      if (click || input.aJustPressed() || input.bJustPressed()) {
        view = 'menu';
        window.CQ?.audio?.playSfx('sfx_cancel');
        input.flush();
      }
      return;
    }

    // Menu navigation
    const click = input.consumeClick();
    if (click) {
      // Option hitboxes centered inside panel (x=52..188, y=54 + i*18, h=14)
      if (click.x >= 44 && click.x <= 196) {
        for (let i = 0; i < MENU_ITEMS.length; i++) {
          const iy = 54 + i * 18;
          if (click.y >= iy - 2 && click.y <= iy + 14) {
            selectedIdx = i;
            activateOption(MENU_ITEMS[i].id);
            input.flush();
            return;
          }
        }
      }
      // Click outside menu panel closes pause menu
      if (click.x < 40 || click.x > 200 || click.y < 24 || click.y > 128) {
        this.close();
      }
      input.flush();
      return;
    }

    const dir = input.dirJustPressed();
    if (dir === 'up') {
      selectedIdx = (selectedIdx + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
      window.CQ?.audio?.playSfx('sfx_blip');
    } else if (dir === 'down') {
      selectedIdx = (selectedIdx + 1) % MENU_ITEMS.length;
      window.CQ?.audio?.playSfx('sfx_blip');
    }

    if (input.bJustPressed()) {
      this.close();
      return;
    }

    if (input.aJustPressed()) {
      activateOption(MENU_ITEMS[selectedIdx].id);
      input.flush();
    }
  },

  draw(ctx) {
    if (!isOpen) return;

    // Dim backdrop using pure INK checkerboard dither so only palette colors appear
    ctx.fillStyle = cfg.PAL['0'];
    for (let y = 0; y < cfg.LOGICAL_H; y += 2) {
      ctx.fillRect(0, y, cfg.LOGICAL_W, 1);
    }

    if (view === 'controls') {
      drawControlsPanel(ctx);
      return;
    }

    // Main pause menu panel (40, 24, 160, 106)
    const px = 40, py = 24, pw = 160, ph = 106;
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(px, py, pw, ph);
    uiArt.drawRectOutline(ctx, px, py, pw, ph, cfg.PAL['0'], 2);

    // Header
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(px + 2, py + 2, pw - 4, 16);
    uiArt.drawText(ctx, 'PAUSED', px + 56, py + 6, cfg.PAL['7'], 8);

    // 3 Options
    for (let i = 0; i < MENU_ITEMS.length; i++) {
      const iy = 54 + i * 18;
      const selected = i === selectedIdx;
      if (selected) {
        ctx.fillStyle = cfg.PAL['B'];
        ctx.fillRect(px + 10, iy - 3, pw - 20, 14);
        uiArt.drawText(ctx, MENU_ITEMS[i].label, px + 34, iy, cfg.PAL['4'], 8);
        if (window.CQ?.art) {
          window.CQ.art.draw(ctx, 'icon_cursor', px + 18, iy);
        } else {
          uiArt.drawText(ctx, '>', px + 18, iy, cfg.PAL['7'], 8);
        }
      } else {
        uiArt.drawText(ctx, MENU_ITEMS[i].label, px + 34, iy, cfg.PAL['0'], 8);
      }
    }

    // Bottom hint
    const backHint = input.isTouch ? 'B / TAP OUTSIDE: RESUME' : 'Z: OK   X/ESC: RESUME';
    uiArt.drawMiniText(ctx, backHint, 120, py + ph - 12, cfg.PAL['2'], { align: 'center' });
  }
};

function activateOption(id) {
  if (id === 'resume') {
    pauseMenu.close();
  } else if (id === 'controls') {
    view = 'controls';
    window.CQ?.audio?.playSfx('sfx_confirm');
  } else if (id === 'exit') {
    exiting = true;
    window.CQ?.audio?.playSfx('sfx_confirm');
    window.CQ?.fx?.wipeOut(cfg.WIPE_MS).then(() => {
      isOpen = false;
      view = 'menu';
      exiting = false;
      resetState();
      sceneManager.switchTo('TITLE');
      window.CQ?.fx?.wipeIn(cfg.WIPE_MS);
    });
  }
}

function drawControlsPanel(ctx) {
  const px = 20, py = 16, pw = 200, ph = 128;
  ctx.fillStyle = cfg.PAL['4'];
  ctx.fillRect(px, py, pw, ph);
  uiArt.drawRectOutline(ctx, px, py, pw, ph, cfg.PAL['0'], 2);

  // Header
  ctx.fillStyle = cfg.PAL['B'];
  ctx.fillRect(px + 2, py + 2, pw - 4, 16);
  uiArt.drawText(ctx, 'CONTROLS', 88, py + 6, cfg.PAL['7'], 8);

  const lines = [
    ['PC KEYBOARD', cfg.PAL['B']],
    ['  ARROWS / WASD : Move character', cfg.PAL['0']],
    ['  Z / ENTER     : Talk / Confirm (A)', cfg.PAL['0']],
    ['  X             : Back / Cancel (B)', cfg.PAL['0']],
    ['  ESC           : Pause Menu', cfg.PAL['0']],
    ['  M             : Mute Audio', cfg.PAL['0']],
    ['TOUCHSCREEN', cfg.PAL['B']],
    ['  D-PAD / A / B : Move & Interact', cfg.PAL['0']],
  ];

  let y = py + 24;
  for (const [text, color] of lines) {
    uiArt.drawMiniText(ctx, text, px + 8, y, color);
    y += color === cfg.PAL['B'] ? 10 : 10;
  }

  const backMsg = input.isTouch ? '[TAP ANYWHERE FOR BACK]' : '[Z / X / ESC] BACK';
  ctx.fillStyle = cfg.PAL['1'];
  ctx.fillRect(px + 2, py + ph - 16, pw - 4, 14);
  uiArt.drawMiniText(ctx, backMsg, 120, py + ph - 12, cfg.PAL['4'], { align: 'center' });
}
