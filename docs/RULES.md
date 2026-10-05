# 🛡️ CODING RULES & GUARDRAILS — J.A.R.V.I.S. MARK I

**Scope:** Next.js 16, React 19, JavaScript (JSX), Three.js / React Three Fiber, Web Audio API  

---

## 1. JavaScript & JSX Only

* All source files use `.js` or `.jsx`. No `.ts` / `.tsx`, no type annotations; use JSDoc comments when types help.
* Functional components with prop destructuring:
  ```jsx
  export function MetricsTiles({ compact = false }) { ... }
  ```
* Client components that touch the canvas, Web Audio, WebSockets, or the browser declare `"use client";` at the top.
* Keep high-frequency data (audio levels, FFT bins, PCM) out of React state: read it in render loops from refs or getters.

## 2. 3D (React Three Fiber)

* Never allocate `Vector3`, `Euler`, `Matrix4`, or `Color` inside `useFrame()`; reuse objects created outside the loop.
* Never call `setState()` inside `useFrame()`; mutate refs (scale, rotation, material opacity) directly.
* Dispose of geometries and materials you create manually when the component unmounts.

## 3. Web Audio & Streaming

* Microphone downsampling runs in the `AudioWorkletProcessor` (`public/audio-worklet-processor.js`), never on the main thread.
* Resume a suspended `AudioContext` from a user gesture (INITIALIZE, or any click / key) before playback.
* Schedule incoming 24 kHz PCM on the audio clock for gapless playback.
* On interruption, call `stopAndFlush()` and clear the queue within 50 ms.

## 4. UI & Styling

* Use the palette in `app/globals.css` (teal `#00E5B0`, navy `#000814`, red `#FF4444`, amber `#FFAA00`, purple `#AA66FF`) and the rounded glass panel style described in `DESIGN.md`.
* Fonts: Orbitron for headings and numbers, Rajdhani for text, JetBrains Mono for system lines and details.
* Every screen must fit from 320px phones to wide desktops: no control off-screen, no sideways scroll.

## 5. Errors & Tools

* If WebGL is unavailable, show the display's fallback message instead of a blank panel.
* Tool calls must not block audio or animation; log each action to the Neural Link as a system line.
* Server routes return JSON errors with a message Jarvis can speak; never crash the session on a failed tool.
