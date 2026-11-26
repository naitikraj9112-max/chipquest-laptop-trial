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

    // Sky & roof trim
    ctx.fillStyle = cfg.PAL['1'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, 112);

    // Building
    ctx.fillStyle = cfg.PAL['B']; // BLUE walls
    ctx.fillRect(20, 24, 200, 88);
    ctx.fillStyle = cfg.PAL['A']; // CYAN roof trim
    ctx.fillRect(18, 22, 204, 4);

    // Windows with glass glint
    for (let i = 0; i < 4; i++) {
      const wx = 34 + i * 48;
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(wx - 1, 35, 22, 18);
      ctx.fillStyle = cfg.PAL['7']; // YELLOW warm interior
      ctx.fillRect(wx, 36, 20, 16);
      ctx.fillStyle = cfg.PAL['4']; // glint
      ctx.fillRect(wx + 2, 38, 4, 4);
    }

    // Store sign (widened to frame RELIANCE DIGITAL cleanly)
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(36, 60, 168, 22);
    ctx.fillStyle = cfg.PAL['4']; // WHITE
    ctx.fillRect(38, 62, 164, 18);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['B'];
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText(cfg.STORE_NAME, 120, 67);
    ctx.textAlign = 'left';

    // Double Door
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(98, 86, 44, 26);
    ctx.fillStyle = cfg.PAL['E']; // WOOD frame
    ctx.fillRect(100, 88, 19, 24);
    ctx.fillRect(121, 88, 19, 24);
    ctx.fillStyle = cfg.PAL['A']; // glass panes
    ctx.fillRect(103, 91, 13, 12);
    ctx.fillRect(124, 91, 13, 12);
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillRect(116, 102, 2, 4);
    ctx.fillRect(122, 102, 2, 4);

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
