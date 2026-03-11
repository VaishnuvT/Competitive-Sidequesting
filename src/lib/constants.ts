import type { Preferences } from "@/lib/types";

export const INTEREST_OPTIONS = [
  "food",
  "outdoors",
  "arts",
  "music",
  "study spots",
  "culture",
  "nightlife",
  "wellness",
  "random"
] as const;

export const TIME_OPTIONS = ["15 min", "30 min", "1 hour", "2+ hours"] as const;

export const BUDGET_OPTIONS = ["free", "under $10", "under $25", "no preference"] as const;

export const MODE_OPTIONS = ["solo", "with friends", "either"] as const;

export const TRANSPORT_OPTIONS = [
  "walk",
  "bike or scooter",
  "drive",
  "transit",
  "no preference"
] as const;

export const VIBE_OPTIONS = [
  "chill",
  "spontaneous",
  "social",
  "adventurous",
  "productive",
  "comfort-zone stretch"
] as const;

export const PREFERENCES_STORAGE_KEY = "sidequest:preferences";
export const JOURNAL_STORAGE_KEY = "sidequest:journal";
export const DEMO_SEEDED_STORAGE_KEY = "sidequest:demo-seeded";

export const DEFAULT_PREFERENCES: Preferences = {
  interests: [],
  time: "30 min",
  budget: "under $10",
  mode: "either",
  transport: "walk",
  vibe: []
};
