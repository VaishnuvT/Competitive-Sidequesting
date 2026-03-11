import { LIVE_ENDPOINTS } from "../../config.js";

const FEED_PROXY = "https://api.allorigins.win/raw?url=";

function proxied(url) {
  return `${FEED_PROXY}${encodeURIComponent(url)}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 3500);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: options.headers ?? {},
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchText(url) {
  try {
    const direct = await fetchWithTimeout(url);
    return await direct.text();
  } catch (error) {
    const proxiedResponse = await fetchWithTimeout(proxied(url));
    return await proxiedResponse.text();
  }
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url, {
    headers: { Accept: "application/geo+json, application/json" },
    timeoutMs: 5000,
  });
  return response.json();
}

function stripHtml(input = "") {
  const template = document.createElement("template");
  template.innerHTML = input;
  return template.content.textContent?.trim() ?? "";
}

function guessTags(text) {
  const lowered = text.toLowerCase();
  const dictionary = {
    ai: ["ai", "artificial intelligence", "machine learning"],
    startups: ["startup", "founder", "venture", "funding"],
    biology: ["biology", "biotech", "health", "clinical", "medicine"],
    policy: ["policy", "legislature", "government", "regulation"],
    research: ["research", "study", "scientist", "lab"],
    career: ["job", "career", "hiring", "internship"],
    climate: ["climate", "storm", "weather", "heat", "rain"],
    students: ["student", "campus", "university", "college"],
    commute: ["commute", "traffic", "travel", "parking"],
  };

  return Object.entries(dictionary)
    .filter(([, keywords]) => keywords.some((keyword) => lowered.includes(keyword)))
    .map(([tag]) => tag);
}

function parseRss(xmlText, domain, sourceLabel) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(xmlText, "text/xml");
  const items = Array.from(documentNode.querySelectorAll("item")).slice(0, 6);

  return items.map((item, index) => {
    const title = item.querySelector("title")?.textContent?.trim() ?? `Live ${domain} item ${index + 1}`;
    const summary = stripHtml(item.querySelector("description")?.textContent ?? "");
    const link = item.querySelector("link")?.textContent?.trim() ?? "";
    const pubDate = item.querySelector("pubDate")?.textContent;
    const startsAt = pubDate ? new Date(pubDate) : new Date();

    return {
      id: `${domain}-live-${index}`,
      title,
      summary,
      domain,
      startsAt,
      tags: guessTags(`${title} ${summary}`),
      urgency: 2,
      importance: domain === "world" ? 4 : 3,
      source: {
        label: sourceLabel,
        mode: "live",
        url: link,
        note: "Pulled from a public feed during the demo.",
      },
    };
  });
}

function parseIcsDate(rawValue) {
  if (!rawValue) {
    return null;
  }

  const clean = rawValue.replace("Z", "");
  if (clean.length < 15) {
    return null;
  }

  const year = clean.slice(0, 4);
  const month = clean.slice(4, 6);
  const day = clean.slice(6, 8);
  const hours = clean.slice(9, 11);
  const minutes = clean.slice(11, 13);
  const seconds = clean.slice(13, 15);
  return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
}

function parseIcs(text) {
  const blocks = text.split("BEGIN:VEVENT").slice(1);
  return blocks
    .map((block, index) => {
      const summary = block.match(/SUMMARY:(.+)/)?.[1]?.trim();
      const location = block.match(/LOCATION:(.+)/)?.[1]?.trim();
      const startsAt = parseIcsDate(block.match(/DTSTART[^:]*:(.+)/)?.[1]?.trim());
      const endsAt = parseIcsDate(block.match(/DTEND[^:]*:(.+)/)?.[1]?.trim());

      if (!summary || !startsAt) {
        return null;
      }

      return {
        id: `calendar-live-${index}`,
        title: summary,
        summary: location ? `Live calendar event at ${location}.` : "Live calendar event from a public ICS feed.",
        domain: "personal",
        startsAt,
        endsAt,
        location,
        tags: guessTags(`${summary} ${location ?? ""}`),
        urgency: 4,
        importance: 4,
        source: {
          label: "Google Calendar ICS adapter",
          mode: "live",
          note: "Pulled from a public ICS URL. Authenticated Google Calendar integration is the next step after the hackathon.",
        },
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

export const liveProviders = [
  {
    id: "live-calendar",
    domain: "personal",
    slots: ["morning"],
    async run({ profile }) {
      const calendarUrl = profile.liveSources?.calendarUrl?.trim();

      if (!calendarUrl) {
        return {
          items: [],
          traces: [
            {
              provider: "Google Calendar adapter",
              status: "needs-config",
              mode: "live",
              detail: "No public ICS URL configured, so the personal agenda falls back to seeded tasks.",
            },
          ],
        };
      }

      try {
        const text = await fetchText(calendarUrl);
        const items = parseIcs(text);
        return {
          items,
          traces: [
            {
              provider: "Google Calendar adapter",
              status: items.length ? "live" : "empty",
              mode: "live",
              detail: items.length
                ? `Loaded ${items.length} upcoming events from the configured public calendar.`
                : "Calendar feed responded, but there were no near-term events to promote.",
            },
          ],
        };
      } catch (error) {
        return {
          items: [],
          traces: [
            {
              provider: "Google Calendar adapter",
              status: "error",
              mode: "live",
              detail: `Calendar fetch failed: ${error.message}. Demo fallback keeps the briefing usable.`,
            },
          ],
        };
      }
    },
  },
  {
    id: "live-weather",
    domain: "personal",
    slots: ["morning"],
    async run() {
      try {
        const point = await fetchJson(LIVE_ENDPOINTS.weatherPoint);
        const forecastUrl = point.properties?.forecastHourly ?? point.properties?.forecast;
        const forecast = await fetchJson(forecastUrl);
        const periods = forecast.properties?.periods ?? [];
        const first = periods[0];

        if (!first) {
          return {
            items: [],
            traces: [
              {
                provider: "Weather.gov adapter",
                status: "empty",
                mode: "live",
                detail: "Forecast endpoint responded without hourly periods.",
              },
            ],
          };
        }

        const item = {
          id: "weather-live-0",
          title: `${first.shortForecast} for your morning window`,
          summary: `Austin looks like ${first.temperature} degrees around ${first.name.toLowerCase()}. Plan your walk or drive accordingly.`,
          domain: "personal",
          startsAt: new Date(first.startTime),
          tags: guessTags(`${first.shortForecast} weather Austin commute`),
          urgency: 3,
          importance: 3,
          source: {
            label: "Weather.gov",
            mode: "live",
            url: LIVE_ENDPOINTS.weatherPoint,
            note: "Live public weather feed.",
          },
        };

        return {
          items: [item],
          traces: [
            {
              provider: "Weather.gov adapter",
              status: "live",
              mode: "live",
              detail: `Loaded live Austin forecast: ${first.shortForecast}.`,
            },
          ],
        };
      } catch (error) {
        return {
          items: [],
          traces: [
            {
              provider: "Weather.gov adapter",
              status: "error",
              mode: "live",
              detail: `Weather fetch failed: ${error.message}.`,
            },
          ],
        };
      }
    },
  },
  {
    id: "live-campus-rss",
    domain: "campus",
    slots: ["afternoon"],
    async run() {
      try {
        const xmlText = await fetchText(LIVE_ENDPOINTS.campusCalendarRss);
        const items = parseRss(xmlText, "campus", "UT Events RSS");
        return {
          items,
          traces: [
            {
              provider: "UT Events RSS adapter",
              status: items.length ? "live" : "empty",
              mode: "live",
              detail: items.length
                ? `Loaded ${items.length} event headlines from the official UT calendar feed.`
                : "UT Events RSS returned no parseable items.",
            },
          ],
        };
      } catch (error) {
        return {
          items: [],
          traces: [
            {
              provider: "UT Events RSS adapter",
              status: "error",
              mode: "live",
              detail: `UT calendar fetch failed: ${error.message}.`,
            },
          ],
        };
      }
    },
  },
  {
    id: "live-world-rss",
    domain: "world",
    slots: ["evening"],
    async run() {
      try {
        const xmlResults = await Promise.all(
          LIVE_ENDPOINTS.worldFeeds.map(async (feed) => ({ feed, xml: await fetchText(feed) })),
        );
        const items = xmlResults.flatMap(({ feed, xml }) => parseRss(xml, "world", feed)).slice(0, 6);
        return {
          items,
          traces: [
            {
              provider: "World news RSS adapter",
              status: items.length ? "live" : "empty",
              mode: "live",
              detail: items.length
                ? `Loaded ${items.length} live world headlines from public RSS feeds.`
                : "Public world feeds responded without parseable headlines.",
            },
          ],
        };
      } catch (error) {
        return {
          items: [],
          traces: [
            {
              provider: "World news RSS adapter",
              status: "error",
              mode: "live",
              detail: `World news fetch failed: ${error.message}.`,
            },
          ],
        };
      }
    },
  },
];