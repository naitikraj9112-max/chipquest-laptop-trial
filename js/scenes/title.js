// js/scenes/title.js — Title screen (section 5)
import { cfg } from '../config.js';
import { input } from '../core/input.js';

let timer = 0;
let shimmerOffset = 0;
let started = false;

export const TitleScene = {
  enter() {
    timer = 0;
    started = false;
    shimmerOffset = 0;
    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_TITLE', { fadeMs: 300 });
    }
  },

  update(dt) {
    timer += dt;
    shimmerOffset += dt * 0.003;

    if (started) return;

    // Check for start input (any key/tap)
    if (timer > 300 && (input.aJustPressed() || input.bJustPressed())) {
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

    // Blue/Cyan glow
    const cx = cfg.LOGICAL_W / 2;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = cfg.PAL['A'];
    ctx.beginPath();
    ctx.arc(cx, 50, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = cfg.PAL['B'];
    ctx.beginPath();
    ctx.arc(cx, 50, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Logo: CHIPQUEST
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    // Shadow
    ctx.fillStyle = cfg.PAL['1'];
    ctx.fillText('CHIPQUEST', cx + 2, 32);

    // Main text with shimmer
    const shimmer = Math.sin(shimmerOffset) * 0.3 + 0.7;
    ctx.globalAlpha = shimmer;
    ctx.fillStyle = cfg.PAL['A'];
    ctx.fillText('CHIPQUEST', cx, 30);
    ctx.globalAlpha = 1;

    // Subtitle
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillText('The Laptop Trial', cx, 56);

    // Blinking prompt
    if (Math.floor(timer / 500) % 2 === 0) {
      ctx.fillStyle = cfg.PAL['4'];
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('TAP TO START', cx, 100);
    }

    // Footer
    ctx.font = '6px monospace';
    ctx.fillStyle = cfg.PAL['2'];
    ctx.fillText('An 8-bit AI PC adventure', cx, 140);

    ctx.textAlign = 'left';
  },

  exit() {}
};
