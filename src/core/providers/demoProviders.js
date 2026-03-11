import { DEMO_CONTENT } from "../../data/demoContent.js";
import { createDateAt } from "../date.js";

function hydrateSeedItem(item) {
  const startsAt = item.schedule?.start ? createDateAt(item.schedule.dayOffset ?? 0, item.schedule.start) : null;
  const endsAt = item.schedule?.end ? createDateAt(item.schedule.dayOffset ?? 0, item.schedule.end) : null;
  const dueAt = item.schedule?.due ? createDateAt(item.schedule.dayOffset ?? 0, item.schedule.due) : null;

  return {
    ...item,
    startsAt,
    endsAt,
    dueAt,
  };
}

function buildTrace(label, count, slot) {
  return {
    provider: label,
    status: "demo",
    mode: "demo",
    detail: `Loaded ${count} seeded ${slot} item${count === 1 ? "" : "s"} for a reliable stage demo.`,
  };
}

export const demoProviders = [
  {
    id: "demo-personal",
    domain: "personal",
    slots: ["morning"],
    async run({ profile }) {
      const items = DEMO_CONTENT.personal
        .filter((item) => item.personas.includes(profile.id))
        .map(hydrateSeedItem);

      return {
        items,
        traces: [buildTrace("Personal agenda adapter", items.length, "personal")],
      };
    },
  },
  {
    id: "demo-campus",
    domain: "campus",
    slots: ["afternoon"],
    async run() {
      const items = DEMO_CONTENT.campus.map(hydrateSeedItem);
      return {
        items,
        traces: [buildTrace("Campus happenings adapter", items.length, "campus")],
      };
    },
  },
  {
    id: "demo-world",
    domain: "world",
    slots: ["evening"],
    async run() {
      const items = DEMO_CONTENT.world.map(hydrateSeedItem);
      return {
        items,
        traces: [buildTrace("World news adapter", items.length, "world")],
      };
    },
  },
];