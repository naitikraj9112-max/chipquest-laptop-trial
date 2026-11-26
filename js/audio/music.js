/**
 * CHIPQUEST – Music Cue Definitions
 * Pure WebAudio chiptune music — all original compositions.
 *
 * Format per cue:
 *   { id, bpm, bars, loop, key, ch:[{wave, vol, notes:[[midiOrNull, sixteenths], ...]}] }
 *
 * - midiOrNull: MIDI note number (60 = C4) or null for rest
 * - sixteenths: duration in sixteenth-note ticks
 * - wave: 'square' | 'square25' | 'triangle' | 'noise'
 * - vol: 0–1 relative channel volume
 *
 * Brand motif "CHIP MOTIF": rising four-note phrase
 *   root → major-3rd → fifth → octave  (in the cue's key)
 *   Inverted (descending minor) in battle / dark cues.
 */

// ── Helpers ─────────────────────────────────────────────────────────
// Shorthand note builder: N(midi, sixteenths)  R(sixteenths) = rest
const N = (m, d) => [m, d];
const R = (d)    => [null, d];

// MIDI note constants (for readability)
const C3=48, D3=50, E3=52, F3=53, G3=55, A3=57, Bb3=58, B3=59;
const C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, Bb4=70, B4=71;
const C5=72, D5=74, E5=76, F5=77, G5=79, A5=81, Bb5=82, B5=83;
const C6=84, D6=86, E6=88, F6=89, G6=91;
const Db3=49, Eb3=51, Gb3=54, Ab3=56;
const Db4=61, Eb4=63, Gb4=66, Ab4=68;
const Db5=73, Eb5=75, Gb5=78, Ab5=80;
const Cs5=73, Fs4=66, Fs3=54, Cs4=61;

// ── MUS_TITLE ───────────────────────────────────────────────────────
// C major / 120 BPM / 8 bars / loop / Heroic & bouncy
// Motif on LEAD (C5 E5 G5 C6), arpeggiated HARM
const MUS_TITLE = {
  id: 'MUS_TITLE', bpm: 120, bars: 8, loop: true, key: 'C major',
  ch: [
    // LEAD – square 50 %
    { wave: 'square', vol: 0.7, notes: [
      // Bar 1-2: Chip motif heroic entrance
      N(C5,2), N(E5,2), N(G5,2), N(C6,4), R(2), N(B4,2), N(C5,2),
      N(G5,4), N(E5,2), N(D5,2), N(C5,4), R(4),
      // Bar 3-4: Response phrase
      N(E5,2), N(G5,2), N(C6,2), N(B5,2), N(A5,2), N(G5,4), R(2),
      N(F5,2), N(E5,2), N(D5,2), N(C5,2), N(D5,4), R(4),
      // Bar 5-6: Motif variation higher energy
      N(C5,2), N(E5,2), N(G5,2), N(C6,2), N(D6,2), N(C6,2), N(B5,2), N(G5,2),
      N(A5,4), N(G5,2), N(E5,2), N(D5,2), N(C5,2), R(4),
      // Bar 7-8: Closing phrase loops back
      N(G5,2), N(A5,2), N(B5,2), N(C6,4), N(G5,2), N(E5,2), N(D5,2),
      N(C5,2), N(D5,2), N(E5,4), N(C5,4), R(2), R(2),
    ]},
    // HARM – square 25 %, arpeggiated chords
    { wave: 'square25', vol: 0.35, notes: [
      // Bar 1-2: C arpeggio
      N(C4,2), N(E4,2), N(G4,2), N(E4,2), N(C4,2), N(E4,2), N(G4,2), N(E4,2),
      N(C4,2), N(E4,2), N(G4,2), N(E4,2), N(C4,2), N(E4,2), N(G4,2), N(E4,2),
      // Bar 3-4: Am → F
      N(A3,2), N(C4,2), N(E4,2), N(C4,2), N(A3,2), N(C4,2), N(E4,2), N(C4,2),
      N(F3,2), N(A3,2), N(C4,2), N(A3,2), N(F3,2), N(A3,2), N(C4,2), N(A3,2),
      // Bar 5-6: G → C
      N(G3,2), N(B3,2), N(D4,2), N(B3,2), N(G3,2), N(B3,2), N(D4,2), N(B3,2),
      N(C4,2), N(E4,2), N(G4,2), N(E4,2), N(C4,2), N(E4,2), N(G4,2), N(E4,2),
      // Bar 7-8: F → G → C
      N(F3,2), N(A3,2), N(C4,2), N(A3,2), N(G3,2), N(B3,2), N(D4,2), N(B3,2),
      N(C4,2), N(E4,2), N(G4,2), N(E4,2), N(C4,4), R(4), R(4),
    ]},
    // BASS – triangle
    { wave: 'triangle', vol: 0.8, notes: [
      // Bar 1-2
      N(C3,4), N(C3,4), N(G3,4), N(G3,4),
      N(C3,4), N(E3,4), N(G3,4), N(C3,4),
      // Bar 3-4
      N(A3,4), N(A3,4), N(E3,4), N(E3,4),
      N(F3,4), N(F3,4), N(C3,4), N(C3,4),
      // Bar 5-6
      N(G3,4), N(G3,4), N(B3,4), N(D3,4),
      N(C3,4), N(C3,4), N(E3,4), N(G3,4),
      // Bar 7-8
      N(F3,4), N(F3,4), N(G3,4), N(G3,4),
      N(C3,4), N(E3,4), N(C3,8),
    ]},
    // PERC – noise
    { wave: 'noise', vol: 0.5, notes: [
      // 8 bars of bouncy beat: kick on 1, hat on 3, kick-hat on 5-7
      // Each bar = 16 sixteenths
      ...Array(8).fill(null).flatMap(() => [
        N(1,2), R(2), N(2,2), R(2), N(1,2), R(2), N(2,2), R(2),
      ]),
    ]},
  ],
};

