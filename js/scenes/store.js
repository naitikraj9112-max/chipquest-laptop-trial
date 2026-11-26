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

let player, guide, rival, rep1, rep2, rep3;
let introTriggered = false;
let toastLines = [];
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
    toastTimer = 0;

    // Player
    player = entityManager.add(new Entity('player', 9, 12, 'up', 'spr_player'));
    state.player.x = 9;
    state.player.y = 12;
    state.player.dir = 'up';

    // Story NPCs
    guide = entityManager.add(new Entity('guide', 9, 5, 'down', 'spr_guide'));
    rival = entityManager.add(new Entity('rival', 11, 6, 'left', 'spr_rival'));

    // Intel Representatives in the store (teach Core Ultra Series 3 AI processors)
    rep1 = entityManager.add(new Entity('rep1', 4, 9, 'down', 'spr_rep1'));
    rep2 = entityManager.add(new Entity('rep2', 15, 5, 'down', 'spr_rep2'));
    rep3 = entityManager.add(new Entity('rep3', 14, 11, 'left', 'spr_rep3'));

    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_STORE', { fadeMs: 300 });
    }
  },

  update(dt) {
    entityManager.update(dt);
    camera.follow(player);
    dialogueUI.update(dt);

    // Toast timer (only tick down when unobstructed)
    if (toastTimer > 0 && !dialogueUI.isActive && !laptopCardShowing) {
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
        // Show device-appropriate controls hint on first move
        if (firstMove) {
          firstMove = false;
          if (input.isTouch) {
            showToast(['D-PAD: MOVE   A: TALK / OK', 'B: BACK   PAUSE: MENU'], 3500);
          } else {
            showToast(['ARROWS: MOVE   Z: INTERACT', 'X: BACK   ESC: PAUSE'], 3500);
          }
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
      // Animated fancy RGB screen glint + blinking -30% promo tag above NOVA X
      const mx = 9 * cfg.TILE - camera.x;
      const my = 6 * cfg.TILE - camera.y;
      const tickPhase = Math.floor(Date.now() / 180) % 4;
      const rgbCols = ['A', 'D', '7', 'C'];
      ctx.fillStyle = cfg.PAL[rgbCols[tickPhase]];
      ctx.fillRect(mx + 4, my + 2, 4, 3);
      ctx.fillStyle = cfg.PAL[rgbCols[(tickPhase + 2) % 4]];
      ctx.fillRect(mx + 4, my + 7, 5, 1);
      // Floating -30% retail placard on front edge of display table (doesn't overlap Prof. Chip at row 5)
      const blink = Math.floor(Date.now() / 350) % 2 === 0;
      ctx.fillStyle = blink ? cfg.PAL['5'] : cfg.PAL['6'];
      ctx.fillRect(mx, my + 10, 16, 7);
      uiArt.drawMiniText(ctx, '30%', mx + 1, my + 11, cfg.PAL['7']);
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

    // Toast (placed high so it doesn't collide with dialogue box)
    if (toastTimer > 0 && !dialogueUI.isActive && !laptopCardShowing) {
      const maxChars = Math.max(...toastLines.map(l => l.length));
      const tw = maxChars * 5 + 16;
      const th = toastLines.length * 10 + 10;
      const tx = Math.floor((240 - tw) / 2);
      const ty = 12;
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(tx, ty, tw, th);
      uiArt.drawRectOutline(ctx, tx, ty, tw, th, cfg.PAL['7'], 1);
      for (let i = 0; i < toastLines.length; i++) {
        uiArt.drawMiniText(ctx, toastLines[i], 120, ty + 6 + i * 10, cfg.PAL['7'], { align: 'center' });
      }
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

function showToast(textOrLines, durationMs = 3000) {
  toastLines = Array.isArray(textOrLines) ? textOrLines : [textOrLines];
  toastTimer = durationMs;
}

function oppositeDir(dir) {
  if (dir === 'up') return 'down';
  if (dir === 'down') return 'up';
  if (dir === 'left') return 'right';
  return 'left';
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
      targetEntity.face(oppositeDir(player.dir));
      dialogueUI.show([D.G4]); // Repeat last line
      return;
    }
    if (targetEntity.id === 'rival' && state.flags.guideMet) {
      targetEntity.face(oppositeDir(player.dir));
      dialogueUI.show([D.R2]); // Repeat last line
      return;
    }
    if (targetEntity.id === 'rep1') {
      targetEntity.face(oppositeDir(player.dir));
      dialogueUI.show([D.REP1_1, D.REP1_2, D.REP1_3]);
      return;
    }
    if (targetEntity.id === 'rep2') {
      targetEntity.face(oppositeDir(player.dir));
      dialogueUI.show([D.REP2_1, D.REP2_2, D.REP2_3]);
      return;
    }
    if (targetEntity.id === 'rep3') {
      targetEntity.face(oppositeDir(player.dir));
      dialogueUI.show([D.REP3_1, D.REP3_2, D.REP3_3]);
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
    // Panel 28..212, 26..132: bottom-right = LOOK AGAIN, left/panel = TAKE IT
    if (click.x >= 118 && click.y >= 110) {
      laptopCardShowing = false;
      laptopCardId = null;
      if (window.CQ) window.CQ.audio.playSfx('sfx_cancel');
      return;
    }
    if (click.x >= 28 && click.x <= 212 && click.y >= 26 && click.y <= 132) {
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

  // Panel 184x106 centred at (28, 26) so detailed specs fit cleanly inside borders
  const px = 28, py = 26, pw = 184, ph = 106;
  ctx.fillStyle = cfg.PAL['4'];
  ctx.fillRect(px, py, pw, ph);
  uiArt.drawRectOutline(ctx, px, py, pw, ph, id === 'nova' ? cfg.PAL['C'] : cfg.PAL['B'], 2);

  // Header
  ctx.fillStyle = id === 'nova' ? cfg.PAL['C'] : cfg.PAL['B'];
  ctx.fillRect(px + 2, py + 2, pw - 4, 14);
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillStyle = cfg.PAL['4'];
  ctx.textBaseline = 'top';
  ctx.fillText(laptop.name, px + 6, py + 5);

  if (id === 'nova') {
    const blinkTag = Math.floor(Date.now() / 300) % 2 === 0;
    ctx.fillStyle = blinkTag ? cfg.PAL['7'] : cfg.PAL['5'];
    ctx.fillRect(px + pw - 60, py + 4, 56, 10);
    uiArt.drawMicroText(ctx, '+ FREE MERCH!', px + pw - 32, py + 7, blinkTag ? cfg.PAL['0'] : cfg.PAL['4'], { align: 'center' });
  }

  // Laptop sprite inside card right side
  const sx = px + pw - 54;
  const sy = py + 19;
  if (window.CQ && window.CQ.art) {
    window.CQ.art.draw(ctx, `spr_laptop_${id}`, sx, sy);
  }

  // Fancy animated RGB screen & keybed glow for NOVA X
  if (id === 'nova') {
    const phase = Math.floor(Date.now() / 160) % 4;
    const cols = ['A', 'D', '7', 'C'];
    // Equalizer bars animated inside laptop screen area (sx+8..sx+39, sy+5..sy+14)
    for (let b = 0; b < 5; b++) {
      const h = 3 + ((phase + b) % 4) * 2;
      ctx.fillStyle = cfg.PAL[cols[(phase + b) % 4]];
      ctx.fillRect(sx + 9 + b * 6, sy + 14 - h, 4, h);
    }
    // Animated RGB keyboard strip
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = cfg.PAL[cols[(phase + k) % 4]];
      ctx.fillRect(sx + 5 + k * 5, sy + 20, 4, 1);
    }
  }

  // Stats on left side using crisp compact 3x5 micro pixel font
  uiArt.drawMicroText(ctx, `Look: ${'*'.repeat(laptop.look)}`, px + 6, py + 21, cfg.PAL['0']);

  if (id === 'nova') {
    uiArt.drawMicroText(ctx, 'Price:', px + 6, py + 30, cfg.PAL['0']);
    ctx.fillStyle = cfg.PAL['5']; // RED tag
    ctx.fillRect(px + 31, py + 28, 41, 9);
    uiArt.drawMicroText(ctx, 'SALE -30%', px + 51, py + 30, cfg.PAL['4'], { align: 'center' });
  } else {
    uiArt.drawMicroText(ctx, `Price: ${laptop.priceTag}`, px + 6, py + 30, cfg.PAL['0']);
  }

  uiArt.drawMicroText(ctx, `Battery: ${laptop.battery}`, px + 6, py + 39, cfg.PAL['0']);
  uiArt.drawMicroText(ctx, `AI speed: ${laptop.aiSpeed}`, px + 6, py + 48, cfg.PAL['0']);

  // Offer badge or compact Intel spec lines (fit cleanly inside px..px+pw)
  if (id === 'nova') {
    ctx.fillStyle = cfg.PAL['7'];
    ctx.fillRect(px + 5, py + 58, pw - 10, 13);
    uiArt.drawRectOutline(ctx, px + 5, py + 58, pw - 10, 13, cfg.PAL['5'], 1);
    uiArt.drawMicroText(ctx, laptop.chipLine, px + Math.floor(pw / 2), py + 62, cfg.PAL['0'], { align: 'center' });
    uiArt.drawMicroText(ctx, 'RGB LIGHTS + DISPLAY DEAL!', px + Math.floor(pw / 2), py + 76, cfg.PAL['C'], { align: 'center' });
  } else {
    ctx.fillStyle = cfg.PAL['4'];
    ctx.fillRect(px + 5, py + 58, pw - 10, 22);
    uiArt.drawRectOutline(ctx, px + 5, py + 58, pw - 10, 22, cfg.PAL['A'], 1);
    if (laptop.chipLine) {
      uiArt.drawMicroText(ctx, laptop.chipLine, px + 9, py + 61, cfg.PAL['B']);
    }
    if (laptop.specSub) {
      uiArt.drawMicroText(ctx, laptop.specSub, px + 9, py + 70, cfg.PAL['0']);
    }
  }

  // Choice line centered
  const cardPrompt = input.isTouch ? '[A] TAKE IT   [B] LOOK AGAIN' : '[Z] TAKE IT   [X] LOOK AGAIN';
  uiArt.drawMiniText(ctx, cardPrompt, px + Math.floor(pw / 2), py + 89, cfg.PAL['B'], { align: 'center' });
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
