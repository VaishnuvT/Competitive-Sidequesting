import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { primaryButtonClassName } from "@/components/ui/PrimaryButton";
import { secondaryButtonClassName } from "@/components/ui/SecondaryButton";

const featureCards = [
  {
    title: "Break the doomscroll loop",
    body: "Get one concrete thing to do in the real world in minutes, not another feed to refresh."
  },
  {
    title: "Low effort, high memory",
    body: "Every sidequest is designed for student schedules, from 15-minute resets to weekend adventures."
  },
  {
    title: "Private by default",
    body: "Your journal is just for you. No public profile, no likes, no performative pressure."
  }
];

export default function HomePage() {
  return (
    <PageContainer className="space-y-8">
      <section className="card-surface space-y-6 p-6 sm:p-8">
        <SectionHeading
          eyebrow="Sidequest UT"
          title="Break routine. Do something real today."
          subtitle="A privacy-first app that turns your vibe into low-friction sidequests around campus and Austin."
        />
        <p className="text-sm leading-relaxed text-slate-700">
          Sidequest UT helps you swap one scroll session for one small real-world story. Pick your mood, time, and
          budget, then we suggest three adventures that actually fit your day.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/onboarding" className={primaryButtonClassName}>
            Start Sidequesting
          </Link>
          <Link href="/journal" className={secondaryButtonClassName}>
            View Private Journal
          </Link>
        </div>
      </section>

      <section className="grid gap-4">
        {featureCards.map((feature) => (
          <article key={feature.title} className="card-surface p-5">
            <h2 className="text-2xl text-slate-900">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
          </article>
        ))}
      </section>
    </PageContainer>
  );
}