// ── MUS_STORE ───────────────────────────────────────────────────────
// F major / 100 BPM / 16 bars / loop / Light shop groove
const MUS_STORE = {
  id: 'MUS_STORE', bpm: 100, bars: 16, loop: true, key: 'F major',
  ch: [
    // LEAD – sparse, friendly melody
    { wave: 'square', vol: 0.5, notes: [
      // Bar 1-4: Gentle opening phrase
      R(8), N(F5,2), N(A5,2), N(C6,4),
      R(4), N(Bb5,2), N(A5,2), N(G5,4), R(4),
      R(8), N(A5,2), N(G5,2), N(F5,4),
      R(4), N(E5,2), N(F5,2), N(G5,4), R(4),
      // Bar 5-8: Echo variation
      R(8), N(C5,2), N(F5,2), N(A5,4),
      R(4), N(G5,2), N(F5,2), N(E5,4), R(4),
      R(8), N(F5,2), N(G5,2), N(A5,4),
      R(4), N(C6,4), N(A5,4), R(4),
      // Bar 9-12
      R(8), N(F5,2), N(A5,2), N(C6,4),
      R(4), N(Bb5,4), N(A5,4), R(4),
      R(8), N(G5,2), N(A5,2), N(Bb5,4),
      R(4), N(A5,2), N(G5,2), N(F5,4), R(4),
      // Bar 13-16: Resolve
      R(4), N(F5,2), N(G5,2), N(A5,4), R(4),
      N(Bb5,2), N(A5,2), N(G5,2), N(F5,2), R(8),
      R(8), N(C5,2), N(F5,2), N(A5,4),
      N(F5,8), R(8),
    ]},
    // HARM
    { wave: 'square25', vol: 0.25, notes: [
      ...Array(16).fill(null).flatMap((_, i) => {
        const chords = [
          [F3,A3,C4], [F3,A3,C4], [Bb3,D4,F4], [C4,E4,G4],
          [F3,A3,C4], [F3,A3,C4], [Bb3,D4,F4], [C4,E4,G4],
          [F3,A3,C4], [D4,F4,A4], [Bb3,D4,F4], [C4,E4,G4],
          [F3,A3,C4], [Bb3,D4,F4], [C4,E4,G4], [F3,A3,C4],
        ];
        const c = chords[i];
        return [N(c[0],4), N(c[1],4), N(c[2],4), N(c[1],4)];
      }),
    ]},
    // BASS – walking bass
    { wave: 'triangle', vol: 0.75, notes: [
      // 16 bars walking bass in F
      N(F3,4), N(A3,4), N(C3,4), N(A3,4),
      N(F3,4), N(G3,4), N(A3,4), N(C4,4),
      N(Bb3,4), N(A3,4), N(G3,4), N(F3,4),
      N(C3,4), N(E3,4), N(G3,4), N(C4,4),
      // 5-8
      N(F3,4), N(A3,4), N(C3,4), N(F3,4),
      N(F3,4), N(E3,4), N(D3,4), N(C3,4),
      N(Bb3,4), N(A3,4), N(G3,4), N(F3,4),
      N(C3,4), N(E3,4), N(G3,4), N(Bb3,4),
      // 9-12
      N(F3,4), N(A3,4), N(C4,4), N(A3,4),
      N(D3,4), N(F3,4), N(A3,4), N(D3,4),
      N(Bb3,4), N(A3,4), N(G3,4), N(F3,4),
      N(C3,4), N(E3,4), N(G3,4), N(C4,4),
      // 13-16
      N(F3,4), N(G3,4), N(A3,4), N(Bb3,4),
      N(Bb3,4), N(A3,4), N(G3,4), N(F3,4),
      N(C3,4), N(E3,4), N(G3,4), N(C4,4),
      N(F3,8), N(C3,4), N(F3,4),
    ]},
    // PERC – light groove
    { wave: 'noise', vol: 0.35, notes: [
      ...Array(16).fill(null).flatMap(() => [
        N(1,4), N(2,4), N(1,2), N(2,2), N(2,4), N(2,4),
      ]),
    ]},
  ],
};

