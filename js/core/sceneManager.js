// js/core/sceneManager.js — Scene manager (section 3.6)
import { bus } from './bus.js';

const scenes = {};
let currentScene = null;
let currentId = null;

export const sceneManager = {
  register(id, scene) {
    scenes[id] = scene;
  },

  async switchTo(id, params = {}) {
    if (currentScene && currentScene.exit) {
      await currentScene.exit();
    }
    currentId = id;
    currentScene = scenes[id];
    if (currentScene && currentScene.enter) {
      await currentScene.enter(params);
    }
    bus.emit('scene:enter', { id });
  },

  update(dt) {
    if (currentScene && currentScene.update) {
      currentScene.update(dt);
    }
  },

  draw(ctx) {
    if (currentScene && currentScene.draw) {
      currentScene.draw(ctx);
    }
  },

  get currentId() { return currentId; },
  get current() { return currentScene; }
};
