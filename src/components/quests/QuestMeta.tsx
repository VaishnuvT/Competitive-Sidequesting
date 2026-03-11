import { TagPill } from "@/components/ui/TagPill";
import type { Quest } from "@/lib/types";

export function QuestMeta({ quest }: { quest: Quest }) {
  return (
    <div className="flex flex-wrap gap-2">
      <TagPill>{quest.time}</TagPill>
      <TagPill>{quest.budget}</TagPill>
      <TagPill>{quest.mode}</TagPill>
      {(quest.tags ?? []).slice(0, 2).map((tag) => (
        <TagPill key={tag}>{tag}</TagPill>
      ))}
    </div>
  );
}
