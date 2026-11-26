/**
 * CHIPQUEST – SFX Definitions
 * All sound effects are synthesised via WebAudio (no samples).
 *
 * Each entry:
 *   { id, fn(ctx, masterGain) }
 *
 * fn receives the AudioContext and the master gain node,
 * creates short-lived oscillator / noise graphs, connects them,
 * and lets them self-destruct via stop() scheduling.
 */

// ── Helpers ─────────────────────────────────────────────────────────

/** Create a short square-wave blip. */
function blip(ctx, dest, freq, startTime, dur, vol = 0.15) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  osc.connect(g).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + dur + 0.01);
}

/** Create a triangle tone. */
function tri(ctx, dest, freq, startTime, dur, vol = 0.2) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
  osc.connect(g).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + dur + 0.01);
}

/** Create a short noise burst (kick-like or hat-like). */
function noiseBurst(ctx, dest, startTime, dur, highPass, vol = 0.12) {
  const bufSize = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, Math.max(bufSize, 2), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const filt = ctx.createBiquadFilter();
  filt.type = highPass ? 'highpass' : 'lowpass';
  filt.frequency.value = highPass ? 3000 : 400;

  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

  src.connect(filt).connect(g).connect(dest);
  src.start(startTime);
  src.stop(startTime + dur + 0.01);
}

/** Frequency from MIDI note number. */
function midiHz(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

// MIDI constants
const C5 = 72, E5 = 76, G5 = 79, C6 = 84;

// ── SFX Definitions ─────────────────────────────────────────────────

export const sfxDefs = {

  /** Dialogue letter blip – square 880 Hz, 20ms, quiet */
  sfx_blip(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 880, t, 0.02, 0.07);
  },

  /** Confirm – square 660→880 Hz, 80ms total */
  sfx_confirm(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 660, t, 0.04, 0.15);
    blip(ctx, dest, 880, t + 0.04, 0.04, 0.15);
  },

  /** Cancel – square 440→330 Hz, 60ms */
  sfx_cancel(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 440, t, 0.03, 0.15);
    blip(ctx, dest, 330, t + 0.03, 0.03, 0.15);
  },

  /** Step – very quiet tick, 120 Hz, 15ms */
  sfx_step(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 120, t, 0.015, 0.04);
  },

  /** Power-on chime – C5, G5, C6, 60ms each */
  sfx_start(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, midiHz(C5), t, 0.06, 0.18);
    blip(ctx, dest, midiHz(G5), t + 0.06, 0.06, 0.18);
    blip(ctx, dest, midiHz(C6), t + 0.12, 0.08, 0.2);
  },

  /** Card flick – noise 40ms + 1.2kHz blip */
  sfx_card(ctx, dest) {
    const t = ctx.currentTime;
    noiseBurst(ctx, dest, t, 0.04, true, 0.1);
    blip(ctx, dest, 1200, t + 0.02, 0.04, 0.12);
  },

  /** Super effective – arpeggio C5 E5 G5 C6, 50ms each, square */
  sfx_super(ctx, dest) {
    const t = ctx.currentTime;
    const notes = [C5, E5, G5, C6];
    notes.forEach((n, i) => {
      blip(ctx, dest, midiHz(n), t + i * 0.05, 0.05, 0.18);
    });
  },

  /** OK – single square 660 Hz, 70ms */
  sfx_ok(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 660, t, 0.07, 0.14);
  },

  /** Weak / not very effective – triangle slide 300→150 Hz, 200ms */
  sfx_weak(ctx, dest) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + 0.25);
  },

  /** Heat / fire – high-passed noise with rising cutoff, 400ms */
  sfx_heat(ctx, dest) {
    const t = ctx.currentTime;
    const dur = 0.4;
    const bufSize = Math.max(ctx.sampleRate * dur, 2);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.setValueAtTime(1000, t);
    filt.frequency.exponentialRampToValueAtTime(6000, t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, t);
    g.gain.linearRampToValueAtTime(0.2, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);

    src.connect(filt).connect(g).connect(dest);
    src.start(t);
    src.stop(t + dur + 0.01);
  },

  /** Warning – two 1kHz beeps, 80ms each, 80ms apart */
  sfx_warn(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 1000, t, 0.08, 0.17);
    blip(ctx, dest, 1000, t + 0.16, 0.08, 0.17);
  },

  /** Shutdown – triangle glide 440→55 Hz over 700ms + noise tail */
  sfx_shutdown(ctx, dest) {
    const t = ctx.currentTime;
    // Triangle glide
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.7);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + 0.8);

    // Noise tail
    const dur = 0.5;
    const bufSize = Math.max(ctx.sampleRate * dur, 2);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(800, t + 0.3);
    filt.frequency.exponentialRampToValueAtTime(100, t + 0.3 + dur);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.1, t + 0.4);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + dur);
    src.connect(filt).connect(g2).connect(dest);
    src.start(t + 0.3);
    src.stop(t + 0.3 + dur + 0.01);
  },

  /** Complete – five-note rising fanfare, ~400ms */
  sfx_complete(ctx, dest) {
    const t = ctx.currentTime;
    const notes = [C5, E5, G5, C6, E5 + 12]; // C5 E5 G5 C6 E6
    notes.forEach((n, i) => {
      blip(ctx, dest, midiHz(n), t + i * 0.07, 0.08, 0.18);
    });
  },

  /** WiFi drop – three falling blips 880, 660, 440 Hz */
  sfx_wifi_drop(ctx, dest) {
    const t = ctx.currentTime;
    blip(ctx, dest, 880, t, 0.06, 0.15);
    blip(ctx, dest, 660, t + 0.08, 0.06, 0.15);
    blip(ctx, dest, 440, t + 0.16, 0.08, 0.13);
  },
};
