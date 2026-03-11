import Link from "next/link";

import { QuestMeta } from "@/components/quests/QuestMeta";
import { primaryButtonClassName } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import type { Quest } from "@/lib/types";

type QuestCardProps = {
  quest: Quest;
  onReroll?: () => void;
  rerollDisabled?: boolean;
};

export function QuestCard({ quest, onReroll, rerollDisabled }: QuestCardProps) {
  return (
    <article className="card-surface space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-600">Sidequest</p>
        <h2 className="mt-1 text-2xl text-slate-900">{quest.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{quest.description}</p>
      </div>
      <QuestMeta quest={quest} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/quests/${quest.id}`} className={`${primaryButtonClassName} w-full sm:w-auto`}>
          Choose this quest
        </Link>
        {onReroll ? (
          <SecondaryButton type="button" onClick={onReroll} disabled={rerollDisabled} fullWidth>
            Reroll
          </SecondaryButton>
        ) : null}
      </div>
    </article>
  );
}
