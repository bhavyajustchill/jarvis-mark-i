# ⚡ J.A.R.V.I.S. MARK I — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Product:** J.A.R.V.I.S. Mark I (Just A Rather Very Intelligent System)  
**Platform:** Web app (Next.js 16) running on the user's own computer, opened in a Chromium browser  
**Voice core:** Gemini Live API (`models/gemini-3.1-flash-live-preview`), voice Charon  
**Persona:** J.A.R.V.I.S. (Iron Man): calm, refined, dryly witty  

---

## 1. Vision

A voice-first desktop assistant you talk to like a person: it listens continuously, answers out loud in under a second, stops the moment you interrupt, remembers what matters to you, and handles a handful of everyday computer tasks. All of it sits behind a cinematic holographic dashboard that also works on phones and tablets.

## 2. Persona

* **Name:** Jarvis, always spoken as one word; shown on screen as J.A.R.V.I.S.
* **Tone:** a composed British butler who also runs the lab: courteous, quietly confident, dryly witty, never gushing or servile.
* **Address:** uses the callsign the user sets (default "Sir").
* **Speech:** short turns, natural numbers ("seventy-five percent"), no meta-commentary.

## 3. Target User

A developer or power user who wants a hands-free assistant on their own machine, runs it locally, and brings their own Gemini API key.

## 4. Features

### 4.1 Real-time conversation
* Continuous listening while connected and unmuted; typed messages work too.
* Spoken answers streamed as audio with a gapless player; interruption (the red Stop button, or speaking over him) cuts playback within 50 ms.
* Spoken greeting when the link opens.
* Sixteen selectable male voices with audio previews; Charon by default.

### 4.2 Memory & profile
* A long-term memory vault: Jarvis stores facts, preferences, and goals when told to, and recalls them later.
* The vault can be browsed, searched, filtered, edited, and pruned in the HUD.
* The operator profile (callsign, role, clearance, assistant name, voice, preferences, humour, auto-briefing) is editable in Settings or by voice.
* Saved memories and the profile are injected into every session's system instruction.

### 4.3 Briefing
* A two-step morning / tactical briefing: a short acknowledgement, then system readiness, the day's headlines, and active objectives.

### 4.4 Information
* Web search (DuckDuckGo), with results kept as dossiers in the Intel panel.
* Current weather for any city (Open-Meteo), optionally opened in the browser.
* Live host telemetry: CPU, GPU, memory, network, uptime, processes.

### 4.5 Desktop actions (Windows and Linux)
* Open common apps (VS Code, terminal, text editor, calculator, files, task manager, Spotify, browser).
* Volume up, down, set, mute, unmute.
* Open a folder or URL, minimise all windows, lock the screen.

### 4.6 Interface
* Boot screen with arc reactor, boot terminal, and INITIALIZE (which also starts the voice link).
* Dashboard: header with link state and tools, the HOLOGRAPHIC DISPLAY (reacts to the voice), the NEURAL LINK chat, and live metric tiles.
* Panels: Intel, Memory Vault (and memory detail), Settings, API Key.
* Layouts for desktop, tablet, and phone.

## 5. Non-Functional Requirements

| Requirement | Target |
| :-- | :-- |
| Voice latency | First audio in under 500 ms on a good connection |
| Barge-in | Playback stops within 50 ms |
| Rendering | Smooth animation of the 10,000-point sphere (6,000 on phones) |
| Privacy | Memory and profile stay on the local machine (`data/`, never committed) |
| Key handling | API key in browser local storage or the server environment only |

## 6. Out of Scope

* Cloud hosting or multi-user accounts.
* Screen or camera vision, plugins, phone remotes, wake words.
* File editing, terminal commands, or other unrestricted computer control beyond the actions in 4.5.
