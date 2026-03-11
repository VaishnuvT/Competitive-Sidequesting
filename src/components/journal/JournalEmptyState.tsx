import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";
import { primaryButtonClassName } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

export function JournalEmptyState({ onLoadDemo }: { onLoadDemo: () => void }) {
  return (
    <EmptyState
      title="Your private journal is empty"
      description="No pressure, no likes, no leaderboard. Complete one sidequest and keep the memory here just for you."
      primaryAction={
        <Link href="/onboarding" className={primaryButtonClassName}>
          Start sidequest
        </Link>
      }
      secondaryAction={
        <SecondaryButton type="button" onClick={onLoadDemo}>
          Load demo entries
        </SecondaryButton>
      }
    />
  );
}
