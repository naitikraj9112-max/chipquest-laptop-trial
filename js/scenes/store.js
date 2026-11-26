// js/scenes/store.js — Store exploration scene (sections 5, 6, 7)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { bus } from '../core/bus.js';
import { tilemap } from '../world/tilemap.js';
import { Entity, entityManager } from '../world/entity.js';
import { camera } from '../world/camera.js';
import { dialogueUI } from '../world/dialogue.js';
import { scriptRunner } from '../world/scriptRunner.js';
import { uiArt } from '../art/ui.js';
import { dialogue as D } from '../data/dialogue.js';
import { laptops } from '../data/laptops.js';

let player, guide, rival;
let introTriggered = false;
let toastText = '';
let toastTimer = 0;
let laptopCardShowing = false;
let laptopCardId = null;
let cardChoiceActive = false;
let storePhase = 'explore'; // explore, cutscene, card, post_battle1, persona_transition
let firstMove = true;

export const StoreScene = {
  get entityManager() { return entityManager; },
  get tilemap() { return tilemap; },

  enter(params = {}) {
    if (window.CQ) {
      window.CQ.storeScene = StoreScene;
    }

    // If returning from BATTLE1
    if (state.flags.b1Winner && !state.flags.persona) {
      storePhase = 'post_battle1';
      runPostBattle1();
      return;
    }

    // Fresh entry
    entityManager.clear();
    introTriggered = false;
    storePhase = 'explore';
    firstMove = true;
    laptopCardShowing = false;

    // Player
    player = entityManager.add(new Entity('player', 9, 12, 'up', 'spr_player'));
    state.player.x = 9;
    state.player.y = 12;
    state.player.dir = 'up';

    // NPCs
    guide = entityManager.add(new Entity('guide', 9, 5, 'down', 'spr_guide'));
    rival = entityManager.add(new Entity('rival', 11, 6, 'left', 'spr_rival'));

    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_STORE', { fadeMs: 300 });
    }
  },

  update(dt) {
    entityManager.update(dt);
    camera.follow(player);
    dialogueUI.update(dt);

    // Toast timer
    if (toastTimer > 0) {
      toastTimer -= dt;
    }

    if (scriptRunner.isRunning) {
      scriptRunner.update(dt);
      // Handle A press in script
      if (input.aJustPressed()) {
        scriptRunner.handleA();
      }
      const dir = input.dirJustPressed();
      if (dir) scriptRunner.handleDirection(dir);
      return;
    }

    if (dialogueUI.isActive) {
      if (input.aJustPressed()) dialogueUI.handleA();
      const dir = input.dirJustPressed();
      if (dir === 'up') dialogueUI.handleUp();
      if (dir === 'down') dialogueUI.handleDown();
      return;
    }

    if (laptopCardShowing) {
      handleCardInput();
      return;
    }

    // Player movement
    if (!player.moving) {
      const dir = input.dir();
      if (dir) {
        // Show hint on first move
        if (firstMove) {
          firstMove = false;
          showToast('D-PAD: MOVE  A: TALK', 3000);
        }
        player.startMove(dir, tilemap, entityManager.entities);
        state.player.x = player.col;
        state.player.y = player.row;
        state.player.dir = player.dir;
      }
    }

    // Trigger zone: row <= 8 triggers intro cutscene
    if (!introTriggered && !state.flags.guideMet && player.row <= 8) {
      introTriggered = true;
      runIntroCutscene();
      return;
    }

    // A button: interact
    if (input.aJustPressed() && !player.moving) {
      handleInteraction();
    }
  },

  draw(ctx) {
    // Draw tilemap
    tilemap.draw(ctx, camera.x, camera.y);

    // Draw mini laptops on tables if not picked by player or rival (section 6)
    if (state.laptops.player !== 'nova' && state.laptops.rival !== 'nova') {
      drawMiniSprite(ctx, 'spr_mini_nova', 9, 6);
    }
    if (state.laptops.player !== 'aura_go' && state.laptops.rival !== 'aura_go') {
      drawMiniSprite(ctx, 'spr_mini_aura', 10, 6);
    }

    // Draw entities
    entityManager.draw(ctx, camera.x, camera.y);

    // Laptop card overlay
    if (laptopCardShowing) {
      drawLaptopCard(ctx, laptopCardId);
    }

    // Dialogue / script
    dialogueUI.draw(ctx);

    // Toast
    if (toastTimer > 0) {
      const tw = toastText.length * 8 + 16;
      const tx = Math.floor((240 - tw) / 2);
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(tx, 68, tw, 24);
      uiArt.drawRectOutline(ctx, tx, 68, tw, 24, cfg.PAL['7'], 1);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = cfg.PAL['7'];
      ctx.textBaseline = 'top';
      ctx.fillText(toastText, tx + 8, 76);
    }
  },

  exit() {
    scriptRunner.stop();
    dialogueUI.close();
  }
};

