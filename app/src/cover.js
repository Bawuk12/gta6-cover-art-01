// Vice Cover Studio — the cover render engine.
//
// drawCover(canvas, photo, { title, caption, layout, grade }) paints one GTA-style
// cover onto a canvas already sized from SIZES: photo panels with white gutters, a neon
// Vice City grade over every panel, and a title band in heavy italic capitals with a
// black keyline. The render is fully deterministic — same inputs, same pixels, every
// time (no Math.random anywhere in the render path), so screenshots and exports match.
//
// Layouts:
//   classic — a tall hero panel on the left, two stacked panels on the right,
//             all above the title band (the iconic box-art grid).
//   hero    — one full-bleed panel, title band overlaid on a scrim.
//   stack   — three horizontal strips of the photo at different crops.
// Grades (neon gradient overlays): sunset (magenta -> orange), midnight
// (purple -> blue), golden (amber -> red).

export const SIZES = {
  square: [1080, 1080],
  wide: [1280, 720],
  portrait: [1080, 1350],
};

const GRADES = {
  sunset: ['#ff2e88', '#ff8a3c'],
  midnight: ['#7b2ff7', '#1e8bff'],
  golden: ['#ffb347', '#e63b2e'],
};

const GUTTER = '#ffffff';
const BAND = '#160a26';
const KEYLINE = '#0a0512';
const GOLD = '#ffc857';
const INK = '#ffffff';

/** Draws `photo` (an image, or null for the built-in fallback scene) cover-cropped
 *  into the rect (x, y, w, h), anchored at focus point (fx, fy) in 0..1. */
function drawPhotoCover(ctx, photo, x, y, w, h, fx, fy) {
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) * fx;
  const dy = y + (h - dh) * fy;
  ctx.filter = 'saturate(1.38) contrast(1.12) brightness(1.03)';
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.filter = 'none';
}

/** The fallback scene when no photo is loaded: a fixed synthwave sunset — gradient sky,
 *  striped sun, skyline silhouette — so the cover is never blank or broken. */
function drawFallbackScene(ctx, x, y, w, h, grade) {
  const [c1, c2] = GRADES[grade] ?? GRADES.sunset;
  const sky = ctx.createLinearGradient(x, y, x, y + h);
  sky.addColorStop(0, '#2a1052');
  sky.addColorStop(0.55, c1);
  sky.addColorStop(1, c2);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  // Striped sun, low over the skyline.
  const sunR = Math.min(w, h) * 0.26;
  const sunX = x + w * 0.5;
  const sunY = y + h * 0.62;
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c1;
  for (let i = 0; i < 4; i++) {
    const sy = sunY + sunR * (0.08 + i * 0.22);
    ctx.fillRect(sunX - sunR, sy, sunR * 2, sunR * (0.05 + i * 0.03));
  }

  // Skyline silhouette (fixed building widths/heights, as fractions of the panel).
  const base = y + h;
  const buildings = [
    [0.00, 0.10, 0.30], [0.09, 0.07, 0.42], [0.15, 0.09, 0.24], [0.23, 0.06, 0.50],
    [0.28, 0.10, 0.34], [0.37, 0.07, 0.46], [0.43, 0.09, 0.28], [0.51, 0.06, 0.40],
    [0.56, 0.10, 0.32], [0.65, 0.07, 0.48], [0.71, 0.09, 0.26], [0.79, 0.06, 0.44],
    [0.84, 0.08, 0.30], [0.91, 0.09, 0.38],
  ];
  ctx.fillStyle = '#12061f';
  for (const [bx, bw, bh] of buildings) {
    ctx.fillRect(x + w * bx, base - h * bh * 0.45, w * bw, h * bh * 0.45);
  }
  ctx.fillRect(x, base - h * 0.06, w, h * 0.06);
}

/** Paints one graded panel: photo (or fallback scene), neon grade overlay, a soft
 *  bottom scrim for depth, and the white border that forms the poster gutters. */
function drawPanel(ctx, photo, x, y, w, h, fx, fy, grade, borderW) {
  const [c1, c2] = GRADES[grade] ?? GRADES.sunset;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  if (photo && photo.naturalWidth > 0) {
    drawPhotoCover(ctx, photo, x, y, w, h, fx, fy);
  } else {
    drawFallbackScene(ctx, x, y, w, h, grade);
  }

  // Neon grade: a diagonal two-stop wash blended over the photo.
  const wash = ctx.createLinearGradient(x, y, x + w, y + h);
  wash.addColorStop(0, c1);
  wash.addColorStop(1, c2);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.65;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // Gentle bottom scrim so panels sit into the poster.
  const scrim = ctx.createLinearGradient(x, y + h * 0.55, x, y + h);
  scrim.addColorStop(0, 'rgba(10, 4, 24, 0)');
  scrim.addColorStop(1, 'rgba(10, 4, 24, 0.35)');
  ctx.fillStyle = scrim;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  ctx.strokeStyle = GUTTER;
  ctx.lineWidth = borderW;
  ctx.strokeRect(x + borderW / 2, y + borderW / 2, w - borderW, h - borderW);
}

