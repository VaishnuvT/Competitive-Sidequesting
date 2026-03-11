import { BRIEFING_SLOTS } from "../config.js";
import { chooseWhyItMatters, selectItems } from "./personalize.js";

function slotConfig(slot) {
  return BRIEFING_SLOTS.find((entry) => entry.id === slot) ?? BRIEFING_SLOTS[0];
}

function buildLead(profile, slot, items) {
  if (!items.length) {
    return `No strong ${slot} signals landed, so the system stayed quiet instead of inventing noise.`;
  }

  const top = items[0];

  if (slot === "morning") {
    return `${profile.name.split(" ")[0]}, your day compresses around ${top.timeLabel}, so the briefing is front-loading what could create stress later.`;
  }

  if (slot === "afternoon") {
    return `Around campus, the best opportunities today are the ones that match ${profile.major.toLowerCase()} energy without asking you to scroll five different calendars.`;
  }

  return `Tonight's world brief is filtered for ${profile.interests.slice(0, 2).join(" and ")}, so the headlines land closer to student reality than generic news does.`;
}

function buildHeadline(slot, items) {
  if (!items.length) {
    return "Quiet window";
  }

  if (slot === "morning") {
    return `Most immediate: ${items[0].title}`;
  }

  if (slot === "afternoon") {
    return `Best campus bet: ${items[0].title}`;
  }

  return `Biggest signal tonight: ${items[0].title}`;
}

export function composeBriefing({ profile, slot, rankedItems, traces, sourceMode }) {
  const config = slotConfig(slot);
  const selectedItems = selectItems(rankedItems, profile).map((item) => ({
    ...item,
    whyItMatters: chooseWhyItMatters(item, profile),
  }));

  return {
    slot,
    slotTitle: config.title,
    cue: config.cue,
    accent: config.accent,
    generatedAt: new Date(),
    sourceMode,
    lead: buildLead(profile, slot, selectedItems),
    headline: buildHeadline(slot, selectedItems),
    items: selectedItems,
    traces,
    transparencyNote:
      sourceMode === "demo"
        ? "Demo mode is using seeded content designed to feel real and be stable on stage."
        : "Live mode is best-effort and falls back gracefully so the experience never goes blank during a demo.",
  };
}