function drawMiniSprite(ctx, spriteId, col, row) {
  const sx = col * cfg.TILE - camera.x;
  const sy = row * cfg.TILE - camera.y;
  if (window.CQ && window.CQ.art) {
    window.CQ.art.draw(ctx, spriteId, sx, sy);
  } else {
    ctx.fillStyle = spriteId.includes('nova') ? cfg.PAL['C'] : cfg.PAL['2'];
    ctx.fillRect(sx + 3, sy + 3, 10, 10);
  }
}

function showToast(text, durationMs = 3000) {
  toastText = text;
  toastTimer = durationMs;
}

function handleInteraction() {
  // Check tile in front of player
  const dx = player.dir === 'left' ? -1 : player.dir === 'right' ? 1 : 0;
  const dy = player.dir === 'up' ? -1 : player.dir === 'down' ? 1 : 0;
  const targetCol = player.col + dx;
  const targetRow = player.row + dy;

  const interaction = tilemap.getInteraction(targetCol, targetRow);

  // NPC interactions
  const targetEntity = entityManager.entities.find(e => e.col === targetCol && e.row === targetRow && e.visible);
  if (targetEntity) {
    if (targetEntity.id === 'guide' && state.flags.guideMet) {
      dialogueUI.show([D.G4]); // Repeat last line
      return;
    }
    if (targetEntity.id === 'rival' && state.flags.guideMet) {
      dialogueUI.show([D.R2]); // Repeat last line
      return;
    }
  }

  if (!interaction) return;

  switch (interaction) {
    case 'laptop_nova':
    case 'laptop_aura_go':
      if (state.flags.guideMet && !state.flags.starter) {
        laptopCardShowing = true;
        laptopCardId = interaction === 'laptop_nova' ? 'nova' : 'aura_go';
        if (window.CQ) window.CQ.audio.playSfx('sfx_card');
      } else if (!state.flags.guideMet) {
        showToast('Talk to the guide first!', 2000);
      }
      break;
    case 'shelf':
      dialogueUI.show([{ speaker: '', text: "Shiny! But shiny isn't everything." }]);
      break;
    case 'counter':
      dialogueUI.show([{ speaker: '', text: 'Staff counter. PROF. CHIP is busy.' }]);
      break;
    case 'plant':
      dialogueUI.show([{ speaker: '', text: 'A very healthy plant.' }]);
      break;
    case 'door':
      showToast('Not yet! Pick a partner.', 2000);
      break;
  }
}

function handleCardInput() {
  const click = input.consumeClick();
  if (click) {
    // Panel 40..200, 32..128: right half / outside bottom-left = BACK if tapped on [B] LOOK AGAIN, left = TAKE IT
    if (click.x >= 120 && click.y >= 106) {
      laptopCardShowing = false;
      laptopCardId = null;
      if (window.CQ) window.CQ.audio.playSfx('sfx_cancel');
      return;
    }
    if (click.x >= 40 && click.x <= 200 && click.y >= 32 && click.y <= 128) {
      pickLaptop(laptopCardId);
      return;
    }
  }
  if (input.aJustPressed()) {
    // Choose this laptop
    pickLaptop(laptopCardId);
  }
  if (input.bJustPressed()) {
    // Close card
    laptopCardShowing = false;
    laptopCardId = null;
    if (window.CQ) window.CQ.audio.playSfx('sfx_cancel');
  }
}

function drawLaptopCard(ctx, id) {
  const laptop = laptops[id];
  if (!laptop) return;

  // Panel 160x96 centred at (40, 32) per section 7.3
  const px = 40, py = 32, pw = 160, ph = 96;
  ctx.fillStyle = cfg.PAL['4'];
  ctx.fillRect(px, py, pw, ph);
  uiArt.drawRectOutline(ctx, px, py, pw, ph, cfg.PAL['B'], 2);

  // Header
  ctx.fillStyle = cfg.PAL['B'];
  ctx.fillRect(px + 2, py + 2, pw - 4, 14);
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = cfg.PAL['4'];
  ctx.textBaseline = 'top';
  ctx.fillText(laptop.name, px + 6, py + 5);

  // Laptop sprite inside card right side (section 7.3)
  if (window.CQ && window.CQ.art) {
    window.CQ.art.draw(ctx, `spr_laptop_${id}`, px + 108, py + 20);
  }

  // Stats on left side using crisp 4x6 pixel font
  uiArt.drawMiniText(ctx, `Look: ${'*'.repeat(laptop.look)}`, px + 6, py + 22, cfg.PAL['0']);

  if (id === 'nova') {
    uiArt.drawMiniText(ctx, 'Price:', px + 6, py + 33, cfg.PAL['0']);
    ctx.fillStyle = cfg.PAL['5']; // RED tag
    ctx.fillRect(px + 37, py + 31, 49, 9);
    uiArt.drawMiniText(ctx, 'SALE -20%', px + 39, py + 33, cfg.PAL['4']);
  } else {
    uiArt.drawMiniText(ctx, `Price: ${laptop.priceTag}`, px + 6, py + 33, cfg.PAL['0']);
  }

  uiArt.drawMiniText(ctx, `Battery: ${laptop.battery}`, px + 6, py + 44, cfg.PAL['0']);
  uiArt.drawMiniText(ctx, `AI speed: ${laptop.aiSpeed}`, px + 6, py + 55, cfg.PAL['0']);

  // Chip line
  if (laptop.chipLine) {
    uiArt.drawMiniText(ctx, laptop.chipLine, px + 6, py + 68, cfg.PAL['B']);
  }

  // Choice line
  uiArt.drawMiniText(ctx, '[A] TAKE IT   [B] LOOK AGAIN', px + 6, py + 84, cfg.PAL['B']);
}

