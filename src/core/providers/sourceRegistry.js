import { demoProviders } from "./demoProviders.js";
import { editorialProviders } from "./editorialProviders.js";
import { liveProviders } from "./liveProviders.js";

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.domain}:${item.title.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function providerListForMode(sourceMode) {
  if (sourceMode === "demo") {
    return [...editorialProviders, ...demoProviders];
  }

  if (sourceMode === "hybrid") {
    return [...editorialProviders, ...liveProviders, ...demoProviders];
  }

  return [...editorialProviders, ...liveProviders];
}

function fallbackProviders(slot) {
  return demoProviders.filter((provider) => provider.slots.includes(slot));
}

export async function collectSourceItems({ profile, slot, sourceMode }) {
  const traces = [];
  const items = [];
  const providers = providerListForMode(sourceMode).filter((provider) => provider.slots.includes(slot));

  for (const provider of providers) {
    const result = await provider.run({ profile, slot });
    items.push(...(result.items ?? []));
    traces.push(...(result.traces ?? []));
  }

  let deduped = dedupe(items);
  const needsFallback = sourceMode !== "demo" && deduped.length < 3;

  if (needsFallback) {
    for (const provider of fallbackProviders(slot)) {
      const result = await provider.run({ profile, slot });
      deduped = dedupe([...deduped, ...(result.items ?? [])]);
      traces.push(
        ...((result.traces ?? []).map((trace) => ({
          ...trace,
          status: "fallback",
          mode: sourceMode,
          detail: `Fallback applied: ${trace.detail}`,
        })) ?? []),
      );
    }
  }

  return {
    items: deduped,
    traces,
  };
}
