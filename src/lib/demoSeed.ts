import type { JournalEntry } from "@/lib/types";
import { getJournalEntries, isDemoSeeded, replaceJournalEntries, setDemoSeeded } from "@/lib/storage";

export const DEMO_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "demo-walk-reset",
    questId: "q008",
    title: "No-Phone Picnic",
    completedAt: "2026-03-08T18:22:00.000Z",
    note: "I left my phone zipped away and actually noticed the fountain sounds. Mood lifted fast.",
    imageUrl: "/demo/austin-walk.svg",
    locationText: "Main Mall lawn",
    companions: "Solo",
    tags: ["digital detox", "chill", "campus"]
  },
  {
    id: "demo-study-spot",
    questId: "q004",
    title: "Find a Hidden Study Nook",
    completedAt: "2026-03-06T21:05:00.000Z",
    note: "Found a quiet corner in FAC, finished a reading in one focused sprint.",
    imageUrl: "/demo/sidequest-memory.svg",
    locationText: "FAC courtyard edge",
    companions: "With one friend",
    tags: ["productive", "study spots", "small wins"]
  }
];

export function getDemoEntries(): JournalEntry[] {
  return DEMO_JOURNAL_ENTRIES.map((entry) => ({ ...entry, tags: entry.tags ? [...entry.tags] : undefined }));
}

export function seedDemoEntries(force = false): JournalEntry[] {
  const currentEntries = getJournalEntries();

  if (currentEntries.length > 0 && !force) {
    return currentEntries;
  }

  const demoEntries = getDemoEntries();
  replaceJournalEntries(demoEntries);
  setDemoSeeded(true);
  return demoEntries;
}

export function maybeRestoreSeededEntries(): JournalEntry[] {
  const currentEntries = getJournalEntries();

  if (currentEntries.length === 0 && isDemoSeeded()) {
    return seedDemoEntries(true);
  }

  return currentEntries;
}
