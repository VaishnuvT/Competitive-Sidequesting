"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { QuestCard } from "@/components/quests/QuestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { secondaryButtonClassName } from "@/components/ui/SecondaryButton";
import { getSavedPreferences } from "@/lib/storage";
import type { Preferences, Quest } from "@/lib/types";

type QuestApiResponse = {
  quests?: Quest[];
  error?: string;
};

async function fetchQuests(preferences: Preferences, excludeIds: string[], count = 3): Promise<Quest[]> {
  const response = await fetch("/api/quests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ preferences, excludeIds, count })
  });

  const data = (await response.json()) as QuestApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to generate sidequests.");
  }

  return data.quests ?? [];
}

export default function QuestsPage() {
  const router = useRouter();

  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rerolling, setRerolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedPreferences = getSavedPreferences();

    if (!savedPreferences) {
      router.replace("/onboarding");
      return;
    }

    setPreferences(savedPreferences);

    fetchQuests(savedPreferences, [])
      .then((result) => {
        setQuests(result);
      })
      .catch((fetchError: Error) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleReroll = async () => {
    if (!preferences) {
      return;
    }

    setRerolling(true);
    setError(null);

    try {
      const nextQuests = await fetchQuests(
        preferences,
        quests.map((quest) => quest.id)
      );
      setQuests(nextQuests);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not reroll sidequests.");
    } finally {
      setRerolling(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="grid gap-4">
        <LoadingBlock label="Matching your sidequests..." />
        <LoadingBlock label="Finding nearby options..." />
        <LoadingBlock label="Packing in some surprise..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="We hit a snag"
          description={error}
          primaryAction={
            <Link href="/onboarding" className={secondaryButtonClassName}>
              Edit preferences
            </Link>
          }
          secondaryAction={
            <button type="button" className={secondaryButtonClassName} onClick={handleReroll}>
              Try again
            </button>
          }
        />
      </PageContainer>
    );
  }

  if (quests.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          title="No sidequests yet"
          description="Try broadening your filters and we will find new options around UT and Austin."
          primaryAction={
            <Link href="/onboarding" className={secondaryButtonClassName}>
              Edit preferences
            </Link>
          }
          secondaryAction={
            <button type="button" className={secondaryButtonClassName} onClick={handleReroll}>
              Reroll
            </button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <section className="card-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-600">Results</p>
        <h1 className="mt-1 text-3xl text-slate-900">Here are your 3 sidequests</h1>
        <p className="mt-2 text-sm text-slate-600">Low friction, real world, and tuned to your current vibe.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" className={secondaryButtonClassName} onClick={handleReroll} disabled={rerolling}>
            {rerolling ? "Rerolling..." : "Reroll all"}
          </button>
          <Link href="/onboarding" className={secondaryButtonClassName}>
            Edit preferences
          </Link>
        </div>
      </section>

      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onReroll={handleReroll} rerollDisabled={rerolling} />
      ))}
    </PageContainer>
  );
}
