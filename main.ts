// Vice Cover Studio — hand-in program for make.fun's gta6-cover-art-01 bounty.
//
// The studio itself is the static web app under app/ (index.html + style.css + src/*.js +
// samples/*.jpg). This program hands it in: it copies app/ and screenshots/ from this
// repository into /output and writes /output/dossier.json with buildDossier from
// vendor/makefun-app.ts (make.fun's own browser-app library, copied byte for byte).
//
// Node 22+, standard library only, erasable TypeScript: `node main.ts` just runs it.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });

// The app, exactly as it ships: static files only, no network requests, no build step.
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });

// The screenshots that show it working (the first by name is the cover).
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The dossier the judge reads: a contact sheet of the screenshots plus an outline of the
// source. The caps are the scorer's own (reference/gate.json): text_max_bytes shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4 screenshots or one
// over 256 KiB, more than 993 files in app/ or 48 MiB of app files in all, or a path under
// app/ over 1000 bytes (app/ counts beside /output's own 1000-entry cap, its screenshots/
// and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`Vice Cover Studio handed in: app/ + screenshots/ + dossier.json -> ${out}`);
