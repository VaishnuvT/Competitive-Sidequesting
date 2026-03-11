# Dirac Dispatch

Dirac Dispatch is a hackathon MVP for a UT-student personal briefing product that feels outbound-first instead of browse-first. The experience is framed like a newspaper dispatch desk: three daily editions that get sent to the student as SMS-style briefings and optional audio.

The app is still zero-dependency from a setup standpoint, but it now has a stronger live-data story:

- a local PowerShell proxy for real public feeds
- pinned public UT event and news links for demo reliability
- a newspaper-style UI with a gothic masthead and burnt orange editorial accents

## Quick start

1. From the repo root, start the local server:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1 -Port 4173
```

2. Open [http://localhost:4173](http://localhost:4173) in a browser.
3. Leave the app in `Demo` mode for the safest walkthrough.
4. Click `Morning`, `Afternoon`, `Evening`, or `Dispatch all three`.
5. Use `Play audio` to demo the podcast-style briefing.

No package install is required.

## Recommended MVP format and stack

The fastest, most demoable format is a lightweight web control panel that simulates outbound delivery:

- Static HTML/CSS/JavaScript app with ES modules
- Browser-native `SpeechSynthesis` for podcast-style playback
- Local PowerShell server that acts as both static host and same-origin live-data proxy
- Modular source adapters for `demo`, `hybrid`, and `live` modes
- Seeded personas and fallback content for a reliable demo
- Curated public-link provider for recognizable UT events and real news stories

Why this stack:

- It runs on a bare machine without npm, auth, or backend setup.
- The UI can focus on the outbound experience instead of building a full app shell.
- The architecture still looks extensible enough for real integrations after the hackathon.

## Project structure

```text
.
|-- index.html
|-- README.md
|-- scripts/
|   `-- serve.ps1
|-- src/
|   |-- config.js
|   |-- main.js
|   |-- data/
|   |   |-- demoContent.js
|   |   |-- editorialDesk.js
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
|   |       |-- editorialProviders.js
|   |       |-- liveProviders.js
|   |       `-- sourceRegistry.js
|   `-- ui/
|       |-- render.js
|       `-- speech.js
`-- styles/
    `-- main.css
```

## Architecture and module boundaries

The system is split into the same layers you would keep if this grew into a real product:

1. Source adapters / ingestion
   - `src/core/providers/demoProviders.js` returns stable seeded tasks, campus events, and world items.
   - `src/core/providers/editorialProviders.js` injects pinned public links for real UT events and real news stories.
   - `src/core/providers/liveProviders.js` attempts real public feeds through the local proxy:
     - UT Events RSS
     - public news RSS
     - Weather.gov
     - optional public Google Calendar ICS
2. Normalization
   - `src/core/normalize.js` converts mixed source records into one shared briefing item shape.
3. Ranking / personalization
   - `src/core/personalize.js` scores items by slot, urgency, interests, major, lifestyle, stress mode, and whether the item is a live feed or an editor's pick.
4. Briefing composition
   - `src/core/compose.js` turns ranked items into a narrative briefing object with a strong opening, transparency note, and “why it matters”.
5. Output formatting
   - `src/core/formatters.js` produces:
     - SMS-style text
     - audio/podcast-style script
6. Source orchestration
   - `src/core/providers/sourceRegistry.js` mixes providers by mode and applies fallback logic so the demo never goes blank.
7. Control interface
   - `src/ui/render.js` renders the newspaper-style dispatch console, SMS proof column, source trace, and ranking rationale.

## Exact file-by-file implementation plan

1. `index.html`
   - Host page, font loading, and app mount point.
2. `styles/main.css`
   - Newspaper-style visual system with gothic masthead, editorial panels, and message-thread proof column.
3. `src/config.js`
   - Shared app constants, slot definitions, and live feed metadata.
4. `src/data/personas.js`
   - Seeded demo personas and cloning helpers.
5. `src/data/demoContent.js`
   - Stable fallback tasks, campus happenings, and world summaries.
6. `src/data/editorialDesk.js`
   - Curated public UT event links and real news links used as recognizable pinned anchors.
7. `src/core/date.js`
   - Shared time helpers for schedule hydration and spoken-length estimation.
8. `src/core/providers/demoProviders.js`
   - Stable demo adapters for all three briefing domains.
9. `src/core/providers/editorialProviders.js`
   - Real-link provider that guarantees a few recognizable public stories stay visible.
10. `src/core/providers/liveProviders.js`
    - Best-effort live adapters for public RSS, weather, and optional public ICS.
11. `src/core/providers/sourceRegistry.js`
    - Mode selection plus live-to-demo fallback.
12. `src/core/normalize.js`
    - Common item shape, display-time overrides, and derived ranking fields.
13. `src/core/personalize.js`
    - Ranking heuristics and “why it matters” selection.
14. `src/core/compose.js`
    - Narrative briefing object construction.
15. `src/core/formatters.js`
    - SMS and podcast-script output formatters.
16. `src/core/briefingEngine.js`
    - End-to-end orchestration.
17. `src/ui/speech.js`
    - Browser TTS wrapper.
18. `src/ui/render.js`
    - Demo control surface and preview rendering.
19. `src/main.js`
    - State management, event wiring, persistence, and generation actions.
20. `scripts/serve.ps1`
    - Local static server plus same-origin proxy routes for live public feeds.

## Setup

Because this is a static app with a tiny local proxy, setup is intentionally small.

### Run the included PowerShell server

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1 -Port 4173
```

