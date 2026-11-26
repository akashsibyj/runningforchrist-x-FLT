# Running for Christ × FTL · Loader (React)

The loader animation as a React component: the runner from the reference video on its paper; the moment his front
foot touches the ground on his 3rd step (frame 67), a short black streak spreads on the ground under it and at that
moment he fades as the black circle bursts open; it eases back to its size as the three silver crosses fade in, and the
approved loader carries on (rise, × and FTL): the crosses light up, the middle one first, and the light flows on down through the × (drawn a little smaller) and FTL,
and the finished identity holds still for 1.8 s (longer if the website is still loading, see `ready`). It draws every frame with the same code and images as the film. The whole animation runs 4.88 s.

The runner plays at 1.5 times the video's pace, so his stride keeps time with the logo.

## The timeline

| Frames | Time | What you see |
|---|---|---|
| 1, 6–58 | 0.00–1.49 s | The runner, exactly as in the reference video, at 1.5 times its pace (36 video frames a second). The film starts 0.12 s into his run (frames 2–5 are not in the film). |
| 59–67 | 1.49–1.71 s | He runs on into his 3rd step while the video's paper eases into the loader's grey. At 67 (1.713 s) his front foot touches the ground. |
| 120–124 | 1.76–1.92 s | The black circle bursts open from a point as he fades: its segments slide into place either side of the centre, with short edge streaks; its momentum carries it a touch (3%) past its size. No big black crosses. |
| 125–134 | 1.96–2.34 s | The clean, centred circle eases back to its size (125–128). The crosses are dark; a concentrated white light travels down the middle cross, lighting it, with a soft bloom (129–134). |
| 135–140 | 2.38–2.59 s | The approved loader: rise and ×. A quarter of a second after the middle one, the left and right crosses light the same way, a little softer. |
| 141–146 | 2.63–2.84 s | FTL fades in as approved; the outer crosses finish lighting and the crosses settle (by 143): the middle one keeps a faint, steady metallic sheen and the outer two rest a touch softer; and the light flows on down from them through the × (144–146). |
| 147–150 | 2.88–3.00 s | The light flows straight on down through FTL, quickly, at the same steady pace as through the ×, then fades. |
| 151–195 | 3.05–4.88 s | The finished identity holds, still, for 1.8 s (and stays while the website is still loading, see `ready`). |
| (Loop on) | 4.88–5.28 s | The opening frame fades in over the identity (0.4 s), so the film starts again without a jump. Played only with Loop on. |

Frames 137–156 are the original film's apart from the crosses lighting and the light on the ×. Frames 68–119 are not in the film.

## The 3rd-step trigger

The circle is started by the run itself: the frames of the run where a foot meets the ground are 13, 57 and 110 (its
lowest point comes down to the ground line and stays there). The film opens in the air before the first; the first and
second complete his two strides (0.10 s and 0.83 s); at the third (frame 110 of the run, film frame 67, 1.713 s) the
circle starts to burst, on the very next screen frame. In `film/runnerScene.js` this is `CONTACTS` / `CONTACT3`.

## The physics

