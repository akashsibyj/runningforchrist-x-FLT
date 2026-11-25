import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { FilmEngine } from './film/engine.js';
import { DURATION, FRAMES, LOOP_BRIDGE, frameAt, indexOfLabel } from './frames.js';
import './RunnerIntroLoader.css';

const fmt = (t) => (Math.max(0, t) || 0).toFixed(2);
const clampIndex = (i) => Math.max(0, Math.min(FRAMES.length - 1, Math.round(Number.isFinite(i) ? i : 0)));
const startIndex = (label) => { const i = indexOfLabel(label); return i >= 0 ? i : 0; };

/**
 * The Running for Christ × FTL loader: the reference runner, his change into the three crosses, and the approved
 * loader, drawn exactly as the film draws it. It fills its parent, so give the parent a size.
 *
 * Props
 *   autoPlay      start playing once ready (default true)
 *   loop          start with Loop on (default false); the viewer can toggle it
 *   ready         false while the website is still loading: at the end the loader holds its final logo until this
 *                 turns true, then calls onComplete (default true: onComplete once the final hold has played)
 *   controls      show the review controls under the film (default false: the loading screen alone)
 *   frameMode     start in frame-by-frame mode (default false)
 *   startFrame    frame to open on, by its label: 1-67 or 120-195 (default 1)
 *   assetsBase    where the film's images are served from (default '/runner-intro/')
 *   onReady, onComplete, onFrameChange(frame), onError(error)
 *   className, style
 *
 * Ref: play(), pause(), toggleLoop(), setFrameMode(on), goToFrame(label), seek(seconds), getFrame()
 */
