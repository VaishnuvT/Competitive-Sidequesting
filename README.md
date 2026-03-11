# Dirac Dispatch

Dirac Dispatch is a hackathon MVP for a UT-student personal briefing product that feels outbound-first instead of browse-first. The demo ships as a zero-dependency web app so it can run reliably this weekend without a backend, auth, or package installation.

## Quick start

1. From the repo root, start the local server:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1 -Port 4173
```

2. Open [http://localhost:4173](http://localhost:4173) in a browser.
3. Leave the app in `Demo` mode for the safest hackathon walkthrough.
4. Click `Morning`, `Afternoon`, `Evening`, or `Dispatch all three`.
5. Use `Play audio` to demo the podcast-style briefing.

No package install is required.
## Recommended MVP format and stack

The fastest, most demoable format is a lightweight web control panel that simulates outbound delivery:

- Static HTML/CSS/JavaScript app with ES modules
- Browser-native `SpeechSynthesis` for podcast-style playback
- Modular source adapters for `demo`, `hybrid`, and `live` modes
- Seeded persona and content data for a reliable demo
- Public-feed adapters for weather, UT events RSS, world RSS, and optional public Google Calendar ICS

Why this stack:

- It is runnable with almost zero setup.
- The UI can focus on message dispatch and spoken briefings instead of building a complex app shell.
- The architecture still looks extensible enough for real integrations after the hackathon.

## Project structure

```text
.
|-- index.html
|-- scripts/
|   `-- serve.ps1
|-- src/
|   |-- config.js
|   |-- main.js
|   |-- data/
|   |   |-- demoContent.js
|   |   `-- personas.js
|   |-- core/
|   |   |-- briefingEngine.js
|   |   |-- compose.js
|   |   |-- date.js
|   |   |-- formatters.js
|   |   |-- normalize.js
|   |   |-- personalize.js
|   |   `-- providers/
|   |       |-- demoProviders.js
|   |       |-- liveProviders.js
|   |       `-- sourceRegistry.js
|   `-- ui/
|       |-- render.js
|       `-- speech.js
`-- styles/
    `-- main.css
```

## Architecture and module boundaries

The system is intentionally split into the same layers you would keep if this grew into a real product:

1. Source adapters / ingestion
   - `src/core/providers/demoProviders.js` returns stable seeded tasks, campus events, and world items.
   - `src/core/providers/liveProviders.js` attempts real public feeds:
     - Weather.gov for commute context
     - UT Events RSS feed
     - Public RSS feeds for world news
     - Optional public Google Calendar ICS URL
2. Normalization
   - `src/core/normalize.js` converts mixed source records into one shared briefing item shape.
3. Ranking / personalization
   - `src/core/personalize.js` scores items by slot, urgency, interests, major, lifestyle, and stress mode.
4. Briefing composition
   - `src/core/compose.js` turns ranked items into a narrative briefing object with a strong opening and “why it matters”.
5. Output formatting
   - `src/core/formatters.js` produces:
     - SMS-style text
     - audio/podcast-style script
6. Demo/live toggle
   - `src/core/providers/sourceRegistry.js` selects providers and applies fallback logic so the demo never goes blank.
7. Control interface
   - `src/ui/render.js` renders the dispatch console, persona editor, SMS preview, source trace, and ranking rationale.

## Exact file-by-file implementation plan

1. `index.html`
   - Minimal host page and app mount point.
2. `styles/main.css`
   - Outbound-first visual direction with a dispatch console, phone-style SMS shell, and cards for sources and audio.
3. `src/config.js`
   - Shared app constants, slot definitions, and source-mode metadata.
4. `src/data/personas.js`
   - Seeded demo personas and cloning helpers.
5. `src/data/demoContent.js`
   - Seeded fallback tasks, campus happenings, and world summaries.
6. `src/core/date.js`
   - Shared time helpers for schedule hydration and spoken-length estimation.
7. `src/core/providers/demoProviders.js`
   - Stable demo adapters for all three briefing domains.
8. `src/core/providers/liveProviders.js`
   - Best-effort live adapters for public RSS, weather, and optional public ICS.
9. `src/core/providers/sourceRegistry.js`
   - Mode selection plus live-to-demo fallback.
10. `src/core/normalize.js`
    - Common item shape and derived fields.
11. `src/core/personalize.js`
    - Ranking heuristics and “why it matters” selection.
12. `src/core/compose.js`
    - Narrative briefing object construction.
13. `src/core/formatters.js`
    - SMS and podcast-script output formatters.
14. `src/core/briefingEngine.js`
    - End-to-end orchestration.
15. `src/ui/speech.js`
    - Browser TTS wrapper.
16. `src/ui/render.js`
    - Demo control surface and preview rendering.
17. `src/main.js`
    - State management, event wiring, and generation actions.
18. `scripts/serve.ps1`
    - Tiny static server for local demoing without external tools.

## Setup

Because this is a static app, setup is intentionally tiny.

### Option 1: use the included PowerShell server

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1 -Port 4173
```

