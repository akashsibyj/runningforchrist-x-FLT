/* eslint-disable */
// The runner intro scene, exactly as in the film: the reference video's runner on its paper (at 1.5 times the
// video's pace), then (after frame 58) on through his 3rd step; as his front foot touches the ground a black streak
// spreads on the ground under it, moving back with the ground under his planted foot; then he fades as the black
// circle bursts open from a point, carries a touch past its size and eases back as the silver crosses fade in,
// then the approved loader: the crosses light up, the middle one first, and the light flows on down through the x and FTL, and
// the finished identity holds still.
// Wrapped so it registers with one player.
export default function installRunnerScene(kit, W) {
const { seg, lerp, eo, eio, clamp01, rng, vnoise } = kit;

// The runner exactly as drawn in the supplied artwork: its scanline dashes (row, start, end on a 264 x 250 grid of
// 50 rows), each labelled with the body part it belongs to: A torso, B head, C/D back thigh/shin, E/F front
// thigh/shin, G/H back upper arm/forearm, I/J front upper arm/forearm.
const ART = '0,94,152,H;1,100,112,H;1,129,133,H;1,138,150,H;1,151,162,H;1,166,171,G;2,87,115,H;2,127,164,H;2,164,179,G;3,81,128,H;3,129,140,H;3,141,144,H;3,150,158,H;3,160,164,H;3,164,168,G;3,169,181,G;4,101,106,H;4,167,190,G;5,101,105,H;5,168,190,G;6,172,192,G;6,192,196,A;6,196,200,B;6,226,233,B;7,172,189,G;7,189,197,A;7,197,200,B;7,222,237,B;8,181,186,G;8,186,198,A;8,198,209,B;8,218,246,B;9,181,184,G;9,184,199,A;9,199,209,B;9,218,246,B;10,172,182,G;10,182,200,A;10,200,249,B;10,249,260,J;11,172,181,G;11,181,200,A;11,200,247,B;11,247,264,J;12,162,166,A;12,166,180,G;12,180,201,A;12,201,237,B;12,242,260,J;13,158,200,A;13,200,237,B;13,242,260,J;14,156,210,A;14,210,218,B;14,251,260,J;15,153,210,A;15,210,219,I;15,248,261,J;16,149,152,A;16,154,210,A;16,210,223,I;16,252,255,J;17,144,209,A;17,209,228,I;17,246,256,J;18,129,135,A;18,139,150,A;18,153,159,A;18,161,187,A;18,189,196,A;18,214,231,I;18,246,255,J;19,125,205,A;19,209,232,I;19,242,256,J;20,133,140,A;20,143,185,A;20,223,232,I;20,232,251,J;21,116,186,A;21,219,232,I;21,232,251,J;22,138,145,A;22,148,159,A;22,233,247,J;23,111,167,A;23,233,251,J;24,115,122,A;24,123,129,A;24,133,163,A;25,102,172,A;26,138,155,A;26,162,172,A;27,93,117,C;27,117,177,A;27,177,181,E;28,94,101,C;28,103,106,C;28,107,112,C;28,121,128,A;28,135,139,A;28,145,168,A;28,171,186,E;29,88,120,C;29,120,125,E;29,143,147,A;29,147,186,E;30,87,119,C;30,119,129,E;30,140,185,E;31,83,112,C;31,158,191,E;32,79,116,C;32,153,195,E;33,65,122,C;33,122,195,E;34,65,123,C;34,123,177,E;34,177,181,F;34,181,195,E;35,56,84,C;35,93,116,C;36,51,114,C;36,114,119,F;36,154,176,F;37,46,64,C;37,93,106,C;37,106,111,F;38,42,45,D;38,45,69,C;38,93,98,C;38,98,111,F;39,36,48,D;39,99,106,F;40,32,55,D;40,98,107,F;41,9,37,D;42,4,41,D;43,4,25,D;44,4,27,D;45,4,17,D;46,0,18,D;47,0,10,D;48,0,9,D;49,0,8,D';
const GW = 264, GH = 250, ASP = GH / GW, GR = 50, BAND = ASP / GR; // the artwork grid and its 50 scanline rows

// The run is the motion-reference video itself. Traced: the video's runner was cut out of every frame (24 a second),
// in-between frames were made from the video's own motion (optical flow) for 60 a second, and each was read into
// the drawing's 50 scanline rows the way the drawing was traced (a row is inked where most of it is covered). So
// every frame shows the runner exactly as the video shows him, in the drawing's own strokes. Frame 1 of the video is
// the drawing: the film opens on the drawing itself and eases into the traced runner as the video does (0.2 s).
const RUN = 87 / 24; // the video's frames 1 to 88: rises from the drawn pose, two strides, lands in a flight pose
const GL = RUN - 0.25; // from here the last of stride 2 slows into its final pose
const HO = RUN + 0.25; // landed in that pose: the rows start to reflow into the crosses
const OP = HO + 0.75; // the crosses are formed: the approved film follows from here, unchanged
const S1 = 0.4; // first the whole runner stretches into the crosses' footprint (rows stay joined), then each row
// breaks and slides sideways into its dashes of the crosses
const T1 = 1.0; // where that is in the approved film's original timeline (crosses formed, before the lock)
const REVEAL = 0.1; // the film opens with the runner already part-way in: top rows inked, the lowest still arriving
const MORPH = 0.2; // the drawing becomes the traced runner over the first 0.2 s, as it does in the video
// The traced frames are an image asset: frame j (0..NF) is the runner at RUN * j / NF s. In it, each frame's inked
// cells: NR rows from row KR0, NC half-pixel columns from column C0 (column c is at (c / 2 - 96) artwork pixels),
// three cells to a pixel (its red, green and blue, each 0 or 255), FPR frames side by side, PW pixels each.
const FRAMES = 'runner_run_frames.png', NF = 218, KR0 = -2, NR = 58, C0 = 150, NC = 612, PW = 204, FPR = 8;
// The run as the reference video shows it: the video's own frames of the runner (with in-betweens made from its own
// motion, RNF + 1 of them, 40 to a second of the video: at 1.5 times, one a screen frame at 60 Hz), grey images
// multiplied onto the video's paper. Frame j (0..RNF) is the runner at RUN * j / RNF s, tile j % PER of atlas
// floor(j / PER), COLS tiles to a row, each FW x FH video pixels with its top left at video pixel BOX. The drawing's
// grid sits in the video at VO, VS video pixels to an artwork pixel. PAPER is a tile of the video's paper grain.
const RNF = 145, REF = Array.from({ length: Math.ceil((RNF + 1) / 25) }, (_, a) => 'runner_ref40_' + a + '.jpg'), PAPER = 'runner_paper.jpg', PAPER_RGB = '#EFEFEF';
const FW = 376, FH = 347, COLS = 5, PER = 25, BOX = [141, 6], VS = 1.253, VO = [165, 20];
// The hand-over: the drawing's scanlines open across the runner, then row by row from the top the scanline runner
// takes his place before the rows stretch, and the video's paper eases into the loader's own ground.
const SPLIT0 = HO - 0.45, SPLIT1 = HO - 0.27, SWAP = HO - 0.15, PAPER_OUT = HO + 0.35;
const swapAt = (r) => SPLIT1 + (SWAP - SPLIT1) * clamp01((r + 2) / (GR + 6)); // when row r changes over
// The jump: the runner runs on through the video's frames 59 to 67 to his 3rd step, and from the moment his front foot
// touches the ground the black circle bursts open (frames 68 to 119 are not in the film). The video's paper fades to
// the loader's ground before his foot lands (J_PAPER).
// SPEED: the run plays at 1.5 times the video's pace, so his strides keep time with the logo. JV: where frame 58 ends
// in the video's own time; JA: the same moment in the film.
// CONTACTS: the frames of the run (its RNF + 1 frames, see RNF) where a foot meets the ground, found in the frames
// themselves (the lowest point of the figure comes down to the ground line and stays there): 13, 57 and 110. The film
// opens in the air before the first; the second completes his two strides; the third (CONTACT3) is the trigger: at
// that very frame the circle starts to burst (no delay). LAND: that moment, s after frame 58; TC: the same in the film.
const CONTACTS = [13, 57, 110], CONTACT3 = CONTACTS[2];
const SPEED = 1.5, JV = 58 / 24, JA = JV / SPEED, JB = HO + 32 / 24, LAND = (CONTACT3 / RNF * RUN - JV) / SPEED, TC = JA + LAND;
const J_PAPER = [0, LAND - 0.03];
// If his frames cannot be made into masks (see fadeRef), he and his paper fade out together over J_FALL instead.
const J_FALL = [LAND - 0.1, LAND - 0.025];
// From the landing: the approved film carries on from its frame 119 (original time TJ), so the black circle bursts
// open (from a point) and settles, then hold, rise, x and FTL, all as the original film has them, but without
// its big black crosses: only the circle bursts. A moment after the circle is whole (solid at original time 1.9), the
// silver crosses fade in over SILVER (original time), before the rise. He fades out over R_OUT as the circle bursts.
// Frames 68 to 119 are not in the film: the circle bursts (120) as his foot lands (67).
const TJ = 1 + 13 / 24, R_OUT = 0.08, SILVER = [1.95, 2.26];
// (R_OUT: he has faded before his video frames end, 0.083 s after the burst, so he never stops moving. SILVER: the
// crosses fade in as the circle comes to rest and finish as the rise (from 2.2) begins: no still hold in between.)
// The burst: the circle starts growing at original time B0. Its first instants are eased (EASE_IN s, ending at its own
// speed), so it grows from a point instead of popping in at a third of its size; later frames are unchanged. Its
// momentum then carries it OV (3%) past its size and it eases back by OV_SEG[1], filling the moment before the crosses.
const B0 = 1.56, EASE_IN = 2 * (B0 - TJ), OV = 0.03, OV_SEG = [1.6, 1.95];
// The ground under his 3rd step, measured in the video: his planted foot moves back with the ground at a steady
// FOOT[2] video px a frame (heel and toe alike, frames 112 to 128); the middle of his flat foot is at FOOT[0] at frame
// FOOT[1], and his sole at FOOT[3] (video px, in the frame's own box).
const FOOT = [272, 112, 7.56, 343.5];
// The finish (original time): the burst's specks are drawn into the circle and gone by SPECK[1]; once the crosses have
// lit (see LIGHT_AT), a light passes down the x over the end of SWEEP (X_AT),
// then down through the x, each fading in and out as it goes; FTL does not pulse (PULSE, PULSES, PULSE_K: see pulse,
// not used); once FTL has arrived the identity holds still. The light is a band BAND_H high
// (half, in loader units); CR: the crosses' top and bottom rows in their 480 artwork frame. X_A: its strength on the x.
// GLOW_A: the strength of its soft glow around the crosses.
const GLOW_A = 0.55;
// The crosses light up (original time): each is dark until its light reaches it; LIGHT_AT[i] is when the light travels
// down cross i (left, middle, right): the middle one first, the outer two a quarter of a second later; SHINE[i] is the
// strength of its light (the middle one strongest). FEATHER: the softness of the edge between lit and dark (artwork px).
const LIGHT_AT = [[2.2, 2.55], [1.95, 2.3], [2.2, 2.55]], SHINE = [0.6, 1, 0.6], FEATHER = 18;
// The middle cross, a little more present: once lit the outer crosses rest at OUTER_A of their brightness (left,
// middle, right: REST_A); the middle one keeps a steady sheen at its crossing (SHEEN_AT: centre and radii in its 480
// artwork frame), of strength SHEEN, growing in over SHEEN_IN (original time) as its light sweep finishes, then still.
const SHEEN_GLOW = 0.4, OUTER_A = 0.82, REST_A = [OUTER_A, 1, OUTER_A], SHEEN = 0.42, SHEEN_AT = [250, 210, 52, 78], SHEEN_IN = [2.12, 2.45];
// The light goes down the crosses in turn, the middle one first and then the left and right ones together: CROSSES, each
// cross's column (x from, x to) and its top and bottom in the 480 artwork frame, left to right; cross i's light runs over [CROSS_AT[i], CROSS_AT[i] + CROSS_D] of SWEEP, then the
// x's over X_AT; CROSS_H: half the height of the light on a cross (loader units).
const CROSSES = [[70, 185, 158, 310], [185, 290, 158, 355], [290, 432, 157, 322]], CROSS_AT = [0.24, 0, 0.24], CROSS_D = 0.42, X_AT = [0.4, 1], CROSS_H = 0.045;
// The merge (original time): the segments sit off-centre, either side, by up to MERGE_A (loader units) and slide into place,
// each a little after the one before by up to MERGE_LAG s.
const MERGE_A = 0.035, MERGE_LAG = 0.035;
// The loop's return: after the final hold (original time END_T), when looping, the opening frame fades in over
// LOOP_BRIDGE s (the player plays this only when looping; frames.js has the same values).
// The x is drawn X_SCALE of its approved size, about its own centre. FLOW (original time): after the crosses have lit, the
// light flows on down from their foot through the x and then FTL, one continuous movement (fading in at its start and
// out at its end); FTL_A: its strength on FTL.
const X_SCALE = 0.8, FLOW = [2.5, 3.08], FLOW_X = [2.58, 2.73], FLOW_F = 2.78, FTL_A = 0.85;
const END_T = 5 - 7 / 24, LOOP_BRIDGE = 0.4; // (the hold ends on original frame 195)
const SPECK = [1.64, 1.8], SWEEP = [2.45, 3.15], PULSE = [3.07, 3.67], PULSES = 2, PULSE_K = 0.03, SWEEP_A = 1, X_A = 0.85, BAND_H = 0.09, CR = [152, 356];
// The ground: the moment his foot lands, a short black streak spreads out under it (GROW), showing the surface he
// lands on, and at that same moment the circle bursts (GD = 0: no run-on, no wait). He fades over R_OUT as it bursts
// and the streak fades over G_FADE. Its shape, in runner widths: it reaches G_BACK
// behind the middle of his foot and G_FRONT in front, G_H thick at its fullest, tapering to points.
const GD = 0, G_FADE = [0.1, 0.28], GROW = 0.1, G_BACK = 0.3, G_FRONT = 0.12, G_H = 0.03;
// The reference video's first two frames are the drawing and a half-blended frame between it and the runner; the film
// opens on its first clean frame of the runner (J_FIRST) instead, held for those 2/60 s, so frame 1 looks like the rest.
const J_FIRST = 2;
// The film starts START s into this timeline (all times in this scene are on it): what was the film at 0.12 s is its
// first frame now, the runner already off the drawn pose and running.
const START = 0.12;
// The rows are traced steady with the body; its rise and fall in the video (artwork pixels, + down, one value per
// video frame) is added back smoothly.
const DY = [0,-0.06,-0.13,-0.19,-0.22,-0.2,-0.13,-0.02,0.14,0.31,0.46,0.49,0.25,-0.34,-1.23,-2.22,-3.17,-4.06,-4.93,-5.78,-6.59,-7.3,-7.86,-8.21,-8.34,-8.29,-8.12,-7.86,-7.54,-7.17,-6.75,-6.29,-5.76,-5.13,-4.37,-3.47,-2.41,-1.11,0.38,1.77,2.62,2.81,2.54,2.1,1.58,0.96,0.24,-0.56,-1.43,-2.32,-3.21,-4.05,-4.85,-5.6,-6.26,-6.78,-7.12,-7.29,-7.31,-7.18,-6.94,-6.59,-6.12,-5.55,-4.87,-4.08,-3.22,-2.3,-1.34,-0.38,0.56,1.47,2.35,3.09,3.56,3.67,3.52,3.24,2.93,2.59,2.22,1.81,1.37,0.88,0.37,-0.14,-0.59,-0.94];
// A smooth Catmull-Rom curve through v at fractional index p, held at the ends.
function cat(v, p) {
  const n = v.length - 1;
  if (!(n > 0)) return 0;
  const x = Math.min(Math.max(p, 0), n), i = Math.min(n - 1, Math.floor(x)), u = x - i;
  const a = v[Math.max(0, i - 1)], b = v[i], c = v[i + 1], d = v[Math.min(n, i + 2)];
  return 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
}

const REDUCED = (() => { try { return !!(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } })();

// Cubic Hermite: from a (speed va) to b (speed vb) over D seconds, at u in 0..1.
// How much of the next frame to show at fraction f between two of the run's frames: none near the first, all near
// the second, a smooth blend only in between (0.3 to 0.7).
function inBetween(f) { const u = clamp01((f - 0.3) / 0.4); return u * u * (3 - 2 * u); }
function hermite(u, a, va, b, vb, D) {
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * D * va + (-2 * u3 + 3 * u2) * b + (u3 - u2) * D * vb;
}
// Running time (video seconds) at film time t: SPEED times the film's, so his strides keep pace with the logo.
// With reduced motion requested, the runner holds the drawn pose and only the change into the crosses plays.
function tau(t) {
  if (REDUCED || !(t > 0)) return 0;
  return Math.min(RUN, SPEED * t);
}
// Between two frames, each row's strokes glide from one to the other: the signed distance to a row's strokes
// (negative inside) is blended and the strokes are where the blend is below zero. A stroke that moves slides, one
// that only one of them has grows or shrinks about its middle. Runs and distances in runner widths.
const CAP = 4 / GW, MINRUN = 1.5 / GW;
function sd(R, x) { let m = CAP; for (const r of R) { const v = Math.max(r[0] - x, x - r[1]); if (v < m) m = v; } return m; }
function morphRow(A, B, f) {
  if (f <= 0 || !B.length && !A.length) return A;
  if (f >= 1) return B;
  const P = [];
  for (const R of [A, B]) R.forEach((r, i) => { P.push(r[0], r[1], (r[0] + r[1]) / 2, r[0] - CAP, r[1] + CAP); if (i) P.push((R[i - 1][1] + r[0]) / 2); });
  P.sort((p, q) => p - q);
  const out = [];
  let px = 0, pd = 1, st = null;
  for (let i = 0; i < P.length; i++) {
    const x = P[i], d = (1 - f) * sd(A, x) + f * sd(B, x);
    if (i && pd >= 0 && d < 0) st = px + (x - px) * pd / (pd - d);
    else if (i && pd < 0 && d >= 0 && st !== null) { const e = px + (x - px) * pd / (pd - d); if (e - st >= MINRUN) out.push([st, e]); st = null; }
    else if (!i && d < 0) st = x;
    px = x; pd = d;
  }
  return out;
}
function morphRows(A, B, f) {
  if (f <= 0) return A;
  if (f >= 1) return B;
  const out = new Map();
  for (const k of new Set([...A.keys(), ...B.keys()])) {
    const iv = morphRow(A.get(k) || [], B.get(k) || [], f);
    if (iv.length) out.set(k, iv);
  }
  return out;
}

kit.scene('runner-intro', {
  async init(kit) {
    await W.build(this, kit, 'runner-intro');
    const S = this, G = S.G, U = G.Ua, r = rng(97);
    S.sweep = null;
    try {
      const sv = S.silver, url = kit.assets && kit.assets.has('rwc_silver_1024.png') ? kit.assets.url('rwc_silver_1024.png') : null;
      const can = typeof CSS !== 'undefined' && CSS.supports && (CSS.supports('mask-image', 'url("a.png")') || CSS.supports('-webkit-mask-image', 'url("a.png")'));
      if (sv && sv.parentNode && sv.tagName === 'IMG' && url && can && !REDUCED) {
        sv.parentNode.querySelectorAll('.runner-intro-sweep').forEach((e) => e.remove()); // (never two)
        // (an outer layer placed over the crosses, the light itself inside it, masked by the crosses)
        const el = document.createElement('div'), lt = document.createElement('div'), m = 'url("' + String(url).replace(/"/g, '%22') + '")';
        el.className = 'runner-intro-sweep';
        el.setAttribute('aria-hidden', 'true');
        Object.assign(el.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', opacity: '0', display: 'none' });
        Object.assign(lt.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%' });
        for (const p of ['maskImage', 'webkitMaskImage']) lt.style[p] = m;
        for (const p of ['maskSize', 'webkitMaskSize']) lt.style[p] = '100% 100%';
        for (const p of ['maskRepeat', 'webkitMaskRepeat']) lt.style[p] = 'no-repeat';
        el.appendChild(lt);
        sv.after(el);
        S.sweep = el; S.sweepLight = lt; S.sweepGlow = null;
        // its glow: the same light through a soft (blurred) copy of the crosses, made once from their own image as soon
        // as it has loaded (the film does not wait for it; until then, or if it cannot be read back, no glow)
        const glow = () => {
          try {
            if (!el.isConnected || S.sweepGlow || !sv.naturalWidth) return;
            const n = 72, c = document.createElement('canvas');
            c.width = c.height = n;
            const x = c.getContext('2d');
            if (!x) return;
            for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) x.drawImage(sv, dx, dy, n, n); // (spread a little)
            const gl = document.createElement('div'), soft = c.toDataURL('image/png');
            Object.assign(gl.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', opacity: String(GLOW_A) });
            for (const p of ['maskImage', 'webkitMaskImage']) gl.style[p] = 'url("' + soft + '")';
            for (const p of ['maskSize', 'webkitMaskSize']) gl.style[p] = '100% 100%';
            for (const p of ['maskRepeat', 'webkitMaskRepeat']) gl.style[p] = 'no-repeat';
            el.insertBefore(gl, lt);
            S.sweepGlow = gl;
          } catch (e) { S.sweepGlow = null; } // (an image that may not be read back: the light without its glow)
        };
        if (sv.complete && sv.naturalWidth) glow(); else sv.addEventListener('load', glow, { once: true });
      }
    } catch (e) { S.sweep = null; }
    (S.sl || []).forEach((q, i) => {
      const h = 0.6 * Math.sin(i * 0.7 + 0.4) + 0.4 * Math.sin(i * 1.9 + 2.1); // (-1..1: either side of the centre)
      q.trail = h; q.lag = MERGE_LAG * Math.abs(h);
    });
    S.startCv = null; // the opening frame, drawn once for the loop's return (see bridge)
    try {
      if (S.x) {
        const l = parseFloat(S.x.style.left), t = parseFloat(S.x.style.top), w = parseFloat(S.x.style.width), h = parseFloat(S.x.style.height);
        if ([l, t, w, h].every(Number.isFinite) && w > 0 && h > 0) {
          const w2 = w * X_SCALE, h2 = h * X_SCALE;
          Object.assign(S.x.style, { left: (l + (w - w2) / 2).toFixed(1) + 'px', top: (t + (h - h2) / 2).toFixed(1) + 'px', width: w2.toFixed(1) + 'px', height: h2.toFixed(1) + 'px' });
        }
      }
    } catch (e) { /* the x as approved */ }
    S.xSweep = null;
    try {
      const can = typeof CSS !== 'undefined' && CSS.supports && (CSS.supports('mask-image', 'url("a.svg")') || CSS.supports('-webkit-mask-image', 'url("a.svg")'));
      if (S.x && can && !REDUCED) {
        S.x.querySelectorAll('.runner-intro-xsweep').forEach((e) => e.remove()); // (never two)
        const path = S.x.querySelector('path'), sw = path ? parseFloat(path.style.strokeWidth) : NaN;
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M12 12 L88 88 M88 12 L12 88" fill="none" stroke="#000" stroke-width="' + (Number.isFinite(sw) && sw > 0 ? sw : 13).toFixed(2) + '"/></svg>';
        const m = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")', el = document.createElement('div');
        el.className = 'runner-intro-xsweep';
        el.setAttribute('aria-hidden', 'true');
        Object.assign(el.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', pointerEvents: 'none', display: 'none' });
        for (const p of ['maskImage', 'webkitMaskImage']) el.style[p] = m;
        for (const p of ['maskSize', 'webkitMaskSize']) el.style[p] = '100% 100%';
        for (const p of ['maskRepeat', 'webkitMaskRepeat']) el.style[p] = 'no-repeat';
        S.x.appendChild(el);
        S.xSweep = el;
      }
    } catch (e) { S.xSweep = null; }
    S.ftlSweep = null;
    try {
      const can = typeof CSS !== 'undefined' && CSS.supports && (CSS.supports('mask-image', 'url("a.svg")') || CSS.supports('-webkit-mask-image', 'url("a.svg")'));
      const svgEl = S.ftl ? S.ftl.querySelector('svg') : null;
      if (svgEl && can && !REDUCED) {
        S.ftl.querySelectorAll('.runner-intro-ftlsweep').forEach((e) => e.remove()); // (never two)
        const c = svgEl.cloneNode(true);
        c.removeAttribute('class');
        c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        c.querySelectorAll('[style]').forEach((q) => q.setAttribute('style', String(q.getAttribute('style')).replace(/var\(--main\)/g, '#000')));
        const m = 'url("data:image/svg+xml,' + encodeURIComponent(c.outerHTML) + '")', el = document.createElement('div');
        el.className = 'runner-intro-ftlsweep';
        el.setAttribute('aria-hidden', 'true');
        Object.assign(el.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', pointerEvents: 'none', display: 'none' });
        for (const p of ['maskImage', 'webkitMaskImage']) el.style[p] = m;
        for (const p of ['maskSize', 'webkitMaskSize']) el.style[p] = '100% 100%';
        for (const p of ['maskRepeat', 'webkitMaskRepeat']) el.style[p] = 'no-repeat';
        S.ftl.appendChild(el);
        S.ftlSweep = el;
      }
    } catch (e) { S.ftlSweep = null; }
    // Size: half a panel tall on desktop; on phones, in the same proportion to the mark (never more than three quarters
    // of the space inside the margins, or 30% of the height). Running in place, centred, a little below the middle like the approved first frame.
    const RW = S.RW = G.m === null ? Math.min(0.5 * U / ASP, 0.6 * G.w) : Math.min(0.75 * (G.w - 2 * G.m), 0.3 * G.h / ASP, 0.55 * G.Ub / ASP);
    S.band = RW * BAND;
    S.ox = G.cx - 0.5 * RW; S.oy = (G.m === null ? G.h / 2 : S.P3[1]) - 0.5 * RW * ASP;
    // The drawing's own rows, exactly as drawn (dashes that touch are one stroke): the film's first frame.
    S.art = new Map();
    ART.split(';').map((t) => t.split(',')).filter((d) => d.length === 4).map(([k, a, b]) => [+k, +a, +b])
      .filter(([k, a, b]) => isFinite(k) && isFinite(a) && isFinite(b) && b > a && k >= 0 && k < GR)
      .sort((p, q) => p[0] - q[0] || p[1] - q[1]).forEach(([k, a, b]) => {
        const iv = S.art.get(k) || (S.art.set(k, []), S.art.get(k)), last = iv[iv.length - 1];
        if (last && a <= last[1] * GW + 1e-9) last[1] = Math.max(last[1], b / GW); else iv.push([a / GW, b / GW]);
      });
    // The traced run (none with reduced motion, or if the frames cannot be had: the runner then holds the drawn pose).
    const refP = S.loadRef(kit); // (fetched alongside the traced frames, not after them)
    S.film = REDUCED ? null : await S.loadFrames(kit);
    // The reference's own frames (only with the traced run to hand over to, or holding the first frame with reduced
    // motion). Without them the scanline runner runs on the loader's ground, as before.
    S.ref = S.film || REDUCED ? await refP : null;
    // make the dissolve's first darkness mask now, so its one-off set-up cost never lands on a frame
    if (S.ref) S.refMask(Math.min(RNF, Math.max(J_FIRST, Math.round(clamp01((REDUCED ? 0 : JV) / RUN) * RNF))));
    // and get the images of the dissolve's later frames ready for reading back too, one a task, while he runs (a
    // one-off of some 15 ms each that would otherwise drop a frame as the dissolve reaches them)
    if (S.ref && !REDUCED) S.warmRef(Math.floor(Math.round(clamp01(JV / RUN) * RNF) / PER) + 1);
    for (let i = 0; i < 82; i++) r(); // (keeps the speed lines' random places as they were)
    // Where and how fast each fragment of the crosses is moving at the moment the approved film is joined.
    const e = 0.01, cv = (A) => [(A[0] + A[1]) / 2, A[1] - A[0], A[2], A[3], A[4]];
    const list = [];
    S.fr.forEach((f) => {
      const A = W.dash(S, f, T1), B = W.dash(S, f, T1 + e);
      if (!A || !B) return;
      const a = cv(A), b = cv(B);
      list.push({ E: a, V: a.map((q, m) => (b[m] - q) / e) });
    });
    // The runner as his foot lands on his 3rd step (TL: that moment in the video's time; with reduced motion, the drawn
    // pose he holds), run by run; the fragments are shared among those runs by length.
    const TL = S.TL = REDUCED ? 0 : Math.min(RUN, JV + SPEED * LAND), bobL = S.bobAt(TL);
    const runAt = (k, a, b, f, w) => { const c = (a + b) / 2, L = b - a; return [S.ox + (c + f * L) * S.RW, L * w * S.RW, S.oy + (k + 0.5) * BAND * S.RW + bobL]; };
    const runs = [], landRows = S.rowsAt(TL, REDUCED ? 0 : 1);
    landRows.forEach(({ k, iv }) => iv.forEach(([a, b]) => runs.push({ k, a, b, cnt: 0 })));
    // Where his foot meets the ground as he lands: under the front-most stroke of his lowest row (null if none).
    S.ground = null;
    try {
      const low = landRows.filter((r) => r.iv && r.iv.length).slice(-1)[0];
      if (low) {
        const [a, b] = low.iv[low.iv.length - 1], x = S.ox + (a + b) / 2 * RW, y = S.oy + (low.k + 1) * BAND * RW + bobL;
        if (Number.isFinite(x) && Number.isFinite(y)) S.ground = { x, y };
      }
    } catch (e) { S.ground = null; }
    const N = list.length, M = runs.length;
    S.pc = [];
    if (N && M) {
      const tw = runs.reduce((s, v) => s + (v.b - v.a), 0) || 1, base = N >= M ? 1 : 0, left = N - base * M;
      const want = runs.map((v) => left * (v.b - v.a) / tw), cnt = want.map((x) => base + Math.floor(x));
      let rest = N - cnt.reduce((s, c) => s + c, 0);
      want.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rest > 0) { cnt[i]++; rest--; } });
      const home = [];
      runs.forEach((v, i) => { v.cnt = cnt[i]; for (let j = 0; j < cnt[i]; j++) home.push({ v, f: (j + 0.5) / cnt[i] - 0.5, w: 1 / cnt[i] }); });
      // Top to bottom, then left to right, on both sides: each piece goes to the fragment at the same place in that
      // order, so the runner's rows reflow into the crosses' rows in place, without crossing over or scattering.
      const cx = (h) => (h.v.a + h.v.b) / 2 + h.f * (h.v.b - h.v.a);
      home.sort((a, b) => a.v.k - b.v.k || cx(a) - cx(b));
      list.sort((a, b) => a.E[2] - b.E[2] || a.E[0] - b.E[0]);
      list.forEach((q, j) => { if (home[j]) S.pc.push(Object.assign(q, home[j])); });
      // Where each piece stands once the runner has stretched into the crosses' footprint (a smooth glitch smear).
      const box = (L) => L.reduce((b, p) => [Math.min(b[0], p[0] - p[1] / 2), Math.max(b[1], p[0] + p[1] / 2), Math.min(b[2], p[2]), Math.max(b[3], p[2])], [Infinity, -Infinity, Infinity, -Infinity]);
      for (const q of S.pc) { const [x, w, y] = runAt(q.v.k, q.v.a, q.v.b, q.f, q.w); q.P0 = [x, w, y, 0.8 * S.band, 1]; }
      const bR = box(S.pc.map((q) => q.P0)), bC = box(S.pc.map((q) => q.E));
      const sx = (bC[1] - bC[0]) / Math.max(1, bR[1] - bR[0]), sy = (bC[3] - bC[2]) / Math.max(1, bR[3] - bR[2]);
      const mx = (b) => (b[0] + b[1]) / 2, my = (b) => (b[2] + b[3]) / 2;
      S.h1 = S.pc[0].E[3];
      S.fit = (P, h) => [mx(bC) + (P[0] - mx(bR)) * sx, P[1] * sx, my(bC) + (P[2] - my(bR)) * sy, h, 1];
      for (const q of S.pc) q.P1 = S.fit(q.P0, q.E[3]);
      // Within each row of the crosses, its pieces take its dashes left to right, so no two cross while sliding.
      const rowsC = new Map();
      for (const q of S.pc) { const key = Math.round(q.E[2]); if (!rowsC.has(key)) rowsC.set(key, []); rowsC.get(key).push(q); }
      for (const qs of rowsC.values()) {
        const T = qs.map((q) => ({ E: q.E, V: q.V })).sort((a, b) => a.E[0] - b.E[0]);
        qs.sort((a, b) => a.P1[0] - b.P1[0]).forEach((q, i) => { q.E = T[i].E; q.V = T[i].V; });
      }
      // The rows set off sideways in turn from the top while the stretch finishes (the last 0.15 s after the
      // first); all land together.
      let y0 = Infinity, y1 = -Infinity;
      for (const q of S.pc) { y0 = Math.min(y0, q.E[2]); y1 = Math.max(y1, q.E[2]); }
      for (const q of S.pc) q.s1 = HO + 0.2 + 0.15 * (q.E[2] - y0) / Math.max(1, y1 - y0);
    }
    // Runs left without a fragment of their own stretch with the rest and fade away.
    S.ghost = runs.filter((v) => v.cnt === 0);
    for (const v of S.ghost) { const [x, w, y] = runAt(v.k, v.a, v.b, 0, 1); v.P0 = [x, w, y, 0.8 * S.band, 1]; v.P1 = S.fit ? S.fit(v.P0, 0.8 * S.band) : v.P0; }
    S.lines = Array.from({ length: 10 }, () => ({ y: 0.2 + r() * 0.65, off: r(), len: 3 + r() * 5 }));
  },
  // The traced frames, read from their image into rows of strokes. Any failure (no asset, an image that will not
  // load or read back, the wrong size, a slow network) gives null.
  async loadFrames(kit) {
    try {
      const A = kit.assets;
      if (!A || typeof A.has !== 'function' || !A.has(FRAMES)) return null;
      const url = typeof A.url === 'function' ? A.url(FRAMES) : null;
      const load = url ? new Promise((ok, no) => {
        const im = new Image();
        im.crossOrigin = 'anonymous'; im.decoding = 'async';
        im.onload = () => ok(im); im.onerror = () => no(new Error('frames did not load'));
        im.src = url;
      }) : A.image(FRAMES);
      const img = await Promise.race([load, new Promise((ok, no) => setTimeout(() => no(new Error('frames timed out')), 8000))]);
      const w = FPR * PW, h = Math.ceil((NF + 1) / FPR) * NR;
      if (!img || (img.naturalWidth || img.width) !== w || (img.naturalHeight || img.height) !== h) return null;
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const g = cv.getContext('2d', { willReadFrequently: true });
      if (!g) return null;
      g.drawImage(img, 0, 0);
      const px = g.getImageData(0, 0, w, h).data, out = [];
      for (let j = 0; j <= NF; j++) {
        const fx = (j % FPR) * PW, fy = Math.floor(j / FPR) * NR, rows = new Map();
        for (let r = 0; r < NR; r++) {
          const o = ((fy + r) * w + fx) * 4, iv = [];
          let st = -1;
          for (let c = 0; c <= NC; c++) {
            const on = c < NC && px[o + ((c / 3) | 0) * 4 + (c % 3)] > 127;
            if (on && st < 0) st = c;
            if (!on && st >= 0) { iv.push([((C0 + st) / 2 - 96) / GW, ((C0 + c) / 2 - 96) / GW]); st = -1; }
          }
          if (iv.length) rows.set(KR0 + r, iv);
        }
        out.push(rows);
      }
      // Every frame must hold a whole runner; otherwise the image is not what it should be.
      return out.every((m) => m.size >= 30) ? out : null;
    } catch (e) {
      return null;
    }
  },
  // The reference frames and paper tile. Any failure (a missing asset, an image that will not load or is the wrong
  // size, a slow network) gives null.
  async loadRef(kit) {
    try {
      const A = kit.assets;
      // Only the atlases holding frames the film shows: his last is J_LAST (he has faded out by then, see R_OUT).
      const J_LAST = Math.min(RNF, Math.ceil((JV + SPEED * (LAND + GD + R_OUT)) / RUN * RNF) + 2), need = (a) => a * PER <= J_LAST;
      if (!A || typeof A.has !== 'function' || typeof A.url !== 'function' || !REF.every((n, a) => !need(a) || A.has(n))) return null;
      const one = (n) => new Promise((ok, no) => {
        const im = new Image();
        im.crossOrigin = 'anonymous'; im.decoding = 'async';
        im.onload = () => ok(im); im.onerror = () => no(new Error(n + ' did not load'));
        im.src = A.url(n);
      });
      // the paper at the same time as the frames
      const paperP = A.has(PAPER) ? Promise.race([one(PAPER), new Promise((ok) => setTimeout(() => ok(null), 15000))]).catch(() => null) : Promise.resolve(null);
      // each atlas as WebP (lighter), else its JPEG
      const oneRef = (n) => new Promise((ok, no) => {
        const im = new Image(), jpg = () => { im.onerror = () => no(new Error(n + ' did not load')); im.src = A.url(n); };
        im.crossOrigin = 'anonymous'; im.decoding = 'async';
        im.onload = () => ok(im); im.onerror = jpg;
        try { im.src = A.url(n.replace(/\.jpg$/, '.webp')); } catch (e) { jpg(); }
      });
      const atlases = await Promise.race([Promise.all(REF.map((n, a) => (need(a) ? oneRef(n) : Promise.resolve(null)))), new Promise((ok, no) => setTimeout(() => no(new Error('reference frames timed out')), 15000))]);
      const rows = (a) => Math.ceil(Math.min(PER, RNF + 1 - a * PER) / COLS);
      if (!atlases.every((im, a) => !need(a) || (im && im.naturalWidth === COLS * FW && im.naturalHeight === rows(a) * FH))) return null;
      // The first frames are decoded before the film starts; the rest decode in the background.
      try { if (atlases[0].decode) await Promise.race([atlases[0].decode(), new Promise((ok) => setTimeout(ok, 3000))]); } catch (e) { /* drawn anyway */ }
      atlases.slice(1).forEach((im) => { try { if (im && im.decode) im.decode().catch(() => {}); } catch (e) { /* drawn anyway */ } });
      let paper = null;
      try { paper = await paperP; } catch (e) { paper = null; }
      return { atlases, paper, pattern: null };
    } catch (e) {
      return null;
    }
  },
  // The reference look at time t: the video's paper over the whole picture (easing out after the swap), and the
  // runner's frame multiplied onto it, splitting into the drawing's scanlines; each row gives way to the scanline
  // runner in turn.
  drawRef(g, t) {
    const S = this;
    S.drawRefAt(g, { pa: 1 - eio(seg(t, SWAP, PAPER_OUT)), T: tau(t), gap: 0.2 * seg(t, SPLIT0, SPLIT1), gone: (r) => t >= swapAt(r), sprite: t < SWAP, bob: S.bob(t) });
  },
  // The same, from values: paper alpha pa, running time T, scanline gap (0 to 0.2 of a row), which rows have
  // changed over (gone), whether the figure is still shown (sprite), and the body's bob.
  drawRefAt(g, o) {
    const S = this, R = S.ref, k = S.RW / (GW * VS);
    const pa = o.pa;
    if (!R || !(pa > 0)) return;
    g.save();
    let fill = PAPER_RGB;
    if (R.paper) {
      try {
        if (!R.pattern) R.pattern = g.createPattern(R.paper, 'repeat');
        if (R.pattern) {
          if (typeof R.pattern.setTransform === 'function' && typeof DOMMatrix === 'function') R.pattern.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0]));
          fill = R.pattern;
        }
      } catch (e) { fill = PAPER_RGB; }
    }
    g.globalAlpha = pa;
    g.fillStyle = fill;
    g.fillRect(-4, -4, S.G.w + 8, S.G.h + 8);
    const x = clamp01(o.T / RUN) * RNF, fr = S.refFrame(x);
    if (o.sprite && fr) {
      const X = S.ox + (BOX[0] - VO[0]) * k, Y = S.oy + (BOX[1] - VO[1]) * k, gap = o.gap;
      if (gap > 0) { // the gaps between the scanline runner's rows open across the solid figure; changed rows go
        const b = S.band, bob = o.bob;
        g.beginPath();
        for (let r = -6; r <= GR + 10; r++) if (!o.gone(r)) g.rect(X - 4, S.oy + (r + 0.5) * b + bob - b * (1 - gap) / 2, FW * k + 8, b * (1 - gap));
        g.clip();
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'multiply';
      g.imageSmoothingEnabled = true;
      try { g.imageSmoothingQuality = 'high'; } catch (e) { /* not supported */ }
      try { g.drawImage(fr[0], fr[1], fr[2], FW, FH, X, Y, FW * k, FH * k); } catch (e) { /* not decoded yet */ }
    }
    g.restore();
  },
  // The run's picture at (fractional) frame x: the nearest frame, or between two frames the two blended (see inBetween),
  // so his poses flow into each other whatever the screen's timing. [image, sx, sy] of an FW x FH picture, or null.
  refFrame(x) {
    const S = this, R = S.ref;
    if (!R) return null;
    const lo = Math.floor(Number.isFinite(x) ? x : 0), j0 = Math.min(RNF, Math.max(J_FIRST, lo)), j1 = Math.min(RNF, j0 + 1);
    const f = REDUCED || lo < J_FIRST || j1 === j0 ? 0 : inBetween(x - lo);
    const tile = (j) => { const im = R.atlases[Math.floor(j / PER)], q = j % PER; return im ? [im, (q % COLS) * FW, Math.floor(q / COLS) * FH] : null; };
    const a = tile(j0);
    if (!(f > 0.01)) return a;
    const b = tile(j1);
    if (!b || !a) return a || b;
    if (f > 0.99) return b;
    try {
      const cv = R.blend || (R.blend = document.createElement('canvas'));
      if (cv.width !== FW || cv.height !== FH) { cv.width = FW; cv.height = FH; }
      const c = cv.getContext('2d');
      if (!c) return a;
      c.globalAlpha = 1; c.globalCompositeOperation = 'copy';
      c.drawImage(a[0], a[1], a[2], FW, FH, 0, 0, FW, FH);
      c.globalAlpha = f; c.globalCompositeOperation = 'source-over';
      c.drawImage(b[0], b[1], b[2], FW, FH, 0, 0, FW, FH);
      c.globalAlpha = 1;
      return [cv, 0, 0];
    } catch (e) { return a; }
  },
  // The same for his darkness masks (see refMask): the two nearest blended. null if they cannot be made.
  refMaskAt(x) {
    const S = this, R = S.ref;
    if (!R || R.maskOff) return null;
    const lo = Math.floor(Number.isFinite(x) ? x : 0), j0 = Math.min(RNF, Math.max(J_FIRST, lo)), j1 = Math.min(RNF, j0 + 1);
    const f = REDUCED || lo < J_FIRST || j1 === j0 ? 0 : inBetween(x - lo);
    const m0 = S.refMask(j0);
    if (!m0 || !(f > 0.01)) return m0;
    const m1 = S.refMask(j1);
    if (!m1) return m0;
    if (f > 0.99) return m1;
    try {
      const cv = R.mblend || (R.mblend = document.createElement('canvas'));
      if (cv.width !== FW || cv.height !== FH) { cv.width = FW; cv.height = FH; }
      const c = cv.getContext('2d');
      if (!c) return m0;
      c.globalAlpha = 1 - f; c.globalCompositeOperation = 'copy'; c.drawImage(m0, 0, 0);
      c.globalAlpha = f; c.globalCompositeOperation = 'lighter'; c.drawImage(m1, 0, 0);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      return cv;
    } catch (e) { return m0; }
  },
  // The runner at time t as rows of strokes ({ k, iv }: row k, runs in runner widths): the traced frame for this
  // moment (gliding between the two nearest), and over the first 0.2 s the drawing easing into it. At t = 0, and
  // throughout with reduced motion or without the frames, exactly the drawing.
  rows(t) { return this.rowsAt(tau(t), t > 0 ? eio(seg(REDUCED ? t : SPEED * t, 0, MORPH)) : 0); },
  // The same from a running time T, w of the way from the drawing to the traced runner.
  rowsAt(T, w) {
    const S = this;
    let R = S.art;
    if (S.film && w > 0) {
      const x = clamp01(T / RUN) * NF, j = Math.min(NF - 1, Math.floor(x));
      R = morphRows(S.art, morphRows(S.film[j], S.film[j + 1], x - j), w);
    }
    return [...R.entries()].sort((p, q) => p[0] - q[0]).map(([k, iv]) => ({ k, iv }));
  },
  // The body's rise and fall, from the video (level at the start).
  bob(t) { return this.bobAt(tau(t)); },
  bobAt(T) { return this.film ? cat(DY, T * 24) * this.RW / GW : 0; },
  // The stretch into the crosses' footprint: starts gently just before he lands, done at HO + S1.
  fitE(t) { return (1 - Math.cos(Math.PI * seg(t, HO - 0.15, HO + S1))) / 2; },
  // Rows are not jittered while they reflow (no flicker); the approved film's own shimmer takes over from the crosses.
  shift() { return 0; },
  // One run (row k, a..b in widths) drawn at time t: [centre x, width, y] in pixels.
  run(k, a, b, t, f, w) {
    const S = this, c = (a + b) / 2, L = b - a;
    return [S.ox + (c + f * L) * S.RW + S.shift(k, t), L * w * S.RW, S.oy + (k + 0.5) * BAND * S.RW + S.bob(t)];
  },
  // One piece (from the hand-over runs) at time t: [centre x, width, y, height, alpha].
  piece(q, t) { const [x, w, y] = this.run(q.v.k, q.v.a, q.v.b, t, q.f, q.w); return [x, w, y, 0.8 * this.band, 1]; },
  // The film at time t: the run to the end of frame 58 (as it was), then his 3rd step, the circle bursting, the silver crosses and
  // the approved loader.
  render(t, kit) {
    // film time t (from 0) is START s into the scene's own timeline; anything that is not a time shows the first frame
    return this.renderFilm((Number.isFinite(t) ? Math.max(0, t) : 0) + START, kit);
  },
  renderFilm(t, kit) {
    const S = this;
    if (!(t >= JA)) { S.renderAt(Math.max(0, t) || 0, kit); return; }
    const g = kit.fx;
    // the loader (page layer): nothing of it before the burst; from it, the approved film from its frame 119
    const u = t - TC - GD;
    if (TJ + u > END_T) { S.bridge(g, seg(TJ + u, END_T, END_T + LOOP_BRIDGE)); return; } // (only when looping)
    S.logoAt(u < 0 ? T1 : u < EASE_IN ? B0 + u * u / (2 * EASE_IN) : TJ + u);
    if (!g) return;
    if (t < TC + Math.max(GD + R_OUT, G_FADE[1])) {
      S.drawGround(g, t - TC); // the ground under his foot
      S.jumpRunner(g, t - JA); // he runs on to his 3rd step, holds, then fades as the circle bursts
    }
  },
  // The loop's return, v (0 to 1) of the way: the finished identity as it holds, with the film's opening frame fading
  // in over it (eased), so that at its end the picture is exactly the opening frame and the loop carries on from it.
  // If the opening frame cannot be drawn apart, the identity simply holds until the loop starts again.
  bridge(g, v) {
    const S = this;
    S.logoAt(END_T);
    if (!g || !(v > 0)) return;
    const a = eio(Math.min(1, v));
    // without the video's paper the opening frame does not cover the page: the identity fades out under it instead
    if (!S.ref) for (const el of [S.disc, S.silver, S.x, S.ftl]) if (el) el.style.opacity = String(Math.min(+el.style.opacity || 0, 1 - a));
    const c = S.startFrame(g);
    if (!c) return;
    g.save();
    try { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.globalCompositeOperation = 'source-over'; g.drawImage(c, 0, 0); } finally { g.restore(); }
  },
  // The opening frame (film time 0) drawn on a canvas of its own, the same size and scale as the film's; made once per
  // size. null if it cannot be made.
  startFrame(g) {
    const S = this;
    try {
      const W0 = g.canvas.width, H0 = g.canvas.height, m = g.getTransform();
      const key = W0 + 'x' + H0 + ':' + m.a + ',' + m.d;
      if (S.startCv && S.startCv.key === key) return S.startCv.cv;
      const cv = (S.startCv && S.startCv.cv) || document.createElement('canvas');
      cv.width = W0; cv.height = H0;
      const c = cv.getContext('2d');
      if (!c) return null;
      c.setTransform(m);
      S.noDom = true; // (its page layer is the identity's, as it is: only the canvas is drawn)
      try { S.renderAt(START, { fx: c }); } finally { S.noDom = false; }
      S.startCv = { key, cv };
      return cv;
    } catch (e) { S.noDom = false; S.startCv = null; return null; }
  },
  // The ground streak, s after the landing: it spreads out from under his foot (GROW, easing out), stays while he holds,
  // and fades with him as the circle bursts.
  drawGround(g, s) {
    const S = this, q = S.ground;
    if (!q || !(s > 0) || (S.ref && S.ref.maskOff)) return; // (none if he faded before the landing, see fadeRef)
    const a = 1 - eio(seg(s, G_FADE[0], G_FADE[1])), w = eo(seg(s, 0, GROW));
    if (!(a > 0) || !(w > 0)) return;
    let qx = q.x, qy = q.y;
    if (!REDUCED && S.film) {
      // the ground moves back at its steady speed, under the middle of his planted foot; with his video frames, at the
      // frame he is shown in (so the foot never slips on it), else smoothly
      const k = S.RW / (GW * VS), X = S.ox + (BOX[0] - VO[0]) * k, Y = S.oy + (BOX[1] - VO[1]) * k;
      let j = (JV + SPEED * (LAND + s)) / RUN * RNF;
      if (S.ref) { const lo = Math.floor(j); j = lo + inBetween(j - lo); qy = Y + FOOT[3] * k; } // (as his picture is shown)
      const x = X + (FOOT[0] - FOOT[2] * (j - FOOT[1])) * k;
      if (Number.isFinite(x) && Number.isFinite(qy)) qx = x; else qy = q.y;
    }
    const R = S.RW, xl = qx - G_BACK * R * w, xr = qx + G_FRONT * R * w, h = G_H * R * (0.35 + 0.65 * w), xm = qx - 0.02 * R;
    g.save();
    try {
      g.globalAlpha = a;
      g.fillStyle = S.ink;
      g.beginPath();
      g.moveTo(xl, qy);
      g.quadraticCurveTo(xm, qy - h, xr, qy);
      g.quadraticCurveTo(xm, qy + h * 0.6, xl, qy);
      g.closePath();
      g.fill();
    } finally {
      g.restore();
    }
  },
  // The loader at original time T: the approved loader without its big black crosses; the silver crosses fade in over
  // SILVER, once the circle is whole.
  logoAt(T) {
    const S = this;
    if (S.noDom) return;
    W.dom(S, T);
    if (S.sil) S.sil.style.opacity = '0';
    // (a gentle ease-out, so they are still visibly coming in as the rise begins)
    try { S.reveal(T); } catch (e) { if (S.silver) { S.silver.style.opacity = '1'; S.unmask(); } }
    try { S.merge(T); } catch (e) { /* the approved segments as they are */ }
    try { S.settle(T); } catch (e) { /* the approved circle as it is */ }
    try { S.specks(T); } catch (e) { /* as approved */ }
    try { S.shine(T); } catch (e) { for (const q of [S.sweep, S.xSweep, S.ftlSweep]) if (q) q.style.display = 'none'; }
  },
  // The crosses lighting up (original time T): dark before the middle one's light comes; then each cross is shown down
  // to where its light has reached (a soft edge), the middle one first; once lit, each rests at its REST_A (the outer
  // two a touch softer than the middle one). With reduced motion each simply fades in, the middle one first; if the browser cannot mask
  // the image, all three fade in together.
  reveal(T) {
    const S = this, sv = S.silver, G = S.G;
    if (!sv || !G) return;
    const t0 = LIGHT_AT[1][0], t1 = Math.max(LIGHT_AT[0][1], LIGHT_AT[1][1], LIGHT_AT[2][1]);
    if (!(T >= t0)) { sv.style.opacity = '0'; S.unmask(); return; }
    if (S.maskOK === undefined) {
      try { S.maskOK = typeof CSS !== 'undefined' && !!CSS.supports && (CSS.supports('mask-image', 'linear-gradient(#000,#000)') || CSS.supports('-webkit-mask-image', 'linear-gradient(#000,#000)')); } catch (e) { S.maskOK = false; }
    }
    if (!S.maskOK) { sv.style.opacity = String(eo(seg(T, t0, t1))); S.unmask(); return; } // (all three alike, as before)
    const p6 = eio(seg(T, 2.2, 2.45)), kL = lerp(S.D5, S.D6, p6) / 463.5;
    if (!(kL > 0)) { sv.style.opacity = '1'; S.unmask(); return; }
    const img = [], pos = [], size = [];
    CROSSES.forEach(([x0, x1, y0, y1], i) => {
      const v = seg(T, LIGHT_AT[i][0], LIGHT_AT[i][1]), r = REST_A[i];
      if (REDUCED || v >= 1) { const a = (r * eio(v)).toFixed(3); img.push('linear-gradient(rgba(0,0,0,' + a + '), rgba(0,0,0,' + a + '))'); }
      else {
        const e = lerp(y0 - FEATHER, y1 + FEATHER, eio(v)) / 480 * 100, f = FEATHER / 480 * 100;
        img.push('linear-gradient(180deg, rgba(0,0,0,' + r.toFixed(3) + ') ' + (e - f).toFixed(2) + '%, rgba(0,0,0,0) ' + (e + f).toFixed(2) + '%)');
      }
      pos.push((x0 * kL).toFixed(2) + 'px 0px'); size.push(((x1 - x0) * kL).toFixed(2) + 'px 100%');
    });
    sv.style.opacity = '1';
    const key = img.join(', ') + '|' + pos.join(', ') + '|' + size.join(', ');
    if (S.masked && S.maskKey === key) return; // (unchanged: nothing to write, as through the final hold)
    for (const [p, v] of [['maskImage', img.join(', ')], ['maskPosition', pos.join(', ')], ['maskSize', size.join(', ')], ['maskRepeat', 'no-repeat']]) {
      sv.style[p] = v; sv.style['webkit' + p[0].toUpperCase() + p.slice(1)] = v;
    }
    S.masked = true; S.maskKey = key;
  },
  // The crosses' image back to itself (no mask).
  unmask() {
    const S = this, sv = S.silver;
    if (!sv || !S.masked) return;
    for (const p of ['maskImage', 'maskPosition', 'maskSize', 'maskRepeat']) { sv.style[p] = ''; sv.style['webkit' + p[0].toUpperCase() + p.slice(1)] = ''; }
    S.masked = false; S.maskKey = '';
  },
  // The burst's specks, as the circle settles: each is drawn in to just inside the circle's edge, shrinking, as it
  // fades (all gone by SPECK[1]), so nothing is left outside the solid circle.
  specks(T) {
    const S = this, G = S.G;
    if (!(T > 1.5 && T < 1.9) || !S.sp || !G) return;
    for (const q of S.sp) q.el.style.opacity = '0'; // (no stray specks around the forming circle)
    return;
    const a = eo(seg(T, B0, 1.62)) * (1 - eio(seg(T, SPECK[0], SPECK[1]))), m = eio(seg(T, SPECK[0], SPECK[1]));
    const b = Math.sin(Math.PI * seg(T, OV_SEG[0], OV_SEG[1])), R = S.D5 / 2 * (W.expo(seg(T, B0, 1.8)) + OV * b * b);
    for (const q of S.sp) {
      const k = 1 - 0.6 * m, w = q.w * k, h = q.h * k, dx = q.x + q.w / 2, dy = q.y + q.h / 2, d = Math.hypot(dx, dy) || 1;
      const f = lerp(1, Math.min(1, 0.85 * R / d), m), x = G.cx + dx * f - w / 2, y = S.c5 + dy * f - h / 2;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      q.el.style.opacity = String(a > 0.001 ? a : 0);
      q.el.style.width = w.toFixed(1) + 'px';
      q.el.style.height = h.toFixed(1) + 'px';
      q.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }
  },
  // One soft white light moving down (only on the crosses and the x: their shapes are its masks): from the top of the
  // crosses to their bottom, then on down through the x, fading in at the start and out at the end. Outside SWEEP it is
  // hidden and they look exactly as they did.
  shine(T) {
    const S = this, el = S.sweep, xl = S.xSweep;
    const off = (e) => {
      if (!e || e.style.display === 'none') return;
      for (const q of [e, S.sweepLight, S.sweepGlow]) if (q && (q === e || e === el)) q.style.background = 'none';
      e.style.clipPath = 'none'; e.style.opacity = '0'; e.style.display = 'none';
    };
    const u = seg(T, SWEEP[0], SWEEP[1]), G = S.G;
    const active = (i) => { const v = seg(T, LIGHT_AT[i][0], LIGHT_AT[i][1]); return v > 0 && v < 1; };
    const fl = S.ftlSweep, uf = seg(T, FLOW[0], FLOW[1]);
    const sheen = SHEEN * eio(seg(T, SHEEN_IN[0], SHEEN_IN[1]));
    if (!G || (!el && !xl && !fl) || (!(uf > 0 && uf < 1) && ![0, 1, 2].some(active) && !(sheen > 0))) { off(el); off(xl); off(fl); return; }
    // where things are now (as the approved loader places them): the crosses' frame and the x
    const p6 = eio(seg(T, 2.2, 2.45)), kL = lerp(S.D5, S.D6, p6) / 463.5, oy = lerp(S.c5, S.c6, p6) - 240.5 * kL, size = 480 * kL;
    let xT = S.x ? parseFloat(S.x.style.top) : NaN, xH = S.x ? parseFloat(S.x.style.height) : NaN;
    if (!Number.isFinite(xT) || !(xH > 0)) { xH = 0.075 * G.Ub; xT = G.topF + 0.657 * G.Ub - xH / 2; }
    if (!(size > 0) || !Number.isFinite(oy)) { off(el); off(xl); off(fl); return; }
    const env = (v) => eo(seg(v, 0, 0.2)) * (1 - eio(seg(v, 0.75, 1))); // (fades in, then out, as it goes)
    const grad = (c, w, a) => 'linear-gradient(180deg, rgba(255,255,255,0) ' + (c - w).toFixed(2) + '%, rgba(255,255,255,' + a.toFixed(3) + ') ' + c.toFixed(2) + '%, rgba(255,255,255,0) ' + (c + w).toFixed(2) + '%)';
    // the light on each cross as it lights up: a small soft oval at its lit edge, travelling down it, the middle one's
    // the strongest; the bloom (glow) follows it
    const hA = CROSS_H * G.Ub / kL, bgs = [];
    let lo = 100, hi = 0;
    CROSSES.forEach(([x0, x1, y0, y1], i) => {
      const v = seg(T, LIGHT_AT[i][0], LIGHT_AT[i][1]);
      if (!(v > 0 && v < 1)) return;
      const c = lerp(y0 - FEATHER, y1 + FEATHER, eio(v)) / 480 * 100, w = hA / 480 * 100, a = SWEEP_A * SHINE[i] * env(v);
      const rx = 0.45 * (x1 - x0) * kL, ry = hA * kL, X = (x0 + x1) / 2 * kL, Y = c / 100 * size, A = (k) => 'rgba(255,255,255,' + (a * k).toFixed(3) + ')';
      bgs.push('radial-gradient(' + rx.toFixed(2) + 'px ' + ry.toFixed(2) + 'px at ' + X.toFixed(2) + 'px ' + Y.toFixed(2) + 'px, ' + A(1) + ' 0%, ' + A(0.85) + ' 45%, ' + A(0) + ' 100%) no-repeat');
      lo = Math.min(lo, c - w); hi = Math.max(hi, c + w);
    });
    const glows = bgs.slice();
    if (sheen > 0) { // the middle cross's steady sheen, at its crossing (its bloom fainter)
      const [cx, cy, rx, ry] = SHEEN_AT, oval = (s0) => { const A = (k) => 'rgba(255,255,255,' + (s0 * k).toFixed(3) + ')'; return 'radial-gradient(' + (rx * kL).toFixed(2) + 'px ' + (ry * kL).toFixed(2) + 'px at ' + (cx * kL).toFixed(2) + 'px ' + (cy * kL).toFixed(2) + 'px, ' + A(1) + ' 0%, ' + A(0.6) + ' 50%, ' + A(0) + ' 100%) no-repeat'; };
      bgs.push(oval(sheen)); glows.push(oval(sheen * SHEEN_GLOW));
      lo = Math.min(lo, (cy - ry) / 480 * 100); hi = Math.max(hi, (cy + ry) / 480 * 100);
    }
    if (el && S.silver && bgs.length) {
      const sv = S.silver.style, bg = bgs.join(', ');
      el.style.display = 'block';
      el.style.width = sv.width; el.style.height = sv.height; el.style.transform = sv.transform;
      el.style.clipPath = 'inset(' + Math.max(0, lo - 2).toFixed(2) + '% 0 ' + Math.max(0, 100 - hi - 2).toFixed(2) + '% 0)'; // (only the lit strip is painted)
      (S.sweepLight || el).style.background = bg;
      if (S.sweepGlow) S.sweepGlow.style.background = glows.join(', ');
      el.style.opacity = '1';
    } else off(el);
    // then on down, one flowing movement, from the crosses' foot through the x and then FTL
    let fT = S.ftl ? parseFloat(S.ftl.style.top) : NaN, fH = S.ftl ? parseFloat(S.ftl.style.height) : NaN;
    if (!Number.isFinite(fT) || !(fH > 0)) { fH = Math.max(44, 0.164 * G.Ub); fT = G.topF + 0.759 * G.Ub; }
    const h = 0.06 * G.Ub, af = eo(seg(uf, 0, 0.1)) * (1 - eio(seg(uf, 0.85, 1)));
    const keys = [[FLOW[0], oy + CR[1] * kL], [FLOW_X[0], xT - h], [FLOW_X[1], xT + xH + h], [FLOW_F, fT - h], [FLOW[1], fT + fH + h]];
    let yf = keys[0][1];
    for (let i = 1; i < keys.length; i++) if (T >= keys[i - 1][0]) yf = lerp(keys[i - 1][1], keys[i][1], seg(T, keys[i - 1][0], keys[i][0]));
    const on = uf > 0 && uf < 1 && Number.isFinite(yf);
    if (xl && on && yf - h < xT + xH && yf + h > xT) {
      xl.style.display = 'block';
      xl.style.background = grad((yf - xT) / xH * 100, h / xH * 100, 1);
      xl.style.opacity = (X_A * af).toFixed(4);
    } else off(xl);
    if (fl && on && yf - h < fT + fH && yf + h > fT) {
      fl.style.display = 'block';
      fl.style.background = grad((yf - fT) / fH * 100, h / fH * 100, 1);
      fl.style.opacity = (FTL_A * af).toFixed(4);
    } else off(fl);
  },
  // (Not used: FTL no longer pulses. Kept should it be wanted again: PULSES pulses over PULSE, each 100% to 103% and back.)
  pulse(T) {
    const S = this;
    if (REDUCED || !S.ftl || !(T > PULSE[0] && T < PULSE[1])) return;
    const b = Math.sin(Math.PI * PULSES * seg(T, PULSE[0], PULSE[1])); // (PULSES pulses, each eased in and out)
    S.ftl.style.transform = 'translateY(0.00px) scale(' + (1 + PULSE_K * b * b).toFixed(4) + ')';
  },
  // The burst's follow-through (original time T): its radius goes OV past the circle's and eases back over OV_SEG;
  // here the solid disc (from 1.9) is drawn at it (the segments before that: merge). Elsewhere the approved circle is untouched.
  settle(T) {
    const S = this, G = S.G, K = S.K;
    if (!(T >= 1.9 && T < OV_SEG[1]) || !S.disc || !G) return;
    const D = S.D5, cy = S.c5, b = Math.sin(Math.PI * seg(T, OV_SEG[0], OV_SEG[1])), R = D / 2 * (W.expo(seg(T, B0, 1.8)) + OV * b * b);
    if (!(R > 0.5) || !Number.isFinite(R) || !Number.isFinite(cy)) return;
    S.disc.style.width = S.disc.style.height = (2 * R).toFixed(2) + 'px';
    S.disc.style.transform = 'translate(' + (G.cx - R).toFixed(2) + 'px,' + (cy - R).toFixed(2) + 'px)';
  },
  // The merge (original time T, until the circle is solid at 1.9): its horizontal segments trail behind (left; he runs right) by each one's own steady amount and slide forward into
  // place one after another; the edge streaks hold a steady length, longer behind him. The circle grows as before.
  merge(T) {
    const S = this, G = S.G;
    if (!(T >= B0 && T < 1.9) || !G || !S.sl) return;
    const b = Math.sin(Math.PI * seg(T, OV_SEG[0], OV_SEG[1])), R = S.D5 / 2 * (W.expo(seg(T, B0, 1.8)) + OV * b * b), cy = S.c5;
    if (!(R > 0.5) || !Number.isFinite(R) || !Number.isFinite(cy)) return;
    const bh = 2 * R / S.N, rise = eo(seg(T, B0, 1.6));
    S.sl.forEach((q, i) => {
      const dx = -MERGE_A * G.Ub * (q.trail || 0) * rise * (1 - W.eoq(seg(T - (q.lag || 0), 1.58, 1.88 - MERGE_LAG)));
      q.el.style.width = (2 * R).toFixed(2) + 'px';
      q.el.style.height = (bh + 2).toFixed(2) + 'px';
      q.el.style.transform = 'translate(' + (G.cx - R + dx).toFixed(2) + 'px,' + (cy - R + i * bh).toFixed(2) + 'px)';
      q.inner.style.width = q.inner.style.height = (2 * R).toFixed(2) + 'px';
      q.inner.style.transform = 'translateY(' + (-i * bh).toFixed(2) + 'px)';
    });
    const life = eo(seg(T, 1.57, 1.62)) * (1 - W.eoq(seg(T, 1.62, 1.86)));
    for (const q of S.st || []) {
      const y = q.f * R, e2 = R * R - y * y;
      if (!(life > 0) || !(e2 > 0)) { q.el.style.opacity = 0; continue; }
      const L = 0.6 * q.len * life, ex = Math.sqrt(e2);
      q.el.style.opacity = 1;
      q.el.style.width = L.toFixed(1) + 'px';
      q.el.style.transform = 'translate(' + (q.side > 0 ? G.cx + ex - 2 : G.cx - ex - L + 2).toFixed(1) + 'px,' + (cy + y - q.th / 2).toFixed(1) + 'px)';
    }
  },
  // The runner and his paper during the jump: the paper fades to the loader's ground; from the landing he fades.
  jumpRunner(g, s) {
    const S = this;
    if (!g) return;
    const pa = 1 - eio(seg(s, J_PAPER[0], J_PAPER[1])), ra = 1 - eio(seg(s, LAND + GD, LAND + GD + R_OUT)); // (he fades as the circle bursts)
    if (!(pa > 0) && !(ra > 0)) return;
    const tauR = REDUCED ? 0 : Math.min(RUN, JV + SPEED * s); // (he runs on through the landing until he fades)
    g.save();
    try {
      if (S.ref) S.fadeRef(g, s, tauR, pa, ra);
      else if (ra > 0) {
        // without the reference frames: the scanline runner (and his speed lines) fade the same way
        g.fillStyle = S.ink;
        const b = S.band, bob = S.bobAt(tauR);
        const bar = (lx, rx, y, h, al) => { const L = Math.round(lx), R = Math.round(rx), Tp = Math.round(y - h / 2), B = Math.round(y + h / 2); if (B > Tp) W.rect(S, g, L, R, (Tp + B) / 2, B - Tp, al); };
        for (const { k, iv } of S.rowsAt(tauR, 1)) for (const [x0, x1] of iv) bar(S.ox + x0 * S.RW, S.ox + x1 * S.RW, S.oy + (k + 0.5) * BAND * S.RW + bob, 0.8 * b, ra);
        const tr = JA + s + REVEAL;
        for (const l of S.lines) {
          const u = (tr * SPEED / 0.45 + l.off) % 1, len = l.len * b * (1 - u), x = S.ox + (0.25 - u * 0.5) * S.RW;
          bar(x - len, x, S.oy + l.y * S.RW * ASP + bob, Math.max(1, 0.5 * b), 0.45 * ra * (1 - u));
        }
      }
    } finally {
      g.restore();
    }
  },
  // The reference look, fading: the paper at alpha pa, and the runner as a darkness mask at alpha ra over it (where
  // both are 1 this is exactly the usual multiply onto the paper). If the mask cannot be made, he stays on his
  // paper and both fade out just before his foot lands.
  fadeRef(g, s, T, pa, ra) {
    const S = this, R = S.ref, k = S.RW / (GW * VS);
    const j = Math.min(RNF, Math.max(J_FIRST, Math.round(clamp01(T / RUN) * RNF)));
    const X = S.ox + (BOX[0] - VO[0]) * k, Y = S.oy + (BOX[1] - VO[1]) * k;
    let fill = PAPER_RGB;
    if (R.paper) {
      try {
        if (!R.pattern) R.pattern = g.createPattern(R.paper, 'repeat');
        if (R.pattern) {
          if (typeof R.pattern.setTransform === 'function' && typeof DOMMatrix === 'function') R.pattern.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0]));
          fill = R.pattern;
        }
      } catch (e) { fill = PAPER_RGB; }
    }
    g.imageSmoothingEnabled = true;
    try { g.imageSmoothingQuality = 'high'; } catch (e) { /* not supported */ }
    const xf = clamp01(T / RUN) * RNF, mask = ra > 0 ? S.refMaskAt(xf) : null;
    if (mask || !(ra > 0)) {
      if (pa > 0) { g.globalAlpha = pa; g.fillStyle = fill; g.fillRect(-4, -4, S.G.w + 8, S.G.h + 8); }
      if (mask) { g.globalAlpha = ra; try { g.drawImage(mask, X, Y, FW * k, FH * k); } catch (e) { /* not decoded yet */ } }
      return;
    }
    // Without the mask he can only be shown on his paper: he runs on it until just before his foot lands, then he
    // and the paper fade out together (J_FALL), before the circle bursts.
    const a = 1 - eio(seg(s, J_FALL[0], J_FALL[1]));
    if (!(a > 0)) return;
    const fr = S.refFrame(xf);
    g.globalAlpha = 1; g.fillStyle = fill;
    g.fillRect(-4, -4, S.G.w + 8, S.G.h + 8);
    if (fr) {
      g.globalCompositeOperation = 'multiply';
      try { g.drawImage(fr[0], fr[1], fr[2], FW, FH, X, Y, FW * k, FH * k); } catch (e) { /* not decoded yet */ }
    }
    if (a < 1) { // all of it at once: what is drawn here keeps only a of its opacity
      g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1 - a; g.fillStyle = '#000';
      g.fillRect(-4, -4, S.G.w + 8, S.G.h + 8);
    }
  },
  // Reads atlas a (and those after it) back once on the CPU, a task each, so a later mask from it is quick.
  warmRef(a) {
    const S = this, R = S.ref;
    if (!R || R.maskOff || !(a < R.atlases.length)) return;
    setTimeout(() => {
      try {
        if (!R.warm) { R.warm = document.createElement('canvas'); R.warm.width = R.warm.height = 1; }
        const c = R.warm.getContext('2d', { willReadFrequently: true });
        if (!c || !R.atlases[a]) return;
        c.drawImage(R.atlases[a], 0, 0, 1, 1, 0, 0, 1, 1);
        c.getImageData(0, 0, 1, 1);
      } catch (e) { return; } // only a head start: the mask is made when needed either way
      S.warmRef(a + 1);
    }, 60);
  },
  // Reference frame j as a darkness mask (black, alpha 1 - its grey), made when first needed; the last three are kept.
  // null if it cannot be made (no canvas, an image that cannot be read back).
  refMask(j) {
    const S = this, R = S.ref;
    if (!R || R.maskOff) return null;
    if (!R.masks) R.masks = new Map();
    if (R.masks.has(j)) { const hit = R.masks.get(j); R.masks.delete(j); R.masks.set(j, hit); return hit; }
    try {
      const im = R.atlases[Math.floor(j / PER)], q = j % PER;
      if (!im) return null;
      let cv = null;
      if (R.masks.size >= 3) { const old = R.masks.keys().next().value; cv = R.masks.get(old); R.masks.delete(old); }
      cv = cv || document.createElement('canvas');
      if (cv.width !== FW || cv.height !== FH) { cv.width = FW; cv.height = FH; }
      const c = cv.getContext('2d', { willReadFrequently: true });
      if (!c) throw new Error('no 2D canvas');
      c.globalCompositeOperation = 'copy';
      c.drawImage(im, (q % COLS) * FW, Math.floor(q / COLS) * FH, FW, FH, 0, 0, FW, FH);
      const d = c.getImageData(0, 0, FW, FH), p = d.data;
      for (let i = 0; i < p.length; i += 4) { const v = p[i]; p[i] = p[i + 1] = p[i + 2] = 0; p[i + 3] = 255 - v; }
      c.putImageData(d, 0, 0);
      R.masks.set(j, cv);
      return cv;
    } catch (e) {
      R.maskOff = true; // fall back for good (for example, an image that may not be read back)
      return null;
    }
  },
  // The film at original time t (the run, the old hand-over and the approved loader).
  renderAt(t, kit) {
    const S = this, g = kit.fx, b = S.band;
    S.logoAt(Math.max(t - OP, 0) + T1);
    if (!g) return;
    if (t >= OP) { W.frags(S, t - OP + T1, g); return; }
    g.save();
    g.fillStyle = S.ink;
    // Every bar is snapped edge by edge (left, right, top, bottom each rounded once), so its edges only ever move one
    // way as it slides or stretches: no one-pixel shimmer.
    const bar = (lx, rx, y, h, a) => { const L = Math.round(lx), R = Math.round(rx), T = Math.round(y - h / 2), B = Math.round(y + h / 2); if (B > T) W.rect(S, g, L, R, (T + B) / 2, B - T, a); };
    // The rows come in from the top as he starts to run (the film opens part-way through, as in the first frame).
    // With the reference frames, the video's look comes first and the scanline runner appears at the split; without
    // them, the scanline runner's rows come in from the top as he starts to run.
    const ref = !!S.ref;
    if (ref && t < PAPER_OUT) S.drawRef(g, t);
    const tr = t + REVEAL, show = (k) => (ref ? (t >= swapAt(k) ? 1 : 0) : eo(clamp01((tr - 0.14 * clamp01(k / GR)) / 0.12)));
    const fe = S.fitE(t);
    if (t < HO) {
      // Running, then settling into his final pose (the stretch just beginning): drawn fresh each frame.
      for (const { k, iv } of S.rows(t)) {
        const a = show(k);
        if (a > 0) for (const [x0, x1] of iv) {
          let [x, w, y] = S.run(k, x0, x1, t, 0, 1), h = 0.8 * b;
          if (fe > 0 && S.fit) { const F = S.fit([x, w, y], S.h1); x = lerp(x, F[0], fe); w = lerp(w, F[1], fe); y = lerp(y, F[2], fe); h = lerp(h, F[3], fe); }
          bar(x - w / 2, x + w / 2, y, h, a);
        }
      }
    } else {
      const e1 = fe;
      for (const q of S.pc) {
        // The stretch (all together), and overlapping its end each piece's slide to its dash of the crosses,
        // arriving with that dash's own speed so the approved film carries on without a jolt.
        const dx = S.shift(q.v.k, t);
        const u = seg(t, q.s1, OP), D = Math.max(1e-3, OP - q.s1);
        const s = q.P0.map((val, m) => lerp(val, q.P1[m], e1) + (u > 0 ? hermite(u, 0, 0, q.E[m] - q.P1[m], q.V[m], D) : 0));
        if (s[1] >= 0.5) bar(s[0] - s[1] / 2 + dx, s[0] + s[1] / 2 + dx, s[2], Math.max(1, s[3]), clamp01(s[4]));
      }
      // Runs left without a fragment of their own stretch with the rest and fade.
      const fa = 1 - eio(seg(t, HO, HO + S1));
      if (fa > 0) for (const v of S.ghost) { const s = v.P0.map((val, m) => lerp(val, v.P1[m], e1)); bar(s[0] - s[1] / 2, s[0] + s[1] / 2, s[2], s[3], fa); }
    }
    // Faint speed lines stream back from the scanline runner while he runs (not over the reference look, which has none).
    const sp = ref ? 0 : 1 - eio(seg(t, GL - 0.2, HO - 0.05));
    if (sp > 0) for (const l of S.lines) {
      const u = (tr * SPEED / 0.45 + l.off) % 1, len = l.len * b * (1 - u), x = S.ox + (0.25 - u * 0.5) * S.RW;
      bar(x - len, x, S.oy + l.y * S.RW * ASP + S.bob(t), Math.max(1, 0.5 * b), 0.45 * sp * (1 - u) * eo(clamp01(tr / 0.2)));
    }
    g.restore();
  },
});
}