function pickLaptop(id) {
  laptopCardShowing = false;
  laptopCardId = null;

  if (window.CQ) window.CQ.audio.playSfx('sfx_confirm');

  if (id === 'nova') {
    // Main path: picked laptop disappears at once; rival takes the other on R3
    state.flags.starter = 'nova';
    state.laptops.player = 'nova';
    state.laptops.rival = null;
    runPickScript('nova');
  } else {
    // Fork path
    state.flags.starter = 'aura_go';
    state.laptops.player = 'aura_go';
    state.laptops.rival = null;
    runPickScript('aura_go');
  }
}

function runIntroCutscene() {
  // CS_INTRO: lock, face player, G1, G2, G3, MUSIC sting MUS_RIVAL, R1, R2, MUSIC resume MUS_STORE, G4, unlock, set guideMet
  scriptRunner.run([
    ['LOCK'],
    ['FACE', 'guide', 'down'],
    ['SAY', 'G1'],
    ['SAY', 'G2'],
    ['SAY', 'G3'],
    ['MUSIC', 'MUS_RIVAL'],
    ['SAY', 'R1'],
    ['SAY', 'R2'],
    ['MUSIC', 'MUS_STORE'],
    ['SAY', 'G4'],
    ['SET', 'flags.guideMet', true],
    ['UNLOCK'],
  ]);
}

function runPickScript(id) {
  if (id === 'nova') {
    // Pick NOVA (main path)
    scriptRunner.run([
      ['LOCK'],
      ['SAY', 'G5'],
      ['SET', 'laptops.rival', 'aura_go'],
      ['SAY', 'R3'],
      ['SAY', 'G6'],
      ['SAY', 'G7'],
      ['BATTLE', 'BATTLE1'],
    ]);
  } else {
    // Pick AURA GO (fork path)
    scriptRunner.run([
      ['LOCK'],
      ['SAY', 'G5b'],
      ['SET', 'laptops.rival', 'nova'],
      ['SAY', 'R3b'],
      ['SAY', 'G6'],
      ['SAY', 'G7'],
      ['BATTLE', 'BATTLE1'],
    ]);
  }
}

async function runPostBattle1() {
  // Determine which path (section 7.4 ends at G12; PERSONA starts with G13)
  const isMainPath = state.flags.starter === 'nova';

  if (window.CQ) {
    window.CQ.audio.playMusic('MUS_STORE', { fadeMs: 300 });
  }

  if (isMainPath) {
    // Main path: player lost (LEGACY died)
    state.flags.b1Winner = 'rival';
    scriptRunner.run([
      ['LOCK'],
      ['SAY', 'R4'],
      ['SAY', 'G8'],
      ['SAY', 'G9'],
      ['SAY', 'G10'],
      ['SAY', 'G11'],
      ['SAY', 'G12'],
      ['UNLOCK'],
    ], () => {
      if (window.CQ) {
        window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
          window.CQ.sceneManager.switchTo('PERSONA');
          window.CQ.fx.wipeIn(cfg.WIPE_MS);
        });
      }
    });
  } else {
    // Fork path: player won with AURA GO
    state.flags.b1Winner = 'player';
    scriptRunner.run([
      ['LOCK'],
      ['SAY', 'R4b'],
      ['SAY', 'G8b'],
      ['SAY', 'G9'],
      ['SAY', 'G10'],
      ['SAY', 'G11'],
      ['SAY', 'G12'],
      ['UNLOCK'],
    ], () => {
      if (window.CQ) {
        window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
          window.CQ.sceneManager.switchTo('PERSONA');
          window.CQ.fx.wipeIn(cfg.WIPE_MS);
        });
      }
    });
  }
}
