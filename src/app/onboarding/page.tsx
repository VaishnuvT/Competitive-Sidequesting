"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { ChipGroup } from "@/components/forms/ChipGroup";
import { SingleSelectChips } from "@/components/forms/SingleSelectChips";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  BUDGET_OPTIONS,
  DEFAULT_PREFERENCES,
  INTEREST_OPTIONS,
  MODE_OPTIONS,
  TIME_OPTIONS,
  TRANSPORT_OPTIONS,
  VIBE_OPTIONS
} from "@/lib/constants";
import { savePreferences } from "@/lib/storage";

export default function OnboardingPage() {
  const router = useRouter();

  const [interests, setInterests] = useState<string[]>(DEFAULT_PREFERENCES.interests);
  const [vibe, setVibe] = useState<string[]>(DEFAULT_PREFERENCES.vibe);
  const [time, setTime] = useState<string>(DEFAULT_PREFERENCES.time);
  const [budget, setBudget] = useState<string>(DEFAULT_PREFERENCES.budget);
  const [mode, setMode] = useState<string>(DEFAULT_PREFERENCES.mode);
  const [transport, setTransport] = useState<string>(DEFAULT_PREFERENCES.transport);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = () => {
    const nextErrors: string[] = [];

    if (interests.length === 0) {
      nextErrors.push("Pick at least one interest.");
    }

    if (vibe.length === 0) {
      nextErrors.push("Pick at least one vibe.");
    }

    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      return;
    }

    savePreferences({ interests, time, budget, mode, transport, vibe });
    router.push("/quests");
  };

  return (
    <PageContainer className="space-y-6">
      <section className="card-surface space-y-5 p-6">
        <SectionHeading
          eyebrow="Onboarding"
          title="Set your sidequest preferences"
          subtitle="Choose what sounds good today. You can always tweak this later."
        />

        <ChipGroup label="Interests" options={INTEREST_OPTIONS} values={interests} onChange={setInterests} />
        <ChipGroup label="Vibe" options={VIBE_OPTIONS} values={vibe} onChange={setVibe} maxSelections={3} />

        <SingleSelectChips label="Time" options={TIME_OPTIONS} value={time} onChange={setTime} />
        <SingleSelectChips label="Budget" options={BUDGET_OPTIONS} value={budget} onChange={setBudget} />
        <SingleSelectChips label="Mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
        <SingleSelectChips
          label="Transport"
          options={TRANSPORT_OPTIONS}
          value={transport}
          onChange={setTransport}
        />

        {errors.length > 0 ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        <PrimaryButton type="button" onClick={handleSave} fullWidth>
          See my sidequests
        </PrimaryButton>
      </section>
    </PageContainer>
  );
}
