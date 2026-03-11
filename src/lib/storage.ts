import {
  DEMO_SEEDED_STORAGE_KEY,
  JOURNAL_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY
} from "@/lib/constants";
import type { JournalEntry, Preferences } from "@/lib/types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseJson<T>(rawValue: string | null, fallback: T): T {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function getSavedPreferences(): Preferences | null {
  if (!isBrowser()) {
    return null;
  }

  return parseJson<Preferences | null>(window.localStorage.getItem(PREFERENCES_STORAGE_KEY), null);
}

export function savePreferences(preferences: Preferences): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export function getJournalEntries(): JournalEntry[] {
  if (!isBrowser()) {
    return [];
  }

  return parseJson<JournalEntry[]>(window.localStorage.getItem(JOURNAL_STORAGE_KEY), []);
}

export function replaceJournalEntries(entries: JournalEntry[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
}

export function saveJournalEntry(entry: JournalEntry): void {
  const current = getJournalEntries();
  const updated = [entry, ...current.filter((existing) => existing.id !== entry.id)];
  replaceJournalEntries(updated);
}

export function clearJournal(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(JOURNAL_STORAGE_KEY);
}

export function isDemoSeeded(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return window.localStorage.getItem(DEMO_SEEDED_STORAGE_KEY) === "true";
}

export function setDemoSeeded(seedState: boolean): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(DEMO_SEEDED_STORAGE_KEY, seedState ? "true" : "false");
}
