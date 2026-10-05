# 🎨 DESIGN SYSTEM — J.A.R.V.I.S. MARK I

**Look:** inspired by the J.A.R.V.I.S. interface of the [my-jarvis](https://github.com/harsh-raj00/my-jarvis) project: teal on deep navy, rounded glass panels, and a particle-sphere holographic display.

---

## 1. Colour Tokens (`app/globals.css`)

| Token | Value | Use |
| :-- | :-- | :-- |
| `--jarvis-teal` | `#00E5B0` | Primary accent: titles, icons, borders, the particle sphere |
| `--jarvis-teal-dark` | `#00AA77` | Header subtitle, gradients, system-line chevrons |
| `--jarvis-teal-bright` | `#00FFD4` | Logo core, active tool icons |
| `--jarvis-cyan-light` / `--jarvis-blue` | `#00D4FF` / `#0088FF` | Landing page arc reactor and title gradient |
| `--stark-red` | `#FF4444` | Listening mic button, OFFLINE pill, alerts, landing corner brackets and INITIALIZE |
| `--processing-amber` | `#FFAA00` | PROCESSING pill, NETWORK tile icon |
| `--memory-purple` | `#AA66FF` | MEMORY tile icon |
| `--deep-navy` | `#000814` | Page background (`--void-black`) |
| Panels | `rgba(255,255,255,0.02)` fill, `rgba(255,255,255,0.05)` border | Header, display, chat card, tiles |
| Muted text | `#7A8A99`, greys `#666` / `#555` | Secondary text, labels |

## 2. Typography

* **Orbitron** (`--font-orbitron`): titles, panel headings, metric values, the 3D text (`public/fonts/Orbitron.ttf`, SIL OFL, licence beside it).
* **Rajdhani** (`--font-rajdhani`): body text and chat bubbles.
* **JetBrains Mono** (`--font-mono`): system lines, settings and vault details.
* **Courier New**: the boot terminal on the landing page.
* Uppercase headings with wide letter-spacing (2–4px in the dashboard, up to 20px on the landing title).

## 3. Shape & Effects

* Rounded corners everywhere (6–16px; the old `.chamfer-*` class names now give rounded radii; circles for the logo and orb).
* Glows: logo `0 0 20px rgba(0,229,176,0.5)`, INITIALIZE `0 0 30px rgba(255,68,68,0.5)`.
* Panels open with a short fade-and-drop (`scifi-modal-unfold-down`), close with the reverse.

---

## 4. Screens

### 4.1 Landing Page (`components/Landing/LandingPage.jsx`)

```
┌ ┐                                         ┌ ┐
            ( arc reactor, breathing )
              J . A . R . V . I . S .
       JUST A RATHER VERY INTELLIGENT SYSTEM
    ┌──────────── boot terminal ────────────┐
    │ > STARK INDUSTRIES SECURE NETWORK      │
    │ > ... ALL SYSTEMS OPERATIONAL          │
    │ > WELCOME BACK, SIR.                   │
    └────────────────────────────────────────┘
                 [ INITIALIZE ]
└ ┘              [S] STARK INDUSTRIES        └ ┘
```

* Navy gradient, a cyan / red particle network (fewer particles on phones), a faint chevron grid, red corner brackets.
* Arc reactor in CSS: outer ring, eight light spokes, a spinning inner ring, the glowing core, the white triangle; the whole reactor breathes 0.9–1.1×.
* Boot lines every 300ms (green for READY / ACTIVE / 100% / OPERATIONAL, gold for WELCOME), then INITIALIZE (also Enter). INITIALIZE unlocks audio, opens the dashboard, and starts the voice link.
* Every size uses `clamp()`, so it fits from 320px phones to wide desktops.

### 4.2 Dashboard (`app/page.jsx`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ (●) J.A.R.V.I.S.            [● LISTENING...] [ONLINE] [tools ×6]         │
│     VOICE ASSISTANT ACTIVE                                               │
├───────────────────────────────────────────┬──────────────────────────────┤
│ HOLOGRAPHIC DISPLAY (60%)        [+][-][⟳]│ ● NEURAL LINK                │
│            particle sphere          [✋]  │  bubbles / system lines      │
│        rings · planets · labels           │ [mic] [Speak or type…] [➤]  │
│                                           ├─────────┬─────────┬──────────┤
│ HOLOGRAPHIC DISPLAY                       │ CPU     │ MEMORY  │ NETWORK  │
└───────────────────────────────────────────┴─────────┴─────────┴──────────┘
```

* **Header:** logo orb (pulses while Jarvis speaks), title, a status subtitle (ACTIVE / MIC MUTED / STANDBY / LINKING), the state pill (LISTENING red, PROCESSING amber, SPEAKING teal), the ONLINE / OFFLINE pill (also connects and disconnects, with latency), and six tool buttons: briefing, intel (with count), memories, settings, API key, fullscreen.
* **Holographic display** (`components/Canvas3D/HoloDisplay.jsx`, `HoloScene.jsx`, React Three Fiber): 10,000 teal points (6,000 on phones), an inner glow, "J.A.R.V.I.S." / "STARK INDUSTRIES" turning inside, two orbit rings with red planets, the grey spiral planet, and the AI CORE / NEURAL NET / VOICE SYNC / ANALYSIS labels, auto-rotating. It reacts to the link: the sphere swells and the glow brightens with the voice level (Jarvis's playback or the microphone), spins faster while thinking, and dims when offline. Chips: zoom in / out, reset; keys + / - / R; drag to rotate.
* **Neural Link** (`components/HUD/NeuralLink.jsx`): greeting by time of day when nothing has been said yet; operator bubbles in a teal gradient (right), Jarvis in glass (left, Markdown), system actions as small grey lines; three bouncing dots while thinking. Input row: mic button (teal when muted or offline, red while listening, red Stop while Jarvis speaks), text box, send.
* **Metric tiles** (`components/HUD/MetricsTiles.jsx`): CPU (with GPU), MEMORY (used / total), NETWORK (with uptime, processes, OS), polled every 2.5 s.

### 4.3 Panels & Modals

Intel (draggable), memory vault and memory card, settings, and API key keep their layouts and behaviour, recoloured to the teal palette with rounded corners.

---

## 5. Responsive Layout

| Width | Layout |
| :-- | :-- |
| 1024px and up | Header in one row; display (3/5) beside chat and tiles (2/5). |
| 640–1023px | Tools in their own row of six under the header; display (40dvh) above chat and tiles. |
| Below 640px | Tools in a row of six; display `min(28dvh, 260px)` (22dvh on short screens); the state pill moves into the subtitle; compact greeting; safe-area insets for the notch and home bar. |

The page is `h-dvh`, so mobile browser toolbars never hide the input.

