# CHIPQUEST: The Laptop Trial 🎮

An 8-bit pixel RPG that teaches players about Intel AI PCs, NPUs, and the Evo badge — all inside a ~3 minute playthrough set in an electronics store.

## Play Now

Open `index.html` in any modern browser, or deploy to any static hosting (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

### Local Development
```bash
python -m http.server 8080
# Open http://localhost:8080
```

## Controls

| Input | Keyboard | Touch |
|-------|----------|-------|
| Move | Arrow keys / WASD | D-pad |
| Confirm / Talk | Z / Enter / Space | A button / tap canvas |
| Cancel / Back | X / Escape | B button |
| Mute | M | 🔊 button |
| Fullscreen | — | ⛶ button |

## Game Flow

1. **Title** → Tap to start
2. **Intro** → Storefront establishing shot + narrator text
3. **Store** → Walk around, meet PROF. CHIP and rival ROHAN, pick a laptop
4. **Battle 1** → Legacy vs AI-ready laptop at 40% battery
5. **Persona** → Choose: Student / Creator / Gamer
6. **Battle 2** → AURA PRO vs AURA GO with Wi-Fi drop event
7. **PC-Dex** → Scan 5 competitor platforms
8. **Result** → Trainer Card with persona-specific recommendations

## Tech Stack

- **Vanilla JS** ES modules — no bundler, no framework
- **HTML5 Canvas 2D** at 240×160 logical resolution
- **WebAudio API** — procedural 8-bit music & SFX
- **16-color palette** — all art is procedurally generated
- **Google Font** "Press Start 2P" — only external asset
- **Deterministic battles** — no RNG

## Project Structure

```
index.html          — HTML shell
css/style.css       — Styling + touch controls
js/
  config.js         — Shared constants (palette, timings)
  core/             — Game loop, input, state, scene manager
  art/              — Sprite system, tiles, UI helpers, FX
  audio/            — WebAudio music cues + SFX
  battle/           — Deterministic battle engine + UI
  data/             — Dialogue, laptops, moves, claims
  scenes/           — 7 game scenes (title→result)
  world/            — Tilemap, entities, camera, dialogue, scripts
tools/
  balance-sim.mjs   — Balance invariant checker (I1–I5)
  validate.js       — Syntax validator for all JS files
```

## Balance Invariants

Run `node tools/balance-sim.mjs` to verify:
- **I1**: LEGACY can never complete BATTLE1
- **I2**: GO always completes BATTLE1 (≤8 turns, never faints)
- **I3**: Main-path LEGACY shuts down by turn 5
- **I4**: AURA PRO completes BATTLE2 by turn 5
- **I5**: Rival TASK ≤ 62 when PRO completes

## Dev URL Parameters

- `?scene=STORE` — Jump to a specific scene
- `?debug=1` — Show FPS counter
- `?persona=gamer` — Pre-set persona
- `?starter=nova` — Pre-set starter laptop
- `?mute=1` — Start muted

## License

Built for Intel promotional use. All art, music, and code are original.
No Nintendo/Pokémon assets, names, or IP.
