// js/scenes/pcdex.js — PC-dex competitor scan (section 9.2)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { dialogueUI } from '../world/dialogue.js';
import { uiArt } from '../art/ui.js';
import { dialogue as D } from '../data/dialogue.js';

let currentCard = 0;
let phase = 'cards'; // cards, banner, done, transitioning

const cards = [
  {
    title: 'INTEL CORE ULTRA',
    color: cfg.PAL['B'],
    rows: [
      'AI engines: CPU+GPU+NPU',
      'NPU: up to 50 TOPS',
      'Runs Windows apps natively',
      'Evo = tested battery+wake',
    ]
  },
  {
    title: 'AMD RYZEN AI',
    color: cfg.PAL['5'],
    rows: [
      'Also has an NPU',
      'Compare real battery tests',
      'Runs Windows apps natively',
      'Check the model, not logo',
    ]
  },
  {
    title: 'QUALCOMM SNAPDRAGON X',
    color: cfg.PAL['6'],
    rows: [
      'Also has an NPU',
      'Efficient Arm-based chip',
      'Some apps run via emulation',
      'Check your must-have apps',
    ]
  },
  {
    title: 'APPLE MAC',
    color: cfg.PAL['2'],
    rows: [
      'Own Neural Engine for AI',
      'Runs macOS, not Windows',
      'Check college & game apps',
      'Often a higher price',
    ]
  },
  {
    title: 'NO-AI LAPTOP',
    color: cfg.PAL['1'],
    rows: [
      'No NPU (AI engine)',
      'AI runs on the main chip',
      'More battery use & heat',
      'Often the lowest price',
    ]
  },
];

export const PcdexScene = {
  enter() {
    currentCard = 0;
    phase = 'cards';

    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_RESULT', { fadeMs: 300 });
    }
  },

  update(dt) {
    if (phase === 'transitioning') return;

    if (phase === 'cards') {
      const click = input.consumeClick();
      const dir = input.dirJustPressed();
      const hitPrev = click && click.x < 96 && click.y >= 132 && currentCard > 0;

      if (hitPrev || (dir === 'left' && currentCard > 0)) {
        currentCard--;
        if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
        return;
      }

      if (input.aJustPressed() || dir === 'right') {
        currentCard++;
        if (window.CQ) window.CQ.audio.playSfx('sfx_card');
        if (currentCard >= cards.length) {
          phase = 'banner';
        }
      }
    } else if (phase === 'banner') {
      const dir = input.dirJustPressed();
      if (dir === 'left' || input.bJustPressed()) {
        currentCard = cards.length - 1;
        phase = 'cards';
        if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
        return;
      }
      if (input.aJustPressed()) {
        phase = 'done';
        if (window.CQ) window.CQ.audio.playSfx('sfx_confirm');
        // Show G21, G22, then RESULT
        dialogueUI.show([D.G21, D.G22], () => {
          phase = 'transitioning';
          if (window.CQ) {
            window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
              window.CQ.sceneManager.switchTo('RESULT');
              window.CQ.fx.wipeIn(cfg.WIPE_MS);
            });
          }
        });
      }
    } else if (phase === 'done') {
      dialogueUI.update(dt);
      if (input.aJustPressed()) dialogueUI.handleA();
    }
  },

  draw(ctx) {
    // Background: WHITE and BLUE
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

    // Header
    ctx.fillStyle = cfg.PAL['B'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, 18);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = cfg.PAL['4'];
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText('PC-DEX SCAN', 120, 5);
    ctx.textAlign = 'left';

    if (phase === 'cards' || phase === 'banner') {
      if (phase === 'cards') {
        // Draw current card (224x96 centered)
        const card = cards[currentCard];
        const cx = 8, cy = 24, cw = 224, ch = 96;

        ctx.fillStyle = cfg.PAL['4'];
        ctx.fillRect(cx, cy, cw, ch);
        uiArt.drawRectOutline(ctx, cx, cy, cw, ch, card.color, 2);

        // Header strip
        ctx.fillStyle = card.color;
        ctx.fillRect(cx + 2, cy + 2, cw - 4, 16);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['4'];
        ctx.textBaseline = 'top';
        ctx.fillText(card.title, cx + 6, cy + 6);

        // Rows (crisp 4x6 bitmap font)
        for (let i = 0; i < card.rows.length; i++) {
          uiArt.drawMiniText(ctx, `> ${card.rows[i]}`, cx + 8, cy + 27 + i * 16, cfg.PAL['0']);
        }

        // Card counter
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['2'];
        ctx.textAlign = 'center';
        ctx.fillText(`${currentCard + 1} / ${cards.length}`, 120, 126);
        ctx.textAlign = 'left';

        // Navigation hint
        const prevLabel = currentCard > 0 ? '< PREV' : '      ';
        uiArt.drawMiniText(ctx, `${prevLabel}    [A] NEXT >`, 120, 144, cfg.PAL['B'], { align: 'center' });
      } else {
        // Banner: "Windows apps + Evo testing"
        const bx = 16, by = 38, bw = 208, bh = 54;
        ctx.fillStyle = cfg.PAL['B'];
        ctx.fillRect(bx, by, bw, bh);
        uiArt.drawRectOutline(ctx, bx, by, bw, bh, cfg.PAL['7'], 2);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['7'];
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillText('INTEL HIGHLIGHTED', 120, by + 8);
        ctx.fillStyle = cfg.PAL['4'];
        ctx.fillText('Windows apps +', 120, by + 24);
        ctx.fillText('Evo testing', 120, by + 37);
        ctx.textAlign = 'left';

        uiArt.drawMiniText(ctx, '[A] CONTINUE', 120, 102, cfg.PAL['B'], { align: 'center' });
      }
    }

    // Dialogue overlay
    if (phase === 'done') {
      dialogueUI.draw(ctx);
    }
  },

  exit() {
    dialogueUI.close();
  }
};
