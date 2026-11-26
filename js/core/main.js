// js/core/main.js — Entry point
import { cfg } from '../config.js';
import { bus } from './bus.js';
import { state, resetState } from './state.js';
import { input } from './input.js';
import { loop } from './loop.js';
import { sceneManager } from './sceneManager.js';
import { pauseMenu } from './pause.js';
import { getStage2Pair } from '../data/laptops.js';
import { dialogueUI } from '../world/dialogue.js';
import { art } from '../art/palette.js';
import { sprites } from '../art/sprites.js';
import { tiles } from '../art/tiles.js';
import { uiArt } from '../art/ui.js';
import { fx } from '../art/fx.js';
import { audio } from '../audio/audio.js';
import { TitleScene } from '../scenes/title.js';
import { IntroScene } from '../scenes/intro.js';
import { StoreScene } from '../scenes/store.js';
import { createBattleScene } from '../scenes/battle.js';
import { PersonaScene } from '../scenes/persona.js';
import { PcdexScene } from '../scenes/pcdex.js';
import { GymScene } from '../scenes/gym.js';
import { ResultScene } from '../scenes/result.js';

async function boot() {
  // Wait for font to load (section 3.2)
  try {
    await Promise.race([
      document.fonts.load('8px "Press Start 2P"'),
      new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
    ]);
  } catch(e) {
    console.warn('Font load failed, using fallback monospace', e);
  }

  const canvas = document.getElementById('game');

  // Initialize systems
  input.init(canvas);
  loop.init(canvas);

  // Set up global namespace (section 3.1)
  window.CQ = {
    cfg,
    bus,
    state,
    audio,
    art,
    fx,
    sceneManager,
    pauseMenu,
    dialogueUI,
    input,
    loop,
    isModalOpen: false,
    askPlayerName: null,
  };

  // Name Prompt modal wiring (asked on first interaction with Prof. Chip)
  const nameModal = document.getElementById('name-modal');
  const nameInput = document.getElementById('name-input');
  const nameOkBtn = document.getElementById('name-ok');
  window.CQ.askPlayerName = cb => {
    if (!nameModal || !nameInput || !nameOkBtn) {
      state.playerName = state.playerName || 'ASH';
      if (cb) cb(state.playerName);
      return;
    }
    window.CQ.isModalOpen = true;
    input.flush();
    nameInput.value = '';
    nameModal.classList.remove('hidden');
    setTimeout(() => { try { nameInput.focus(); } catch {} }, 30);

    const submit = () => {
      const raw = (nameInput.value || '').trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 10);
      const chosen = raw || 'ASH';
      state.playerName = chosen;
      nameModal.classList.add('hidden');
      window.CQ.isModalOpen = false;
      input.flush();
      nameInput.blur();
      cleanup();
      if (window.CQ.audio) window.CQ.audio.playSfx('sfx_confirm');
      if (cb) cb(chosen);
    };

    const onKey = e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        submit();
      }
    };
    const onPreset = e => {
      const n = e.target?.getAttribute?.('data-name');
      if (n) {
        nameInput.value = n;
        submit();
      }
    };
    const presetBtns = Array.from(nameModal.querySelectorAll('.name-preset'));
    const cleanup = () => {
      nameOkBtn.removeEventListener('click', submit);
      nameInput.removeEventListener('keydown', onKey);
      presetBtns.forEach(b => b.removeEventListener('click', onPreset));
    };

    nameOkBtn.addEventListener('click', submit);
    nameInput.addEventListener('keydown', onKey);
    presetBtns.forEach(b => b.addEventListener('click', onPreset));
  };

  // Initialize art
  art.init();
  fx.init();

  // Register scenes — BATTLE1, BATTLE2 (fake Stage 1), and BATTLE3 (Gym Stage 2)
  sceneManager.register('TITLE', TitleScene);
  sceneManager.register('INTRO', IntroScene);
  sceneManager.register('STORE', StoreScene);
  sceneManager.register('BATTLE1', createBattleScene('BATTLE1'));
  sceneManager.register('PERSONA', PersonaScene);
  sceneManager.register('BATTLE2', createBattleScene('BATTLE2'));
  sceneManager.register('PCDEX', PcdexScene);
  sceneManager.register('GYM', GymScene);
  sceneManager.register('BATTLE3', createBattleScene('BATTLE3'));
  sceneManager.register('RESULT', ResultScene);

  // Fullscreen button shown on TITLE; Pause button shown on in-game scenes
  const fsBtn = document.getElementById('btn-fullscreen');
  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', e => {
      e.preventDefault();
      audio.unlock();
      pauseMenu.toggle();
    });
  }
  bus.on('scene:enter', ({ id }) => {
    state.scene = id;
    if (fsBtn && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
      fsBtn.style.display = id === 'TITLE' ? 'flex' : 'none';
    }
    if (pauseBtn) {
      pauseBtn.style.display = id === 'TITLE' ? 'none' : 'flex';
    }
  });

  // Dev URL params (section 3.9)
  const params = new URLSearchParams(window.location.search);
  const startScene = params.get('scene');
  const persona = params.get('persona');
  const starter = params.get('starter');
  const mute = params.get('mute');

  if (mute === '1') {
    audio.setMuted(true);
    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) muteBtn.textContent = '🔇';
  }
  if (persona) state.flags.persona = persona;
  if (starter) {
    state.flags.starter = starter;
    state.laptops.player = starter;
    state.laptops.rival = starter === 'nova' ? 'aura_go' : 'nova';
  }

  // Hide loading screen
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';

  // Start the appropriate scene
  if (startScene && cfg.SCENES.includes(startScene)) {
    if (startScene === 'BATTLE1' && !state.flags.starter) {
      state.flags.starter = 'nova';
      state.laptops.player = 'nova';
      state.laptops.rival = 'aura_go';
    }
    if (startScene === 'BATTLE2') {
      state.flags.starter = state.flags.starter || 'nova';
      state.laptops.player = 'aura_pro';
      state.laptops.rival = 'aura_go';
      state.flags.persona = state.flags.persona || 'student';
    }
    if (startScene === 'PCDEX') {
      state.flags.persona = state.flags.persona || 'student';
    }
    if (startScene === 'GYM' || startScene === 'BATTLE3') {
      state.flags.starter = state.flags.starter || 'nova';
      state.flags.persona = state.flags.persona || 'student';
      state.flags.gymUnlocked = true;
      const pair = getStage2Pair(state.flags.persona);
      state.laptops.gymPlayer = pair.player;
      state.laptops.gymRival = pair.rival;
    }
    if (startScene === 'RESULT') {
      state.flags.persona = state.flags.persona || 'student';
      state.flags.b2PlayerBatt = 38;
      state.flags.b2Turns = 5;
    }
    await sceneManager.switchTo(startScene, { battleId: startScene });
  } else {
    await sceneManager.switchTo('TITLE');
  }

  loop.start();
}

boot().catch(e => console.error('Boot failed:', e));
