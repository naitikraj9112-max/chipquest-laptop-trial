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
    askPlayerGender: null,
    askPlayerName: null,
  };

  // Shared modal wiring: mode = 'gender' (at game start) | 'name' (with Prof. Chip later)
  const nameModal = document.getElementById('name-modal');
  const nameTitle = document.getElementById('name-title');
  const nameSub = document.getElementById('name-sub');
  const genderRow = document.getElementById('gender-row');
  const nameInput = document.getElementById('name-input');
  const namePresetsRow = document.getElementById('name-presets');
  const nameOkBtn = document.getElementById('name-ok');

  function openTrainerModal(mode, cb) {
    if (!nameModal || !nameOkBtn) {
      if (cb) cb(mode === 'gender' ? state.playerGender : state.playerName);
      return;
    }
    window.CQ.isModalOpen = true;
    input.flush();

    let selectedGender = state.playerGender || 'boy';
    const isGender = mode === 'gender';
    const genderBtns = Array.from(nameModal.querySelectorAll('.gender-btn'));
    const presetBtns = Array.from(nameModal.querySelectorAll('.name-preset'));

    if (nameTitle) nameTitle.textContent = isGender ? 'BOY OR GIRL?' : 'YOUR NAME?';
    if (nameSub) {
      nameSub.textContent = isGender
        ? 'Choose your trainer before entering the store!'
        : 'Prof. Chip wants to register your Trainer Card!';
    }
    if (genderRow) genderRow.style.display = isGender ? 'flex' : 'none';
    if (nameInput) nameInput.style.display = isGender ? 'none' : 'block';
    if (namePresetsRow) namePresetsRow.style.display = isGender ? 'none' : 'flex';

    const syncGenderUI = () => {
      const presets = selectedGender === 'girl' ? ['MISTY', 'MAY', 'DAWN'] : ['ASH', 'RED', 'KAI'];
      if (nameInput) nameInput.placeholder = presets[0];
      genderBtns.forEach(b => {
        const g = b.getAttribute('data-gender');
        b.classList.toggle('selected', g === selectedGender);
        const cv = b.querySelector('.gender-prev');
        const spr = art.getSpriteData(g === 'girl' ? 'spr_player_girl_down_0' : 'spr_player_down_0');
        if (cv && spr) {
          const pctx = cv.getContext('2d');
          pctx.imageSmoothingEnabled = false;
          pctx.clearRect(0, 0, cv.width, cv.height);
          pctx.drawImage(spr.canvas, 0, 0, cv.width, cv.height);
        }
      });
      presetBtns.forEach((b, i) => {
        b.setAttribute('data-name', presets[i]);
        b.textContent = presets[i];
      });
    };

    syncGenderUI();
    if (!isGender && nameInput) {
      nameInput.value = '';
      setTimeout(() => { try { nameInput.focus(); } catch {} }, 30);
    } else {
      setTimeout(() => { try { nameOkBtn.focus(); } catch {} }, 30);
    }
    nameModal.classList.remove('hidden');

    const submit = () => {
      let chosen;
      if (isGender) {
        state.playerGender = selectedGender;
        chosen = selectedGender;
      } else {
        const fallback = (state.playerGender || 'boy') === 'girl' ? 'MISTY' : 'ASH';
        const raw = (nameInput?.value || '').trim().toUpperCase().replace(/[^A-Z0-9 _-]/g, '').slice(0, 10);
        chosen = raw || fallback;
        state.playerName = chosen;
        nameInput?.blur();
      }
      nameModal.classList.add('hidden');
      window.CQ.isModalOpen = false;
      input.flush();
      cleanup();
      if (window.CQ.audio) window.CQ.audio.playSfx('sfx_confirm');
      if (cb) cb(chosen);
    };

    const setGender = g => {
      if (!g || g === selectedGender) return;
      selectedGender = g;
      state.playerGender = g;
      syncGenderUI();
      if (window.CQ.audio) window.CQ.audio.playSfx('sfx_cursor');
    };

    const onGender = e => setGender(e.currentTarget?.getAttribute?.('data-gender'));
    const onModalKey = e => {
      if (isGender) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setGender('boy'); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setGender('girl'); }
        else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); e.stopPropagation(); submit(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        submit();
      }
    };
    const onPreset = e => {
      const n = e.target?.getAttribute?.('data-name');
      if (n && nameInput) {
        nameInput.value = n;
        submit();
      }
    };
    const cleanup = () => {
      nameOkBtn.removeEventListener('click', submit);
      window.removeEventListener('keydown', onModalKey, true);
      genderBtns.forEach(b => b.removeEventListener('click', onGender));
      presetBtns.forEach(b => b.removeEventListener('click', onPreset));
    };

    nameOkBtn.addEventListener('click', submit);
    window.addEventListener('keydown', onModalKey, true);
    genderBtns.forEach(b => b.addEventListener('click', onGender));
    presetBtns.forEach(b => b.addEventListener('click', onPreset));
  }

  window.CQ.askPlayerGender = cb => openTrainerModal('gender', cb);
  window.CQ.askPlayerName = cb => openTrainerModal('name', cb);

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
