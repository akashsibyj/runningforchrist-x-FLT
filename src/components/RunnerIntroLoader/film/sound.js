// Restrained sound for the film, made in the browser (no audio files, no libraries): a soft tap as his foot lands, a
// short airy whoosh while the circle's outline draws, and a quiet two-note tone as the three crosses come in.
// It stays off until the viewer turns it on: browsers only let a page start audio after a click or key press, so
// enable() must be called from one. Without it (or where Web Audio is missing) the film plays exactly the same.
export function createSound() {
  const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
  let ctx = null, out = null, noise = null;

  const running = () => !!(ctx && ctx.state === 'running');

  // A second of seeded noise (the same every time), for the tap's grit and the whoosh.
  const makeNoise = () => {
    const n = Math.floor(ctx.sampleRate), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    let x = 0x2545f491;
    for (let i = 0; i < n; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; d[i] = ((x >>> 0) / 4294967296) * 2 - 1; }
    return buf;
  };

  async function enable() {
    if (!AC) return false;
    try {
      if (!ctx) {
        ctx = new AC();
        out = ctx.createGain();
        out.gain.value = 0.55;
        const soft = ctx.createDynamicsCompressor(); // keeps every sound gentle and level
        soft.threshold.value = -24; soft.ratio.value = 4;
        out.connect(soft); soft.connect(ctx.destination);
        noise = makeNoise();
      }
      if (ctx.state !== 'running') await ctx.resume();
      return running();
    } catch (e) {
      console.warn('[RunnerIntroLoader] sound unavailable:', e);
      return false;
    }
  }

  function disable() {
    try { if (ctx && ctx.state === 'running') ctx.suspend(); } catch (e) { /* already stopped */ }
  }

  const env = (g, t, peak, attack, end) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + end);
  };

  // His foot lands: a light, short low tap with a little grit (no heavy bass).
  function foot(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(95, t + 0.08);
    env(g, t, 0.22, 0.004, 0.12);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.14);
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gn = ctx.createGain();
    n.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 0.8;
    env(gn, t, 0.07, 0.002, 0.05);
    n.connect(bp); bp.connect(gn); gn.connect(out); n.start(t); n.stop(t + 0.07);
  }

  // The outline draws: soft air rising in pitch, over d seconds.
  function whoosh(t, d) {
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = noise; n.loop = true;
    bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(380, t);
    bp.frequency.exponentialRampToValueAtTime(2000, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + d * 0.45);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    n.connect(bp); bp.connect(g); g.connect(out); n.start(t); n.stop(t + d + 0.02);
  }

  // The crosses come in: a quiet open fifth that rings out.
  function chime(t) {
    [[659.25, 0.05], [987.77, 0.028], [1318.5, 0.01]].forEach(([f, peak]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      env(g, t, peak, 0.012, 1.6);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.65);
    });
  }

  // Plays one event now; late: how far into it the film already is (a whoosh starts part-way).
  function play(kind, late = 0, dur = 0.5) {
    if (!running()) return;
    try {
      const t = ctx.currentTime + 0.01;
      if (kind === 'foot') foot(t);
      else if (kind === 'whoosh') { const d = dur - Math.max(0, late); if (d > 0.08) whoosh(t, d); }
      else if (kind === 'chime') chime(t);
    } catch (e) {
      console.warn('[RunnerIntroLoader] sound event failed:', e);
    }
  }

  function close() {
    try { if (ctx) ctx.close(); } catch (e) { /* already closed */ }
    ctx = null; out = null; noise = null;
  }

  return { supported: !!AC, enable, disable, play, close, get on() { return running(); } };
}
