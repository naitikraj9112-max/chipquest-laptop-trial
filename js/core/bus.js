// js/core/bus.js — Event bus (section 3.7)
const listeners = {};

export const bus = {
  on(name, fn) {
    if (!listeners[name]) listeners[name] = [];
    listeners[name].push(fn);
  },
  off(name, fn) {
    if (!listeners[name]) return;
    listeners[name] = listeners[name].filter(f => f !== fn);
  },
  emit(name, payload) {
    if (!listeners[name]) return;
    for (const fn of listeners[name]) fn(payload);
  }
};
