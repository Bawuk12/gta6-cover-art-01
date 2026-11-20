# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01)](https://make.fun/bounty/gta6-cover-art-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Runs offline](https://img.shields.io/badge/runs-offline-brightgreen.svg)](#how-to-run)

An offline browser studio that turns any photo into GTA-style cover art: the iconic
multi-panel poster with white gutters, a neon Vice City grade, and heavy italic
lettering — exported as a PNG in one click. Built for
[make.fun](https://make.fun/bounty/gta6-cover-art-01)'s "Make GTA 6 Cover Art" bounty.

Drop a photo (or pick one of the three built-in scenes), type a title and a caption,
choose a layout and a grade, and export. Everything runs on the page: no uploads, no
network requests, no libraries — your photo never leaves your machine.

## What it does

- **Any photo**: file picker or drag-and-drop; every panel cover-crops the photo at its
  own focus point, so one picture fills the whole poster.
- **Three layouts**: *Classic panels* (tall hero + two stacked panels over a title
  band), *Full-bleed hero* (one panel, title on a scrim), *Triple stack* (three
  horizontal strips at different crops).
- **Three neon grades**: *Sunset* (magenta → orange), *Midnight* (purple → blue),
  *Golden hour* (amber → red) — each panel also gets a saturation/contrast lift.
- **Genre lettering**: heavy italic capitals with a black keyline, a magenta-to-gold
  rule, and the caption in gold.
- **Three export sizes**: square 1080 × 1080, wide 1280 × 720, portrait 1080 × 1350.
- **Deterministic render**: same photo and settings, same pixels — no randomness in
  the render path, so previews, screenshots and exports always match.
- **No photo handy?** Three original synthwave scenes ship with the studio (pier,
  boulevard, marina), and even with no photo at all the cover falls back to a built-in
  sunset scene instead of going blank.

## How to run

Requires Node.js 22 or later. No install, no build step.

```sh
node serve.ts            # serves app/ at http://localhost:8080
node serve.ts --port 8099
```

Hand-in (copies `app/` and `screenshots/` to the output dir and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

| File | What it is |
| --- | --- |
| `main.ts` | Hand-in program: copies `app/` + `screenshots/` to `/output`, writes `dossier.json` |
| `serve.ts` | Tiny static server for trying the studio locally (Node stdlib only) |
| `app/index.html` | The studio page: photo drop zone, scene buttons, title/caption, layout/grade/size pickers |
| `app/style.css` | Dark neon studio theme; `body.shot-cover` shows the cover alone for screenshots |
| `app/src/cover.js` | The render engine: layouts, grades, panels, title band (`drawCover`, `SIZES`) |
| `app/src/main.js` | Page wiring: photo loading, drag-and-drop, live preview, PNG export |
| `app/src/shots.js` | Fixed screenshot scenes (`?shot=cover\|editor&photo=…&title=…`) |
| `app/samples/*.jpg` | Three original synthwave sample scenes (pier, boulevard, marina) |
| `screenshots/*.jpg` | The studio and its covers, as handed in |
| `vendor/makefun-app.ts` | make.fun's browser-app library (dossier builder), copied byte for byte |

## Screenshots

| File | Scene |
| --- | --- |
| `screenshots/1-cover.jpg` | Classic panels · pier · Sunset — "Vice City / Sunset Heist" |
| `screenshots/2-editor.jpg` | The studio itself, boulevard scene loaded |
| `screenshots/3-cover.jpg` | Triple stack · marina · Golden hour — "Marina Nights / Golden Hour" |
| `screenshots/4-cover.jpg` | Full-bleed hero · boulevard · Midnight, wide — "Neon District / Midnight Run" |

## Licence

MIT — see [LICENSE](LICENSE). The sample scenes and all code in this repository are
original work made for this entry; `vendor/makefun-app.ts` is make.fun's own library,
included as the bounty requires.

---

Built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty. Want to make
something (and maybe win) too? Start here: https://make.fun/?ref=0br80kvj
