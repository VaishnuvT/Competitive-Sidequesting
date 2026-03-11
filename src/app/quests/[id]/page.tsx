import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { QuestChecklist } from "@/components/quests/QuestChecklist";
import { QuestMeta } from "@/components/quests/QuestMeta";
import { primaryButtonClassName } from "@/components/ui/PrimaryButton";
import { secondaryButtonClassName } from "@/components/ui/SecondaryButton";
import { getQuestById } from "@/lib/questEngine";

export default async function QuestDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quest = getQuestById(id);

  if (!quest) {
    notFound();
  }

  const mapsUrl = quest.locationSuggestion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.locationSuggestion)}`
    : null;

  return (
    <PageContainer className="space-y-4">
      <section className="card-surface space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Quest detail</p>
        <h1 className="text-3xl text-slate-900">{quest.title}</h1>
        <p className="text-sm leading-relaxed text-slate-600">{quest.description}</p>
        <QuestMeta quest={quest} />

        {quest.locationSuggestion ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Suggested spot:</span> {quest.locationSuggestion}
            </p>
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                Open in maps
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/complete/${quest.id}`} className={primaryButtonClassName}>
            Complete this quest
          </Link>
          <Link href="/quests" className={secondaryButtonClassName}>
            Back to results
          </Link>
        </div>
      </section>

      <QuestChecklist checklist={quest.checklist} />
    </PageContainer>
  );
}
