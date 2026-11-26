// js/scenes/title.js — Title screen (section 5)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { uiArt } from '../art/ui.js';

let timer = 0;
let started = false;

export const TitleScene = {
  enter() {
    timer = 0;
    started = false;
    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_TITLE', { fadeMs: 300 });
    }
  },

  update(dt) {
    timer += dt;

    if (started) return;

    // Check for start input (any key/tap)
    if (timer > 100 && (input.aJustPressed() || input.bJustPressed() || input.dirJustPressed())) {
      started = true;
      if (window.CQ) {
        window.CQ.audio.unlock();
        window.CQ.audio.playSfx('sfx_start');
        window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
          window.CQ.sceneManager.switchTo('INTRO');
          window.CQ.fx.wipeIn(cfg.WIPE_MS);
        });
      }
    }
  },

  draw(ctx) {
    // Background: INK
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

    // Pixel Blue/Dusk stepped backdrop (pure 16-color palette)
    const cx = cfg.LOGICAL_W / 2;
    ctx.fillStyle = cfg.PAL['1']; // DUSK
    ctx.fillRect(24, 18, 192, 56);
    ctx.fillStyle = cfg.PAL['B']; // BLUE accent frame
    ctx.fillRect(28, 22, 184, 2);
    ctx.fillRect(28, 68, 184, 2);

    // Logo: CHIPQUEST
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    // Shadow
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillText('CHIPQUEST', cx + 2, 32);

    // Main text with shimmer alternating CYAN/WHITE
    ctx.fillStyle = Math.floor(timer / 350) % 4 === 0 ? cfg.PAL['4'] : cfg.PAL['A'];
    ctx.fillText('CHIPQUEST', cx, 30);

    // Subtitle
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillText('The Laptop Trial', cx, 54);

    // Blinking prompt
    if (Math.floor(timer / 500) % 2 === 0) {
      ctx.fillStyle = cfg.PAL['4'];
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('TAP TO START', cx, 100);
    }

    ctx.textAlign = 'left';

    // Crisp pixel footer
    uiArt.drawMiniText(ctx, 'An 8-bit AI PC adventure', cx, 140, cfg.PAL['3'], { align: 'center' });
  },

  exit() {}
};
