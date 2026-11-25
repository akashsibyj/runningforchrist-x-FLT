/* eslint-disable */
// The approved loader's shared drawing code (crosses, black circle, silver crosses, x and FTL), exactly as in the
// film. Wrapped so it builds its helpers for one player instead of a global.
export default function installShared(kit) {
// Running for Christ x Fear The Lamb loader: three candidate openings over the approved animation.
// U is the height of a storyboard panel; every size below is a ratio of it.
const W = {
  // The 480 px artwork frame of the supplied logo: disc centre, radius, and the crosses' bounds.
  ART: { size: 480, cx: 240, cy: 240.5, r: 231.75, top: 157, bottom: 353, left: 78, right: 426 },
  // Landscape: one storyboard frame, U = min(height, 0.63 x width), centred (unchanged; no side margin).
  // Portrait: frames 01-03 use Ua = 0.42 x width (crosses 61% of the width); 04-06 use Ub = min(0.66 x width, height).
  // Each state is centred on the screen, and nothing is drawn within m (10% of the width) of either side.
  // The layout unit for a w x h screen. As a loading screen the mark is kept to LOADER_H of the screen's height at most
  // and then drawn at LOADER_S of that size on every screen (a desktop or laptop: under half its height; a phone held
  // upright: about a quarter of its width for the circle), always centred.
  LOADER_H: 0.55, LOADER_S: 0.8,
  geo(kit) {
    const w = kit.W, h = kit.H, land = w >= h, cap = this.LOADER_H * h, k = this.LOADER_S;
    if (land) { const U = k * Math.min(h, 0.63 * w, cap), top = (h - U) / 2; return { w, h, cx: w / 2, Ua: U, Ub: U, topA: top, topB: top, topF: top, m: null }; }
    const Ub0 = Math.min(0.66 * w, h), Ub = k * Math.min(Ub0, cap), Ua = 0.42 * w * (Ub / Ub0);
    return { w, h, cx: w / 2, Ua, Ub, topA: h / 2 - 0.565 * Ua, topB: h / 2 - 0.444 * Ub, topF: h / 2 - 0.4935 * Ub, m: 0.1 * w };
  },
  // The logo's own rows: each entry is one horizontal run of the cross silhouette (x0, x1, y) in the artwork frame.
  DASH: '166.0,168.5,157.0;352.8,355.2,157.0;165.0,168.0,160.6;254.9,257.4,160.6;351.9,355.0,160.6;163.9,167.1,164.2;253.4,257.1,164.2;350.5,354.1,164.2;162.6,166.6,167.8;252.0,256.1,167.8;349.1,353.5,167.8;161.0,165.9,171.4;250.9,255.1,171.4;347.9,353.1,171.4;159.9,165.1,175.0;249.8,254.8,175.0;346.9,352.1,175.0;158.6,164.1,178.6;248.0,254.1,178.6;345.6,351.9,178.6;157.0,164.4,182.2;246.8,253.4,182.2;344.2,351.4,182.2;155.9,163.2,185.8;245.1,253.5,185.8;342.9,350.8,185.8;154.8,162.4,189.4;243.9,253.6,189.4;341.8,350.2,189.4;153.0,161.6,193.0;242.8,253.6,193.0;340.1,349.1,193.0;151.9,160.2,196.6;241.0,253.8,196.6;338.9,348.1,196.6;149.1,159.5,200.2;237.4,254.6,200.2;336.4,347.1,200.2;349.9,352.4,200.2;143.2,171.0,203.8;222.9,272.9,203.8;327.9,365.2,203.8;77.0,138.0,207.4;139.3,213.5,207.4;215.1,285.0,207.4;286.6,301.8,207.4;302.9,388.5,207.4;389.8,427.1,207.4;77.0,126.1,211.0;127.0,175.5,211.0;192.8,206.8,211.0;207.6,242.1,211.0;243.6,261.4,211.0;274.4,276.9,211.0;280.0,283.2,211.0;293.4,367.8,211.0;368.5,387.6,211.0;394.4,396.9,211.0;398.1,400.6,211.0;147.2,155.1,214.6;237.1,246.0,214.6;256.9,263.9,214.6;327.8,344.0,214.6;143.2,154.1,218.2;235.1,244.6,218.2;249.6,259.8,218.2;330.9,343.1,218.2;143.2,153.1,221.8;234.1,254.8,221.8;331.8,342.1,221.8;143.6,152.0,225.4;233.1,251.9,225.4;331.9,341.1,225.4;142.9,151.0,229.0;232.0,249.2,229.0;331.5,340.1,229.0;142.0,149.9,232.6;231.1,247.0,232.6;330.9,339.1,232.6;341.5,344.4,232.6;141.6,148.6,236.2;151.1,153.6,236.2;230.8,239.9,236.2;241.8,245.1,236.2;329.9,338.2,236.2;339.9,343.5,236.2;140.9,147.9,239.8;229.9,243.8,239.8;329.1,337.2,239.8;338.8,342.0,239.8;139.9,149.4,243.4;228.9,242.1,243.4;328.1,340.1,243.4;139.2,148.8,247.0;227.9,240.8,247.0;327.4,338.2,247.0;138.5,147.2,250.6;227.0,239.1,250.6;326.5,337.1,250.6;137.9,145.1,254.2;226.2,237.6,254.2;325.9,335.2,254.2;136.9,144.0,257.8;225.6,236.4,257.8;324.9,334.1,257.8;135.9,142.2,261.4;224.6,235.0,261.4;323.9,332.6,261.4;134.9,141.1,265.0;223.9,233.6,265.0;322.9,331.1,265.0;133.9,140.0,268.6;222.9,232.0,268.6;321.9,329.5,268.6;132.9,138.4,272.2;221.9,230.8,272.2;320.9,328.1,272.2;132.0,137.2,275.8;220.9,229.1,275.8;319.9,326.5,275.8;131.0,136.0,279.4;220.0,228.1,279.4;319.0,325.1,279.4;129.9,134.6,283.0;219.1,227.0,283.0;318.0,324.0,283.0;129.0,133.2,286.6;218.5,225.2,286.6;317.0,322.5,286.6;128.0,132.1,290.2;217.0,224.1,290.2;316.1,321.1,290.2;127.0,131.0,293.8;216.4,223.0,293.8;315.4,320.0,293.8;125.9,129.6,297.4;215.5,221.5,297.4;314.2,318.4,297.4;124.9,128.2,301.0;214.6,220.1,301.0;313.2,317.1,301.0;123.9,127.1,304.6;213.6,219.1,304.6;312.0,316.0,304.6;123.2,126.0,308.2;212.8,217.9,308.2;311.0,314.9,308.2;211.9,216.1,311.8;310.0,313.2,311.8;210.9,215.1,315.4;309.0,312.1,315.4;209.9,214.0,319.0;308.1,311.0,319.0;208.8,212.6,322.6;307.4,309.9,322.6;207.8,211.2,326.2;206.9,210.1,329.8;205.9,209.0,333.4;204.8,208.0,337.0;203.6,206.9,340.6;202.5,205.5,344.2;201.5,204.4,347.8;200.8,203.3,351.4',
  dashes() { return this.DASH.split(';').map((s) => s.split(',').map(Number)); },
  // The cross silhouette, traced from the supplied logo (no redrawing), in the same 480 px frame.
  SIL: 'M344.4 230.6L342.6 231.6L340.6 235.5L338.8 241.2L339 242.4L339.9 242L341.9 238ZM167.5 158.5L166.1 159.1L164 164.1L162.9 169L161 172.6L160.9 174.5L157 183.5L156.9 185.2L156 186.2L155.9 188.1L155 189.2L151.8 198.5L147.6 203.8L142.1 205.9L131.8 205.9L127.9 206.9L109.4 206.9L96.8 207.9L83.2 207.9L77.9 208.4L77 209L78 209.8L130.6 210L135.4 210.5L145 210L148 210.5L149.2 211.4L148.9 213.6L147.4 214.2L147.8 215.8L146.6 217L143.2 218.9L143.9 225.9L142.9 232.1L142 234.2L141.9 237.4L140.9 239.5L140.8 243.2L139.9 244.5L139.9 247.2L138 253.1L137.9 256.5L137 257.8L135.9 264.1L134 269L133.9 271.8L132.9 273.5L131.9 279.6L129.9 284.5L129.9 286.5L128 291.4L127.9 293.8L127 295L125.9 300.6L124 305.4L123.5 310.1L124.8 309.4L125.9 306.8L126 305L130.9 292.4L131 290.8L133.9 283.8L136.1 276L137.8 273.1L138.1 270.8L139.9 266.9L141.5 260.5L142.9 258.8L144.9 254.2L145.5 250.8L146.9 249.8L149.2 243.5L149.1 242.2L148.4 242.4L145.6 247.4L145.9 248.5L145.2 249.2L145.2 246.2L146.6 243.8L146.4 242.4L148 237.4L148 235.5L152.9 221L153 218.9L155 213.2L155 211.4L156.4 210.4L161.4 210L163 210.5L168.1 209.1L172.8 210L176.1 209L184.4 209L191.5 207.8L191 206.9L185.5 206.6L182.4 205.9L171.9 205.9L163.9 203.6L162.2 204.6L159.1 205L158 204L158.1 202.1L159.9 197.5L160.1 194L162.1 190.1L162 187.5L163 186L163.1 183.6L164.2 181.8L163.4 180.2L165 173.4L165 171.1L166.9 165.2L167 162.2L167.9 159.8ZM427 208.2L419.1 207.2L388.8 206.8L384.6 205.9L367.9 205.9L362.5 204.9L356.9 204.9L353 203.2L351.2 200.8L350.2 201.2L351.6 202.9L351 203.8L346.9 202.8L347 197.8L347.9 195.8L348 193.2L349 191.2L350.1 190.4L349.4 188.1L350.2 186.6L350.1 184.6L351.2 182.8L351 178.5L352 175.5L352 172.4L353 170.4L354 161.1L355 158.5L354.5 157.1L353 158.1L351.9 162.8L344.9 181.5L344.8 183.2L343 186.5L338.9 198.5L336.8 201.6L334.1 203.8L331.8 204.9L328.5 205L327.4 205.8L319.4 205.9L315.4 206.9L307.4 206.9L302 207.9L296.5 207.9L294.9 206.8L290.6 206.6L288.5 205.9L273.8 205.9L271.2 205L261.5 204.9L256.9 203.9L254 201.4L253.2 198.4L253.2 179.4L254 177.5L255 169.6L255.9 168.1L256 165.1L257 162.5L257.2 159.2L256.4 158.6L254 163.5L251.9 170.8L251 172L250.8 174.1L245 187.5L244.9 189.1L244 190.2L241.9 196.8L240.9 198.5L237.2 202L233.8 203.9L231.2 204L229.6 204.9L224.6 204.9L221.4 205.9L213.4 205.9L211.4 206.8L203.8 206.9L199.4 207.9L193.9 208L192.6 208.9L193 209.6L194.8 210L205.1 209.9L208.8 209.1L213 209.9L218.8 209.2L220 209.8L227.4 209.8L229.4 210.5L234.1 210.1L237.4 212.1L238.8 214.1L238.4 215.4L237.1 215.5L236.6 218.5L235.1 219.4L233.4 225.1L231.9 233L231 234.5L230.8 238.2L229.9 239.6L229.9 242L228 247.6L227.9 250.5L226.9 252.5L226.9 254.8L224 264.2L223.9 266.6L223 268.2L222.9 271L221.9 272.6L220.9 279.5L220 280.8L218.9 287.4L217 291.9L216.9 294.4L216 296L214.9 302.1L213.9 303.8L213.9 305.8L211.9 311.5L211.9 313.8L210.9 315.5L210.9 317.4L208.9 322.5L207.9 327.8L206.9 329.5L206.9 331.8L204.9 336.5L204.9 338.4L202 346.8L200.8 353.6L201.8 353.4L203.8 348.4L206 340.1L207 338.4L208 333.5L211.9 323.4L213 318.6L215 314.4L215 312.5L215.9 311.4L216.1 309.6L217.9 306.2L218 304.5L219.9 300.8L220 299L220.9 297.8L223 290.4L226.9 281.4L227 279.6L227.9 278.6L229 273.9L233.9 262.8L234.9 258.6L235.9 257.5L237.1 253L241 243.6L242 242.4L244 236.4L247 230.4L252.1 222.6L256.8 218L262.9 214.9L263.8 213.8L261.8 213.8L257.5 215.4L256.2 217.1L249.9 219.6L248.8 221.5L243.5 224.9L242.9 224.2L243 221.2L243.9 219.9L244.1 217L245.9 214.4L245.6 212.4L246.5 211.1L250.2 210.4L252.1 210.8L255.2 209.8L261.8 209L279.1 209L281.9 209.6L292 208.1L293.9 209.6L295.9 210L310.5 210L311.5 211.8L312.9 211.6L313.8 210L323.2 210.2L325.4 212.2L326.8 212.1L328 213L330.1 213L332.2 214L332 215.8L334.5 216.9L333.9 218.1L332.4 216.6L330.9 217.2L331.9 220.1L331.9 229L330.9 232L330.9 235L330 236.5L329.9 239.8L328 245.1L327.9 247.6L326 253.2L325.9 255.9L323.9 261.6L322.9 267.8L321.9 269.8L321.9 271.8L321 273L319.9 279L318 284.4L317.9 286.8L316.9 288.5L315.9 294.6L315 295.9L313.9 301.6L313 303L312.9 304.9L312 306.2L311.9 308.2L311 309.6L310.9 311.5L310 312.9L309.9 315L308.1 320.9L308.8 321.2L309.9 320L311.9 314.8L312.1 312.5L314.9 306.2L315 304.2L316.9 300.5L317.1 298.4L320.9 289.6L326.1 274.4L337.8 247.1L338 244.4L338.8 243L337 243.5L336.2 242.1L339 231.9L339 229.4L340 227.9L341 222L342.9 217.5L343 215.1L344.4 211L348.6 210.1L364.1 209.5L375.1 210L381.5 209.4L385.5 209.8L388.8 209L395.5 209.5L401 209L420.4 209.1L426.2 209Z',
  sil(cls, fill) {
    return '<svg class="' + cls + '" viewBox="0 0 480 480" aria-hidden="true" style="position:absolute;left:0;top:0;overflow:visible"><path d="' + this.SIL + '" style="fill:' + fill + '"/></svg>';
  },
  // Paper grain from the storyboard, made once as a small seeded tile.
  paper(kit) {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 192;
      const g = c.getContext('2d'), img = g.createImageData(192, 192), r = kit.rng(77);
      for (let i = 0; i < img.data.length; i += 4) { const v = r() < 0.5 ? 0 : 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = Math.round(r() * 9); }
      g.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    } catch (e) { return ''; }
  },
  // The FTL blackletter, outlined from Fear The Lamb's own logo file (no font).
  ftl(cls) {
    return '<svg class="' + cls + '" viewBox="0 0 1128 1138" aria-hidden="true"><path fill-rule="evenodd" style="fill:var(--main)" d="M319 1L322 1L326 9L329 11L331 16L334 18L334 20L337 22L337 24L340 26L340 28L343 30L343 32L346 34L346 36L349 38L349 40L352 42L355 48L359 51L359 53L370 65L370 67L374 70L374 72L379 76L383 83L395 95L395 97L436 139L438 139L448 149L450 149L455 154L469 162L494 167L507 167L519 165L532 159L536 155L537 159L528 176L517 188L515 188L511 193L509 193L506 197L504 197L497 203L491 205L490 207L480 212L477 212L475 214L458 220L440 224L397 225L368 216L354 209L348 204L344 203L336 196L334 196L332 193L330 193L328 190L326 190L311 175L309 175L303 169L303 167L293 158L293 156L288 152L288 150L284 147L284 145L275 135L275 133L273 132L273 130L271 129L271 127L265 119L263 119L232 150L232 370L326 371L232 465L232 985L288 1041L193 1136L191 1136L69 1012L69 1010L96 984L96 466L0 465L60 406L60 404L94 370L96 370L96 226L300 22L300 20ZM942 77L943 997L981 1034L981 1036L987 1042L990 1042L1006 1034L1009 1034L1015 1030L1025 1027L1031 1023L1034 1023L1040 1019L1050 1016L1056 1012L1059 1012L1065 1008L1075 1005L1081 1001L1084 1001L1090 997L1100 994L1106 990L1109 990L1115 986L1118 986L1125 982L1127 983L1067 1060L1043 1072L1040 1072L1012 1087L1009 1087L981 1102L978 1102L948 1118L945 1118L917 1133L905 1137L790 1021L816 996L816 243L812 239L810 239L796 225L796 223ZM663 106L665 106L665 371L759 372L665 466L665 986L721 1042L626 1137L624 1137L502 1013L502 1011L529 985L529 467L433 466L529 371L529 285L506 262L528 240L530 240Z"/></svg>';
  },
  // The collaboration sign: two equal strokes at 90 degrees, drawn as geometry.
  times(cls, sw) {
    return '<svg class="' + cls + '" viewBox="0 0 100 100" aria-hidden="true"><path d="M12 12 L88 88 M88 12 L12 88" style="fill:none;stroke:var(--main);stroke-width:' + (sw || 13).toFixed(2) + '"/></svg>';
  },
  // ---- The approved loader (identical maths to the current film), shared by the three opening concepts. ----
  CX: 252, CY: 255, RH: 3.6, // crosses centre and row height, in the 480 px artwork frame
  T0: 0.68, // where the approved film starts in the original timeline
  IN: 0.4, // the new opening replaces the approved film's first 0.4 s, then hands over
  eoq(x) { return 1 - Math.pow(1 - x, 5); },
  expo(x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); },
  bump(K, t, c) { return Math.sin(Math.PI * K.seg(t, c - 0.04, c + 0.04)); },
  amp(K, t, U) { return 0.04 * U * K.eo(K.seg(t, 0.3, 0.55)) * Math.pow(1 - K.seg(t, 0.55, 1.35), 1.7); },
  async build(S, kit, id) {
    const { seg, lerp, eo, eio, clamp01, rng, vnoise } = kit, P = id + '-';
    S.K = { seg, lerp, eo, eio, clamp01 };
    const G = S.G = this.geo(kit), U = G.Ua, Ub = G.Ub, CX = this.CX, CY = this.CY, RH = this.RH;
    const has = (n) => { try { return kit.assets.has(n); } catch (e) { return false; } };
    const k3 = S.k3 = 1.46 * U / 348;
    S.P3 = [G.cx, G.topA + 0.565 * U];
    Object.assign(S, { D5: 0.672 * Ub, D6: 0.5 * Ub, c5: G.topB + 0.444 * Ub, c6: G.topF + 0.31 * Ub, N: 28 });
    const xs = 0.075 * Ub, fh = Math.max(44, 0.164 * Ub), fw = fh * 1128 / 1138, xY = G.topF + 0.657 * Ub, fT = G.topF + 0.759 * Ub;
    const slices = Array.from({ length: S.N }, () => '<div class="' + P + 'slice" style="position:absolute;left:0;top:0;overflow:hidden;opacity:0"><div style="position:absolute;left:0;top:0;border-radius:50%;background:var(--main)"></div></div>').join('');
    const bits = (n, cls) => Array.from({ length: n }, () => '<div class="' + cls + '" style="position:absolute;left:0;top:0;background:var(--main);opacity:0"></div>').join('');
    const silver = has('rwc_silver_1024.png') ? '<img class="' + P + 'silver" src="' + kit.assets.url('rwc_silver_1024.png') + '" alt="" style="position:absolute;left:0;top:0;display:block">' : this.sil(P + 'silver', 'var(--accent)');
    kit.stage.append(kit.h('<div class="ground ' + P + 'paper"><div class="paper-vig"></div>' +
      this.sil(P + 'sil', 'var(--main)') + slices +
      '<div class="' + P + 'disc" style="position:absolute;left:0;top:0;border-radius:50%;background:var(--main);opacity:0"></div>' +
      silver + bits(8, P + 'streak') + bits(8, P + 'speck') +
      '<div class="sign ' + P + 'x" style="left:' + (G.cx - xs / 2).toFixed(1) + 'px;top:' + (xY - xs / 2).toFixed(1) + 'px;width:' + xs.toFixed(1) + 'px;height:' + xs.toFixed(1) + 'px;opacity:0">' + this.times(P + 'xsvg', Math.max(13, 200 / xs)) + '</div>' +
      '<div class="sign ' + P + 'ftl" style="left:' + (G.cx - fw / 2).toFixed(1) + 'px;top:' + fT.toFixed(1) + 'px;width:' + fw.toFixed(1) + 'px;height:' + fh.toFixed(1) + 'px;opacity:0">' + this.ftl(P + 'ftlsvg') + '</div></div>'));
    const q = (s) => kit.stage.querySelector('.' + P + s), qa = (s) => Array.from(kit.stage.querySelectorAll('.' + P + s));
    Object.assign(S, { sil: q('sil'), silver: q('silver'), disc: q('disc'), x: q('x'), ftl: q('ftl') });
    const paper = q('paper'), tile = this.paper(kit);
    if (paper && tile) { paper.style.backgroundImage = 'url(' + tile + ')'; paper.style.backgroundSize = '192px 192px'; }
    let ink = '';
    try { ink = getComputedStyle(kit.stage).getPropertyValue('--main').trim(); } catch (e) { ink = ''; }
    S.ink = ink || '#000000';
    const r = rng(21);
    S.sl = qa('slice').map((el, i) => ({ el, inner: el.firstChild, n: vnoise(1300 + i) }));
    S.st = qa('streak').map((el, i) => ({ el, f: (r() * 2 - 1) * 0.8, side: i % 2 ? 1 : -1, th: (0.004 + r() * 0.004) * Ub, len: (0.08 + r() * 0.12) * Ub, n: vnoise(1500 + i) }));
    S.sp = qa('speck').map((el) => { const a = r() * Math.PI * 2, d = (0.38 + r() * 0.2) * Ub; return { el, x: Math.cos(a) * d * 1.3, y: Math.sin(a) * d * 0.6, w: (0.006 + r() * 0.014) * Ub, h: (0.004 + r() * 0.004) * Ub }; });
    if (G.m !== null) for (const s of S.sp) s.x = Math.max(G.m - G.cx, Math.min(G.cx - G.m - s.w, s.x));
    const Dsh = this.dashes(), order = Dsh.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    const rank = []; order.forEach((i, n) => { rank[i] = n; });
    const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
    const X = S.X = (fx) => G.cx + (fx - CX) * k3, Y = S.Y = (fy) => S.P3[1] + (fy - CY) * k3;
    S.yTop = Y(157) - 2; S.yBot = Y(354) + 2;
    const left = X(77), span = X(427) - left, half = G.m === null ? Math.min(0.95 * U, 0.46 * G.w) : Math.min(0.95 * U, 0.5 * G.w - G.m - 0.03 * U), rows = {};
    S.half = half;
    S.fr = Dsh.map((d, i) => {
      const n = rank[i], early = n < 55, tx = X((d[0] + d[1]) / 2), ty = Y(d[2]);
      const tw = Math.max(2, (d[1] - d[0]) * k3), th = RH * k3, ri = Math.round((d[2] - 157) / RH);
      if (!rows[ri]) rows[ri] = vnoise(300 + ri);
      const f = { tx, ty, tw, th, early, side: r() < 0.5 ? -1 : 1, rn: rows[ri], en: vnoise(700 + i), fl: vnoise(1100 + i),
        tick: ri % 7 === 3 ? (ri % 14 === 3 ? 1 : -1) : 0, fleck: i % 10 === 0, fx: (d[0] + d[1]) / 2, bar: d[2] > 203 && d[2] < 212 };
      const dd = 0.12 * (tx - left) / span + r() * 0.06;
      if (early) {
        f.a = n < 12 ? -0.3 + r() * 0.25 : r() * 0.32;
        f.sx = G.cx + (r() * 2 - 1) * half;
        f.sy = G.topA + U * Math.min(0.72, Math.max(0.29, 0.5 + gauss() * 0.11));
        f.w0 = U * Math.min(0.11, Math.max(0.004, 0.017 * Math.exp(gauss() * 0.6)));
        f.h0 = U * Math.min(0.022, Math.max(0.004, 0.009 * Math.exp(gauss() * 0.5)));
        const tq = r(); f.tone = tq < 0.45 ? 1 : tq < 0.85 ? 0.72 : 0.38;
        f.y0 = 0.4 + dd * 0.4; f.y1 = f.y0 + 0.22;
      } else {
        f.a = 0.4 + r() * 0.2;
        f.sx = Math.min(G.m === null ? G.w * 0.98 : G.w - G.m - tw / 2, Math.max(G.m === null ? G.w * 0.02 : G.m + tw / 2, tx + f.side * (0.12 + r() * 0.2) * U));
        f.sy = ty + (r() * 2 - 1) * 0.03 * U;
        f.w0 = tw * (0.6 + r() * 0.8); f.h0 = th * 0.6; f.tone = 0.72 + r() * 0.28;
        f.y0 = f.a; f.y1 = f.a + 0.15;
      }
      f.x0 = Math.max(0.42 + dd * 0.8, f.a + 0.05); f.x1 = Math.max(f.x0 + 0.2, Math.min(0.98, f.x0 + 0.32));
      return f;
    });
    const keep = rng(99);
    S.fr = S.fr.filter((f, i) => (Dsh[i][2] > 203 && Dsh[i][2] < 212) || keep() > 0.45);
    // Where every dash stands at the hand-over, so each new opening lands exactly on the approved film.
    S.end = S.fr.map((f) => this.dash(S, f, this.T0 + this.IN));
  },
  // One dash of the approved build at original time t: [left, right, y, height, alpha], or null when hidden.
  dash(S, f, t) {
    const K = S.K, U = S.G.Ua, A = this.amp(K, t, U);
    const vis = K.clamp01((t - f.a) / 0.06);
    if (vis <= 0) return null;
    const fade = 1 - K.seg(t, f.fleck ? 1.3 : 1.25, f.fleck ? 1.48 : 1.45);
    if (fade <= 0) return null;
    const pre = f.early ? 0.15 * K.eo(K.seg(t, f.a, 0.4)) : 0;
    const qy = K.eo(K.seg(t, f.y0, f.y1)), qx = K.eio(K.seg(t, f.x0, f.x1));
    const x = K.lerp(f.sx, f.tx, pre + (1 - pre) * qx), y = K.lerp(f.sy, f.ty, pre + (1 - pre) * qy);
    let shift = A * f.rn(t * 2.4);
    for (let j = 0; j < 2; j++) { const p = K.seg(t, 0.55 + j * 0.12, 0.83 + j * 0.12); if (p > 0 && p < 1 && Math.abs(y - K.lerp(S.yTop, S.yBot, p)) < f.th / 2 + 0.003 * U) shift += (j ? -1 : 1) * 0.06 * U; }
    if (f.tick) shift += f.tick * U * (0.02 * this.bump(K, t, 1.08) + 0.01 * this.bump(K, t, 1.4));
    if (f.fleck) shift += f.side * 0.008 * U * (1 - K.seg(t, 1.3, 1.48));
    const ext = Math.abs(f.en(t * 1.7)) * A * 0.8;
    const w = K.lerp(f.w0, f.tw, qx) + ext;
    const h = K.lerp(f.h0, f.th * 0.72, qy) + f.th * 0.32 * K.eo(K.seg(t, 1.0, 1.3));
    const fl = 1 - 0.25 * (0.5 + 0.5 * f.fl(t * 2.5)) * (1 - K.seg(t, 0.8, 1.0));
    const lx = x + shift + f.side * ext / 2 - w / 2;
    return [lx, lx + w, y, h, vis * fade * K.lerp(f.tone, 1, K.seg(t, 0.7, 0.95)) * fl];
  },
  // Draws one rectangle, kept inside the side margin on phones.
  rect(S, g, lx, rx, y, h, a) {
    if (S.G.m !== null) { lx = Math.max(lx, S.G.m); rx = Math.min(rx, S.G.w - S.G.m); }
    if (rx - lx < 1 || !(a > 0)) return;
    g.globalAlpha = Math.min(1, a);
    g.fillRect(Math.round(lx), Math.round(y - h / 2), Math.max(1, Math.round(rx - lx)), Math.max(1, Math.round(h)));
  },
  // The approved fragment build (original time t).
  frags(S, t, g) {
    if (!g || t >= 1.5) return;
    g.save(); g.fillStyle = S.ink;
    for (const f of S.fr) { const d = this.dash(S, f, t); if (d) this.rect(S, g, d[0], d[1], d[2], d[3], d[4]); }
    g.restore();
  },
  // Everything after the fragments, exactly as approved (original time t): lock, circle, rise, x and FTL.
  dom(S, t) {
    const K = S.K, G = S.G, Ub = G.Ub, CX = this.CX, CY = this.CY;
    const p6 = K.eio(K.seg(t, 2.2, 2.45)), Dd = K.lerp(S.D5, S.D6, p6), dcy = K.lerp(S.c5, S.c6, p6), kL = Dd / 463.5;
    const pc = K.eio(K.seg(t, 1.5, 1.65)), k = K.lerp(S.k3, kL, pc);
    const ccx = K.lerp(S.P3[0], G.cx + (CX - 240) * kL, pc), ccy = K.lerp(S.P3[1], dcy + (CY - 240.5) * kL, pc);
    const ox = ccx - CX * k, oy = ccy - CY * k, size = (480 * k).toFixed(2) + 'px';
    for (const el of [S.sil, S.silver]) {
      if (!el) continue;
      el.style.width = size; el.style.height = size;
      el.style.transform = 'translate(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px)';
    }
    if (S.sil) {
      S.sil.style.opacity = t > 1.9 ? 0 : K.eo(K.seg(t, 1.25, 1.45));
      S.sil.style.filter = 'blur(' + (0.6 * (1 - K.seg(t, 1.3, 1.5))).toFixed(2) + 'px)';
    }
    const R = Dd / 2 * this.expo(K.seg(t, 1.56, 1.8));
    if (S.silver) {
      S.silver.style.opacity = K.eo(K.seg(t, 1.6, 1.66));
      S.silver.style.clipPath = 'circle(' + (R > 0 ? R + 1 : 0).toFixed(2) + 'px at ' + (G.cx - ox).toFixed(2) + 'px ' + (dcy - oy).toFixed(2) + 'px)';
    }
    const sliced = t >= 1.56 && t < 1.9 && R > 0.5;
    const A = 0.08 * Ub * K.eo(K.seg(t, 1.56, 1.6)) * (1 - this.eoq(K.seg(t, 1.58, 1.88))), bh = 2 * R / S.N;
    S.sl.forEach((s, i) => {
      if (!sliced) { s.el.style.opacity = 0; return; }
      s.el.style.opacity = 1;
      s.el.style.width = (2 * R).toFixed(2) + 'px';
      s.el.style.height = (bh + 2).toFixed(2) + 'px';
      s.el.style.transform = 'translate(' + (G.cx - R + A * s.n(t * 2.2)).toFixed(2) + 'px,' + (dcy - R + i * bh).toFixed(2) + 'px)';
      s.inner.style.width = (2 * R).toFixed(2) + 'px';
      s.inner.style.height = (2 * R).toFixed(2) + 'px';
      s.inner.style.transform = 'translateY(' + (-i * bh).toFixed(2) + 'px)';
    });
    S.disc.style.opacity = t >= 1.9 ? 1 : 0;
    S.disc.style.width = Dd.toFixed(2) + 'px';
    S.disc.style.height = Dd.toFixed(2) + 'px';
    S.disc.style.transform = 'translate(' + (G.cx - Dd / 2).toFixed(2) + 'px,' + (dcy - Dd / 2).toFixed(2) + 'px)';
    const life = K.eo(K.seg(t, 1.57, 1.62)) * (1 - this.eoq(K.seg(t, 1.62, 1.86)));
    for (const s of S.st) {
      const y = s.f * R, e2 = R * R - y * y;
      if (life <= 0 || e2 <= 0) { s.el.style.opacity = 0; continue; }
      const L = s.len * life * (0.7 + 0.3 * Math.abs(s.n(t * 3))), ex = Math.sqrt(e2);
      s.el.style.opacity = 1;
      s.el.style.width = L.toFixed(1) + 'px';
      s.el.style.height = s.th.toFixed(1) + 'px';
      s.el.style.transform = 'translate(' + (s.side > 0 ? G.cx + ex - 2 : G.cx - ex - L + 2).toFixed(1) + 'px,' + (dcy + y - s.th / 2).toFixed(1) + 'px)';
    }
    const sp = K.eo(K.seg(t, 1.56, 1.62)) * (1 - K.eo(K.seg(t, 1.7, 1.85)));
    for (const s of S.sp) {
      s.el.style.opacity = sp;
      s.el.style.width = s.w.toFixed(1) + 'px';
      s.el.style.height = s.h.toFixed(1) + 'px';
      s.el.style.transform = 'translate(' + (G.cx + s.x).toFixed(1) + 'px,' + (S.c5 + s.y).toFixed(1) + 'px)';
    }
    const xp = K.eo(K.seg(t, 2.35, 2.55));
    S.x.style.opacity = xp;
    S.x.style.transform = 'scale(' + K.lerp(0.6, 1, xp).toFixed(4) + ')';
    const fp = this.expo(K.seg(t, 2.45, 2.8));
    S.ftl.style.opacity = K.eo(K.seg(t, 2.45, 2.8));
    S.ftl.style.transform = 'translateY(' + K.lerp(0.06 * Ub, 0, fp).toFixed(2) + 'px) scale(' + K.lerp(0.94, 1, fp).toFixed(4) + ')';
  },
  // Runs a concept: its own opening for the first 0.4 s, then the approved film from where that opening lands.
  play(S, t, g, intro) {
    this.dom(S, Math.max(t, this.IN) + this.T0);
    if (!g) return;
    if (t < this.IN) { g.save(); g.fillStyle = S.ink; try { intro(t, g); } finally { g.restore(); } }
    else this.frags(S, t + this.T0, g);
  },
};
  return W;
}
