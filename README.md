# Sidequest UT

Sidequest UT is a privacy-first hackathon MVP that helps UT students break routine with low-friction real-world sidequests, then privately log completed memories.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Client-side persistence with `localStorage`
- Hardcoded quest dataset + lightweight API route (`POST /api/quests`)

## Route Map

- `/` Landing page with product pitch and CTA
- `/onboarding` Preferences form
- `/quests` Recommended quest results (3 cards)
- `/quests/[id]` Quest detail
- `/complete/[id]` Completion flow with optional image preview
- `/journal` Private journal (saved + demo seeded entries)

## Shared Type Contracts

Defined in `src/lib/types.ts`:

- `Preferences`
- `Quest`
- `JournalEntry`

The schema and field names match the shared hackathon contract and should remain stable for integration.

## Shared Constants

Defined in `src/lib/constants.ts`:

- Allowed option arrays for interests, time, budget, mode, transport, and vibe
- Storage keys:
- `sidequest:preferences`
- `sidequest:journal`
- `sidequest:demo-seeded`

## Ownership Split (Original Team Plan)

- Developer 1: app shell, landing, onboarding, shared UI and contracts
- Developer 2: quests dataset, ranking engine, API route, `/quests`, `/quests/[id]`
- Developer 3: storage layer, completion flow, journal, demo seed, demo checklist

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Demo Notes

- Quick runbook: `DEMO_CHECKLIST.md`
- Demo placeholders: `public/demo/*`