// ── MUS_RIVAL ───────────────────────────────────────────────────────
// A minor / 140 BPM / 2 bars / one-shot / Cheeky sting
const MUS_RIVAL = {
  id: 'MUS_RIVAL', bpm: 140, bars: 2, loop: false, key: 'A minor',
  ch: [
    { wave: 'square', vol: 0.7, notes: [
      N(A4,2), N(C5,2), N(E5,2), N(A5,2), R(2), N(G5,2), N(E5,2), N(C5,2),
      N(A4,2), N(B4,1), N(C5,1), N(D5,2), N(E5,4), R(2), N(A5,4),
    ]},
    { wave: 'square25', vol: 0.4, notes: [
      N(A3,4), N(C4,4), N(E4,4), N(A3,4),
      N(A3,4), N(B3,4), N(C4,4), N(E4,4),
    ]},
    { wave: 'triangle', vol: 0.8, notes: [
      N(A3,4), N(A3,4), N(E3,4), N(A3,4),
      N(A3,4), N(B3,4), N(C3,4), N(A3,4),
    ]},
    { wave: 'noise', vol: 0.5, notes: [
      N(2,2), N(2,2), N(1,4), N(2,2), N(2,2), N(1,4),
      N(2,2), N(2,2), N(1,2), N(2,2), N(1,2), N(2,2), N(1,2), N(2,2),
    ]},
  ],
};

