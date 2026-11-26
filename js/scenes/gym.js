// js/scenes/gym.js — Stage 2 Championship Pokemon-Gym Room
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { gymTilemap } from '../world/tilemap.js';
import { Entity, entityManager } from '../world/entity.js';
import { camera } from '../world/camera.js';
import { dialogueUI } from '../world/dialogue.js';
import { scriptRunner } from '../world/scriptRunner.js';
import { uiArt } from '../art/ui.js';
import { dialogue as D } from '../data/dialogue.js';
import { laptops, getStage2Pair } from '../data/laptops.js';

let player, rival, gymRef, guide;
let toastLines = [];
let toastTimer = 0;
let challengeTriggered = false;
let rivalExclaim = false;
let exclaimTimer = 0;
let transitioning = false;

export const GymScene = {
  get entityManager() { return entityManager; },
  get tilemap() { return gymTilemap; },

  enter(params = {}) {
    entityManager.clear();
    transitioning = false;
    challengeTriggered = false;
    rivalExclaim = false;
    exclaimTimer = 0;
    toastTimer = 0;

    const persona = state.flags.persona || 'student';
    const pair = getStage2Pair(persona);
    state.laptops.gymPlayer = pair.player;
    state.laptops.gymRival = pair.rival;
    const intelLap = laptops[pair.player];
    const amdLap = laptops[pair.rival];

    if (params.postBattle3 || (state.flags.b3Winner === 'player' && !state.flags.gymBadgeShown)) {
      // Returning victorious from Gym Championship BATTLE3!
      player = entityManager.add(new Entity('player', 9, 5, 'up', 'spr_player'));
      rival = entityManager.add(new Entity('rival', 9, 3, 'down', 'spr_rival'));
      guide = entityManager.add(new Entity('guide', 10, 5, 'up', 'spr_guide'));
      gymRef = entityManager.add(new Entity('gym_ref', 7, 11, 'right', 'spr_rep1'));
      state.player.x = 9; state.player.y = 5; state.player.dir = 'up';
      challengeTriggered = true;

      camera.follow(player, gymTilemap);

      if (window.CQ) {
        window.CQ.audio.playMusic('MUS_WIN', { fadeMs: 150 });
      }

      const loseLine = {
        speaker: 'ROHAN',
        text: `No way! My ${amdLap.shortOem || amdLap.oemName} ran out of steam vs ${intelLap.name}!`
      };
      dialogueUI.show([loseLine, D.GYM_WIN_G1, D.GYM_WIN_G2, D.GYM_WIN_G3], () => {
        state.flags.gymBadgeShown = true;
        transitioning = true;
        if (window.CQ) {
          window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
            window.CQ.sceneManager.switchTo('RESULT');
            window.CQ.fx.wipeIn(cfg.WIPE_MS);
          });
        }
      });
      return;
    }

    // Standard Gym Entrance
    player = entityManager.add(new Entity('player', 9, 12, 'up', 'spr_player'));
    gymRef = entityManager.add(new Entity('gym_ref', 7, 11, 'right', 'spr_rep1'));
    rival = entityManager.add(new Entity('rival', 9, 3, 'down', 'spr_rival'));
    state.player.x = 9; state.player.y = 12; state.player.dir = 'up';
    camera.follow(player, gymTilemap);

    if (window.CQ) {
      window.CQ.audio.playMusic('MUS_GYM', { fadeMs: 300 });
    }

    if (!state.flags.gymEntered) {
      state.flags.gymEntered = true;
      dialogueUI.show([D.GYM_ENTER_1, D.GYM_ENTER_2], () => {
        showToast('Walk UP the red carpet to Rohan!', 3200);
      });
    } else {
      showToast('PRO ARENA GYM - Challenge ROHAN!', 2800);
    }
  },

  update(dt) {
    entityManager.update(dt);
    camera.follow(player, gymTilemap);
    dialogueUI.update(dt);

    if (transitioning) return;

    if (toastTimer > 0 && !dialogueUI.isActive && !rivalExclaim) {
      toastTimer -= dt;
    }

    // Pokemon-style [!] alert pause before Rohan dialogue starts
    if (rivalExclaim) {
      exclaimTimer -= dt;
      if (exclaimTimer <= 0) {
        rivalExclaim = false;
        launchGymChallengeDialogue();
      }
      return;
    }

    if (dialogueUI.isActive) {
      if (input.aJustPressed()) dialogueUI.handleA();
      return;
    }

    if (!player.moving) {
      // South exit back to Reliance Digital Store
      if (player.row === 13 && (player.col === 9 || player.col === 10)) {
        transitioning = true;
        if (window.CQ) {
          window.CQ.audio.playSfx('sfx_confirm');
          window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
            window.CQ.sceneManager.switchTo('STORE', { fromGym: true });
            window.CQ.fx.wipeIn(cfg.WIPE_MS);
          });
        }
        return;
      }

      // Challenge trigger zone at upper red/gold Gym runner
      if (!challengeTriggered && !state.flags.b3Winner && player.row <= 6) {
        triggerRohanGymChallenge();
        return;
      }

      const dir = input.dir();
      if (dir) {
        player.startMove(dir, gymTilemap, entityManager.entities);
        state.player.x = player.col;
        state.player.y = player.row;
        state.player.dir = player.dir;
      }

      if (input.aJustPressed()) {
        handleGymInteraction();
      }
    }
  },

  draw(ctx) {
    gymTilemap.draw(ctx, camera.x, camera.y);

    // Animated neon glow pulses on top Gym banners (cols 5,8..11,14 row 0)
    const glowPhase = Math.floor(Date.now() / 280) % 2 === 0;
    const bannerCols = [5, 8, 9, 10, 11, 14];
    for (const c of bannerCols) {
      const bx = c * cfg.TILE - camera.x;
      const by = 0 - camera.y;
      ctx.fillStyle = glowPhase ? cfg.PAL['7'] : cfg.PAL['A'];
      ctx.fillRect(bx + 4, by + 6, 8, 2);
    }

    entityManager.draw(ctx, camera.x, camera.y);

    // Pokemon-style [!] alert bubble above Champion Rohan when spotted!
    if (rivalExclaim && rival) {
      const ex = Math.floor(rival.x - camera.x) + 3;
      const ey = Math.floor(rival.y - camera.y) - 14;
      ctx.fillStyle = cfg.PAL['4'];
      ctx.fillRect(ex, ey, 10, 12);
      uiArt.drawRectOutline(ctx, ex, ey, 10, 12, cfg.PAL['5'], 1);
      uiArt.drawMiniText(ctx, '!', ex + 3, ey + 3, cfg.PAL['5']);
    }

    dialogueUI.draw(ctx);

    if (toastTimer > 0 && !dialogueUI.isActive && !rivalExclaim) {
      const maxChars = Math.max(...toastLines.map(l => l.length));
      const tw = maxChars * 4 + 16;
      const th = toastLines.length * 10 + 10;
      const tx = Math.floor((240 - tw) / 2);
      const ty = 12;
      ctx.fillStyle = cfg.PAL['0'];
      ctx.fillRect(tx, ty, tw, th);
      uiArt.drawRectOutline(ctx, tx, ty, tw, th, cfg.PAL['7'], 1);
      for (let i = 0; i < toastLines.length; i++) {
        uiArt.drawMicroText(ctx, toastLines[i], 120, ty + 6 + i * 10, cfg.PAL['7'], { align: 'center' });
      }
    }
  },

  exit() {
    scriptRunner.stop();
    dialogueUI.close();
  }
};

