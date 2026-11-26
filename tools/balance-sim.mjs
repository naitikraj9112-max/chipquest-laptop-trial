// tools/balance-sim.mjs — Battle balance simulator (section 8.8)
// Run with: node tools/balance-sim.mjs
// Must assert I1-I5 and exit non-zero on failure.

const laptops = {
  nova: {
    profile: 'LEGACY',
    multipliers: {
      AI_HEAVY: { prog: 1.0, batt: 1.0, heat: 1.0 },
      AI_LIGHT: { prog: 1.0, batt: 1.0, heat: 1.0 },
      GFX:      { prog: 1.0, batt: 1.0, heat: 1.0 },
      CPU:      { prog: 1.0, batt: 1.0, heat: 1.0 },
    }
  },
  aura_go: {
    profile: 'GO',
    multipliers: {
      AI_HEAVY: { prog: 0.7,  batt: 0.85, heat: 0.8 },
      AI_LIGHT: { prog: 1.0,  batt: 0.35, heat: 0.25 },
      GFX:      { prog: 1.0,  batt: 0.60, heat: 0.6 },
      CPU:      { prog: 1.0,  batt: 0.70, heat: 0.7 },
    }
  },
  aura_pro: {
    profile: 'PRO',
    multipliers: {
      AI_HEAVY: { prog: 1.2,  batt: 0.40, heat: 0.35 },
      AI_LIGHT: { prog: 1.0,  batt: 0.30, heat: 0.20 },
      GFX:      { prog: 1.15, batt: 0.50, heat: 0.5 },
      CPU:      { prog: 1.1,  batt: 0.60, heat: 0.6 },
    }
  }
};

const battle1Moves = {
  M1: { type: 'AI_LIGHT', base: { prog: 18, batt: 12, heat: 25 } },
  M2: { type: 'AI_LIGHT', base: { prog: 16, batt: 10, heat: 22 } },
  M3: { type: 'GFX',      base: { prog: 22, batt: 14, heat: 30 } },
  M4: { type: 'AI_LIGHT', base: { prog: 14, batt: 9,  heat: 20 } },
};

const battle2Moves = {
  M1: { type: 'AI_HEAVY', base: { prog: 20, batt: 15, heat: 30 } },
  M2: { type: 'AI_HEAVY', base: { prog: 20, batt: 14, heat: 28 } },
  M3: { type: 'GFX',      base: { prog: 20, batt: 12, heat: 22 } },
  M4: { type: 'CPU',      base: { prog: 20, batt: 9,  heat: 16 } },
};

function simulateMove(actor, laptop, move) {
  const mult = laptop.multipliers[move.type];
  const throttle = actor.heat >= 60 ? 0.7 : 1;
  const prog = Math.round(move.base.prog * mult.prog * throttle);
  const batt = Math.ceil(move.base.batt * mult.batt);
  const heat = Math.round(move.base.heat * mult.heat);
  actor.task = Math.min(100, actor.task + prog);
  actor.batt = Math.max(0, actor.batt - batt);
  actor.heat = Math.min(100, actor.heat + heat);
  // Rule 4: completion checked BEFORE faint (section 8.3)
  const completed = actor.task >= 100;
  const fainted = !completed && actor.batt <= 0;
  return { prog, batt, heat, completed, fainted };
}

function simulateBattle(playerLaptopId, rivalLaptopId, moves, startBatt, playerScript, rivalScript) {
  const player = { task: 0, batt: startBatt, heat: 0 };
  const rival = { task: 0, batt: startBatt, heat: 0 };
  const pLaptop = laptops[playerLaptopId];
  const rLaptop = laptops[rivalLaptopId];
  let turn = 0;
  let winner = null;

  for (turn = 0; turn < 20 && !winner; turn++) {
    // Player acts
    const pMove = moves[playerScript[turn % playerScript.length]];
    const pResult = simulateMove(player, pLaptop, pMove);
    if (pResult.completed) { winner = 'player'; break; }
    if (pResult.fainted) { winner = 'rival'; break; }

    // Rival acts
    if (turn < rivalScript.length) {
      const rMove = moves[rivalScript[turn]];
      const rResult = simulateMove(rival, rLaptop, rMove);
      if (rResult.completed) { winner = 'rival'; break; }
      if (rResult.fainted) { winner = 'player'; break; }
    }

    // End of turn cooling
    player.heat = Math.max(0, player.heat - 5);
    rival.heat = Math.max(0, rival.heat - 5);
  }

  return { winner, turn: turn + 1, player, rival };
}

// Generate all possible 4-move sequences of length n
function* allSequences(length, moveIds) {
  if (length === 0) { yield []; return; }
  for (const id of moveIds) {
    for (const rest of allSequences(length - 1, moveIds)) {
      yield [id, ...rest];
    }
  }
}

let pass = 0;
let fail = 0;

function assert(id, condition, msg) {
  if (condition) {
    console.log(`  ✅ ${id}: ${msg}`);
    pass++;
  } else {
    console.error(`  ❌ ${id}: ${msg}`);
    fail++;
  }
}

console.log('=== CHIPQUEST Balance Simulator ===\n');

