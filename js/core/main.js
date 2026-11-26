// js/core/main.js — Entry point
import { cfg } from '../config.js';
import { bus } from './bus.js';
import { state, resetState } from './state.js';
import { input } from './input.js';
import { loop } from './loop.js';
import { sceneManager } from './sceneManager.js';
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
import { ResultScene } from '../scenes/result.js';

console.log('[BOOT] All modules imported successfully');

async function boot() {
  console.log('[BOOT] boot() started');

  // Wait for font to load (section 3.2)
  try {
    await Promise.race([
      document.fonts.load('8px "Press Start 2P"'),
      new Promise(resolve => setTimeout(resolve, 3000)) // 3s timeout
    ]);
    console.log('[BOOT] Font loaded or timed out');
  } catch(e) {
    console.warn('Font load failed, using fallback monospace', e);
  }

  const canvas = document.getElementById('game');
  console.log('[BOOT] Canvas:', canvas ? 'found' : 'NOT FOUND');
  
  // Initialize systems
  input.init(canvas);
  loop.init(canvas);
  console.log('[BOOT] Input and loop initialized');
  
  // Set up global namespace (section 3.1)
  window.CQ = {
    cfg,
    bus,
    state,
    audio,
    art,
    fx,
    sceneManager,
    input,
    loop,
  };

  // Initialize art
  art.init();
  fx.init();
  console.log('[BOOT] Art and FX initialized');

  // Register scenes — BATTLE1 and BATTLE2 get separate instances
  sceneManager.register('TITLE', TitleScene);
  sceneManager.register('INTRO', IntroScene);
  sceneManager.register('STORE', StoreScene);
  sceneManager.register('BATTLE1', createBattleScene('BATTLE1'));
  sceneManager.register('PERSONA', PersonaScene);
  sceneManager.register('BATTLE2', createBattleScene('BATTLE2'));
  sceneManager.register('PCDEX', PcdexScene);
  sceneManager.register('RESULT', ResultScene);
  console.log('[BOOT] Scenes registered');

  // Dev URL params (section 3.9)
  const params = new URLSearchParams(window.location.search);
  const startScene = params.get('scene');
  const persona = params.get('persona');
  const starter = params.get('starter');
  const mute = params.get('mute');

  if (mute === '1') audio.setMuted(true);
  if (persona) state.flags.persona = persona;
  if (starter) {
    state.flags.starter = starter;
    state.laptops.player = starter;
    state.laptops.rival = starter === 'nova' ? 'aura_go' : 'nova';
  }

  // Hide loading screen
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
  console.log('[BOOT] Loading screen hidden');

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
    if (startScene === 'RESULT') {
      state.flags.persona = state.flags.persona || 'student';
      state.flags.b2PlayerBatt = 38;
      state.flags.b2Turns = 5;
    }
    await sceneManager.switchTo(startScene, { battleId: startScene });
  } else {
    await sceneManager.switchTo('TITLE');
  }
  console.log('[BOOT] Scene loaded, starting loop');

  loop.start();
  console.log('[BOOT] Game loop started!');
}

boot().catch(e => console.error('Boot failed:', e));
