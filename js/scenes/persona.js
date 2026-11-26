// js/scenes/persona.js — Persona selection (sections 5, 9.1)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { dialogueUI } from '../world/dialogue.js';
import { scriptRunner } from '../world/scriptRunner.js';
import { uiArt } from '../art/ui.js';
import { dialogue as D } from '../data/dialogue.js';
import { getStage2Pair } from '../data/laptops.js';

let selectedIndex = 0;
let phase = 'prompt'; // prompt, choose, chosen, transitioning
let chooseTimer = 0;
const personas = [
  { id: 'student', label: 'STUDENT', icon: 'icon_student' },
  { id: 'creator', label: 'CREATOR', icon: 'icon_creator' },
  { id: 'gamer',  label: 'GAMER',  icon: 'icon_gamer' },
];

export const PersonaScene = {
  enter() {
    selectedIndex = 0;
    phase = 'prompt';
    chooseTimer = 0;

    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_STORE', { fadeMs: 300 });
    }

    // Show G13 then choice
    dialogueUI.show([D.G13], () => {
      phase = 'choose';
      chooseTimer = 0;
    });
  },

  update(dt) {
    dialogueUI.update(dt);

    if (phase === 'prompt') {
      if (input.aJustPressed()) dialogueUI.handleA();
      return;
    }

    if (phase === 'choose') {
      chooseTimer += dt;
      const click = input.consumeClick();
      if (click) {
        if (chooseTimer < 200) {
          input.aJustPressed();
          return;
        }
        const xs = [12, 88, 164];
        for (let i = 0; i < 3; i++) {
          if (click.x >= xs[i] && click.x <= xs[i] + 64 && click.y >= 40 && click.y <= 96) {
            selectedIndex = i;
            selectPersona(personas[i].id);
            return;
          }
        }
        input.aJustPressed(); // ignore click outside persona buttons
        return;
      }

      const dir = input.dirJustPressed();
      if (dir === 'left' && selectedIndex > 0) {
        selectedIndex--;
        if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
      }
      if (dir === 'right' && selectedIndex < 2) {
        selectedIndex++;
        if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
      }

      if (input.aJustPressed() && chooseTimer >= 200) {
        selectPersona(personas[selectedIndex].id);
      }
      return;
    }

    if (phase === 'chosen') {
      if (input.aJustPressed()) dialogueUI.handleA();
    }
  },

  draw(ctx) {
    // Background
    ctx.fillStyle = cfg.PAL['0'];
    ctx.fillRect(0, 0, cfg.LOGICAL_W, cfg.LOGICAL_H);

    if (phase === 'choose' || phase === 'chosen') {
      // Draw persona buttons (section 9.1: 64x56 at x=12, 88, 164, y=40)
      for (let i = 0; i < 3; i++) {
        const bx = [12, 88, 164][i];
        const by = 40;
        const isSelected = i === selectedIndex;

        // Button background
        ctx.fillStyle = isSelected ? cfg.PAL['B'] : cfg.PAL['1'];
        ctx.fillRect(bx, by, 64, 56);
        uiArt.drawRectOutline(ctx, bx, by, 64, 56, isSelected ? cfg.PAL['A'] : cfg.PAL['2'], 2);

        // Icon (draw scaled x2 — 32x32 centered)
        const iconId = personas[i].icon;
        if (window.CQ && window.CQ.art) {
          // Draw icon at double size
          const iconData = window.CQ.art.getSpriteData(iconId);
          if (iconData) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(iconData.canvas, bx + 16, by + 5, 32, 32);
          }
        } else {
          // Fallback: colored square
          const colors = [cfg.PAL['B'], cfg.PAL['C'], cfg.PAL['9']];
          ctx.fillStyle = colors[i];
          ctx.fillRect(bx + 20, by + 8, 24, 24);
        }

        // Crisp 8px Press Start 2P label
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = cfg.PAL['4'];
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        ctx.fillText(personas[i].label, bx + 32, by + 42);
        ctx.textAlign = 'left';
      }

      // Header
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = cfg.PAL['7'];
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.fillText('What kind of trainer?', 120, 20);
      ctx.textAlign = 'left';
    }

    // Dialogue overlay
    dialogueUI.draw(ctx);
  },

  exit() {
    dialogueUI.close();
  }
};

function selectPersona(personaId) {
  phase = 'chosen';
  state.flags.persona = personaId;

  if (window.CQ) window.CQ.audio.playSfx('sfx_confirm');

  // Lock Stage 2 Intel OEM pick vs AMD direct rival pair for PC-DEX
  const pair = getStage2Pair(personaId);
  state.laptops.player = pair.player;
  state.laptops.rival = pair.rival;

  const g14Key = personaId === 'student' ? 'G14s' : personaId === 'creator' ? 'G14c' : 'G14g';

  dialogueUI.show([D[g14Key]], () => {
    phase = 'transitioning';
    // Stage 2: Transition to PC-DEX so PC-DEX chooses & presents our Intel laptop vs AMD competitor
    if (window.CQ) {
      window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
        window.CQ.sceneManager.switchTo('PCDEX');
        window.CQ.fx.wipeIn(cfg.WIPE_MS);
      });
    }
  });
}