// ── MUS_BATTLE1 ─────────────────────────────────────────────────────
// D minor / 150 BPM / 16 bars / loop / Tense, driving
// Inverted motif: D5 Bb4 A4 D4 (descending minor)
const MUS_BATTLE1 = {
  id: 'MUS_BATTLE1', bpm: 150, bars: 16, loop: true, key: 'D minor',
  ch: [
    // LEAD – anxious, urgent melody
    { wave: 'square', vol: 0.7, notes: [
      // Bar 1-4: Inverted motif → tense response
      N(D5,2), N(Bb4,2), N(A4,2), N(D4,4), R(2), N(E4,2), N(F4,2),
      N(A4,4), N(G4,2), N(F4,2), N(E4,2), N(D4,2), R(4),
      N(D5,2), N(Bb4,2), N(A4,2), N(D4,4), R(2), N(F4,2), N(G4,2),
      N(A4,2), N(Bb4,2), N(A4,2), N(G4,2), N(F4,4), R(4),
      // Bar 5-8: Climbing tension
      N(D4,2), N(F4,2), N(A4,2), N(D5,2), N(C5,2), N(Bb4,2), N(A4,2), N(G4,2),
      N(F4,4), N(E4,2), N(F4,2), N(G4,4), N(A4,4),
      N(Bb4,2), N(A4,2), N(G4,2), N(F4,2), N(E4,2), N(D4,2), R(4),
      N(A4,4), N(D5,4), N(A4,4), R(4),
      // Bar 9-12: Intensity peak
      N(D5,2), N(E5,2), N(F5,2), N(E5,2), N(D5,2), N(C5,2), N(Bb4,2), N(A4,2),
      N(G4,2), N(A4,2), N(Bb4,2), N(C5,2), N(D5,4), R(4),
      N(D5,2), N(Bb4,2), N(A4,2), N(D4,4), R(2), N(F4,2), N(G4,2),
      N(A4,4), N(Bb4,4), N(A4,4), R(4),
      // Bar 13-16: Loop reset
      N(D5,2), N(C5,2), N(Bb4,2), N(A4,2), N(G4,2), N(F4,2), N(E4,2), N(D4,2),
      N(F4,4), N(A4,4), N(D5,4), R(4),
      N(Bb4,2), N(A4,2), N(G4,2), N(F4,2), N(E4,2), N(D4,2), R(4),
      N(D4,4), N(A3,4), N(D4,4), R(4),
    ]},
    // HARM
    { wave: 'square25', vol: 0.3, notes: [
      ...Array(16).fill(null).flatMap((_, i) => {
        const prog = [
          [D4,F4], [D4,F4], [Bb3,D4], [A3,Db4],
          [D4,F4], [D4,F4], [Bb3,D4], [A3,Db4],
          [D4,F4], [G3,Bb3], [Bb3,D4], [A3,Db4],
          [D4,F4], [Bb3,D4], [A3,Db4], [D4,F4],
        ];
        const c = prog[i];
        return [N(c[0],4), N(c[1],4), N(c[0],4), N(c[1],4)];
      }),
    ]},
    // BASS – driving
    { wave: 'triangle', vol: 0.85, notes: [
      ...Array(16).fill(null).flatMap((_, i) => {
        const roots = [D3, D3, Bb3, A3, D3, D3, Bb3, A3,
                       D3, G3, Bb3, A3, D3, Bb3, A3, D3];
        const r = roots[i];
        return [N(r,2), N(r,2), N(r,2), N(r,2), N(r,2), N(r,2), N(r,2), N(r,2)];
      }),
    ]},
    // PERC – driving beat
    { wave: 'noise', vol: 0.6, notes: [
      ...Array(16).fill(null).flatMap(() => [
        N(1,2), N(2,2), N(1,2), N(2,2), N(1,2), N(2,1), N(2,1), N(1,2), N(2,2),
      ]),
    ]},
  ],
};

