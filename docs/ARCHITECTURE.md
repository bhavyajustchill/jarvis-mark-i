# ⚡ SYSTEM ARCHITECTURE — J.A.R.V.I.S. MARK I

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · JavaScript / JSX · Tailwind CSS 4 · Three.js with React Three Fiber and drei · Zustand · Gemini Live API · Web Audio  

---

## 1. Overview

```
Browser (localhost)                                    Next.js server (same machine)
┌─────────────────────────────────────────┐            ┌─────────────────────────────────────────┐
│ Boot screen → Dashboard (app/page.jsx)  │            │ /api/live-session  session config,      │
│   HoloDisplay (R3F)  NeuralLink  Tiles  │            │                    persona + memories    │
│ useGeminiLive ── WebSocket ─────────────┼──► Gemini  │ /api/memory        vault + profile       │
│   mic → AudioWorklet (16 kHz PCM)       │    Live    │ /api/weather       Open-Meteo            │
│   PCM player (24 kHz) ← audio           │    API     │ /api/web-search    DuckDuckGo            │
│   tool calls ──── fetch ────────────────┼───────────►│ /api/system-telemetry  host stats        │
│ Zustand store (lib/store.js)            │            │ /api/os-control    apps, volume, lock    │
└─────────────────────────────────────────┘            │ data/memories.json (created on first run)│
                                                       └─────────────────────────────────────────┘
```

## 2. Voice Pipeline

1. **Session setup.** On connect, `hooks/useGeminiLive.js` calls `POST /api/live-session`, which reads `data/memories.json`, builds the system instruction (persona from `lib/jarvisPersona.js`, operator profile, time zone, saved memories), declares the tools, and returns the WebSocket URL and config. The API key comes from the request (browser) or `GEMINI_API_KEY`.
2. **Input.** `hooks/useAudioStream.js` captures the microphone; `public/audio-worklet-processor.js` downsamples 48 kHz float audio to 16 kHz Int16 PCM off the main thread, and chunks stream to Gemini as realtime input while unmuted.
3. **Output.** Gemini streams 24 kHz PCM; `lib/pcmPlayer.js` schedules chunks on the Web Audio clock without gaps. `stopAndFlush()` drops everything queued (barge-in).
4. **Transcripts.** Input and output transcriptions are written to the conversation log in the store and shown in the Neural Link.
5. **Tools.** Function calls are handled in `useGeminiLive.js`, which calls the matching API route and sends the result back as a tool response.

## 3. Tools

| Tool | Route | Notes |
| :-- | :-- | :-- |
| `get_system_telemetry` | `/api/system-telemetry` | CPU delta, memory, GPU, network throughput, uptime, processes |
| `get_weather` | `/api/weather` | Open-Meteo geocoding and forecast; `open_browser` opens a weather page |
| `web_search` | `/api/web-search` | DuckDuckGo HTML and Instant Answer; results added to Intel |
| `recall_memory` / `store_memory` | `/api/memory` | Vault read and write |
| `update_operator_profile` | `/api/memory` | Callsign, role, clearance, assistant name, voice, preferences |
| `execute_os_action` | `/api/os-control` | Whitelisted apps, volume, folder / URL, minimise all, lock (Windows and Linux) |

## 4. State (`lib/store.js`, Zustand `useJarvisStore`)

* Link: `status` (DISCONNECTED, CONNECTING, CONNECTED, LISTENING, THINKING, SPEAKING), `latencyMs`, `isMuted`.
* Conversation: `commsLog` entries `{ id, sender: 'user' | 'jarvis' | 'system', text, time }`.
* Telemetry: `systemTelemetry` (polled every 2.5 s by `MetricsTiles`).
* Memory: `operatorProfile`, `memories`, `selectedMemoryModal`, plus API helpers.
* Panels: key, settings, memory vault, intel; `intelSearchResults`.
* Browser storage: `jarvis_mark_i_api_key`, `jarvis_mark_i_mic_muted`, `jarvis_mark_i_voice_name`.

## 5. Front End

* `app/page.jsx`: boot screen until INITIALIZE (which unlocks audio and connects), then the dashboard.
* `components/Landing/LandingPage.jsx`: arc reactor, particle network canvas, boot terminal.
* `components/Canvas3D/HoloDisplay.jsx` + `HoloScene.jsx`: the particle sphere scene; reads voice energy (playback or microphone) each frame to swell and glow, spins faster while thinking, dims offline; zoom / reset API for the chips and keys.
* `components/HUD/`: `NeuralLink` (chat and mic button), `MetricsTiles`, `IntelModal`, `SciFiMemoryVaultModal`, `SciFiMemoryModal`, `SciFiSettingsModal`, `ApiKeyModal`, `MarkdownText`.

## 6. Directory Layout

```text
app/            page.jsx, layout.jsx, globals.css, manifest.js, api/*
components/     Landing/, Canvas3D/, HUD/
hooks/          useGeminiLive.js, useAudioStream.js
lib/            jarvisPersona.js, pcmPlayer.js, store.js
public/         audio-worklet-processor.js, fonts/ (Orbitron, OFL), voices/male/ (voice previews)
data/           memories.json, created on first run (gitignored)
docs/           PRD, ARCHITECTURE, DESIGN, RULES, PHASES, MEMORY, screenshots/
```

## 7. Security Notes

* The server listens on all interfaces in development (`next dev -H 0.0.0.0`); OS actions are limited to a whitelist and run with the user's own permissions.
* No authentication: run it on a trusted machine and network.
