import { collectSourceItems } from "./providers/sourceRegistry.js";
import { normalizeItems } from "./normalize.js";
import { rankItems } from "./personalize.js";
import { composeBriefing } from "./compose.js";
import { formatAudioScript, formatGeneratedStamp, formatSms } from "./formatters.js";

export async function generateBriefing({ profile, slot, sourceMode }) {
  const sourceBundle = await collectSourceItems({ profile, slot, sourceMode });
  const normalized = normalizeItems(sourceBundle.items);
  const ranked = rankItems(normalized, profile, slot);
  const composed = composeBriefing({
    profile,
    slot,
    rankedItems: ranked,
    traces: sourceBundle.traces,
    sourceMode,
  });
  const smsText = formatSms(composed, profile);
  const audio = formatAudioScript(composed, profile);

  return {
    ...composed,
    rankedItems: ranked,
    smsText,
    audioScript: audio.text,
    estimatedAudioSeconds: audio.estimatedSeconds,
    generatedStamp: formatGeneratedStamp(composed.generatedAt),
  };
}