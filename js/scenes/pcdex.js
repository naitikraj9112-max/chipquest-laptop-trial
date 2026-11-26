// js/scenes/pcdex.js — PC-DEX competitor scan & persona OEM recommendation (section 9.2)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { dialogueUI } from '../world/dialogue.js';
import { uiArt } from '../art/ui.js';
import { dialogue as D } from '../data/dialogue.js';
import { laptops, getStage2Pair } from '../data/laptops.js';

let currentCard = 0;
let phase = 'cards'; // cards, banner, done, transitioning

const cards = [
  {
    title: 'CORE ULTRA SERIES 3',
    color: cfg.PAL['B'],
    rows: [
      'Models: ThinkPad X9-15p Aura, Yoga Slim 7',
      'Ultra X9 388H: 16C, 5.1GHz, Intel 18A',
      'NPU 5: 50 TOPS | Arc B390 12 Xe3 cores',
      'LPDDR5X-9600 | Up to 180 platform TOPS',
    ]
  },
  {
    title: 'ULTRA 7 & 5 SERIES 3',
    color: cfg.PAL['B'],
    rows: [
      'Models: Acer TravelMate P6, Swift Spin 14',
      'Ultra 7 355 / 5 338H (8-12C, 4.7GHz)',
      'NPU 5: 47-49 TOPS | Arc B370 / Xe3 iGPU',
      'Intel 18A, Intel vPro & Evo verified',
    ]
  },
  {
    title: 'CORE SERIES 3 (ENTRY)',
    color: cfg.PAL['9'],
    rows: [
      'Models: Acer Swift Air 14, Vivobook 15',
      'Core 7 350 / 5 320 (6C, up to 4.8GHz)',
      'NPU 5: 17 TOPS (40 platform), 2 Xe3',
      '10-28W envelope, Wi-Fi 7 & Thunderbolt 4',
    ]
  },
  {
    title: 'CORE ULTRA 200V & 200H',
    color: cfg.PAL['B'],
    rows: [
      'Models: ThinkPad P1 Gen 8, 200V Aura Ed.',
      '200V: 8C, Arc 140V Xe2, 48 NPU TOPS',
      '200HX: up to 24C, 5.5GHz + discrete GPU',
      'LPDDR5X-8533 (200V) / DDR5 (H & HX)',
    ]
  },
  {
    title: 'AMD RYZEN AI',
    color: cfg.PAL['5'],
    rows: [
      'Models: Zenbook S 16 (HX 370), Swift 14 AI',
      '50 TOPS XDNA 2 NPU, Radeon 890M / 860M',
      'Runs x86 Windows applications natively',
      'Compare battery, RAM speed and cooling',
    ]
  },
  {
    title: 'QUALCOMM SNAPDRAGON X',
    color: cfg.PAL['6'],
    rows: [
      'Includes a dedicated Arm-based AI NPU',
      'Power-efficient thin-and-light laptop chip',
      'Some Windows apps & games use emulation',
      'Check your must-have apps before buying',
    ]
  },
  {
    title: 'APPLE MAC',
    color: cfg.PAL['2'],
    rows: [
      'Uses Apple Neural Engine for local AI',
      'Runs macOS rather than Windows OS',
      'Check college and PC gaming needs',
      'Often comes at a higher price tier',
    ]
  },
  {
    title: 'NO-AI LAPTOP',
    color: cfg.PAL['1'],
    rows: [
      'No dedicated NPU hardware engine',
      'AI tasks run on main CPU and GPU cores',
      'Higher battery drain and extra heat',
      'Lower upfront price, shorter AI runway',
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

        const persona = state.flags.persona || 'student';
        const pair = getStage2Pair(persona);
        state.flags.gymUnlocked = true;
        state.laptops.gymPlayer = pair.player;
        state.laptops.gymRival = pair.rival;
        const intel = laptops[pair.player];

        // Recommend real Intel OEM laptop and prompt player to walk north into the PRO GYM!
        dialogueUI.show([
          D.G21,
          { speaker: 'PC-DEX', text: `PC-DEX picked ${intel.oemName} for ${state.playerName || 'ASH'}!` },
          D.G22_GYM,
        ], () => {
          phase = 'transitioning';
          if (window.CQ) {
            window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
              window.CQ.sceneManager.switchTo('STORE', { fromPcdex: true });
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

        // Rows (crisp proportional readable pixel font)
        for (let i = 0; i < card.rows.length; i++) {
          uiArt.drawSmallText(ctx, `> ${card.rows[i]}`, cx + 7, cy + 27 + i * 16, cfg.PAL['0']);
        }

        // Card counter
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['2'];
        ctx.textAlign = 'center';
        ctx.fillText(`${currentCard + 1} / ${cards.length}`, 120, 126);
        ctx.textAlign = 'left';

        // Navigation hint
        const prevLabel = currentCard > 0 ? '< PREV' : '      ';
        const nextBtn = input.isTouch ? '[A] NEXT >' : '[Z] NEXT >';
        uiArt.drawMiniText(ctx, `${prevLabel}    ${nextBtn}`, 120, 144, cfg.PAL['B'], { align: 'center' });
      } else {
        // PC-DEX Recommendation Banner based on chosen Persona + unlock PRO GYM
        const persona = state.flags.persona || 'student';
        const pair = getStage2Pair(persona);
        const intel = laptops[pair.player];
        const bx = 12, by = 28, bw = 216, bh = 88;
        ctx.fillStyle = cfg.PAL['B'];
        ctx.fillRect(bx, by, bw, bh);
        uiArt.drawRectOutline(ctx, bx, by, bw, bh, cfg.PAL['7'], 2);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['7'];
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillText(`PC-DEX ${persona.toUpperCase()} PICK`, 120, by + 8);
        ctx.textAlign = 'left';

        uiArt.drawMiniText(ctx, intel.oemName, 120, by + 26, cfg.PAL['4'], { align: 'center' });
        uiArt.drawSmallText(ctx, intel.hudSpec, 120, by + 40, cfg.PAL['A'], { align: 'center' });
        uiArt.drawSmallText(ctx, 'Intel 18A + NPU 5 + Evo tested!', 120, by + 54, cfg.PAL['4'], { align: 'center' });
        uiArt.drawSmallText(ctx, 'PRO ARENA GYM UNLOCKED FOR STAGE 2!', 120, by + 68, cfg.PAL['7'], { align: 'center' });

        const contLabel = input.isTouch ? '[A] ENTER PRO GYM' : '[Z] ENTER PRO GYM';
        uiArt.drawMiniText(ctx, contLabel, 120, 132, cfg.PAL['B'], { align: 'center' });
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
