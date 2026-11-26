// js/audio/audio.js — WebAudio manager (sections 3.7, 11)
// Integrates with music.js (cue objects) and sfx.js (function-based SFX)
import { musicCues } from './music.js';
import { sfxDefs } from './sfx.js';

let actx = null;
let masterGain = null;
let compressor = null;
let muted = false;
let unlocked = false;
let currentMusicId = null;
let currentMusicNodes = [];
let currentMusicGain = null;
let schedulerTimer = null;

function ensureContext() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    compressor = actx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.connect(actx.destination);
    masterGain = actx.createGain();
    masterGain.gain.value = muted ? 0 : 0.35;
    masterGain.connect(compressor);
  }
  return actx;
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function stopCurrentMusic(fadeMs = 300) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  if (currentMusicGain && actx) {
    const g = currentMusicGain;
    const t = actx.currentTime;
    try {
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0.001, t + fadeMs / 1000);
    } catch(e) {}
    const nodes = currentMusicNodes;
    setTimeout(() => {
      nodes.forEach(n => { try { n.stop(); } catch(e){} try { n.disconnect(); } catch(e){} });
    }, fadeMs + 100);
  }
  currentMusicId = null;
  currentMusicGain = null;
  currentMusicNodes = [];
}

function playMusicCue(cue, fadeMs = 300) {
  const ctx = ensureContext();
  const { id, bpm, bars, loop: doLoop, ch } = cue;

  const musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(0.001, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(1, ctx.currentTime + fadeMs / 1000);
  musicGain.connect(masterGain);

  currentMusicGain = musicGain;
  currentMusicId = id;
  currentMusicNodes = [];

  const sixteenthDur = 60 / bpm / 4;
  const totalSixteenths = bars * 16;
  const totalDuration = totalSixteenths * sixteenthDur;

  function schedulePass(startTime) {
    for (const channel of ch) {
      const { wave, vol, notes } = channel;
      let time = startTime;

      for (const [midiOrNull, sixteenths] of notes) {
        const dur = sixteenths * sixteenthDur;

        if (midiOrNull !== null && midiOrNull > 0) {
          if (wave === 'noise') {
            // Noise for percussion
            try {
              const bufLen = Math.max(128, Math.floor(ctx.sampleRate * Math.min(dur, 0.15)));
              const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
              const data = buf.getChannelData(0);
              for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
              const src = ctx.createBufferSource();
              src.buffer = buf;
              const envGain = ctx.createGain();
              envGain.gain.setValueAtTime(vol * 0.4, time);
              envGain.gain.exponentialRampToValueAtTime(0.001, time + Math.min(dur, 0.15));
              src.connect(envGain);
              envGain.connect(musicGain);
              src.start(time);
              src.stop(time + Math.min(dur, 0.2));
              currentMusicNodes.push(src);
            } catch(e) {}
          } else {
            try {
              const osc = ctx.createOscillator();
              osc.type = (wave === 'triangle') ? 'triangle' : 'square';
              osc.frequency.setValueAtTime(midiToFreq(midiOrNull), time);
              const envGain = ctx.createGain();
              envGain.gain.setValueAtTime(vol, time);
              envGain.gain.setValueAtTime(vol * 0.8, time + dur * 0.7);
              envGain.gain.linearRampToValueAtTime(0.001, time + dur * 0.95);
              osc.connect(envGain);
              envGain.connect(musicGain);
              osc.start(time);
              osc.stop(time + dur + 0.01);
              currentMusicNodes.push(osc);
            } catch(e) {}
          }
        }
        time += dur;
      }
    }
  }

  const t0 = ctx.currentTime + 0.05;
  schedulePass(t0);

  if (doLoop) {
    let nextStart = t0 + totalDuration;
    schedulerTimer = setInterval(() => {
      if (!actx || currentMusicId !== id) {
        clearInterval(schedulerTimer);
        schedulerTimer = null;
        return;
      }
      while (nextStart < actx.currentTime + 1.0) {
        schedulePass(nextStart);
        nextStart += totalDuration;
      }
    }, 250);
  }
}

export const audio = {
  unlock() {
    if (unlocked) return;
    ensureContext();
    if (actx.state === 'suspended') actx.resume();
    unlocked = true;
  },

  playMusic(id, opts = {}) {
    const fadeMs = opts.fadeMs || 300;
    ensureContext();
    if (currentMusicId === id) return;
    stopCurrentMusic(fadeMs);
    const cue = musicCues[id];
    if (!cue) { console.warn('No music cue:', id); return; }
    if (!muted) {
      setTimeout(() => {
        if (currentMusicId === null) { // only play if nothing started in the meantime
          playMusicCue(cue, fadeMs);
        }
      }, fadeMs + 20);
    }
    currentMusicId = id; // reserve the slot immediately
  },

  stopMusic(fadeMs = 300) {
    stopCurrentMusic(fadeMs);
  },

  playSfx(id) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    // sfxDefs uses function-based API: sfxDefs.sfx_blip(ctx, masterGain)
    const fn = sfxDefs[id];
    if (typeof fn === 'function') {
      try { fn(ctx, masterGain); } catch(e) { console.warn('SFX error:', id, e); }
    } else {
      // Fallback: simple beep
      try {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 440;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(g).connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      } catch(e) {}
    }
  },

  setMuted(val) {
    muted = val;
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 0.35;
    }
    if (muted) {
      stopCurrentMusic(0);
    }
  },

  isMuted() {
    return muted;
  }
};
