import { estimateSpeechSeconds, formatClock } from "./date.js";

function formatItemLine(item, index) {
  return `${index + 1}. ${item.timeLabel}: ${item.title}. ${item.summary}`;
}

export function formatSms(briefing, profile) {
  const sendTime = profile.preferredDeliveryTimes?.[briefing.slot];
  const modeLabel = profile.deliveryPreference === "audio" ? "text backup" : "sms";
  const opening = `${briefing.slotTitle} for ${profile.name} | ${sendTime} | ${modeLabel}`;
  const lead = briefing.items.length ? briefing.lead : "Nothing urgent surfaced, so the assistant stayed quiet.";
  const body = briefing.items.map((item, index) => formatItemLine(item, index));
  const closing =
    profile.tone === "concise"
      ? "Why it matters: less hunting, more clarity."
      : `Why it matters: ${briefing.items[0]?.whyItMatters ?? "signal over noise."}`;

  return [opening, lead, ...body, closing].join("\n");
}

function spokenBridge(slot) {
  if (slot === "morning") {
    return "Here is what matters this morning.";
  }

  if (slot === "afternoon") {
    return "Around campus this afternoon, here is what is worth your attention.";
  }

  return "In the wider world tonight, here are the stories that actually matter to you.";
}

function spokenTone(profile, item) {
  if (profile.tone === "concise") {
    return `${item.title}. ${item.whyItMatters}`;
  }

  if (profile.tone === "deeper") {
    return `${item.title}. ${item.summary} Why it matters: ${item.whyItMatters}`;
  }

  return `${item.title}. ${item.summary} ${item.whyItMatters}`;
}

export function formatAudioScript(briefing, profile) {
  const intro = `Hi ${profile.name.split(" ")[0]}. ${spokenBridge(briefing.slot)}`;
  const preferenceLine =
    profile.deliveryPreference === "audio"
      ? "This is your full spoken briefing."
      : "Here is the spoken version if you want it hands-free.";
  const body = briefing.items.map((item) => `At ${item.timeLabel}, ${spokenTone(profile, item)}`);
  const outro =
    briefing.slot === "evening"
      ? "That is your nightly Dirac Dispatch."
      : `That is your ${briefing.slot} Dirac Dispatch. I will be back ${briefing.slot === "morning" ? "this afternoon" : "tonight"}.`;

  const script = [intro, preferenceLine, briefing.lead, ...body, outro].join(" ");
  return {
    text: script,
    estimatedSeconds: estimateSpeechSeconds(script),
  };
}

export function formatGeneratedStamp(date) {
  return `Generated at ${formatClock(date)}`;
}