"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { secondaryButtonClassName } from "@/components/ui/SecondaryButton";
import { getQuestById } from "@/lib/questEngine";
import { saveJournalEntry } from "@/lib/storage";

const MAX_PERSISTED_IMAGE_BYTES = 380_000;

export default function CompleteQuestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const objectUrlRef = useRef<string | null>(null);

  const questId = params.id;
  const quest = useMemo(() => (questId ? getQuestById(questId) : undefined), [questId]);

  const [note, setNote] = useState("");
  const [locationText, setLocationText] = useState("");
  const [companions, setCompanions] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | undefined>();
  const [persistableImageUrl, setPersistableImageUrl] = useState<string | undefined>();
  const [imageWarning, setImageWarning] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file.size <= MAX_PERSISTED_IMAGE_BYTES) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : undefined;
        setImagePreviewUrl(result);
        setPersistableImageUrl(result);
        setImageWarning(null);
      };
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImagePreviewUrl(objectUrl);
    setPersistableImageUrl(undefined);
    setImageWarning("Image is preview-only because the file is large. Save still works.");
  };

  const handleSave = () => {
    if (!quest) {
      return;
    }

    saveJournalEntry({
      id: `journal-${Date.now()}`,
      questId: quest.id,
      title: quest.title,
      completedAt: new Date().toISOString(),
      note: note.trim() || undefined,
      imageUrl: persistableImageUrl,
      locationText: locationText.trim() || undefined,
      companions: companions.trim() || undefined,
      tags: quest.tags
    });

    router.push(`/journal?saved=1&title=${encodeURIComponent(quest.title)}`);
  };

  if (!quest) {
    return (
      <PageContainer>
        <EmptyState
          title="Quest not found"
          description="That sidequest may have expired or been rerolled."
          primaryAction={
            <Link href="/quests" className={secondaryButtonClassName}>
              Back to sidequests
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <section className="card-surface space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-600">Complete sidequest</p>
        <h1 className="text-3xl text-slate-900">{quest.title}</h1>
        <p className="text-sm text-slate-600">Capture the memory privately. Just enough detail to remember the vibe.</p>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-800">Reflection note (optional)</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="What stood out?"
            className="w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none ring-orange-300 transition focus:ring"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-800">Location note (optional)</span>
            <input
              value={locationText}
              onChange={(event) => setLocationText(event.target.value)}
              placeholder="Ex: FAC courtyard"
              className="w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none ring-orange-300 transition focus:ring"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-800">Companions (optional)</span>
            <input
              value={companions}
              onChange={(event) => setCompanions(event.target.value)}
              placeholder="Solo, Sam + Alex, etc"
              className="w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm outline-none ring-orange-300 transition focus:ring"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-800">Add a photo (optional)</span>
          <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-600" />
        </label>

        {imagePreviewUrl ? (
          <Image
            src={imagePreviewUrl}
            alt="Selected preview"
            width={1200}
            height={800}
            className="h-40 w-full rounded-2xl border border-orange-200 object-cover"
            unoptimized
          />
        ) : null}

        {imageWarning ? <p className="text-sm text-amber-700">{imageWarning}</p> : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <PrimaryButton type="button" onClick={handleSave} fullWidth>
            Save to private journal
          </PrimaryButton>
          <Link href="/quests" className={secondaryButtonClassName}>
            Back to quests
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}
