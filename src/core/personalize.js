import { SLOT_LIMITS, SLOT_PRIORITIES } from "../config.js";

function keywordsForProfile(profile) {
  const lifestyleTokens = {
    commuter: ["commute", "parking", "traffic", "coffee"],
    "on-campus": ["wellness", "students", "campus"],
    "off-campus": ["commute", "career", "parking"],
  };

  return Array.from(
    new Set([
      profile.major.toLowerCase(),
      profile.year.toLowerCase(),
      profile.lifestyle.toLowerCase(),
      ...profile.interests.map((interest) => interest.toLowerCase()),
      ...(lifestyleTokens[profile.lifestyle] ?? []),
    ]),
  );
}

function scoreItem(item, profile, slot) {
  const profileKeywords = keywordsForProfile(profile);
  const matchedTags = profileKeywords.filter((keyword) => item.searchableText.includes(keyword));
  const isPrimaryDomain = item.domain === SLOT_PRIORITIES[slot];
  const isUrgentSoon =
    typeof item.minutesUntil === "number" && item.minutesUntil >= 0 && item.minutesUntil <= 8 * 60;

  let score = item.importance * 4 + item.urgency * 5 + matchedTags.length * 4;
  const reasons = [];

  if (isPrimaryDomain) {
    score += 14;
    reasons.push(`Primary ${slot} domain`);
  }

  if (item.source?.mode === "live") {
    score += 2;
    reasons.push("Live signal");
  }

  if (item.source?.mode === "curated") {
    score += 3;
    reasons.push("Editor's desk pick");
  }

  if (isUrgentSoon) {
    score += 8;
    reasons.push("Time-sensitive");
  }

  if (profile.lifestyle === "commuter" && item.tags.includes("commute")) {
    score += 6;
    reasons.push("Commuter-aware");
  }

  if (profile.lifestyle === "on-campus" && item.tags.includes("wellness")) {
    score += 3;
    reasons.push("Good on-campus fit");
  }

  if (profile.stressMode === "low-noise" && item.urgency <= 2 && item.importance <= 3) {
    score -= 6;
    reasons.push("Filtered for low-noise mode");
  }

  if (profile.stressMode === "power-user") {
    score += 2;
    reasons.push("Power-user detail boost");
  }

  if (matchedTags.length) {
    reasons.push(`Matched ${matchedTags.slice(0, 2).join(", ")}`);
  }

  return { ...item, score, reasons };
}

export function rankItems(items, profile, slot) {
  return items
    .map((item) => scoreItem(item, profile, slot))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const leftTime = left.startsAt?.getTime() ?? left.dueAt?.getTime() ?? 0;
      const rightTime = right.startsAt?.getTime() ?? right.dueAt?.getTime() ?? 0;
      return leftTime - rightTime;
    });
}

export function selectItems(rankedItems, profile) {
  const limit = SLOT_LIMITS[profile.stressMode] ?? SLOT_LIMITS.normal;
  return rankedItems.slice(0, limit);
}

export function chooseWhyItMatters(item, profile) {
  const interestKeys = profile.interests.map((interest) => interest.toLowerCase());

  if (item.impact) {
    for (const interest of interestKeys) {
      if (item.impact[interest]) {
        return item.impact[interest];
      }
    }

    if (profile.lifestyle === "commuter" && item.impact.commuter) {
      return item.impact.commuter;
    }

    return item.impact.default;
  }

  if (item.domain === "world") {
    if (item.tags.includes("ai")) {
      return "It signals how quickly AI expectations are shifting toward people who can ship useful products, not just discuss the tech.";
    }

    if (item.tags.includes("biology") || item.tags.includes("research")) {
      return "It helps connect classroom work and research interests to the bigger industries and institutions shaping them.";
    }

    if (item.tags.includes("policy")) {
      return "It gives context for decisions that eventually affect universities, funding, and public life on campus.";
    }

    if (item.tags.includes("career") || item.tags.includes("economy") || item.tags.includes("startups")) {
      return "It sharpens what matters for internships, recruiting, and the kinds of proof-of-work that stand out right now.";
    }

    if (item.tags.includes("climate") || item.tags.includes("commute")) {
      return "It connects global shifts back to the logistics students actually feel in their daily routines.";
    }
  }

  if (item.domain === "personal") {
    return "It lowers the chance that one small miss turns into a stacked, stressful day.";
  }

  if (item.domain === "campus") {
    return "It is a timely chance to get value from campus without having to hunt through scattered calendars.";
  }

  return "It gives context, not just headlines, so the briefing feels useful instead of noisy.";
}
