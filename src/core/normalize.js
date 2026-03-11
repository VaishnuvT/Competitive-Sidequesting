import { formatRelativeWindow, isoOrNull, minutesUntil } from "./date.js";

export function normalizeItems(items) {
  const now = new Date();

  return items.map((item) => {
    const startsAt = item.startsAt ? new Date(item.startsAt) : null;
    const dueAt = item.dueAt ? new Date(item.dueAt) : null;

    return {
      ...item,
      startsAt,
      dueAt,
      timeLabel: formatRelativeWindow(startsAt ?? dueAt, now),
      minutesUntil: minutesUntil(startsAt ?? dueAt, now),
      tags: Array.from(new Set(item.tags ?? [])),
      searchableText: [item.title, item.summary, ...(item.tags ?? [])].join(" ").toLowerCase(),
      source: {
        ...item.source,
        timestamp: isoOrNull(new Date()),
      },
    };
  });
}