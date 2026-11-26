// js/scenes/battle.js — Battle scene factory (sections 5, 8)
import { cfg } from '../config.js';
import { input } from '../core/input.js';
import { state } from '../core/state.js';
import { bus } from '../core/bus.js';
import { BattleEngine } from '../battle/engine.js';
import { BattleUI } from '../battle/ui.js';
import { dialogueUI } from '../world/dialogue.js';
import { dialogue as D } from '../data/dialogue.js';

export function createBattleScene(defaultBattleId) {
  let engine = null;
  let ui = null;
  let battleId = null;
  let phase = 'intro'; // intro, battle, animating, wifi_dialogue, battle_end_wait, transitioning, post_battle2
  let battleOverTimer = 0;
  let musicTimer = null;

  function clearMusicTimer() {
    if (musicTimer) {
      clearTimeout(musicTimer);
      musicTimer = null;
    }
  }

  return {
    enter(params = {}) {
      clearMusicTimer();
      battleId = params.battleId || defaultBattleId;
      engine = new BattleEngine(battleId);
      ui = new BattleUI(engine, battleId);
      phase = 'intro';
      battleOverTimer = 0;

      if (window.CQ) {
        const musicId = battleId === 'BATTLE1' ? 'MUS_BATTLE1' : 'MUS_BATTLE2';
        window.CQ.audio.playMusic(musicId, { fadeMs: 300 });
      }

      // Show intro message
      ui.queueMessage(D.BI1.text, true);
      ui.onMessagesDone = () => {
        phase = 'battle';
        ui.showingMenu = true;
      };
    },

    update(dt) {
      if (!ui) return;
      ui.update(dt);
      dialogueUI.update(dt);

      if (phase === 'transitioning') {
        return;
      }

      if (phase === 'wifi_dialogue') {
        if (input.aJustPressed()) {
          dialogueUI.handleA();
        }
        return;
      }

      if (phase === 'post_battle2') {
        if (input.aJustPressed()) {
          dialogueUI.handleA();
        }
        return;
      }

      if (phase === 'battle_end_wait') {
        battleOverTimer += dt;
        if (input.aJustPressed() || battleOverTimer > 1500) {
          phase = 'transitioning';
          transitionOut();
        }
        return;
      }

      if (phase !== 'battle') {
        if (input.aJustPressed()) ui.handleA();
        return;
      }

      const click = input.consumeClick();
      if (click) {
        if (click.y >= 112) {
          const col = click.x < 120 ? 0 : 1;
          const row = click.y < 136 ? 0 : 1;
          ui.selectedMove = row * 2 + col;
          if (window.CQ) window.CQ.audio.playSfx('sfx_confirm');
          executeTurn(ui.getSelectedMoveId());
        } else {
          input.aJustPressed(); // consume stray upper-screen tap
        }
        return;
      }

      const dir = input.dirJustPressed();
      if (dir) ui.handleInput(dir);

      if (input.aJustPressed()) {
        const result = ui.handleA();
        if (result === 'move_selected') {
          if (window.CQ) window.CQ.audio.playSfx('sfx_confirm');
          executeTurn(ui.getSelectedMoveId());
        }
      }
    },

    draw(ctx) {
      if (!ui) return;
      ui.draw(ctx);
      if (phase === 'wifi_dialogue' || phase === 'post_battle2') {
        dialogueUI.draw(ctx);
      }
    },

    exit() {
      clearMusicTimer();
      dialogueUI.close();
    }
  };

  function executeTurn(playerMoveId) {
    phase = 'animating';
    ui.showingMenu = false;

    const playerResult = engine.playerAct(playerMoveId);
    if (!playerResult) {
      phase = 'battle';
      ui.showingMenu = true;
      return;
    }

    ui.queueMessage(`${engine.player.name} used ${playerResult.label}!`);

    if (playerResult.wasThrottled) {
      ui.queueMessage(`${engine.player.name} is too hot! Slowing down!`);
      if (window.CQ) window.CQ.audio.playSfx('sfx_heat');
    }

    ui.queueMessage(playerResult.effectText, true, playerResult.commentTag);

    if (window.CQ) {
      const sfxMap = { SUPER: 'sfx_super', BOOST: 'sfx_super', OK: 'sfx_ok', SLOW: 'sfx_weak', WEAK_AI: 'sfx_weak', OK_LEGACY: 'sfx_ok' };
      window.CQ.audio.playSfx(sfxMap[playerResult.effectType] || 'sfx_ok');
    }

    if (playerResult.lowBatt) {
      ui.queueMessage(`${engine.player.name}: LOW BATTERY!`);
      if (window.CQ) window.CQ.audio.playSfx('sfx_warn');
    }

    if (playerResult.completed) {
      ui.queueMessage(`${engine.player.name} finished the task!`);
      if (window.CQ) {
        window.CQ.audio.playSfx('sfx_complete');
        clearMusicTimer();
        musicTimer = setTimeout(() => window.CQ.audio.playMusic('MUS_WIN', { fadeMs: 100 }), 500);
      }
      if (battleId === 'BATTLE2') {
        state.flags.b2Winner = 'player';
        state.flags.b2PlayerBatt = engine.player.batt;
        state.flags.b2Turns = engine.turn + 1;
      } else {
        state.flags.b1Winner = 'player';
      }
      ui.onMessagesDone = () => {
        ui.showingMenu = false;
        battleOverTimer = 0;
        phase = 'battle_end_wait';
      };
      return;
    }

    if (playerResult.fainted) {
      ui.queueMessage(`${engine.player.name} ran out of battery and shut down!`);
      ui.playerShake = 500;
      if (window.CQ) {
        window.CQ.audio.playSfx('sfx_shutdown');
        clearMusicTimer();
        musicTimer = setTimeout(() => window.CQ.audio.playMusic('MUS_LOSE', { fadeMs: 100 }), 800);
      }
      if (battleId === 'BATTLE1') state.flags.b1Winner = 'rival';
      ui.onMessagesDone = () => {
        ui.showingMenu = false;
        battleOverTimer = 0;
        phase = 'battle_end_wait';
      };
      return;
    }

    ui.onMessagesDone = () => doRivalTurn();
  }

  function doRivalTurn() {
    const rivalResult = engine.rivalAct();
    if (!rivalResult) { finishTurn(); return; }

    ui.queueMessage(`${engine.rival.name} used ${rivalResult.label}!`);

    if (rivalResult.wasThrottled) {
      ui.queueMessage(`${engine.rival.name} is too hot! Slowing down!`);
      if (window.CQ) window.CQ.audio.playSfx('sfx_heat');
    }

    ui.queueMessage(rivalResult.effectText, true, rivalResult.commentTag);

    if (window.CQ) {
      const sfxMap = { SUPER: 'sfx_super', BOOST: 'sfx_super', OK: 'sfx_ok', SLOW: 'sfx_weak', WEAK_AI: 'sfx_weak', OK_LEGACY: 'sfx_ok' };
      window.CQ.audio.playSfx(sfxMap[rivalResult.effectType] || 'sfx_ok');
    }

    if (rivalResult.lowBatt) {
      ui.queueMessage(`${engine.rival.name}: LOW BATTERY!`);
      if (window.CQ) window.CQ.audio.playSfx('sfx_warn');
    }

    if (rivalResult.completed) {
      ui.queueMessage(`${engine.rival.name} finished the task!`);
      if (window.CQ) {
        window.CQ.audio.playSfx('sfx_complete');
        clearMusicTimer();
        musicTimer = setTimeout(() => window.CQ.audio.playMusic('MUS_LOSE', { fadeMs: 100 }), 500);
      }
      if (battleId === 'BATTLE1') state.flags.b1Winner = 'rival';
      ui.onMessagesDone = () => {
        ui.showingMenu = false;
        battleOverTimer = 0;
        phase = 'battle_end_wait';
      };
      return;
    }

    if (rivalResult.fainted) {
      ui.queueMessage(`${engine.rival.name} ran out of battery and shut down!`);
      ui.rivalShake = 500;
      if (window.CQ) {
        window.CQ.audio.playSfx('sfx_shutdown');
        clearMusicTimer();
        musicTimer = setTimeout(() => window.CQ.audio.playMusic('MUS_WIN', { fadeMs: 100 }), 800);
      }
      if (battleId === 'BATTLE1') state.flags.b1Winner = 'player';
      else {
        state.flags.b2Winner = 'player';
        state.flags.b2PlayerBatt = engine.player.batt;
        state.flags.b2Turns = engine.turn + 1;
      }
      ui.onMessagesDone = () => {
        ui.showingMenu = false;
        battleOverTimer = 0;
        phase = 'battle_end_wait';
      };
      return;
    }

    ui.onMessagesDone = () => finishTurn();
  }

  function finishTurn() {
    const event = engine.endTurn();

    if (event === 'wifi_drop') {
      ui.showWifiDrop();
      if (window.CQ) window.CQ.audio.playSfx('sfx_wifi_drop');
      phase = 'wifi_dialogue';
      ui.showingMenu = false;
      dialogueUI.show([D.W1, D.W2], () => {
        engine.phase = 'player_choose';
        phase = 'battle';
        ui.showingMenu = true;
      });
      return;
    }

    phase = 'battle';
    ui.showingMenu = true;
  }

  function transitionOut() {
    if (!window.CQ) return;
    clearMusicTimer();
    window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
      if (battleId === 'BATTLE1') {
        window.CQ.sceneManager.switchTo('STORE');
        window.CQ.fx.wipeIn(cfg.WIPE_MS);
      } else {
        // After BATTLE2: post-battle dialogue R6, G17-G20 then PCDEX (section 7.4)
        phase = 'post_battle2';
        window.CQ.audio.playMusic('MUS_RESULT', { fadeMs: 300 });
        const postPages = [D.R6, D.G17, D.G18, D.G19, D.G20];
        dialogueUI.show(postPages, () => {
          phase = 'transitioning';
          window.CQ.fx.wipeOut(cfg.WIPE_MS).then(() => {
            window.CQ.sceneManager.switchTo('PCDEX');
            window.CQ.fx.wipeIn(cfg.WIPE_MS);
          });
        });
        window.CQ.fx.wipeIn(cfg.WIPE_MS);
      }
    });
  }
}
