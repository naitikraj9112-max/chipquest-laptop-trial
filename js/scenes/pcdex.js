// js/scenes/pcdex.js — Stage 2 PC-DEX scan & laptop selection (Intel OEM vs AMD rival)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { dialogueUI } from '../world/dialogue.js';
import { uiArt } from '../art/ui.js';
import { dialogue as D } from '../data/dialogue.js';
import { laptops, getStage2Pair } from '../data/laptops.js';

let currentCard = 0;
let phase = 'cards'; // cards, banner, done, transitioning
let cards = [];
let selectedPair = null;

function buildCards(persona) {
  const pair = getStage2Pair(persona);
  const intel = laptops[pair.player];
  const amd = laptops[pair.rival];

  const personaDetail = {
    student: [
      `PICK: ${intel.oemName}`,
      'Intel Core Ultra 7 355 (8C: 4P+4LPE, 4.7GHz)',
      'Intel 18A | NPU 5: 49 TOPS | 12MB Cache',
      'LPDDR5X | 75Wh battery | 975g Evo tested',
    ],
    creator: [
      `PICK: ${intel.oemName}`,
      'Intel Core Ultra X9 388H (16C, 5.1GHz, 18MB)',
      'NPU 5: 50 TOPS | Arc B390 12 Xe3 (180 plat. TOPS)',
      'LPDDR5X-9600 | 88Wh battery | Intel 18A',
    ],
    gamer: [
      `PICK: ${intel.oemName}`,
      'Intel Core Ultra X9 388H (16C, 5.1GHz, 18MB)',
      'Arc B390 12 Xe3 / RTX opt. | NPU 5: 50 TOPS',
      'LPDDR5X-9600 | Up to 99.9Wh | 16" 120Hz OLED',
    ],
  }[persona] || [];

  const amdDetail = {
    student: [
      `RIVAL: ${amd.oemName}`,
      'AMD Ryzen AI 7 350 (8C/16T: 4+4c, 5.0GHz)',
      'XDNA 2 NPU: 50 TOPS | Radeon 860M (8 CUs)',
      'LPDDR5X | 75Wh battery | ~1.29kg aluminum',
    ],
    creator: [
      `RIVAL: ${amd.oemName}`,
      'AMD Ryzen AI 9 HX 370 (12C/24T, 5.1GHz, 36MB)',
      'XDNA 2 NPU: 50 TOPS | Radeon 890M (16 CUs)',
      'LPDDR5X-7500 | 78Wh battery | 1.5kg 16" OLED',
    ],
    gamer: [
      `RIVAL: ${amd.oemName}`,
      'AMD Ryzen AI 9 HX 370 (12C/24T, 5.1GHz, 36MB)',
      'XDNA 2 NPU: 50 TOPS | Radeon 890M / RTX GPU',
      '90Wh battery | 16" 240Hz OLED | 1.85kg',
    ],
  }[persona] || [];

  return [
    {
      title: `PC-DEX PICK (${persona.toUpperCase()})`,
      color: cfg.PAL['B'],
      rows: personaDetail,
    },
    {
      title: 'RIVAL: AMD RYZEN AI',
      color: cfg.PAL['5'],
      rows: amdDetail,
    },
    {
      title: 'INTEL CORE ULTRA SER. 3',
      color: cfg.PAL['B'],
      rows: [
        'OEMs: ThinkPad X9-15p Aura, Yoga Slim 7, TravelMate P6',
        'Intel 18A compute tile, up to 16C (5.1GHz)',
        'NPU 5 up to 50 TOPS | Arc B390 12 Xe3 | 180 plat. TOPS',
        'OpenVINO, WinML, Evo battery+wake tuned',
      ],
    },
    {
      title: 'CORE SER. 3 & ULTRA 200V',
      color: cfg.PAL['9'],
      rows: [
        'Entry: Acer Swift Air 14 / Vivobook 15 (Core 5 320)',
        'Wildcat Lake: 6C, 2 Xe3, 17 NPU TOPS (10-28W)',
        '200V: 8C, Arc 140V Xe2, 48 NPU TOPS, LP5X-8533',
        '200HX: up to 24C, 5.5GHz for dGPU workstations',
      ],
    },
    {
      title: 'QUALCOMM & APPLE SILICON',
      color: cfg.PAL['6'],
      rows: [
        'Snapdragon X: Arm NPU, check app/game emulation',
        'Apple Mac: Neural Engine runs macOS (non-Windows)',
        'Intel Core Ultra runs x86 Windows apps & games natively',
        'Verify OEM config, cooling, RAM & TOPS tier',
      ],
    },
  ];
}

