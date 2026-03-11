import { JournalPageClient } from "@/components/journal/JournalPageClient";

type SearchParamValue = string | string[] | undefined;

function toSingleValue(value: SearchParamValue): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export default async function JournalPage({
  searchParams
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;
  const saved = toSingleValue(params.saved) === "1";
  const title = toSingleValue(params.title);

  return <JournalPageClient saved={saved} title={title} />;
}
