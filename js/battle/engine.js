// js/battle/engine.js — Deterministic battle engine (section 8)
import { cfg } from '../config.js';
import { laptops, getStage2Pair } from '../data/laptops.js';
import { battle1Moves, battle2Moves, personaMoveLabels, rivalScripts } from '../data/moves.js';
import { bus } from '../core/bus.js';
import { state } from '../core/state.js';

export class BattleEngine {
  constructor(battleId) {
    this.battleId = battleId; // 'BATTLE1' or 'BATTLE2'
    this.turn = 0;
    this.phase = 'player_choose'; // player_choose, animating, rival_act, turn_end, battle_over
    this.winner = null; // 'player' | 'rival'
    this.winReason = null; // 'complete' | 'faint'

    // Determine laptops
    if (battleId === 'BATTLE1') {
      this.playerLaptopId = state.laptops.player;
      this.rivalLaptopId = state.laptops.rival;
      this.moves = battle1Moves;
      this.startBatt = 40;
    } else {
      const pair = getStage2Pair(state.flags.persona || 'student');
      this.playerLaptopId = (laptops[state.laptops.player]?.profile === 'PRO') ? state.laptops.player : pair.player;
      this.rivalLaptopId = (laptops[state.laptops.rival]?.profile === 'COMP_AMD') ? state.laptops.rival : pair.rival;
      this.moves = battle2Moves;
      this.startBatt = 50;
    }

    this.playerLaptop = laptops[this.playerLaptopId];
    this.rivalLaptop = laptops[this.rivalLaptopId];

    // State for each side
    this.player = { task: 0, batt: this.startBatt, heat: 0, name: this.playerLaptop.name, lastEngine: null, lowBattTriggered: false };
    this.rival = { task: 0, batt: this.startBatt, heat: 0, name: this.rivalLaptop.name, lastEngine: null, lowBattTriggered: false };

    // Rival script
    if (battleId === 'BATTLE1') {
      if (state.flags.starter === 'nova') {
        // Main path: rival is GO
        this.rivalScript = rivalScripts.battle1_main;
      } else {
        // Fork path: rival is LEGACY
        this.rivalScript = rivalScripts.battle1_fork;
      }
    } else {
      this.rivalScript = rivalScripts.battle2;
    }

    this.rivalMoveIndex = 0;
    this.messages = [];
    this.wifiDropTriggered = false;

    // Get move labels based on persona
    this.moveLabels = this.getMoveLabels();
  }

  getMoveLabels() {
    if (this.battleId === 'BATTLE1') {
      return {
        M1: battle1Moves.M1.label,
        M2: battle1Moves.M2.label,
        M3: battle1Moves.M3.label,
        M4: battle1Moves.M4.label,
      };
    } else {
      const persona = state.flags.persona || 'student';
      return personaMoveLabels[persona];
    }
  }

  getPlayerMoves() {
    return ['M1', 'M2', 'M3', 'M4'].map(id => ({
      id,
      label: this.moveLabels[id],
      type: this.moves[id].type,
    }));
  }

  // Execute a move for an actor (section 8.3)
  executeMove(actor, laptopData, moveId) {
    const move = this.moves[moveId];
    if (!move) return null;

    const mult = laptopData.multipliers[move.type];
    const throttle = actor.heat >= 60 ? 0.7 : 1;

    const prog = Math.round(move.base.prog * mult.prog * throttle);
    const batt = Math.ceil(move.base.batt * mult.batt);
    const heat = Math.round(move.base.heat * mult.heat);

    // Determine effect type & move comment feedback (section 8.6 + move rating commentary)
    let effectType;
    const profile = laptopData.profile;
    if (profile === 'LEGACY' && (move.type === 'AI_LIGHT' || move.type === 'AI_HEAVY')) {
      effectType = 'WEAK_AI';
    } else if (profile === 'LEGACY' && (move.type === 'GFX' || move.type === 'CPU')) {
      effectType = 'OK_LEGACY';
    } else if (profile !== 'LEGACY' && prog < move.base.prog) {
      effectType = 'SLOW';
    } else if (profile !== 'LEGACY' && batt <= 0.45 * move.base.batt) {
      effectType = 'SUPER';
    } else if (profile !== 'LEGACY' && prog > move.base.prog) {
      effectType = 'BOOST';
    } else {
      effectType = 'OK';
    }

    // Apply changes
    const wasThrottled = actor.heat >= 60;
    actor.task = Math.min(100, actor.task + prog);
    actor.batt = Math.max(0, actor.batt - batt);
    actor.heat = Math.min(100, actor.heat + heat);
    actor.lastEngine = mult.engine;

    // Generate comment tag + clear rating message (max 28 chars for crisp 1-row fit below badge)
    let effectText;
    let commentTag;
    switch (effectType) {
      case 'WEAK_AI':
        commentTag = { label: 'BAD MOVE!', bg: '5', fg: '4' };
        effectText = 'No NPU! CPU burns battery!';
        break;
      case 'OK_LEGACY':
        commentTag = { label: 'COSTLY MOVE!', bg: '6', fg: '0' };
        effectText = 'Worked, but heavy drain!';
        break;
      case 'SLOW':
        commentTag = { label: profile === 'COMP_AMD' ? 'HEAVY DRAW!' : 'WEAK MOVE!', bg: '6', fg: '0' };
        effectText = profile === 'COMP_AMD'
          ? '50T NPU works, higher drain!'
          : 'Slow! Needs a bigger NPU.';
        break;
      case 'SUPER':
        if (prog > move.base.prog) {
          commentTag = { label: 'CRITICAL MOVE!', bg: '7', fg: '0' };
          effectText = 'Intel 18A+NPU 5: Fast & cool!';
        } else {
          commentTag = { label: 'EFFECTIVE!', bg: '9', fg: '4' };
          effectText = mult.engine === 'GPU' ? 'GPU power saved!' : 'NPU saved lots of power!';
        }
        break;
      case 'BOOST':
        if (mult.engine === 'GPU') {
          commentTag = { label: 'EFFECTIVE!', bg: '9', fg: '4' };
          effectText = 'Intel Xe3/Arc boosted speed!';
        } else {
          commentTag = { label: 'GOOD MOVE!', bg: 'B', fg: '4' };
          effectText = 'CPU finished extra quick!';
        }
        break;
      default:
        commentTag = { label: 'OK MOVE', bg: 'B', fg: '4' };
        effectText = `Steady work on ${mult.engine}.`;
        break;
    }

    // Check low battery
    let lowBatt = false;
    if (actor.batt <= 20 && !actor.lowBattTriggered) {
      actor.lowBattTriggered = true;
      lowBatt = true;
    }

    return {
      moveId,
      label: this.moveLabels[moveId] || move.label || moveId,
      prog, batt, heat,
      effectType,
      effectText,
      commentTag,
      wasThrottled,
      engine: mult.engine,
      actorTask: actor.task,
      actorBatt: actor.batt,
      actorHeat: actor.heat,
      completed: actor.task >= 100,
      fainted: actor.batt <= 0 && actor.task < 100,
      lowBatt,
    };
  }

