import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { secondaryButtonClassName } from "@/components/ui/SecondaryButton";

export default function NotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="Page not found"
        description="This quest page may have moved. Head back and pick another adventure."
        primaryAction={
          <Link href="/quests" className={secondaryButtonClassName}>
            Back to quests
          </Link>
        }
      />
    </PageContainer>
  );
}
