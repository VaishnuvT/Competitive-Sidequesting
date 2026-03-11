export const APP_NAME = "Dirac Dispatch";

export const SOURCE_MODES = [
  {
    id: "demo",
    label: "Demo",
    description: "Stable seeded content for a flawless hackathon walkthrough.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    description: "Blend seeded briefings with public live feeds where they behave.",
  },
  {
    id: "live",
    label: "Live",
    description: "Attempt public feeds first, then reveal fallbacks if coverage is thin.",
  },
];

export const BRIEFING_SLOTS = [
  {
    id: "morning",
    title: "What you need to do",
    shortLabel: "Morning",
    cue: "what's happening in my world",
    accent: "sunrise",
  },
  {
    id: "afternoon",
    title: "What is happening around campus",
    shortLabel: "Afternoon",
    cue: "what's happening in the world around me",
    accent: "daylight",
  },
  {
    id: "evening",
    title: "What happened in the world",
    shortLabel: "Evening",
    cue: "what happened in the world",
    accent: "nightfall",
  },
];

export const DEFAULT_SOURCE_MODE = "demo";

export const LIVE_ENDPOINTS = {
  campusCalendarRss: "https://calendar.utexas.edu/calendar.xml",
  weatherPoint: "https://api.weather.gov/points/30.2849,-97.7341",
  worldFeeds: [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://feeds.bbci.co.uk/news/technology/rss.xml",
  ],
};

export const SLOT_PRIORITIES = {
  morning: "personal",
  afternoon: "campus",
  evening: "world",
};

export const SLOT_LIMITS = {
  "low-noise": 2,
  normal: 3,
  "power-user": 4,
};

export const DELIVERY_DEFAULTS = {
  morning: "07:45",
  afternoon: "13:10",
  evening: "19:45",
};

export const PIPELINE_STAGES = [
  "Ingest",
  "Normalize",
  "Rank",
  "Compose",
  "Format",
  "Dispatch",
];