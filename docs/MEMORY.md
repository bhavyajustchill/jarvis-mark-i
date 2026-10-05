# 🧠 CONTEXT MEMORY LOG — J.A.R.V.I.S. MARK I

**Purpose:** the current state of the project and the decisions behind it, so work can continue across sessions.  
**Reference Documents:** [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`PHASES.md`](./PHASES.md)

---

## 1. Current State

- **Active Stage:** Phases 1–6 complete; no phase active.
- **Stack:** Next.js 16 + React 19 + JavaScript (JSX) + Tailwind CSS 4 + React Three Fiber + Zustand + Gemini Live API.
- **Voice:** `models/gemini-3.1-flash-live-preview`, voice Charon, persona in `lib/jarvisPersona.js`.
- **Data:** `data/memories.json` holds the operator profile and memories; it is created on first run and never committed.

---

## 2. Key Decisions

| ID | Decision | Rationale |
| :-- | :-- | :-- |
| **DEC-001** | Pure JavaScript / JSX, no TypeScript | Keeps the codebase approachable and fast to iterate on. |
| **DEC-002** | Gemini Live over a browser WebSocket, with the session config built server-side in `/api/live-session` | Lowest voice latency; the server owns the persona, memories, and tool declarations. |
| **DEC-003** | `AudioWorklet` downsampling to 16 kHz and a clock-scheduled 24 kHz PCM player | Off-main-thread capture and gapless playback; `stopAndFlush()` gives barge-in within 50 ms. |
| **DEC-004** | The voice link starts from the INITIALIZE click | A user gesture lets the browser play audio straight away. |
| **DEC-005** | Memory vault as a local JSON file (`data/memories.json`) | Simple, private, and inspectable; created on first run with a neutral profile (callsign "Sir"). |
| **DEC-006** | Persona J.A.R.V.I.S. with the Charon voice | A calm British voice that matches the interface; sixteen voices remain selectable. |
| **DEC-007** | HOLOGRAPHIC DISPLAY in React Three Fiber, driven by voice energy read each frame | Reacts to both speakers without re-rendering React; 6,000 points on phones for performance. |
| **DEC-008** | Teal on navy, rounded glass panels, Orbitron / Rajdhani / JetBrains Mono | A cinematic but readable look; see `DESIGN.md`. |
| **DEC-009** | Three layouts: desktop, tablet (below 1024px), phone (below 640px) | Usable on any screen with no off-screen controls. |
| **DEC-010** | Desktop actions limited to a whitelist (`/api/os-control`) | Useful everyday control without arbitrary command execution. |
| **DEC-011** | API key in browser local storage or `GEMINI_API_KEY`; no other secrets | Bring-your-own-key, nothing sensitive in the repository. |

---

## 3. Action Items

- [ ] Define the next phase before starting new feature work.
