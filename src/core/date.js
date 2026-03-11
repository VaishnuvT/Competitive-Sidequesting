export function createDateAt(dayOffset, time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

export function formatClock(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatReadableDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelativeWindow(date, base = new Date()) {
  if (!date) {
    return "Anytime today";
  }

  const sameDay = date.toDateString() === base.toDateString();
  if (sameDay) {
    return formatClock(date);
  }

  return `${formatReadableDate(date)} at ${formatClock(date)}`;
}

export function minutesUntil(date, base = new Date()) {
  if (!date) {
    return null;
  }

  return Math.round((date.getTime() - base.getTime()) / 60000);
}

export function estimateSpeechSeconds(text) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(25, Math.round((wordCount / 150) * 60));
}

export function isoOrNull(date) {
  return date ? date.toISOString() : null;
}