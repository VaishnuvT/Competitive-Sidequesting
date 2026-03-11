import { NextResponse } from "next/server";

import { getTopQuests } from "@/lib/questEngine";
import type { Preferences } from "@/lib/types";

type QuestRequestBody = {
  preferences?: Preferences;
  excludeIds?: string[];
  count?: number;
};

function isValidPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.interests) &&
    typeof obj.time === "string" &&
    typeof obj.budget === "string" &&
    typeof obj.mode === "string" &&
    typeof obj.transport === "string" &&
    Array.isArray(obj.vibe)
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuestRequestBody;

    if (!isValidPreferences(body.preferences)) {
      return NextResponse.json({ error: "Invalid preferences payload." }, { status: 400 });
    }

    const quests = getTopQuests(
      body.preferences,
      body.count ?? 3,
      Array.isArray(body.excludeIds) ? body.excludeIds : []
    );

    return NextResponse.json({ quests });
  } catch {
    return NextResponse.json({ error: "Unable to generate quests." }, { status: 500 });
  }
}