  // Player selects a move
  playerAct(moveId) {
    if (this.phase !== 'player_choose' || this.winner) return null;

    const result = this.executeMove(this.player, this.playerLaptop, moveId);
    this.phase = 'player_acted';

    // Emit events
    bus.emit('battle:event', { t: 'USED', who: 'player', move: result.label });
    
    if (result.wasThrottled) {
      bus.emit('battle:event', { t: 'THROTTLE', who: 'player' });
    }

    const sfxMap = { SUPER: 'sfx_super', OK: 'sfx_ok', SLOW: 'sfx_weak', WEAK_AI: 'sfx_weak', OK_LEGACY: 'sfx_ok' };
    bus.emit('battle:event', { t: 'EFFECT', who: 'player', effect: result.effectType, sfx: sfxMap[result.effectType] || 'sfx_ok' });

    if (result.lowBatt) {
      bus.emit('battle:event', { t: 'LOW_BATT', who: 'player' });
    }

    // Check win/loss
    if (result.completed) {
      this.winner = 'player';
      this.winReason = 'complete';
      this.phase = 'battle_over';
      bus.emit('battle:event', { t: 'COMPLETE', who: 'player' });
      state.flags.b2PlayerBatt = this.player.batt;
      state.flags.b2Turns = this.turn + 1;
      return result;
    }
    if (result.fainted) {
      this.winner = 'rival';
      this.winReason = 'faint';
      this.phase = 'battle_over';
      bus.emit('battle:event', { t: 'FAINT', who: 'player' });
      return result;
    }

    return result;
  }

  // Rival acts (fixed script)
  rivalAct() {
    if (this.winner) return null;

    const moveId = this.rivalScript[this.rivalMoveIndex];
    if (!moveId) {
      // Repeat last move if script ends
      return null;
    }
    this.rivalMoveIndex++;

    const result = this.executeMove(this.rival, this.rivalLaptop, moveId);

    bus.emit('battle:event', { t: 'USED', who: 'rival', move: result.label });

    if (result.wasThrottled) {
      bus.emit('battle:event', { t: 'THROTTLE', who: 'rival' });
    }

    const sfxMap = { SUPER: 'sfx_super', OK: 'sfx_ok', SLOW: 'sfx_weak', WEAK_AI: 'sfx_weak', OK_LEGACY: 'sfx_ok' };
    bus.emit('battle:event', { t: 'EFFECT', who: 'rival', effect: result.effectType, sfx: sfxMap[result.effectType] || 'sfx_ok' });

    if (result.lowBatt) {
      bus.emit('battle:event', { t: 'LOW_BATT', who: 'rival' });
    }

    if (result.completed) {
      this.winner = 'rival';
      this.winReason = 'complete';
      this.phase = 'battle_over';
      bus.emit('battle:event', { t: 'COMPLETE', who: 'rival' });
      return result;
    }
    if (result.fainted) {
      this.winner = 'player';
      this.winReason = 'faint';
      this.phase = 'battle_over';
      bus.emit('battle:event', { t: 'FAINT', who: 'rival' });
      return result;
    }

    return result;
  }

  // End of turn: cool down
  endTurn() {
    this.player.heat = Math.max(0, this.player.heat - 5);
    this.rival.heat = Math.max(0, this.rival.heat - 5);
    this.turn++;

    // BATTLE2 turn 3: wifi drop event (section 8.3 rule 7)
    if (this.battleId === 'BATTLE2' && this.turn === 3 && !this.wifiDropTriggered) {
      this.wifiDropTriggered = true;
      bus.emit('battle:event', { t: 'EVENT', event: 'wifi_drop' });
      return 'wifi_drop';
    }

    this.phase = 'player_choose';
    return null;
  }
}
