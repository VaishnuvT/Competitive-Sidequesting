"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { JournalEmptyState } from "@/components/journal/JournalEmptyState";
import { JournalList } from "@/components/journal/JournalList";
import { secondaryButtonClassName } from "@/components/ui/SecondaryButton";
import { maybeRestoreSeededEntries, seedDemoEntries } from "@/lib/demoSeed";
import { clearJournal, setDemoSeeded } from "@/lib/storage";
import type { JournalEntry } from "@/lib/types";

function sortNewestFirst(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function JournalPageClient({ saved, title }: { saved: boolean; title: string | null }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const seededOrStored = maybeRestoreSeededEntries();
    setEntries(sortNewestFirst(seededOrStored));
  }, []);

  const successMessage = useMemo(() => {
    if (!saved) {
      return null;
    }

    return title ? `You did the thing: ${title} was added to your private journal.` : "You did the thing.";
  }, [saved, title]);

  const handleLoadDemo = () => {
    const demoEntries = seedDemoEntries(true);
    setEntries(sortNewestFirst(demoEntries));
  };

  const handleClear = () => {
    clearJournal();
    setDemoSeeded(false);
    setEntries([]);
  };

  return (
    <PageContainer className="space-y-4">
      <section className="card-surface space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Private journal</p>
        <h1 className="text-3xl text-slate-900">Your sidequest memories</h1>
        <p className="text-sm text-slate-600">Just for you. No feed, no followers, no pressure.</p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/onboarding" className={secondaryButtonClassName}>
            Start new sidequest
          </Link>
          <button type="button" className={secondaryButtonClassName} onClick={handleLoadDemo}>
            Load demo entries
          </button>
          <button type="button" className={secondaryButtonClassName} onClick={handleClear}>
            Clear journal
          </button>
        </div>
      </section>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>
      ) : null}

      {entries.length === 0 ? <JournalEmptyState onLoadDemo={handleLoadDemo} /> : <JournalList entries={entries} />}

      {entries.length > 0 ? (
        <p className="text-xs text-slate-500">Showing {entries.length} private entr{entries.length === 1 ? "y" : "ies"}.</p>
      ) : null}
    </PageContainer>
  );
}