- The run is the reference video at 1.5 times its pace: his body's rise and fall, his strides and his feet are the video's own.
- His foot meets the ground at one level on every step, and while it is planted it moves back at one steady speed (the
  ground's): the streak under his 3rd step is that ground, so it moves with his foot at that speed, his sole resting on it,
  as it and he fade with the burst.
- He fades out before his video frames end, so he never freezes.
- The circle bursts from a point, decelerating; its momentum carries it a touch past its size and it eases back, so the
  moment before the crosses is never a still frame; its specks are drawn into it as it settles, so none are left outside.
  Each move eases into the next: nothing stands still until the final hold.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd runner-intro-loader
npm install
npm run dev
```

Your browser opens **http://localhost:5173** with the loading screen: the animation alone, full screen, the mark centred and sized like a loading screen on desktops, laptops, tablets and phones. Add `?controls=1` for the review controls below.

To check the production build: `npm run build`, then `npm run preview` (http://localhost:4173).

## Controls (review only: `?controls=1`)

| Control | What it does |
|---|---|
| **Play / Pause** | Plays the film from where it is (from the start once it has ended). Key: <kbd>Space</kbd> or <kbd>K</kbd>. |
| **Loop** | On: after the final hold the opening frame fades in (0.4 s) and the film starts again, without a jump. Key: <kbd>L</kbd>. |
| **Frame by frame** | Pauses and steps one named frame at a time with the ‹ › buttons, the slider or <kbd>←</kbd> <kbd>→</kbd> (<kbd>Home</kbd> / <kbd>End</kbd> for the first and last). Key: <kbd>F</kbd>. |
| **Frame / Go** | Jumps straight to a frame: `1`–`67` or `120`–`195`. A skipped number (68–119) goes to frame 120, where the circle bursts. |

The row above the buttons always shows the frame on screen: its label (for example **66**) and place in the film, its name (for example **Step 3 · Foot strike**),
its place in that part (**2 of 8**), what the film looks like at that moment, and a line on what happens.
The full list is in [FRAMES.md](FRAMES.md). To ask for a change, quote the frame label and name.

Address options for review: `?frame=67` (or `?frame=120`) opens on that frame, `?loop=1` starts with Loop on, `?controls=1` shows the
review controls (the loading screen has none), `?autoplay=0` waits for Play.

## Use it in your site

Copy `src/components/RunnerIntroLoader` into your project and `public/runner-intro` into your public folder, then:

```jsx
import RunnerIntroLoader from './components/RunnerIntroLoader';

export default function Loader({ onDone }) {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <RunnerIntroLoader controls={false} autoPlay onComplete={onDone} />
    </div>
  );
}
```

The component fills its parent, so give the parent a size. It adapts to any shape: a landscape box shows the desktop
film (16:9 is exactly the 1920 × 1080 film), a portrait box the mobile film (9:16 is exactly the 1080 × 1920 film).

| Prop | Default | |
|---|---|---|
| `autoPlay` | `true` | Start playing once ready. |
| `loop` | `false` | Start with Loop on. |
| `ready` | `true` | Set to `false` while your website is still loading: at the end the loader holds its final logo until `ready` turns `true`, then calls `onComplete` (hide the loading screen there). With `true` it calls `onComplete` once the final hold has played. |
| `controls` | `false` | Show the review controls under the film. Leave off on the live site. |
| `frameMode` | `false` | Start in frame-by-frame mode. |
| `startFrame` | `1` | Frame to open on, by its label (`67`, `120`). |
| `assetsBase` | `'/runner-intro/'` | Where the images in `public/runner-intro` are served from. |
| `onReady`, `onComplete`, `onFrameChange(frame)`, `onError(error)` | | Callbacks. |
| `className`, `style` | | For the outer element. |

With a `ref`: `play()`, `pause()`, `toggleLoop()`, `setFrameMode(on)`, `goToFrame(label)`, `seek(seconds)`, `getFrame()`.

## Built to keep going

- **Fast and slow connections alike.** The page asks for the loader's images (about 0.9 MB: the runner's frames as WebP, with JPEG
  copies for any browser without WebP) as soon as it is read, all at once; the film starts only when the frames it needs are in, so it never stalls or skips once it is playing. Until then
  the screen is the plain paper the film opens on (no text). On a very slow connection, if the runner's frames are not
  in within 15 s the film plays with its striped runner instead, so the loader never waits for ever.

- If an image is missing or slow (over 15 s), the film carries on with its fallback: the striped runner in place of
  the video look, or the drawn runner if the motion data is missing; the crosses and logo still play.
- If something fails while starting, the player says so and offers **Try again**; the rest of the page keeps working.
- Resizing redraws at the new shape (after a short pause while you drag), and the controls never cover the film.
- With "reduce motion" switched on in the device settings, the runner holds his first pose and the rest plays.
- Without the reference images the striped runner lands and fades the same way; if the browser won't let the runner's
  image be faded on its own, he and his paper fade out just before his foot lands and the circle still bursts at the
  landing. Every size is worked out again when the screen changes.
- It plays at the screen's own rate (60 frames a second or more) and pauses its clock while the tab is hidden.

## What's inside

```
public/runner-intro/          the film's images: the reference frames (runner_ref40_*), paper grain, motion data and silver crosses
src/components/RunnerIntroLoader/
  RunnerIntroLoader.jsx       the component and its controls
  RunnerIntroLoader.css       its styles, including the film's own stage styles
  frames.js                   the named frames (also in FRAMES.md)
  film/engine.js              the player: stage, canvas, sizing and the film's timing helpers
  film/shared.js              the approved loader's drawing code, unchanged from the film
  film/runnerScene.js         the runner scene: his foot lands (67) and the circle bursts (120), the silver crosses (129–136)
```
