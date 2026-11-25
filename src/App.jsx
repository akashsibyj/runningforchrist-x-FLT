import { Component, useEffect, useRef } from 'react';
import RunnerIntroLoader from './components/RunnerIntroLoader';

// Keeps a crash in the player from taking the page down with it.
class Guard extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[RunnerIntroLoader]', error); }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#ddd', font: '14px system-ui' }}>
          <div style={{ textAlign: 'center' }}>
            <p>The animation stopped unexpectedly.</p>
            <button type="button" onClick={() => this.setState({ failed: false })}>Reload the animation</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Optional address options, handy for review: ?frame=26 (or ?frame=120) opens paused on that frame, ?loop=1 starts with
// Loop on, ?controls=1 shows the review controls (hidden on the loading screen), ?autoplay=0 waits for Play.
function options() {
  try {
    const q = new URLSearchParams(window.location.search);
    const frame = (q.get('frame') || '').trim();
    return {
      frame: /^\d{1,3}$/.test(frame) ? frame : null,
      loop: q.get('loop') === '1',
      controls: q.get('controls') === '1',
      autoPlay: q.get('autoplay') !== '0',
    };
  } catch (e) {
    return { frame: null, loop: false, controls: false, autoPlay: true };
  }
}

export default function App() {
  const o = options();
  const player = useRef(null);
  useEffect(() => { if (import.meta.env.DEV) window.__player = player; }, []);
  return (
    <main style={{ height: '100dvh', minHeight: '100%' }}>
      <Guard>
        <RunnerIntroLoader
          ref={player}
          autoPlay={o.autoPlay && !o.frame}
          loop={o.loop}
          controls={o.controls}
          frameMode={!!o.frame}
          startFrame={o.frame || 1}
          onFrameChange={(frame) => { if (import.meta.env.DEV) window.__frame = frame; }}
        />
      </Guard>
    </main>
  );
}