// ── MUS_BATTLE2 ─────────────────────────────────────────────────────
// D major / 165 BPM / 16 bars / loop / Brighter, extra HARM
const MUS_BATTLE2 = {
  id: 'MUS_BATTLE2', bpm: 165, bars: 16, loop: true, key: 'D major',
  ch: [
    // LEAD – same rhythmic bones as BATTLE1 but major intervals
    { wave: 'square', vol: 0.7, notes: [
      // Bar 1-4
      N(D5,2), N(B4,2), N(A4,2), N(D4,4), R(2), N(E4,2), N(Fs4,2),
      N(A4,4), N(G4,2), N(Fs4,2), N(E4,2), N(D4,2), R(4),
      N(D5,2), N(B4,2), N(A4,2), N(D4,4), R(2), N(Fs4,2), N(G4,2),
      N(A4,2), N(B4,2), N(A4,2), N(G4,2), N(Fs4,4), R(4),
      // Bar 5-8
      N(D4,2), N(Fs4,2), N(A4,2), N(D5,2), N(Cs5,2), N(B4,2), N(A4,2), N(G4,2),
      N(Fs4,4), N(E4,2), N(Fs4,2), N(G4,4), N(A4,4),
      N(B4,2), N(A4,2), N(G4,2), N(Fs4,2), N(E4,2), N(D4,2), R(4),
      N(A4,4), N(D5,4), N(A4,4), R(4),
      // Bar 9-12
      N(D5,2), N(E5,2), N(Fs4,2), N(E5,2), N(D5,2), N(Cs5,2), N(B4,2), N(A4,2),
      N(G4,2), N(A4,2), N(B4,2), N(Cs5,2), N(D5,4), R(4),
      N(D5,2), N(B4,2), N(A4,2), N(D4,4), R(2), N(Fs4,2), N(G4,2),
      N(A4,4), N(B4,4), N(A4,4), R(4),
      // Bar 13-16
      N(D5,2), N(Cs5,2), N(B4,2), N(A4,2), N(G4,2), N(Fs4,2), N(E4,2), N(D4,2),
      N(Fs4,4), N(A4,4), N(D5,4), R(4),
      N(B4,2), N(A4,2), N(G4,2), N(Fs4,2), N(E4,2), N(D4,2), R(4),
      N(D4,4), N(A3,4), N(D4,4), R(4),
    ]},
    // HARM – extra busy layer for brightness
    { wave: 'square25', vol: 0.35, notes: [
      ...Array(16).fill(null).flatMap((_, i) => {
        const prog = [
          [D4,Fs4,A4], [D4,Fs4,A4], [G3,B3,D4], [A3,Cs4,E4],
          [D4,Fs4,A4], [D4,Fs4,A4], [G3,B3,D4], [A3,Cs4,E4],
          [D4,Fs4,A4], [G3,B3,D4], [G3,B3,D4], [A3,Cs4,E4],
          [D4,Fs4,A4], [G3,B3,D4], [A3,Cs4,E4], [D4,Fs4,A4],
        ];
        const c = prog[i];
        // Busier arpeggio pattern
        return [N(c[0],2), N(c[1],2), N(c[2],2), N(c[1],2),
                N(c[0],2), N(c[2],2), N(c[1],2), N(c[0],2)];
      }),
    ]},
    // BASS
    { wave: 'triangle', vol: 0.85, notes: [
      ...Array(16).fill(null).flatMap((_, i) => {
        const roots = [D3, D3, G3, A3, D3, D3, G3, A3,
                       D3, G3, G3, A3, D3, G3, A3, D3];
        const r = roots[i];
        return [N(r,2), N(r,2), N(r,2), N(r,2), N(r,2), N(r,2), N(r,2), N(r,2)];
      }),
    ]},
    // PERC – faster driving beat
    { wave: 'noise', vol: 0.6, notes: [
      ...Array(16).fill(null).flatMap(() => [
        N(1,2), N(2,2), N(1,2), N(2,2), N(1,2), N(2,1), N(2,1), N(1,2), N(2,2),
      ]),
    ]},
  ],
};

// ── MUS_LOSE ────────────────────────────────────────────────────────
// D minor / 90 BPM / 2 bars / one-shot / Descending 3-note sting ~2s
const MUS_LOSE = {
  id: 'MUS_LOSE', bpm: 90, bars: 2, loop: false, key: 'D minor',
  ch: [
    { wave: 'square', vol: 0.65, notes: [
      N(A4,4), N(F4,4), N(D4,8),
      R(16),
    ]},
    { wave: 'square25', vol: 0.35, notes: [
      N(F4,4), N(D4,4), N(A3,8),
      R(16),
    ]},
    { wave: 'triangle', vol: 0.8, notes: [
      N(D3,4), N(D3,4), N(D3,8),
      R(16),
    ]},
    { wave: 'noise', vol: 0.4, notes: [
      N(1,4), R(12),
      R(16),
    ]},
  ],
};

