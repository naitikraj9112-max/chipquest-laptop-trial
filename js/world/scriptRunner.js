// js/world/scriptRunner.js — Cutscene/script runner (section 7.1)
import { cfg } from '../config.js';
import { state } from '../core/state.js';
import { bus } from '../core/bus.js';
import { dialogueUI } from './dialogue.js';
import { dialogue as dialogueData } from '../data/dialogue.js';

let running = false;
let inputLocked = false;
let script = [];
let scriptIndex = 0;
let waitTimer = 0;
let waitDuration = 0;
let waiting = false;
let onScriptComplete = null;

export const scriptRunner = {
  get isRunning() { return running; },
  get isLocked() { return inputLocked; },

  async run(commands, callback) {
    running = true;
    inputLocked = true;
    script = commands;
    scriptIndex = 0;
    onScriptComplete = callback;
    await this.executeNext();
  },

  async executeNext() {
    while (scriptIndex < script.length) {
      const cmd = script[scriptIndex];
      scriptIndex++;
      
      if (!cmd) continue;
      
      const [action, ...args] = Array.isArray(cmd) ? cmd : [cmd];
      
      switch (action) {
        case 'SAY': {
          const key = args[0];
          const entry = dialogueData[key];
          if (entry) {
            await new Promise(resolve => {
              dialogueUI.show([entry], resolve);
            });
          }
          break;
        }

        case 'SAY_MULTI': {
          const keys = args;
          const entries = keys.map(k => dialogueData[k]).filter(Boolean);
          if (entries.length > 0) {
            await new Promise(resolve => {
              dialogueUI.show(entries, resolve);
            });
          }
          break;
        }

        case 'CHOICE': {
          const options = args[0]; // array of {label, value}
          await new Promise(resolve => {
            const labels = options.map(o => o.label || o);
            dialogueUI.showChoice(
              { speaker: '', text: '' },
              labels,
              (idx) => {
                const val = options[idx].value || options[idx];
                resolve(val);
              }
            );
          }).then(val => {
            // Store choice result
            if (typeof val === 'object' && val.set) {
              Object.assign(state.flags, val.set);
            }
          });
          break;
        }

        case 'SET': {
          const [path, value] = args;
          setNestedValue(state, path, value);
          break;
        }

        case 'ASK_NAME': {
          await new Promise(resolve => {
            if (window.CQ && window.CQ.askPlayerName) {
              window.CQ.askPlayerName(() => resolve());
            } else {
              state.playerName = state.playerName || 'ASH';
              resolve();
            }
          });
          break;
        }

        case 'WAIT': {
          const ms = args[0] || 500;
          await new Promise(resolve => setTimeout(resolve, ms));
          break;
        }

        case 'FACE': {
          const [entityId, dir] = args;
          const em = window.CQ?.storeScene?.entityManager;
          if (em) {
            const e = em.get(entityId);
            if (e) e.face(dir);
          }
          break;
        }

        case 'MOVE': {
          const [entityId, dir, steps] = args;
          const em = window.CQ?.storeScene?.entityManager;
          if (em) {
            const e = em.get(entityId);
            if (e) {
              for (let i = 0; i < (steps || 1); i++) {
                e.startMove(dir, window.CQ.storeScene.tilemap, em.entities);
                await new Promise(resolve => setTimeout(resolve, cfg.STEP_MS + 10));
              }
            }
          }
          break;
        }

        case 'MUSIC': {
          const musicId = args[0];
          const opts = args[1] || {};
          if (window.CQ) {
            if (musicId === 'stop') {
              window.CQ.audio.stopMusic(opts.fadeMs || 300);
            } else {
              window.CQ.audio.playMusic(musicId, opts);
            }
          }
          break;
        }

        case 'SFX': {
          if (window.CQ) window.CQ.audio.playSfx(args[0]);
          break;
        }

        case 'FLASH': {
          if (window.CQ) window.CQ.fx.flash(args[0] || 200, args[1] || '4');
          break;
        }

        case 'SHAKE': {
          if (window.CQ) window.CQ.fx.shake(args[0] || 200, args[1] || 3);
          break;
        }

        case 'SCENE': {
          const sceneId = args[0];
          const params = args[1] || {};
          if (window.CQ) {
            await window.CQ.fx.wipeOut(cfg.WIPE_MS);
            await window.CQ.sceneManager.switchTo(sceneId, { battleId: sceneId, ...params });
            await window.CQ.fx.wipeIn(cfg.WIPE_MS);
          }
          running = false;
          inputLocked = false;
          if (onScriptComplete) onScriptComplete();
          return;
        }

        case 'BATTLE': {
          const battleId = args[0];
          if (window.CQ) {
            await window.CQ.fx.wipeOut(cfg.WIPE_MS);
            await window.CQ.sceneManager.switchTo(battleId, { battleId });
            await window.CQ.fx.wipeIn(cfg.WIPE_MS);
          }
          running = false;
          inputLocked = false;
          if (onScriptComplete) onScriptComplete();
          return;
        }

        case 'IF': {
          const [condition, thenCmds, elseCmds] = args;
          const result = evaluateCondition(condition);
          const branch = result ? thenCmds : (elseCmds || []);
          if (branch.length > 0) {
            // Insert branch commands
            script.splice(scriptIndex, 0, ...branch);
          }
          break;
        }

        case 'UNLOCK': {
          inputLocked = false;
          break;
        }

        case 'LOCK': {
          inputLocked = true;
          break;
        }

        default:
          console.warn('Unknown script command:', action);
      }
    }

    // Script complete
    running = false;
    inputLocked = false;
    if (onScriptComplete) onScriptComplete();
  },

  update(dt) {
    dialogueUI.update(dt);
  },

  handleA() {
    return dialogueUI.handleA();
  },

  handleDirection(dir) {
    if (dir === 'up') dialogueUI.handleUp();
    if (dir === 'down') dialogueUI.handleDown();
  },

  draw(ctx) {
    dialogueUI.draw(ctx);
  },

  stop() {
    running = false;
    inputLocked = false;
    dialogueUI.close();
  }
};

function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    curr = curr[parts[i]];
    if (!curr) return;
  }
  curr[parts[parts.length - 1]] = value;
}

function evaluateCondition(condition) {
  if (typeof condition === 'function') return condition();
  if (typeof condition === 'string') {
    const parts = condition.split('===');
    if (parts.length === 2) {
      const val = getNestedValue(state, parts[0].trim());
      const expected = parts[1].trim().replace(/'/g, '');
      return String(val) === expected;
    }
    const val = getNestedValue(state, condition);
    return !!val;
  }
  return !!condition;
}

function getNestedValue(obj, path) {
  const parts = path.split('.');
  let curr = obj;
  for (const p of parts) {
    if (!curr) return undefined;
    curr = curr[p];
  }
  return curr;
}
