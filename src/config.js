export const APP_NAME = "Dirac Dispatch";

export const SOURCE_MODES = [
  {
    id: "demo",
    label: "Demo",
    description: "Stable seeded content plus pinned public links for a flawless hackathon walkthrough.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    description: "Blend pinned public stories with live feeds where they behave.",
  },
  {
    id: "live",
    label: "Live",
    description: "Route official public feeds through the local proxy for a stronger live demo.",
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
  localApiBase: "/api",
  campusCalendarRss: "https://calendar.utexas.edu/calendar.xml",
  weatherPoint: "https://api.weather.gov/points/30.2849,-97.7341",
  worldFeeds: [
    {
      id: "texas-tribune",
      label: "The Texas Tribune",
      url: "https://www.texastribune.org/feed/",
      feedTags: ["policy", "students", "texas", "austin"],
    },
    {
      id: "guardian-world",
      label: "The Guardian World",
      url: "https://www.theguardian.com/world/rss",
      feedTags: ["world", "policy", "international"],
    },
    {
      id: "pbs-headlines",
      label: "PBS NewsHour Headlines",
      url: "https://www.pbs.org/newshour/feeds/rss/headlines",
      feedTags: ["policy", "students", "world"],
    },
    {
      id: "bbc-world",
      label: "BBC World",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      feedTags: ["world", "policy", "students"],
    },
    {
      id: "bbc-technology",
      label: "BBC Technology",
      url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
      feedTags: ["ai", "career", "computer science"],
    },
    {
      id: "bbc-business",
      label: "BBC Business",
      url: "https://feeds.bbci.co.uk/news/business/rss.xml",
      feedTags: ["startups", "career", "economy"],
    },
    {
      id: "bbc-science",
      label: "BBC Science",
      url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      feedTags: ["biology", "research", "climate"],
    },
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

export const PIPELINE_STAGES = ["Ingest", "Normalize", "Rank", "Compose", "Format", "Dispatch"];