// I1: BATTLE1, LEGACY can never reach TASK 100 for any move sequence
console.log('I1: LEGACY can never complete in BATTLE1...');
{
  const moveIds = ['M1', 'M2', 'M3', 'M4'];
  let legacyEverCompletes = false;
  for (const seq of allSequences(6, moveIds)) {
    const actor = { task: 0, batt: 40, heat: 0 };
    const laptop = laptops.nova;
    let completed = false;
    for (const id of seq) {
      const move = battle1Moves[id];
      const r = simulateMove(actor, laptop, move);
      if (r.completed) { completed = true; break; }
      if (r.fainted) break;
      actor.heat = Math.max(0, actor.heat - 5);
    }
    if (completed) { legacyEverCompletes = true; break; }
  }
  assert('I1', !legacyEverCompletes, 'LEGACY never reaches TASK 100');
}

// I2: BATTLE1, GO reaches TASK 100 for any move sequence without shutting down
// Test with up to 8 turns (more than any real battle would last)
console.log('I2: GO always completes in BATTLE1 (up to 8 turns)...');
{
  const moveIds = ['M1', 'M2', 'M3', 'M4'];
  let goAlwaysCompletes = true;
  let goNeverFaints = true;
  // Test all 4^6 sequences over 6 turns
  for (const seq of allSequences(6, moveIds)) {
    const actor = { task: 0, batt: 40, heat: 0 };
    const laptop = laptops.aura_go;
    let completed = false;
    let fainted = false;
    // Allow up to 8 uses of the sequence (repeating) to show it always completes eventually
    for (let t = 0; t < 8; t++) {
      const move = battle1Moves[seq[t % seq.length]];
      const r = simulateMove(actor, laptop, move);
      if (r.completed) { completed = true; break; }
      if (r.fainted) { fainted = true; break; }
      actor.heat = Math.max(0, actor.heat - 5);
    }
    if (fainted) { goNeverFaints = false; break; }
    if (!completed) { goAlwaysCompletes = false; break; }
  }
  assert('I2a', goNeverFaints, 'GO never faints (battery survives all sequences)');
  assert('I2b', goAlwaysCompletes, 'GO completes within 8 turns for all sequences');
}

// I3: Main path: LEGACY player shuts down by turn 5, before rival finishes (turn 6)
console.log('I3: Main path LEGACY shuts down by turn 5...');
{
  const rivalScript = ['M1', 'M2', 'M4', 'M3', 'M1', 'M2'];
  const moveIds = ['M1', 'M2', 'M3', 'M4'];
  let legacyAlwaysFaintsByT5 = true;
  for (const seq of allSequences(5, moveIds)) {
    const result = simulateBattle('nova', 'aura_go', battle1Moves, 40, seq, rivalScript);
    if (result.winner !== 'rival' || result.turn > 5) {
      // Check if legacy hasn't fainted
      const actor = { task: 0, batt: 40, heat: 0 };
      const laptop = laptops.nova;
      let faintTurn = -1;
      for (let t = 0; t < 5; t++) {
        const move = battle1Moves[seq[t % seq.length]];
        simulateMove(actor, laptop, move);
        if (actor.batt <= 0 && actor.task < 100) { faintTurn = t + 1; break; }
        actor.heat = Math.max(0, actor.heat - 5);
      }
      if (faintTurn < 0 || faintTurn > 5) {
        legacyAlwaysFaintsByT5 = false;
        break;
      }
    }
  }
  assert('I3', legacyAlwaysFaintsByT5, 'LEGACY faint by turn 5');
}

// I4: BATTLE2: AURA PRO completes by turn 5 for any move sequence
console.log('I4: AURA PRO completes by turn 5 in BATTLE2...');
{
  const moveIds = ['M1', 'M2', 'M3', 'M4'];
  let proAlwaysCompletes = true;
  for (const seq of allSequences(5, moveIds)) {
    const actor = { task: 0, batt: 50, heat: 0 };
    const laptop = laptops.aura_pro;
    let completed = false;
    for (let t = 0; t < 5; t++) {
      const move = battle2Moves[seq[t]];
      const r = simulateMove(actor, laptop, move);
      if (r.completed) { completed = true; break; }
      if (r.fainted) break;
      actor.heat = Math.max(0, actor.heat - 5);
    }
    if (!completed) { proAlwaysCompletes = false; break; }
  }
  assert('I4', proAlwaysCompletes, 'PRO always completes by turn 5');
}

// I5: BATTLE2: rival TASK <= 62 when player completes
console.log('I5: Rival TASK <= 62 when PRO completes...');
{
  const rivalScript = ['M1', 'M2', 'M1', 'M3', 'M2', 'M4'];
  const rival = { task: 0, batt: 50, heat: 0 };
  const rLaptop = laptops.aura_go;

  // Simulate 4 rival turns (PRO completes on turn 5, so rival gets 4 turns)
  for (let t = 0; t < 4; t++) {
    const move = battle2Moves[rivalScript[t]];
    simulateMove(rival, rLaptop, move);
    rival.heat = Math.max(0, rival.heat - 5);
  }
  assert('I5', rival.task <= 62, `Rival TASK is ${rival.task} (expected <= 62)`);
}

console.log(`\n=== Results: ${pass} passed, ${fail} failed ===`);
process.exit(fail > 0 ? 1 : 0);
