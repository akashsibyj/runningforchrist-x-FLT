// The film player: the same stage, kit and drawing code as the Running for Christ × FTL loader film, sized to its
// container. The film is drawn at its own design size (1080 px on the short side, so a 16:9 box is exactly the
// 1920 × 1080 desktop film and a 9:16 box exactly the 1080 × 1920 mobile film) and scaled to fill the box.
import installShared from './shared.js';
import installRunnerScene from './runnerScene.js';

export const ASSETS = [
  'rwc_silver_1024.png',
  'runner_run_frames.png',
  'runner_paper.jpg',
  ...Array.from({ length: 6 }, (_, a) => 'runner_ref40_' + a + '.jpg'), // the run's frames, 40 to a video second
];

// ---- The kit: the film's own easing and noise, exactly as the film uses them. ----
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function vnoise(seed) {
  const r = mulberry(seed * 7919 + 13), v = [];
  for (let i = 0; i < 512; i++) v.push(r() * 2 - 1);
  return (x) => {
    const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    const a = v[((i % 512) + 512) % 512], b = v[(((i + 1) % 512) + 512) % 512];
    return a + (b - a) * s;
  };
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function makeKit({ W, H, stage, fx, base }) {
  const scenes = {};
  const known = new Set(ASSETS);
  const url = (n) => base + n;
  return {
    W, H, stage, fx,
    seg: (t, a, b) => clamp01((t - a) / (b - a)),
    lerp: (a, b, p) => a + (b - a) * p,
    clamp01,
    eo: (x) => 1 - Math.pow(1 - x, 3),
    eio: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    rng: mulberry,
    vnoise,
    h: (s) => { const t = document.createElement('template'); t.innerHTML = s; return t.content.firstElementChild; },
    assets: {
      has: (n) => known.has(n),
      url,
      list: () => [...known],
      image: (n) => new Promise((ok, no) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => ok(im);
        im.onerror = () => no(new Error(n + ' did not load'));
        im.src = url(n);
      }),
    },
    scene: (id, def) => { scenes[id] = def; },
    _scenes: scenes,
  };
}

// The design size for a box: 1080 px on its short side, its own aspect ratio (kept within 1:3 and 3:1).
export function designSize(cw, ch) {
  const a = Math.max(1 / 3, Math.min(3, cw / ch));
  return a >= 1 ? { W: Math.round(1080 * a), H: 1080 } : { W: 1080, H: Math.round(1080 / a) };
}

export class FilmEngine {
  constructor(host, { assetsBase = '/runner-intro/' } = {}) {
    this.host = host;
    this.base = assetsBase.endsWith('/') ? assetsBase : assetsBase + '/';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ril-fx';
    this.canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) throw new Error('This browser cannot draw the animation (no 2D canvas).');
    this.scene = null; this.kit = null; this.stage = null;
    this.size = null; this.box = { w: 0, h: 0, s: 1, dpr: 1 };
    this.token = 0; this.dead = false; this.errors = 0;
  }

  // Fit the film to the box (CSS px). Builds the film again only when its design size changes.
  async resize(cw, ch) {
    if (this.dead || !(cw > 0) || !(ch > 0)) return false;
    const want = designSize(cw, ch);
    const s = cw / want.W;
    // device pixels: sharp on high-density screens, capped so a very large screen stays quick
    let dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    while (dpr > 1 && cw * ch * dpr * dpr > 8.3e6) dpr = Math.max(1, dpr - 0.25);
    this.box = { w: cw, h: ch, s, dpr };
    const pw = Math.max(1, Math.round(cw * dpr)), ph = Math.max(1, Math.round(ch * dpr));
    if (this.canvas.width !== pw || this.canvas.height !== ph) { this.canvas.width = pw; this.canvas.height = ph; }
    this.canvas.style.width = cw + 'px'; this.canvas.style.height = ch + 'px';
    if (this.stage) this.stage.style.transform = 'scale(' + s + ')';
    if (this.size && this.size.W === want.W && this.size.H === want.H && this.scene) return false;
    if (this.pending && this.pending.W === want.W && this.pending.H === want.H) return false; // already on its way
    this.pending = want;
    try { await this.mount(want.W, want.H); } finally { if (this.pending === want) this.pending = null; }
    return true;
  }

  async mount(W, H) {
    const token = ++this.token;
    const stage = document.createElement('div');
    stage.className = 'ril-stage';
    stage.style.width = W + 'px'; stage.style.height = H + 'px';
    stage.style.transform = 'scale(' + this.box.s + ')';
    stage.style.visibility = 'hidden';
    this.host.insertBefore(stage, this.canvas);
    const kit = makeKit({ W, H, stage, fx: this.ctx, base: this.base });
    try {
      const lib = installShared(kit);
      installRunnerScene(kit, lib);
      const scene = kit._scenes['runner-intro'];
      if (!scene) throw new Error('The runner scene did not register.');
      await scene.init(kit);
      if (this.dead || token !== this.token) { stage.remove(); return; } // a newer size took over
      if (this.stage) this.stage.remove();
      stage.style.visibility = '';
      Object.assign(this, { stage, kit, scene, size: { W, H } });
    } catch (e) {
      stage.remove();
      if (token === this.token) throw e;
    }
  }

  get ready() { return !!this.scene && !this.dead; }

  // Draw the film at time t (seconds). Pure: the same t always gives the same picture.
  render(t) {
    if (!this.ready) return;
    const g = this.ctx, { s, dpr } = this.box;
    try {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, this.canvas.width, this.canvas.height);
      g.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
      this.scene.render(t, this.kit);
      this.errors = 0;
    } catch (e) {
      this.errors++;
      if (this.errors === 1 || this.errors % 120 === 0) console.error('[RunnerIntroLoader] frame at ' + t.toFixed(3) + ' s failed:', e);
      if (this.errors > 30) throw e; // persistently broken: let the component show its error state
    }
  }

  destroy() {
    this.dead = true;
    this.token++;
    try { if (this.stage) this.stage.remove(); } catch (e) { /* already gone */ }
    try { this.canvas.remove(); } catch (e) { /* already gone */ }
    this.scene = null; this.kit = null; this.stage = null;
  }
}
