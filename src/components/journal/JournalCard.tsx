import Image from "next/image";

import { TagPill } from "@/components/ui/TagPill";
import type { JournalEntry } from "@/lib/types";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function JournalCard({ entry }: { entry: JournalEntry }) {
  return (
    <article className="card-surface overflow-hidden">
      {entry.imageUrl ? (
        <div className="relative h-36 w-full bg-orange-50">
          <Image src={entry.imageUrl} alt={entry.title} fill className="object-cover" unoptimized />
        </div>
      ) : null}
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{formatDate(entry.completedAt)}</p>
          <h3 className="mt-1 text-xl text-slate-900">{entry.title}</h3>
        </div>
        {entry.note ? <p className="text-sm text-slate-600">{entry.note}</p> : null}
        <div className="flex flex-wrap gap-2">
          {(entry.tags ?? []).map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>
      </div>
    </article>
  );
}
