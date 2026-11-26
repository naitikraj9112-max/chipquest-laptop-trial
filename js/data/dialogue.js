// js/data/dialogue.js — Dialogue text with live {STORE} and {NAME} substitution
import { cfg } from '../config.js';
import { state } from '../core/state.js';

function s(speaker, template) {
  return {
    speaker,
    get text() {
      const name = state.playerName || 'ASH';
      return template.replace(/\{STORE\}/g, cfg.STORE_NAME).replace(/\{NAME\}/g, name);
    }
  };
}

export const dialogue = {
  // Intro
  I1: s('narrator', 'You need a new laptop for the next 4 years.'),
  I2: s('narrator', 'The store is full of shiny choices.'),
  I3: s('narrator', 'Choose wisely, trainer!'),

  // Guide + Pokemon-style name registration
  G1:     s('PROF. CHIP', 'Hey! Welcome to {STORE}!'),
  G2_ASK: s('PROF. CHIP', "I'm PROF. CHIP! Wait - what is your name?"),
  G2:     s('PROF. CHIP', 'Nice to meet you, {NAME}! Let us pick your laptop.'),
  G3:     s('PROF. CHIP', "A good partner lasts for years. A bad one doesn't."),

  // Rival intro
  R1: s('ROHAN', 'Hey, {NAME}! I am ROHAN!'),
  R2: s('ROHAN', "I'll beat you at everything. Even shopping!"),

  // Guide laptop
  G4:  s('PROF. CHIP', 'Pick your partner from this table, {NAME}!'),
  G5:  s('PROF. CHIP', "NOVA X? Very shiny, {NAME}! Hmm... we'll see."),
  R3:  s('ROHAN', "Ha! Then I'll take AURA GO. Boring? Let's see!"),
  G5b: s('PROF. CHIP', 'AURA GO! A thoughtful pick, {NAME}. Let us test it.'),
  R3b: s('ROHAN', "Fine! I'll take the shiny NOVA X. It's gorgeous!"),

  // Battle 1 setup
  G6: s('PROF. CHIP', 'Challenge! Both at 40% battery. No charger!'),
  G7: s('PROF. CHIP', 'Task: video call, clean voice, export a video.'),

  // After battle 1
  R4:  s('ROHAN', "Ha! Told you, {NAME}! Shiny doesn't win races!"),
  R4b: s('ROHAN', 'My shiny NOVA X... died?! No way, {NAME}!'),

  G8:  s('PROF. CHIP', 'Hold on, ROHAN. Let me explain, {NAME}.'),
  G8b: s('PROF. CHIP', 'Nice win, {NAME}! But do you know WHY it won?'),

  // Explanation
  G9:  s('PROF. CHIP', 'NOVA X looks great. But it has no AI engine.'),
  G10: s('PROF. CHIP', 'AI jobs run on the main chip. That drains battery.'),
  G11: s('PROF. CHIP', 'AURA GO has an NPU: a mini chip made for AI.'),
  G12: s('PROF. CHIP', 'It does AI work with far less power and heat.'),

  // Persona
  G13:  s('PROF. CHIP', 'Now {NAME}, what kind of trainer are you?'),
  G14s: s('PROF. CHIP', 'Studying! Then you need long battery and offline AI.'),
  G14c: s('PROF. CHIP', 'Creating! You need AI power for photos and video.'),
  G14g: s('PROF. CHIP', 'Gaming! You need smooth frames and cool temps.'),

  Gf1: s('PROF. CHIP', 'ROHAN, take AURA GO for the rematch.'),
  G15: s('PROF. CHIP', 'Take AURA PRO: Core Ultra Series 3 (50 TOPS NPU, Evo)!'),

  R5: s('ROHAN', 'Bring it, {NAME}! AURA GO never lets me down!'),

  // Battle 2 intros
  B2s: s('PROF. CHIP', 'ROUND 2, {NAME}! Exam night. Finish before battery dies!'),
  B2c: s('PROF. CHIP', 'ROUND 2, {NAME}! Reel deadline. Finish before battery dies!'),
  B2g: s('PROF. CHIP', 'ROUND 2, {NAME}! Stream night. Finish before battery dies!'),

  // Mid-battle
  W1: s('PROF. CHIP', 'No internet? AI on your laptop still works!'),
  W2: s('PROF. CHIP', 'Your files can stay on your laptop.'),

  // After battle 2
  R6:  s('ROHAN', 'What?! You crushed me, {NAME}!'),
  G17: s('PROF. CHIP', "That's the power of the right AI PC."),
  G18: s('PROF. CHIP', 'CPU is quick. GPU is strong. NPU is efficient.'),
  G19: s('PROF. CHIP', 'An AI PC uses all three, so it stays fast and cool.'),
  G20: s('PROF. CHIP', "Let's scan the competition!"),
  G21: s('PROF. CHIP', 'Intel Evo laptops are tested for battery and wake.'),
  G22: s('PROF. CHIP', "Here is {NAME}'s TRAINER CARD. Show it to the team!"),

  // Post-PCDEX prompt into the new Gym Room
  G22_GYM: s('PROF. CHIP', 'PRO GYM OPEN, {NAME}! Walk NORTH through the Gym Door!'),

  // Gym Level Sequences
  GYM_ENTER_1:   s('GYM JUDGE', 'Yo, {NAME}! Welcome to the INTEL PRO ARENA GYM!'),
  GYM_ENTER_2:   s('GYM JUDGE', 'ROHAN waits north with an AMD rival. Defeat him!'),
  GYM_RIVAL_1:   s('ROHAN', 'Welcome to my Gym turf, {NAME}! Time for our real match!'),
  GYM_JUDGE_TIP: s('GYM JUDGE', 'Walk north up the red carpet to challenge ROHAN!'),
  GYM_WIN_G1:    s('GYM JUDGE', 'CHAMPION {NAME}! Intel Core Ultra ruled the Gym!'),
  GYM_WIN_G2:    s('PROF. CHIP', 'Intel 18A, NPU 5 & Evo outlasted the AMD rival!'),
  GYM_WIN_G3:    s('PROF. CHIP', "You won the GYM BADGE, {NAME}! View your Trainer Card!"),

  // Battle intro
  BI1: s('system', 'ROHAN challenges {NAME}! Finish before battery dies!'),

  // Store Intel Representatives (real 2026 Intel Core Ultra Series 3 / Core Series 3 specs)
  REP1_1: s('INTEL ALEX', "Hi! I'm ALEX from Intel. Curious about Core Ultra?"),
  REP1_2: s('INTEL ALEX', 'Core Ultra Series 3 uses Intel 18A, up to 16 cores & NPU 5!'),
  REP1_3: s('INTEL ALEX', '50 NPU TOPS + Arc B390 12 Xe3 run local AI cool & fast!'),

  REP2_1: s('INTEL PRIYA', "Hey! I'm PRIYA. Look for Core Ultra Evo badges here!"),
  REP2_2: s('INTEL PRIYA', 'ThinkPad X9-15p Aura & Acer TravelMate P6 run Series 3!'),
  REP2_3: s('INTEL PRIYA', 'On-device OpenVINO / WinML AI works offline, privately!'),

  REP3_1: s('INTEL SAM', "Welcome! I'm SAM from Intel. Pick your AI PC tier!"),
  REP3_2: s('INTEL SAM', 'Study: Yoga Slim 7 Ultra (Core Ultra) or Core 5 320 (17 TOPS).'),
  REP3_3: s('INTEL SAM', 'Create/Game: Ultra X9 388H (5.1GHz, Xe3) or 200HX + dGPU!'),
};
