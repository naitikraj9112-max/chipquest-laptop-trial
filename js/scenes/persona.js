// js/scenes/persona.js — Persona selection (sections 5, 9.1)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { dialogueUI } from '../world/dialogue.js';
import { scriptRunner } from '../world/scriptRunner.js';
import { dialogue as D } from '../data/dialogue.js';

let selectedIndex = 0;
let phase = 'prompt'; // prompt, choose, chosen
const personas = [
  { id: 'student', label: 'STUDENT', icon: 'icon_student' },
  { id: 'creator', label: 'CREATOR', icon: 'icon_creator' },
  { id: 'gamer',  label: 'GAMER',  icon: 'icon_gamer' },
];

export const PersonaScene = {
  enter() {
    selectedIndex = 0;
    phase = 'prompt';

    // Show G13 then choice
    dialogueUI.show([D.G13], () => {
      phase = 'choose';
    });
  },

  update(dt) {
    dialogueUI.update(dt);

    if (phase === 'prompt') {
      if (input.aJustPressed()) dialogueUI.handleA();
      return;
    }

    if (phase === 'choose') {
      const dir = input.dir();
      if (dir === 'left') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
      }
      if (dir === 'right') {
        selectedIndex = Math.min(2, selectedIndex + 1);
        if (window.CQ) window.CQ.audio.playSfx('sfx_blip');
      }

      if (input.aJustPressed()) {
        selectPersona(personas[selectedIndex].id);
      }
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
        ctx.strokeStyle = isSelected ? cfg.PAL['A'] : cfg.PAL['2'];
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, 64, 56);

        // Icon (draw scaled x2 — 32x32 centered)
        const iconId = personas[i].icon;
        if (window.CQ && window.CQ.art) {
          // Draw icon at double size
          const iconData = window.CQ.art.getSpriteData(iconId);
          if (iconData) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(iconData.canvas, bx + 16, by + 4, 32, 32);
          }
        } else {
          // Fallback: colored square
          const colors = [cfg.PAL['B'], cfg.PAL['C'], cfg.PAL['9']];
          ctx.fillStyle = colors[i];
          ctx.fillRect(bx + 20, by + 8, 24, 24);
        }

        // Label
        ctx.font = '7px "Press Start 2P", monospace';
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

  // Determine follow-up dialogue
  const g14Key = personaId === 'student' ? 'G14s' : personaId === 'creator' ? 'G14c' : 'G14g';
  const b2Key = personaId === 'student' ? 'B2s' : personaId === 'creator' ? 'B2c' : 'B2g';

  const isForkPath = state.flags.starter === 'aura_go';

  // Build dialogue sequence
  const pages = [D[g14Key]];

  if (isForkPath) {
    // Fork: set rival to aura_go and say Gf1
    state.laptops.rival = 'aura_go';
    pages.push(D.Gf1);
  }

  // Set player to aura_pro
  state.laptops.player = 'aura_pro';
  pages.push(D.G15);
  pages.push(D.R5);
  pages.push(D[b2Key]);

  dialogueUI.show(pages, () => {
    // Transition to BATTLE2
    if (window.CQ) {
      window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
        window.CQ.sceneManager.switchTo('BATTLE2', { battleId: 'BATTLE2' });
        window.CQ.fx.wipeIn(cfg.WIPE_MS);
      });
    }
  });
}
