import { QUESTS } from "@/data/quests";
import type { Preferences, Quest } from "@/lib/types";

const DEFAULT_COUNT = 3;

function getOverlapCount(a: string[], b: string[]): number {
  const bSet = new Set(b);
  return a.reduce((count, value) => (bSet.has(value) ? count + 1 : count), 0);
}

function isModeCompatible(preferenceMode: string, questMode: string): boolean {
  if (preferenceMode === "either" || questMode === "either") {
    return true;
  }

  return preferenceMode === questMode;
}

function scoreQuest(preferences: Preferences, quest: Quest): number {
  let score = 0;

  const interestMatches = getOverlapCount(preferences.interests, quest.interests);
  if (interestMatches > 0) {
    score += 3 + Math.min(interestMatches - 1, 2);
  }

  if (preferences.time === quest.time) {
    score += 2;
  }

  if (preferences.budget === "no preference") {
    score += 1;
  } else if (preferences.budget === quest.budget) {
    score += 2;
  }

  if (isModeCompatible(preferences.mode, quest.mode)) {
    score += 2;
  }

  const vibeMatches = getOverlapCount(preferences.vibe, quest.vibe);
  score += Math.min(vibeMatches * 2, 6);

  if (preferences.transport === "no preference") {
    score += 1;
  } else if (quest.transport.includes(preferences.transport)) {
    score += 1;
  }

  return score;
}

export function getRankedQuests(preferences: Preferences, source: Quest[] = QUESTS): Quest[] {
  return [...source].sort((a, b) => {
    const scoreDiff = scoreQuest(preferences, b) - scoreQuest(preferences, a);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return a.id.localeCompare(b.id);
  });
}

export function getTopQuests(preferences: Preferences, count = DEFAULT_COUNT, excludeIds: string[] = []): Quest[] {
  const excludeSet = new Set(excludeIds);
  const filtered = QUESTS.filter((quest) => !excludeSet.has(quest.id));
  const ranked = getRankedQuests(preferences, filtered);

  return ranked.slice(0, Math.max(1, count));
}

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find((quest) => quest.id === id);
}