/** Fits `text` into maxWidth by shrinking from startSize; returns the font size used. */
function fitFontSize(ctx, text, weight, style, startSize, maxWidth) {
  let size = startSize;
  const set = () => { ctx.font = `${style} ${weight} ${size}px "Arial Black", "Archivo Black", system-ui, sans-serif`; };
  set();
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    set();
  }
  return size;
}

/** The title band: heavy italic capitals with a black keyline, a magenta-to-gold rule,
 *  and the caption in gold beneath. Drawn inside the rect (x, y, w, h). */
function drawTitleBand(ctx, x, y, w, h, title, caption) {
  const titleText = (title || '').trim().toUpperCase();
  const captionText = (caption || '').trim().toUpperCase();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleSize = fitFontSize(ctx, titleText || 'VICE CITY', 900, 'italic', h * 0.46, w * 0.92);
  const titleY = y + h * 0.40;
  if (titleText) {
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = KEYLINE;
    ctx.lineWidth = Math.max(3, titleSize * 0.17);
    ctx.strokeText(titleText, x + w / 2, titleY);
    ctx.fillStyle = INK;
    ctx.fillText(titleText, x + w / 2, titleY);
  }

  // The magenta-to-gold rule, sized to the title.
  const ruleW = Math.min(w * 0.92, Math.max(w * 0.3, ctx.measureText(titleText || 'VICE CITY').width * 0.98));
  const rule = ctx.createLinearGradient(x + (w - ruleW) / 2, 0, x + (w + ruleW) / 2, 0);
  rule.addColorStop(0, '#ff2e88');
  rule.addColorStop(0.55, '#ff8a3c');
  rule.addColorStop(1, GOLD);
  ctx.fillStyle = rule;
  ctx.fillRect(x + (w - ruleW) / 2, y + h * 0.66, ruleW, Math.max(3, h * 0.022));

  if (captionText) {
    const capSize = fitFontSize(ctx, captionText, 800, 'italic', h * 0.17, w * 0.9);
    ctx.font = `italic 800 ${capSize}px "Arial Black", "Archivo Black", system-ui, sans-serif`;
    ctx.fillStyle = GOLD;
    ctx.fillText(captionText, x + w / 2, y + h * 0.84);
  }

  // Micro credit in the corner — the studio's signature on every cover.
  const micro = Math.max(11, h * 0.055);
  ctx.font = `700 ${micro}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText('VICE COVER STUDIO', x + w - h * 0.12, y + h - micro * 0.9);
  ctx.textAlign = 'center';
}

/**
 * Draws one complete cover onto `canvas` (already sized from SIZES).
 * `photo` is an image element or null. Options: title, caption,
 * layout ('classic' | 'hero' | 'stack'), grade ('sunset' | 'midnight' | 'golden').
 */
export function drawCover(canvas, photo, options = {}) {
  const { title = 'Vice City', caption = '', layout = 'classic', grade = 'sunset' } = options;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const g = Math.max(8, Math.round(Math.min(W, H) * 0.018));
  const borderW = Math.max(4, Math.round(g * 0.55));

  // White ground: the gutters between panels.
  ctx.fillStyle = GUTTER;
  ctx.fillRect(0, 0, W, H);

  if (layout === 'hero') {
    // One full-bleed panel, title band overlaid on a scrim at the foot.
    drawPanel(ctx, photo, 0, 0, W, H, 0.5, 0.42, grade, borderW);
    const bandH = Math.round(H * 0.30);
    const scrim = ctx.createLinearGradient(0, H - bandH * 1.35, 0, H);
    scrim.addColorStop(0, 'rgba(12, 5, 26, 0)');
    scrim.addColorStop(0.45, 'rgba(12, 5, 26, 0.55)');
    scrim.addColorStop(1, 'rgba(12, 5, 26, 0.88)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, H - bandH * 1.35, W, bandH * 1.35);
    drawTitleBand(ctx, 0, H - bandH, W, bandH, title, caption);
    return;
  }

  // classic / stack: panels above a solid title band.
  const bandH = Math.round(H * (H >= W ? 0.17 : 0.24));
  const areaH = H - bandH;
  const innerW = W - g * 2;
  const innerH = areaH - g * 2;

  if (layout === 'stack') {
    const stripH = (innerH - g * 2) / 3;
    const focuses = [0.18, 0.5, 0.82];
    for (let i = 0; i < 3; i++) {
      drawPanel(ctx, photo, g, g + i * (stripH + g), innerW, stripH, 0.5, focuses[i], grade, borderW);
    }
  } else {
    // classic: tall hero panel left, two stacked panels right.
    const heroW = Math.round((innerW - g) * 0.58);
    const sideW = innerW - g - heroW;
    const sideH = (innerH - g) / 2;
    drawPanel(ctx, photo, g, g, heroW, innerH, 0.5, 0.42, grade, borderW);
    drawPanel(ctx, photo, g + heroW + g, g, sideW, sideH, 0.5, 0.22, grade, borderW);
    drawPanel(ctx, photo, g + heroW + g, g + sideH + g, sideW, sideH, 0.5, 0.74, grade, borderW);
  }

  ctx.fillStyle = BAND;
  ctx.fillRect(0, areaH, W, bandH);
  drawTitleBand(ctx, 0, areaH, W, bandH, title, caption);
}
