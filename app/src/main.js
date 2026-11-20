// Vice Cover Studio — page wiring.
//
// Everything happens on this page: the photo is read locally (file picker or
// drag-and-drop), the cover is painted by ./cover.js, and Export downloads a PNG.
// No network requests, no uploads, no libraries. A `?shot=` query switches to a fixed
// screenshot scene instead (./shots.js); otherwise the pier sample loads by default.

import { SIZES, drawCover } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const drop = document.getElementById('drop');
const fileInput = document.getElementById('photo');
const titleInput = document.getElementById('title');
const captionInput = document.getElementById('caption');
const layoutSelect = document.getElementById('layout');
const gradeSelect = document.getElementById('grade');
const sizeSelect = document.getElementById('size');
const status = document.getElementById('status');
const sampleButtons = [...document.querySelectorAll('.sample')];

let photo = null;
let activeSample = null;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Repaints the cover from the current controls. */
function redraw() {
  const [w, h] = SIZES[sizeSelect.value] ?? SIZES.square;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  drawCover(canvas, photo, {
    title: titleInput.value,
    caption: captionInput.value,
    layout: layoutSelect.value,
    grade: gradeSelect.value,
  });
}

/** Marks which sample button (if any) is the current photo. */
function markSample(name) {
  activeSample = name;
  for (const b of sampleButtons) b.classList.toggle('active', b.dataset.sample === name);
}

/** Loads one of the built-in sample scenes. */
async function loadSample(name) {
  photo = await loadImage(`samples/${name}.jpg`);
  markSample(name);
  redraw();
}

/** Loads a user photo file (picker or drop). The file never leaves the browser. */
async function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    status.textContent = 'That file is not an image — try a JPG or PNG photo.';
    return;
  }
  try {
    photo = await loadImage(URL.createObjectURL(file));
    markSample(null);
    redraw();
    status.textContent = `Photo loaded: ${file.name}. Tweak the title, then export.`;
  } catch {
    status.textContent = 'That photo could not be read — try another file.';
  }
}

// --- controls ---------------------------------------------------------------

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});
fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));

for (const type of ['dragenter', 'dragover']) {
  drop.addEventListener(type, (e) => {
    e.preventDefault();
    drop.classList.add('over');
  });
}
for (const type of ['dragleave', 'drop']) {
  drop.addEventListener(type, (e) => {
    e.preventDefault();
    drop.classList.remove('over');
  });
}
drop.addEventListener('drop', (e) => loadFile(e.dataTransfer.files[0]));

for (const b of sampleButtons) {
  b.addEventListener('click', async () => {
    await loadSample(b.dataset.sample);
    status.textContent = `Sample scene: ${b.textContent}. Your move — title, layout, grade.`;
  });
}

for (const el of [titleInput, captionInput]) el.addEventListener('input', redraw);
for (const el of [layoutSelect, gradeSelect, sizeSelect]) el.addEventListener('change', redraw);

document.getElementById('export').addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${canvas.width}x${canvas.height}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    status.textContent = `Saved vice-cover-${canvas.width}x${canvas.height}.png — share it anywhere.`;
  }, 'image/png');
});

// --- boot -------------------------------------------------------------------

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, {
    loadSample,
    setTitle: (v) => { titleInput.value = v; },
    setCaption: (v) => { captionInput.value = v; },
    setLayout: (v) => { layoutSelect.value = v; },
    setGrade: (v) => { gradeSelect.value = v; },
    setSize: (v) => { sizeSelect.value = v; },
    redraw,
  });
} else {
  loadSample('pier')
    .then(() => { status.textContent = 'Pier scene loaded. Drop your own photo, or start styling.'; })
    .catch(() => { redraw(); status.textContent = 'Drop a photo to begin.'; });
}
