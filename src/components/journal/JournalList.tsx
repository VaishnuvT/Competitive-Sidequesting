import type { JournalEntry } from "@/lib/types";

import { JournalCard } from "@/components/journal/JournalCard";

export function JournalList({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <JournalCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
