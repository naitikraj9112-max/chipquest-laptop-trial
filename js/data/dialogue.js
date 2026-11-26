// js/data/dialogue.js — Exact dialogue text from section 7.2
import { cfg } from '../config.js';

function s(text) {
  return text.replace('{STORE}', cfg.STORE_NAME);
}

export const dialogue = {
  // Intro
  I1: { speaker: 'narrator', text: s('You need a new laptop for the next 4 years.') },
  I2: { speaker: 'narrator', text: s('The store is full of shiny choices.') },
  I3: { speaker: 'narrator', text: s('Choose wisely, trainer!') },

  // Guide
  G1: { speaker: 'PROF. CHIP', text: s('Hey! Welcome to {STORE}!') },
  G2: { speaker: 'PROF. CHIP', text: s("I'm PROF. CHIP. I help people pick a laptop partner.") },
  G3: { speaker: 'PROF. CHIP', text: s("A good partner lasts for years. A bad one doesn't.") },

  // Rival intro
  R1: { speaker: 'ROHAN', text: s("Hey, slowpoke! I'm ROHAN.") },
  R2: { speaker: 'ROHAN', text: s("I'll beat you at everything. Even shopping!") },

  // Guide laptop
  G4: { speaker: 'PROF. CHIP', text: s('Pick your partner from this table!') },
  G5: { speaker: 'PROF. CHIP', text: s("NOVA X? Very shiny! Hmm... we'll see.") },
  R3: { speaker: 'ROHAN', text: s("Ha! Then I'll take AURA GO. Boring? Let's see!") },
  G5b: { speaker: 'PROF. CHIP', text: s("AURA GO! A thoughtful pick. Let's test it.") },
  R3b: { speaker: 'ROHAN', text: s("Fine! I'll take the shiny NOVA X. It's gorgeous!") },

  // Battle 1 setup
  G6: { speaker: 'PROF. CHIP', text: s('Challenge! Both at 40% battery. No charger!') },
  G7: { speaker: 'PROF. CHIP', text: s('Task: video call, clean voice, export a video.') },

  // After battle 1
  R4: { speaker: 'ROHAN', text: s("Ha! Told you! Shiny doesn't win races!") },
  R4b: { speaker: 'ROHAN', text: s('My shiny NOVA X... died?! No way!') },

  G8: { speaker: 'PROF. CHIP', text: s('Hold on, ROHAN. Let me explain, trainer.') },
  G8b: { speaker: 'PROF. CHIP', text: s('Nice win! But do you know WHY it won?') },

  // Explanation
  G9: { speaker: 'PROF. CHIP', text: s('NOVA X looks great. But it has no AI engine.') },
  G10: { speaker: 'PROF. CHIP', text: s('AI jobs run on the main chip. That drains battery.') },
  G11: { speaker: 'PROF. CHIP', text: s('AURA GO has an NPU: a mini chip made for AI.') },
  G12: { speaker: 'PROF. CHIP', text: s('It does AI work with far less power and heat.') },

  // Persona
  G13: { speaker: 'PROF. CHIP', text: s('Now, what kind of trainer are you?') },
  G14s: { speaker: 'PROF. CHIP', text: s('Studying! Then you need long battery and offline AI.') },
  G14c: { speaker: 'PROF. CHIP', text: s('Creating! You need AI power for photos and video.') },
  G14g: { speaker: 'PROF. CHIP', text: s('Gaming! You need smooth frames and cool temps.') },

  Gf1: { speaker: 'PROF. CHIP', text: s('ROHAN, take AURA GO for the rematch.') },
  G15: { speaker: 'PROF. CHIP', text: s('Take AURA PRO: Intel Core Ultra with the Evo badge.') },

  R5: { speaker: 'ROHAN', text: s('Bring it! AURA GO never lets me down!') },

  // Battle 2 intros
  B2s: { speaker: 'PROF. CHIP', text: s('ROUND 2! Exam night. Finish before battery dies!') },
  B2c: { speaker: 'PROF. CHIP', text: s('ROUND 2! Reel deadline. Finish before battery dies!') },
  B2g: { speaker: 'PROF. CHIP', text: s('ROUND 2! Stream night. Finish before battery dies!') },

  // Mid-battle
  W1: { speaker: 'PROF. CHIP', text: s('No internet? AI on your laptop still works!') },
  W2: { speaker: 'PROF. CHIP', text: s('Your files can stay on your laptop.') },

  // After battle 2
  R6: { speaker: 'ROHAN', text: s('What?! You crushed me!') },
  G17: { speaker: 'PROF. CHIP', text: s("That's the power of the right AI PC.") },
  G18: { speaker: 'PROF. CHIP', text: s('CPU is quick. GPU is strong. NPU is efficient.') },
  G19: { speaker: 'PROF. CHIP', text: s('An AI PC uses all three, so it stays fast and cool.') },
  G20: { speaker: 'PROF. CHIP', text: s("Let's scan the competition!") },
  G21: { speaker: 'PROF. CHIP', text: s('Intel Evo laptops are tested for battery and wake.') },
  G22: { speaker: 'PROF. CHIP', text: s("Here's your TRAINER CARD. Show it to the team!") },

  // Battle intro
  BI1: { speaker: 'system', text: s('ROHAN challenges you! Finish before battery dies!') },

  // Store Intel Representatives (fit cleanly on 2 rows of 28 cols)
  REP1_1: { speaker: 'INTEL ALEX', text: s("Hi! I'm ALEX from Intel. Curious about Core Ultra?") },
  REP1_2: { speaker: 'INTEL ALEX', text: s('Core Ultra Series 3 packs CPU, GPU and a 50 TOPS NPU!') },
  REP1_3: { speaker: 'INTEL ALEX', text: s('The NPU runs everyday AI cool while saving battery.') },

  REP2_1: { speaker: 'INTEL PRIYA', text: s("Hey! I'm PRIYA. Look for Core Ultra Evo badges here!") },
  REP2_2: { speaker: 'INTEL PRIYA', text: s('Evo laptops are tested for battery and instant wake.') },
  REP2_3: { speaker: 'INTEL PRIYA', text: s('On-device Core Ultra AI works offline, privately!') },

  REP3_1: { speaker: 'INTEL SAM', text: s("Welcome! I'm SAM from Intel. Pick a Core Ultra tier!") },
  REP3_2: { speaker: 'INTEL SAM', text: s('Core Ultra 5 gives great study stamina & offline AI.') },
  REP3_3: { speaker: 'INTEL SAM', text: s('Core Ultra 7 & X boost creator AI and gaming speed!') },
};
