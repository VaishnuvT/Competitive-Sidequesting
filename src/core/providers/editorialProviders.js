import { EDITORIAL_DESK } from "../../data/editorialDesk.js";

function buildTrace(provider, count, label) {
  return {
    provider,
    status: "curated",
    mode: "curated",
    detail: `Pinned ${count} public ${label} link${count === 1 ? "" : "s"} from the editor's desk so the demo keeps recognizable real stories in view.`,
  };
}

function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

export const editorialProviders = [
  {
    id: "editorial-campus-desk",
    domain: "campus",
    slots: ["afternoon"],
    async run() {
      const items = cloneItems(EDITORIAL_DESK.campus);
      return {
        items,
        traces: [buildTrace("Campus editor's desk", items.length, "campus event")],
      };
    },
  },
  {
    id: "editorial-world-desk",
    domain: "world",
    slots: ["evening"],
    async run() {
      const items = cloneItems(EDITORIAL_DESK.world);
      return {
        items,
        traces: [buildTrace("World editor's desk", items.length, "news story")],
      };
    },
  },
];