function showToast(textOrLines, durationMs = 3000) {
  toastLines = Array.isArray(textOrLines) ? textOrLines : [textOrLines];
  toastTimer = durationMs;
}

function handleGymInteraction() {
  const dx = player.dir === 'left' ? -1 : player.dir === 'right' ? 1 : 0;
  const dy = player.dir === 'up' ? -1 : player.dir === 'down' ? 1 : 0;
  const tc = player.col + dx;
  const tr = player.row + dy;

  const ent = entityManager.entities.find(e => e.col === tc && e.row === tr && e.visible);
  if (ent) {
    if (ent.id === 'gym_ref') {
      dialogueUI.show([D.GYM_JUDGE_TIP]);
      return;
    }
    if (ent.id === 'rival' && !challengeTriggered) {
      triggerRohanGymChallenge();
      return;
    }
  }

  const inter = gymTilemap.getInteraction(tc, tr);
  if (inter === 'gym_statue') {
    const pair = getStage2Pair(state.flags.persona || 'student');
    const intel = laptops[pair.player];
    dialogueUI.show([{ speaker: 'GYM STATUE', text: `PRO ARENA GYM - CHALLENGER: ${intel.oemName} | LEADER: ROHAN` }]);
  } else if (inter === 'gym_banner') {
    const pair = getStage2Pair(state.flags.persona || 'student');
    const intel = laptops[pair.player];
    const amd = laptops[pair.rival];
    dialogueUI.show([{ speaker: 'ARENA BOARD', text: `${intel.oemName} (Intel) vs ${amd.shortOem || amd.oemName} (AMD)` }]);
  }
}

function triggerRohanGymChallenge() {
  challengeTriggered = true;
  rivalExclaim = true;
  exclaimTimer = 850;
  if (window.CQ) {
    window.CQ.audio.playSfx('sfx_warn');
    window.CQ.audio.playMusic('MUS_RIVAL', { fadeMs: 100 });
  }
}

function launchGymChallengeDialogue() {
  const persona = state.flags.persona || 'student';
  const pair = getStage2Pair(persona);
  const intel = laptops[pair.player];
  const amd = laptops[pair.rival];

  const pages = [
    D.GYM_RIVAL_1,
    { speaker: 'ROHAN', text: `I brought ${amd.shortOem || amd.oemName}! (${amd.hudSpec})` },
    { speaker: 'GYM JUDGE', text: `Go ${intel.oemName}! (${intel.hudSpec})` },
    { speaker: 'ROHAN', text: 'PRO GYM RULES! 50% battery, no charger!' },
  ];

  dialogueUI.show(pages, () => {
    transitioning = true;
    if (window.CQ) {
      window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
        window.CQ.sceneManager.switchTo('BATTLE3', { battleId: 'BATTLE3' });
        window.CQ.fx.wipeIn(cfg.WIPE_MS);
      });
    }
  });
}