Then open:

- [http://localhost:4173](http://localhost:4173)

### Option 2: open `index.html` directly

That is enough for `demo` mode. A local server is recommended for `hybrid` and `live` mode because browsers handle module and network behavior more predictably over `http://`.

## Live vs demo mode

The UI lets you switch between three modes:

- `Demo`
  - Uses seeded tasks, campus events, and world summaries.
  - Best for a guaranteed on-stage demo.
- `Hybrid`
  - Attempts public feeds and keeps seeded content in the mix.
  - Best for showing “real + reliable”.
- `Live`
  - Prefers public feeds first, then falls back if coverage is thin.
  - Best for showing future potential and source transparency.

### Live inputs supported today

- Optional public Google Calendar ICS URL for personal agenda data
- UT Events RSS feed
- Weather.gov Austin forecast endpoint
- Public world-news RSS feeds

## Demo script

A clean 3-minute demo story:

1. Open the app in `Demo` mode.
2. Start on Maya and generate the morning briefing.
   - Point out labs, advising, and weather/commute stress reduction.
3. Switch to Noah and generate the afternoon briefing.
   - Show how startup and career events rise above generic campus events.
4. Switch to Priya and generate the evening briefing.
   - Show policy and research weighting plus lower-noise output.
5. Click “Dispatch all three” for one persona.
   - Emphasize the outbound concept: three pulses, not one endless feed.
6. Hit “Play audio”.
   - Frame it as the podcast-style version for headphones or a smart speaker.
7. Switch to `Hybrid` mode.
   - Show the source trace panel explaining which items were live and which were fallbacks.

## How to explain the hard-coded parts honestly

The honest pitch is stronger than pretending everything is live:

- “We optimized the MVP for demo reliability, so private student systems are mocked behind real adapter boundaries.”
- “Public feeds like UT Events RSS and Weather.gov are already wired in.”
- “The seeded data is not a shortcut around architecture. It is a demo-safe cache layer that lets us prove the product experience now and swap real connectors in later.”
- “For a hackathon, reliability matters more than fragile scraping or auth-heavy integrations.”

## Future roadmap

- Replace public ICS with authenticated Google Calendar integration
- Add real assignment/deadline connectors from LMS or email parsing
- Add delivery channels like Twilio SMS or push notifications
- Add persistent profiles and saved notification schedules
- Add higher-quality TTS and downloadable audio clips
- Add smarter campus-event relevance using historical attendance and location

## Notes for hackathon judging

This MVP is built to tell a strong story:

- Impact: students are overwhelmed by fragmented signals
- Novelty: the product reaches out first instead of asking students to browse
- Usefulness: three daily briefing pulses replace scattered calendars, bulletin boards, and feeds
- Implementation: real public feeds where stable, seeded data where reliability matters
- Future potential: the adapter boundaries make it straightforward to plug in real campus and personal systems later