Then open:

- [http://localhost:4173](http://localhost:4173)

Use the server even if you do not plan to demo live mode. The app will still run in `Demo` mode, and the same origin also keeps the live feed story ready for later in the demo.

## Live vs demo mode

The UI lets you switch between three modes:

- `Demo`
  - Uses seeded tasks plus pinned public UT/news links.
  - Best for a guaranteed on-stage walkthrough.
- `Hybrid`
  - Mixes live public feeds, pinned public links, and seeded fallback content.
  - Best for showing “real + reliable”.
- `Live`
  - Prefers public feeds through the local proxy while still keeping useful pinned links in the story mix.
  - Best for showing future potential and source transparency.

### Live inputs supported today

- Optional public Google Calendar ICS URL for personal agenda data
- UT Events RSS feed
- Weather.gov Austin forecast endpoint
- Official public news feeds including:
  - The Texas Tribune
  - The Guardian World
  - PBS NewsHour headlines
  - BBC World / Technology / Business / Science

### Proxy routes

The included PowerShell server exposes:

- `/api/health`
- `/api/world-news`
- `/api/campus-events`
- `/api/weather`
- `/api/calendar?url=...`

## Pinned public stories and events in the demo

The demo now includes hand-linked public anchors so the front page can show recognizable items even if a live feed gets noisy.

Pinned UT events include:

- [UT Austin Africa Conference 2026](https://calendar.utexas.edu/event/ut-austin-africa-conference-2026)
- [Forty Acres Fest](https://calendar.utexas.edu/event/forty_acres_fest_9226)
- [KXAN Investigates LIVE: The Stories Behind Our Stories](https://calendar.utexas.edu/event/kxan-investigates-live-the-stories-behind-our-stories)
- [Musical Memories featuring Butler Opera Center Musicians](https://calendar.utexas.edu/event/musical-memories-featuring-butler-opera-center-musicians)
- [Registration Deadline for 2026 Technology & Science Undergraduate Research Forum](https://calendar.utexas.edu/event/registration-deadline-for-2026-technology-amp-science-undergraduate-research-forum)

Pinned news stories include:

- [Texas Tribune: Austin shooting raises fresh questions about self-driving cars after ambulance was blocked from victim](https://www.texastribune.org/2026/03/09/texas-austin-shooting-autonomous-vehicles-self-driving-ambulance-blocked/)
- [Bloomberg: Trump Says Texas to Get New Oil Refinery With Reliance Backing](https://www.bloomberg.com/news/articles/2026-03-10/trump-says-us-to-get-new-oil-refinery-with-reliance-backing)
- [The Guardian: US weighs sending forces into Iran to secure nuclear stockpile, reports say](https://www.theguardian.com/world/2026/mar/10/us-weighs-sending-forces-into-iran-to-secure-nuclear-stockpile-reports-say)
- [PBS NewsHour: Iranian barrages target Israel and Gulf countries as Hegseth warns Iran of most intense day of strikes](https://www.pbs.org/newshour/world/iranian-barrages-target-israel-and-gulf-countries-as-hegseth-warns-iran-of-most-intense-day-of-strikes)

## Demo script

A clean 3-minute demo story:

1. Open the app in `Demo` mode.
2. Point at the masthead and explain that this is a newspaper-style dispatch desk, not a scrolling app.
3. Start on Maya and generate the morning edition.
   - Call out labs, advising, and weather/commute stress reduction.
4. Switch to Noah and generate the afternoon edition.
   - Show how startup-leaning students still get anchored with recognizable real UT events and public links.
5. Switch to Priya and generate the evening edition.
   - Show how policy-heavy world stories rise because of profile and stress-mode settings.
6. Click `Dispatch all three` for one persona.
   - Emphasize the outbound concept: three pulses, not one endless feed.
7. Hit `Play audio`.
   - Frame it as the podcast-style version for headphones, a smart speaker, or a voice assistant.
8. Switch to `Hybrid` or `Live` mode.
   - Show the source trace panel explaining which items were live feeds, which were pinned public links, and which were fallbacks.

## Codex skills used and considered

Relevant Codex skills available in this session were:

- `skill-installer`
- `skill-creator`
- `slides`
- `spreadsheets`

What was actually used:

- `skill-installer`
  - Used as the right workflow for auditing whether extra Codex skills should be pulled in for this task.
  - In this environment, its helper scripts require Python, and this machine does not have Python installed, so no extra curated skills could be installed.
- `skill-creator`
  - Used as guidance for thinking about reusable workflows and whether any of this should become a reusable skill later.

What was not used:

- `slides`
  - Not relevant to implementing the app itself.
- `spreadsheets`
  - Not relevant to the app or the live-data pipeline.

The practical result is that the app improvements here came from direct code changes in the repo rather than installing additional Codex add-on skills.

## How to explain the hard-coded parts honestly

The honest pitch is stronger than pretending everything is live:

- “We optimized the MVP for demo reliability, so private student systems are mocked behind real adapter boundaries.”
- “Public feeds like UT Events RSS, Weather.gov, and public news RSS are already wired in.”
- “We also pinned a small editor’s desk of real public UT links and real news links so the demo keeps recognizable anchor stories even if feeds are noisy.”
- “The seeded data is not a shortcut around architecture. It is a demo-safe fallback layer that lets us prove the product experience now and swap real connectors in later.”
- “For a hackathon, reliability matters more than fragile scraping or auth-heavy integrations.”

## Future roadmap

- Replace public ICS with authenticated Google Calendar integration
- Add real assignment/deadline connectors from LMS or email parsing
- Add delivery channels like Twilio SMS or push notifications
- Add persistent profiles and saved notification schedules
- Add higher-quality TTS and downloadable audio clips
- Add smarter campus-event relevance using historical attendance and location
- Add authenticated world-news preferences and source packs

## Notes for hackathon judging

This MVP is built to tell a strong story:

- Impact: students are overwhelmed by fragmented signals
- Novelty: the product reaches out first instead of asking students to browse
- Usefulness: three daily briefing pulses replace scattered calendars, bulletin boards, and feeds
- Implementation: real public feeds where stable, pinned public links where clarity helps, seeded fallbacks where reliability matters
- Future potential: the adapter boundaries make it straightforward to plug in real campus and personal systems later