const RunnerIntroLoader = forwardRef(function RunnerIntroLoader(
  {
    autoPlay = true, loop: loopInit = false, controls = false, frameMode: frameModeInit = false, startFrame = 1,
    assetsBase = '/runner-intro/', ready = true, onReady, onComplete, onFrameChange, onError, className = '', style,
  },
  ref,
) {
  const uid = useId();
  const hostRef = useRef(null), boxRef = useRef(null), engineRef = useRef(null);
  const st = useRef({ t: 0, playing: false, loop: loopInit, frameMode: frameModeInit, base: 0, baseT: 0, dirty: true, raf: 0 });
  const cb = useRef({ onReady, onComplete, onFrameChange, onError });
  cb.current = { onReady, onComplete, onFrameChange, onError };
  const readyRef = useRef(ready !== false);
  readyRef.current = ready !== false;
  // the website has finished loading while the final logo was being held: done now
  useEffect(() => {
    const s = st.current;
    if (ready !== false && s.waiting) {
      s.waiting = false;
      try { cb.current.onComplete && cb.current.onComplete(); } catch (x) { console.error(x); }
    }
  }, [ready]);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(loopInit);
  const [frameMode, setFrameModeState] = useState(frameModeInit);
  const [index, setIndex] = useState(startIndex(startFrame));
  const [note, setNote] = useState('');
  const [time, setTime] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [jump, setJump] = useState('');

  // ---- time ----
  const told = useRef(-1); // the frame last reported through onFrameChange
  const sync = useCallback((t) => {
    const i = frameAt(t);
    setTime(t);
    setIndex(i);
    if (told.current !== i) {
      told.current = i;
      try { cb.current.onFrameChange && cb.current.onFrameChange(FRAMES[i]); } catch (e) { console.error(e); }
    }
  }, []);
  const seek = useCallback((t) => {
    const s = st.current;
    s.t = Math.max(0, Math.min(DURATION, Number.isFinite(t) ? t : 0));
    s.base = performance.now(); s.baseT = s.t; s.dirty = true; s.anchor = true;
    sync(s.t);
  }, [sync]);
  const pause = useCallback(() => {
    const s = st.current;
    s.playing = false; setPlaying(false);
  }, []);
  const play = useCallback(() => {
    const s = st.current;
    if (!engineRef.current || !engineRef.current.ready) return;
    if (s.frameMode) { s.frameMode = false; setFrameModeState(false); }
    if (s.t >= DURATION - 1e-6) s.t = 0; // played to the end: start again
    s.base = performance.now(); s.baseT = s.t; s.playing = true; s.dirty = true; s.anchor = true; s.waiting = false;
    setPlaying(true);
  }, []);
  const togglePlay = useCallback(() => (st.current.playing ? pause() : play()), [pause, play]);
  const toggleLoop = useCallback(() => {
    const s = st.current;
    s.loop = !s.loop; setLoop(s.loop);
    if (!s.loop && s.t > DURATION) { s.t = DURATION; s.base = performance.now(); s.baseT = DURATION; s.dirty = true; } // (switched off mid-return: it ends on the identity)
  }, []);
  const goToFrame = useCallback((i) => {
    const k = clampIndex(i);
    seek(FRAMES[k].t);
  }, [seek]);
  const setFrameMode = useCallback((on) => {
    const s = st.current;
    s.frameMode = !!on; setFrameModeState(!!on);
    if (on) { pause(); goToFrame(frameAt(s.t)); } // snap to the frame on screen
  }, [pause, goToFrame]);
  const step = useCallback((d) => {
    const s = st.current;
    if (!s.frameMode) { s.frameMode = true; setFrameModeState(true); }
    pause();
    goToFrame(frameAt(s.t) + d);
  }, [pause, goToFrame]);

  useImperativeHandle(ref, () => ({
    play, pause, toggleLoop, setFrameMode, seek,
    goToFrame: (label) => { const i = indexOfLabel(label); if (i >= 0) { step(0); goToFrame(i); } return i >= 0; },
    getFrame: () => FRAMES[frameAt(st.current.t)],
  }), [play, pause, toggleLoop, setFrameMode, seek, goToFrame, step]);

  // ---- the player: built once per mount (and again on Retry) ----
  useLayoutEffect(() => {
    const host = hostRef.current, box = boxRef.current;
    if (!host || !box) return undefined;
    let engine, dead = false, ro = null, onWin = null, timer = 0;
    const s = st.current;
    const fail = (e) => {
      if (dead) return;
      const msg = (e && e.message) || String(e);
      console.error('[RunnerIntroLoader]', e);
      setError(msg); setStatus('error'); s.playing = false; setPlaying(false);
      try { cb.current.onError && cb.current.onError(e); } catch (x) { console.error(x); }
    };
    try { engine = new FilmEngine(host, { assetsBase }); } catch (e) { fail(e); return undefined; }
    engineRef.current = engine;
    setStatus('loading'); setError('');

    const fit = async () => {
      const r = box.getBoundingClientRect();
      if (!(r.width > 0) || !(r.height > 0)) return; // not laid out yet; the observer will call again
      try {
        const rebuilt = await engine.resize(Math.round(r.width), Math.round(r.height));
        if (dead) return;
        s.dirty = true;
        if (rebuilt && engine.ready) {
          setStatus('ready');
          if (!s.started) {
            s.started = true;
            const i = startIndex(startFrame);
            s.t = FRAMES[i].t; sync(s.t);
            try { cb.current.onReady && cb.current.onReady(); } catch (x) { console.error(x); }
            if (autoPlay && !s.frameMode) play();
          }
        }
      } catch (e) { fail(e); }
    };
    // Size changes settle before the film is rebuilt (a rebuild happens only when the shape of the box changes).
    const onResize = () => { clearTimeout(timer); timer = setTimeout(fit, 120); s.dirty = true; };
    fit();
    if (typeof ResizeObserver === 'function') { ro = new ResizeObserver(onResize); ro.observe(box); }
    else { onWin = onResize; window.addEventListener('resize', onWin); }

    // The frame loop: draws only when something changed.
    let lastSync = -1;
    const tick = (now) => {
      if (dead) return;
      try {
        if (s.playing) {
          if (s.anchor) { s.anchor = false; s.base = now; s.baseT = s.t; } // (its clock starts on this screen frame)
          let t = s.baseT + (now - s.base) / 1000;
          // (with Loop on it plays on LOOP_BRIDGE s past the end, where the opening frame fades in, then starts again)
          const end = s.loop ? DURATION + (LOOP_BRIDGE > 0 ? LOOP_BRIDGE : 0) : DURATION;
          if (!Number.isFinite(t) || t < 0) { t = 0; s.baseT = 0; s.base = now; }
          if (t >= end) {
            if (s.loop) { t = t % end; s.baseT = 0; s.base = now - t * 1000; }
            else {
              t = DURATION; s.playing = false; setPlaying(false);
              if (readyRef.current) { try { cb.current.onComplete && cb.current.onComplete(); } catch (x) { console.error(x); } }
              else s.waiting = true; // (the website is still loading: the final logo stays until it is ready)
            }
          }
          s.t = t; s.dirty = true;
        }
        if (s.dirty && engine.ready) {
          s.dirty = false;
          engine.render(s.t);
          const shown = Math.min(s.t, DURATION); // (the loop's return counts as the last frame)
          const i = frameAt(shown);
          if (i !== lastSync || !s.playing) { lastSync = i; sync(shown); }
        }
      } catch (e) { fail(e); return; }
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
    const onVis = () => { if (!document.hidden && s.playing) s.anchor = true; }; // (back from a hidden tab: carry on from where it was)
    document.addEventListener('visibilitychange', onVis);

    return () => {
      dead = true;
      cancelAnimationFrame(s.raf);
      clearTimeout(timer);
      if (ro) ro.disconnect();
      if (onWin) window.removeEventListener('resize', onWin);
      document.removeEventListener('visibilitychange', onVis);
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
      s.started = false; s.playing = false;
    };
    // The player is rebuilt only for a new asset location or a retry; the other props are starting values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetsBase, attempt]);

  // ---- keyboard, when the player has focus ----
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' && e.target.type !== 'range') return;
    const k = e.key;
    if (k === ' ' || k === 'k' || k === 'K') { if (tag === 'BUTTON' && k === ' ') return; e.preventDefault(); togglePlay(); }
    else if (k === 'ArrowRight' || k === '.') { e.preventDefault(); step(1); }
    else if (k === 'ArrowLeft' || k === ',') { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); step(-FRAMES.length); }
    else if (k === 'End') { e.preventDefault(); step(FRAMES.length); }
    else if (k === 'l' || k === 'L') { e.preventDefault(); toggleLoop(); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); setFrameMode(!st.current.frameMode); }
  };

  const f = FRAMES[index] || FRAMES[0];
  const submitJump = (e) => {
    e.preventDefault();
    const i = indexOfLabel(jump), n = parseInt(String(jump).trim(), 10);
    if (i >= 0) {
      step(0); goToFrame(i);
      setNote(n >= 68 && n <= 119 ? 'Frames 68–119 are not in the film: showing frame ' + FRAMES[i].label + ', where the circle bursts' : n >= 2 && n <= 5 ? 'Frames 2–5 are not in the film: showing frame 1, where it starts' : '');
    } else {
      setNote('No frame "' + String(jump).trim().slice(0, 12) + '". Use 1–67 or 120–195.');
    }
    setJump('');
  };
  useLayoutEffect(() => { if (!note) return undefined; const id = setTimeout(() => setNote(''), 4000); return () => clearTimeout(id); }, [note]);

  return (
    <div
      className={'ril ' + className}
      style={style}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-label="Running for Christ × Fear The Lamb loader animation"
    >
      <div className="ril-box" ref={boxRef}>
        <div className="ril-host" ref={hostRef} role="img" aria-label={'Frame ' + f.label + ': ' + f.title} />
        {status === 'loading' && <div className="ril-cover" role="progressbar" aria-busy="true" aria-label="Loading" />}
        {status === 'error' && (
          <div className="ril-cover ril-error" role="alert">
            <p>The animation could not start: {error}</p>
            <button type="button" className="ril-btn" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
          </div>
        )}
      </div>

      {controls && (
        <div className="ril-controls" aria-label="Animation controls">
          <div className="ril-frame">
            <button type="button" className="ril-btn ril-step" onClick={() => step(-1)} disabled={status !== 'ready' || index === 0} aria-label="Previous frame">‹</button>
            <div className="ril-frame-text" aria-live={playing ? 'off' : 'polite'}>
              <div className="ril-frame-head">
                <span className="ril-num">Frame {f.label} · {f.i} / {FRAMES.length}</span>
                <strong className="ril-title">{f.title}</strong>
                {f.count ? <span className="ril-chip">{f.count}</span> : null}
                <span className="ril-chip ril-look">{f.look}</span>
              </div>
              <p className="ril-desc" title={f.desc}>{note ? <span className="ril-note">{note}</span> : f.desc}</p>
            </div>
            <button type="button" className="ril-btn ril-step" onClick={() => step(1)} disabled={status !== 'ready' || index === FRAMES.length - 1} aria-label="Next frame">›</button>
          </div>

          <div className="ril-track">
            <label className="ril-sr" htmlFor={uid + '-scrub'}>{frameMode ? 'Frame' : 'Time'}</label>
            {frameMode ? (
              <input id={uid + '-scrub'} type="range" min={0} max={FRAMES.length - 1} step={1} value={index} disabled={status !== 'ready'}
                onChange={(e) => goToFrame(+e.target.value)} aria-valuetext={'Frame ' + f.label + ': ' + f.title} />
            ) : (
              <input id={uid + '-scrub'} type="range" min={0} max={DURATION} step={0.001} value={time} disabled={status !== 'ready'}
                onChange={(e) => { pause(); seek(+e.target.value); }} aria-valuetext={fmt(time) + ' seconds, frame ' + f.label + ': ' + f.title} />
            )}
          </div>

          <div className="ril-bar">
            <button type="button" className="ril-btn ril-primary" onClick={togglePlay} disabled={status !== 'ready'} aria-pressed={playing}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="ril-btn ril-toggle" onClick={toggleLoop} aria-pressed={loop}>
              <span className="ril-dot" aria-hidden="true" />Loop
            </button>
            <button type="button" className="ril-btn ril-toggle" onClick={() => setFrameMode(!frameMode)} aria-pressed={frameMode} disabled={status !== 'ready'}>
              <span className="ril-dot" aria-hidden="true" />Frame by frame
            </button>
            <span className="ril-time">{fmt(time)} / {fmt(DURATION)} s</span>
            <form className="ril-jump" onSubmit={submitJump}>
              <label className="ril-sr" htmlFor={uid + '-jump'}>Go to frame number</label>
              <input id={uid + '-jump'} type="text" autoComplete="off" spellCheck={false} maxLength={6} placeholder="67, 120…" value={jump}
                onChange={(e) => setJump(e.target.value)} disabled={status !== 'ready'} />
              <button type="submit" className="ril-btn" disabled={status !== 'ready' || !jump}>Go</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default RunnerIntroLoader;