export const PcdexScene = {
  enter() {
    const persona = state.flags.persona || 'student';
    selectedPair = getStage2Pair(persona);
    state.laptops.player = selectedPair.player;
    state.laptops.rival = selectedPair.rival;
    cards = buildCards(persona);
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
        const b2Key = persona === 'student' ? 'B2s' : persona === 'creator' ? 'B2c' : 'B2g';
        // Launch Stage 2 Rival Rematch (PC-DEX Intel pick vs Rohan's AMD competitor)
        dialogueUI.show([D.G20, D.R5, D[b2Key]], () => {
          phase = 'transitioning';
          if (window.CQ) {
            window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
              window.CQ.sceneManager.switchTo('BATTLE2', { battleId: 'BATTLE2' });
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
    ctx.fillText('PC-DEX: STAGE 2 PICK', 120, 5);
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

        // Rows (crisp 3x5 micro bitmap font so full OEM names & specs fit with margin)
        for (let i = 0; i < card.rows.length; i++) {
          uiArt.drawMicroText(ctx, `> ${card.rows[i]}`, cx + 7, cy + 27 + i * 16, cfg.PAL['0']);
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
        // Matchup Locked Banner: Player's PC-DEX Intel Pick vs Rohan's AMD Competitor
        const pLap = laptops[selectedPair.player];
        const rLap = laptops[selectedPair.rival];
        const bx = 10, by = 24, bw = 220, bh = 98;
        ctx.fillStyle = cfg.PAL['0'];
        ctx.fillRect(bx, by, bw, bh);
        uiArt.drawRectOutline(ctx, bx, by, bw, bh, cfg.PAL['7'], 2);

        ctx.fillStyle = cfg.PAL['B'];
        ctx.fillRect(bx + 2, by + 2, bw - 4, 15);
        uiArt.drawMiniText(ctx, 'PC-DEX LOCKED YOUR STAGE 2 MATCH!', 120, by + 7, cfg.PAL['7'], { align: 'center' });

        // Player Intel box
        ctx.fillStyle = cfg.PAL['B'];
        ctx.fillRect(bx + 6, by + 22, bw - 12, 26);
        uiArt.drawMicroText(ctx, `YOU (INTEL): ${pLap.oemName}`, bx + 10, by + 26, cfg.PAL['7']);
        uiArt.drawMicroText(ctx, pLap.hudSpec, bx + 10, by + 36, cfg.PAL['4']);

        uiArt.drawMiniText(ctx, 'VS', 120, by + 52, cfg.PAL['7'], { align: 'center' });

        // Rival AMD box
        ctx.fillStyle = cfg.PAL['5'];
        ctx.fillRect(bx + 6, by + 62, bw - 12, 26);
        uiArt.drawMicroText(ctx, `ROHAN (AMD): ${rLap.oemName}`, bx + 10, by + 66, cfg.PAL['7']);
        uiArt.drawMicroText(ctx, rLap.hudSpec, bx + 10, by + 76, cfg.PAL['4']);

        const contLabel = input.isTouch ? '[A] BATTLE ROHAN!   [B] < BACK' : '[Z] BATTLE ROHAN!   [X] < BACK';
        uiArt.drawMiniText(ctx, contLabel, 120, 136, cfg.PAL['B'], { align: 'center' });
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
