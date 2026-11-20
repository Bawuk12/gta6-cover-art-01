// Fixed scenes for screenshots. `?shot=cover` shows the cover alone, full-bleed;
// `?shot=editor` shows the studio with a sample loaded. Query params pick the scene:
//   photo   — sample name (samples/<photo>.jpg), default 'pier'
//   title   — cover title,        default 'Vice City'
//   caption — cover caption,      default 'Sunset Heist'
//   layout  — classic | hero | stack
//   grade   — sunset | midnight | golden
//   size    — square | wide | portrait
// window.__shotReady is set once the scene has painted, so a headless capture can wait
// for exactly the finished frame. The render is deterministic: same query, same pixels.

export async function runShot(shot, query, api) {
  if (shot === 'cover') document.body.classList.add('shot-cover');

  const photo = query.get('photo') ?? 'pier';
  await api.loadSample(photo);

  api.setTitle(query.get('title') ?? 'Vice City');
  api.setCaption(query.get('caption') ?? 'Sunset Heist');
  if (query.get('layout')) api.setLayout(query.get('layout'));
  if (query.get('grade')) api.setGrade(query.get('grade'));
  if (query.get('size')) api.setSize(query.get('size'));

  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

// The scenes the studio's screenshots are taken from (also handy for trying the app):
//
//   1-cover.jpg   ?shot=cover&photo=pier&title=Vice%20City&caption=Sunset%20Heist
//   2-editor.jpg  ?shot=editor&photo=boulevard&title=Vice%20City&caption=Boulevard%20Queen
//   3-cover.jpg   ?shot=cover&photo=marina&layout=stack&grade=golden&title=Marina%20Nights&caption=Golden%20Hour
//   4-cover.jpg   ?shot=cover&photo=boulevard&layout=hero&grade=midnight&size=wide&title=Neon%20District&caption=Midnight%20Run
