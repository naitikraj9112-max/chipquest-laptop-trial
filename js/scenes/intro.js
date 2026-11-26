// js/scenes/intro.js — Intro/storefront scene (section 5)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { dialogue as dialogueData } from '../data/dialogue.js';
import { dialogueUI } from '../world/dialogue.js';

let phase = 0; // 0=storefront, 1=I1, 2=I2, 3=I3, 4=done
let timer = 0;

const introPages = [
  dialogueData.I1,
  dialogueData.I2,
  dialogueData.I3,
];

export const IntroScene = {
  enter() {
    phase = 0;
    timer = 0;
    // Show storefront card, then dialogue pages I1-I3
    dialogueUI.show(introPages, () => {
      // After all intro text, go to store
      if (window.CQ) {
        window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
          window.CQ.sceneManager.switchTo('STORE');
          window.CQ.fx.wipeIn(cfg.WIPE_MS);
        });
      }
    });
  },

  update(dt) {
    timer += dt;
    dialogueUI.update(dt);

    if (input.aJustPressed()) {
      window.CQ?.audio.unlock();
      dialogueUI.handleA();
    }
  },

  draw(ctx) {
    // Storefront background
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

    // Draw storefront (simplified - building with sign)
    // Sky
    ctx.fillStyle = cfg.PAL['1'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, 70);

    // Building
    ctx.fillStyle = cfg.PAL['B']; // BLUE walls
    ctx.fillRect(20, 30, 200, 82);

    // Windows
    ctx.fillStyle = cfg.PAL['7']; // YELLOW (lit)
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(35 + i * 48, 40, 20, 16);
    }

    // Store sign
    ctx.fillStyle = cfg.PAL['4']; // WHITE
    ctx.fillRect(50, 70, 140, 20);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.STORE_NAME, 120, 76);
    ctx.textAlign = 'left';

    // Door
    ctx.fillStyle = cfg.PAL['E']; // WOOD
    ctx.fillRect(100, 90, 40, 22);
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillRect(122, 100, 4, 4); // handle

    // Sidewalk
    ctx.fillStyle = cfg.PAL['3']; // MIST
    ctx.fillRect(0, 112, cfg.LOGICAL_W, 8);

    // Dialogue overlay
    dialogueUI.draw(ctx);
  },

  exit() {
    dialogueUI.close();
  }
};
