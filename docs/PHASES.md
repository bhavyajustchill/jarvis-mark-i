# 🚀 IMPLEMENTATION PHASES — J.A.R.V.I.S. MARK I

**Architecture:** Next.js 16 + React Three Fiber / Three.js + JavaScript (JSX) + Gemini Live WebSockets  
**Reference Documents:** [`PRD.md`](./PRD.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`DESIGN.md`](./DESIGN.md)

---

## Phase Overview

```
[Phase 1: Foundation] ➔ [Phase 2: Voice Core] ➔ [Phase 3: Persona & Memory] ➔ [Phase 4: Tools]
                                                                                      │
                     [Next phase: not yet defined] 🠔 [Phase 6: Layouts] 🠔 [Phase 5: Interface]
```

**Status:** Phases 1–6 are complete. No phase is active; the next one is defined before new feature work starts.

---

## Phase 1: Foundation

- [x] Next.js 16 App Router project in JavaScript / JSX with Tailwind CSS 4 and Turbopack.
- [x] Fonts (Orbitron, Rajdhani, JetBrains Mono) and the teal / navy design tokens.
- [x] Zustand store for link state, conversation, telemetry, memory, and panels.

## Phase 2: Voice Core

- [x] `/api/live-session`: session config, tool declarations, API key from the browser or `GEMINI_API_KEY`.
- [x] `useGeminiLive`: WebSocket to the Gemini Live API, setup, transcripts, and a fresh session after a voice change.
- [x] Microphone capture with an `AudioWorklet` (48 kHz → 16 kHz Int16 PCM).
- [x] Gapless 24 kHz PCM playback (`pcmPlayer.js`) and barge-in under 50 ms.
- [x] Mute / unmute with the preference remembered.

## Phase 3: Persona & Memory

- [x] J.A.R.V.I.S. persona (`lib/jarvisPersona.js`) with the Charon voice and sixteen selectable voices.
- [x] Memory vault in `data/memories.json` (created on first run) and `/api/memory`.
- [x] Operator profile (callsign, role, clearance, assistant name, voice, preferences) injected into each session.
- [x] Spoken greeting on connect and the two-step briefing.

## Phase 4: Tools

- [x] `get_system_telemetry` and `/api/system-telemetry`.
- [x] `get_weather` (Open-Meteo) and `web_search` (DuckDuckGo) with Intel dossiers.
- [x] `recall_memory`, `store_memory`, `update_operator_profile`.
- [x] `execute_os_action`: apps, volume, folder / URL, minimise all, lock (Windows and Linux).

## Phase 5: Interface

- [x] Boot screen: arc reactor, particle network, boot terminal, INITIALIZE.
- [x] HOLOGRAPHIC DISPLAY: particle sphere, orbit rings, labels; reacts to voice; zoom, reset, drag to rotate.
- [x] NEURAL LINK chat with the mic / Stop button and typing indicator.
- [x] Metric tiles; Intel, Memory Vault, Settings, and API Key panels.

## Phase 6: Layouts

- [x] Desktop (display beside chat), tablet (stacked, tools in their own row), and phone (shorter display, safe-area insets, `h-dvh`).
- [x] Checked from 320px to 1920px wide: no control off-screen or overlapping, no sideways scroll.