// ── MUS_WIN ─────────────────────────────────────────────────────────
// C major / 140 BPM / 2 bars / one-shot / Short fanfare using motif ~3s
// Motif: C5 E5 G5 C6
const MUS_WIN = {
  id: 'MUS_WIN', bpm: 140, bars: 2, loop: false, key: 'C major',
  ch: [
    { wave: 'square', vol: 0.75, notes: [
      // Chip motif fanfare
      N(C5,2), N(E5,2), N(G5,2), N(C6,6), R(2), N(G5,2),
      N(C6,8), R(8),
    ]},
    { wave: 'square25', vol: 0.4, notes: [
      N(E4,2), N(G4,2), N(C5,2), N(E5,6), R(2), N(C5,2),
      N(E5,8), R(8),
    ]},
    { wave: 'triangle', vol: 0.8, notes: [
      N(C3,4), N(C3,4), N(G3,4), N(C3,4),
      N(C3,8), R(8),
    ]},
    { wave: 'noise', vol: 0.5, notes: [
      N(1,2), N(2,2), N(1,2), N(2,2), N(1,4), N(2,2), R(2),
      N(1,4), R(12),
    ]},
  ],
};

// ── MUS_RESULT ──────────────────────────────────────────────────────
// C major / 110 BPM / 8 bars / loop / Calm, warm, motif softly
const MUS_RESULT = {
  id: 'MUS_RESULT', bpm: 110, bars: 8, loop: true, key: 'C major',
  ch: [
    // LEAD – soft motif
    { wave: 'square', vol: 0.45, notes: [
      // Bar 1-2: Soft motif entrance
      R(4), N(C5,2), N(E5,2), N(G5,2), N(C6,6),
      R(4), N(B4,2), N(C5,2), N(D5,2), N(E5,4), R(2),
      // Bar 3-4
      R(4), N(G5,2), N(E5,2), N(C5,4), R(4),
      R(4), N(D5,2), N(E5,2), N(F5,2), N(E5,4), R(2),
      // Bar 5-6: Gentle variation
      R(4), N(C5,2), N(E5,2), N(G5,2), N(C6,6),
      R(4), N(A5,2), N(G5,2), N(F5,2), N(E5,4), R(2),
      // Bar 7-8: Resolve
      R(4), N(F5,2), N(E5,2), N(D5,4), R(4),
      R(4), N(C5,4), R(4), R(4),
    ]},
    // HARM – warm pads
    { wave: 'square25', vol: 0.2, notes: [
      N(E4,8), N(G4,8),
      N(C4,8), N(E4,8),
      N(A3,8), N(C4,8),
      N(F3,8), N(G3,8),
      N(E4,8), N(G4,8),
      N(C4,8), N(F4,8),
      N(F3,8), N(G3,8),
      N(C4,8), N(E4,8),
    ]},
    // BASS
    { wave: 'triangle', vol: 0.6, notes: [
      N(C3,8), N(G3,8),
      N(A3,8), N(E3,8),
      N(F3,8), N(C3,8),
      N(F3,8), N(G3,8),
      N(C3,8), N(G3,8),
      N(A3,8), N(F3,8),
      N(F3,8), N(G3,8),
      N(C3,8), N(C3,8),
    ]},
    // PERC – very sparse
    { wave: 'noise', vol: 0.25, notes: [
      ...Array(8).fill(null).flatMap(() => [
        N(1,4), R(4), N(2,4), R(4),
      ]),
    ]},
  ],
};

// ── Export ───────────────────────────────────────────────────────────
export const musicCues = {
  MUS_TITLE,
  MUS_STORE,
  MUS_RIVAL,
  MUS_BATTLE1,
  MUS_BATTLE2,
  MUS_LOSE,
  MUS_WIN,
  MUS_RESULT,
};
