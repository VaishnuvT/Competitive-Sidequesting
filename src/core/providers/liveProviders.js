import { LIVE_ENDPOINTS } from "../../config.js";

const FEED_PROXY = "https://api.allorigins.win/raw?url=";

function proxied(url) {
  return `${FEED_PROXY}${encodeURIComponent(url)}`;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((entry) => searchParams.append(key, entry));
    } else if (value) {
      searchParams.set(key, value);
    }
  }

  const text = searchParams.toString();
  return text ? `?${text}` : "";
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);

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
    timeoutMs: 6000,
  });
  return response.json();
}

async function fetchLocalJson(path, params = {}) {
  const query = buildQuery(params);
  return fetchJson(`${LIVE_ENDPOINTS.localApiBase}${path}${query}`);
}

function stripHtml(input = "") {
  const template = document.createElement("template");
  template.innerHTML = input;
  return template.content.textContent?.trim() ?? "";
}

function guessTags(text, extraTags = []) {
  const lowered = text.toLowerCase();
  const dictionary = {
    ai: ["ai", "artificial intelligence", "machine learning", "model"],
    startups: ["startup", "founder", "venture", "funding"],
    biology: ["biology", "biotech", "health", "clinical", "medicine"],
    policy: ["policy", "legislation", "government", "regulation", "election", "minister"],
    research: ["research", "study", "scientist", "lab"],
    career: ["job", "career", "hiring", "internship", "workforce"],
    climate: ["climate", "storm", "weather", "heat", "rain"],
    students: ["student", "campus", "university", "college"],
    commute: ["commute", "traffic", "travel", "parking"],
    economy: ["economy", "inflation", "markets", "stocks"],
    sports: ["sports", "football", "basketball", "baseball"],
  };

  const tags = new Set(extraTags);
  for (const [tag, keywords] of Object.entries(dictionary)) {
    if (keywords.some((keyword) => lowered.includes(keyword))) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function parseRss(xmlText, domain, sourceInfo) {
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
      tags: guessTags(`${sourceInfo.label} ${title} ${summary}`, sourceInfo.feedTags ?? []),
      urgency: 2,
      importance: domain === "world" ? 4 : 3,
      source: {
        label: sourceInfo.label,
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
        tags: guessTags(`${summary} ${location ?? ""}`, ["calendar", "students"]),
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

function localTrace(provider, detail, response, status = "live") {
  return {
    provider,
    status,
    mode: "live",
    detail: `${detail}${response?.cached ? " Served from local proxy cache." : " Fetched fresh through the local proxy."}`,
    fetchedAt: response?.fetchedAt ?? null,
  };
}

function mapLocalItem(item, domain, defaults = {}) {
  return {
    ...item,
    domain,
    startsAt: item.startsAt ? new Date(item.startsAt) : null,
    endsAt: item.endsAt ? new Date(item.endsAt) : null,
    urgency: item.urgency ?? defaults.urgency ?? 3,
    importance: item.importance ?? defaults.importance ?? 4,
    tags: item.tags?.length ? item.tags : guessTags(`${item.title} ${item.summary}`),
  };
}

async function fetchWorldFromLocalProxy(profile) {
  const response = await fetchLocalJson("/world-news", {
    interests: profile.interests,
    major: profile.major,
  });

  if (!response.ok) {
    throw new Error(response.error ?? "Local world-news proxy returned an error.");
  }

  return {
    items: response.items.map((item) => mapLocalItem(item, "world", { importance: 4, urgency: 2 })),
    traces: [
      localTrace(
        "World news proxy",
        `Loaded ${response.items.length} real headlines from ${response.feeds.join(", ")}.`,
        response,
      ),
    ],
  };
}

async function fetchCampusFromLocalProxy() {
  const response = await fetchLocalJson("/campus-events");

  if (!response.ok) {
    throw new Error(response.error ?? "Local campus-events proxy returned an error.");
  }

  return {
    items: response.items.map((item) => mapLocalItem(item, "campus", { importance: 3, urgency: 2 })),
    traces: [
      localTrace(
        "Campus events proxy",
        `Loaded ${response.items.length} real UT event headlines from ${response.feeds.join(", ")}.`,
        response,
      ),
    ],
  };
}

async function fetchWeatherFromLocalProxy() {
  const response = await fetchLocalJson("/weather");

  if (!response.ok) {
    throw new Error(response.error ?? "Local weather proxy returned an error.");
  }

  return {
    items: [mapLocalItem(response.item, "personal", { importance: 3, urgency: 3 })],
    traces: [localTrace("Weather proxy", `Loaded live Austin forecast: ${response.item.title}.`, response)],
  };
}

async function fetchCalendarFromLocalProxy(profile) {
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

  const response = await fetchLocalJson("/calendar", { url: calendarUrl });
  if (!response.ok) {
    throw new Error(response.error ?? "Local calendar proxy returned an error.");
  }

  return {
    items: response.items.map((item) => mapLocalItem(item, "personal", { importance: 4, urgency: 4 })),
    traces: [
      localTrace(
        "Google Calendar proxy",
        response.items.length
          ? `Loaded ${response.items.length} upcoming events from the configured public calendar.`
          : "Calendar feed responded, but there were no near-term events to promote.",
        response,
        response.items.length ? "live" : "empty",
      ),
    ],
  };
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
        return await fetchCalendarFromLocalProxy(profile);
      } catch (proxyError) {
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
                  ? `Loaded ${items.length} upcoming events from the configured public calendar via browser fallback.`
                  : "Calendar feed responded, but there were no near-term events to promote.",
              },
              {
                provider: "Google Calendar proxy",
                status: "error",
                mode: "live",
                detail: `Local proxy failed first: ${proxyError.message}`,
              },
            ],
          };
        } catch (error) {
          return {
            items: [],
            traces: [
              {
                provider: "Google Calendar proxy",
                status: "error",
                mode: "live",
                detail: `Calendar fetch failed: ${proxyError.message}. Browser fallback also failed: ${error.message}.`,
              },
            ],
          };
        }
      }
    },
  },
  {
    id: "live-weather",
    domain: "personal",
    slots: ["morning"],
    async run() {
      try {
        return await fetchWeatherFromLocalProxy();
      } catch (proxyError) {
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
            tags: guessTags(`${first.shortForecast} weather Austin commute`, ["weather", "commute"]),
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
                detail: `Loaded live Austin forecast via browser fallback. Proxy failed first: ${proxyError.message}`,
              },
            ],
          };
        } catch (error) {
          return {
            items: [],
            traces: [
              {
                provider: "Weather proxy",
                status: "error",
                mode: "live",
                detail: `Weather fetch failed: ${proxyError.message}. Browser fallback also failed: ${error.message}.`,
              },
            ],
          };
        }
      }
    },
  },
  {
    id: "live-campus-rss",
    domain: "campus",
    slots: ["afternoon"],
    async run() {
      try {
        return await fetchCampusFromLocalProxy();
      } catch (proxyError) {
        try {
          const xmlText = await fetchText(LIVE_ENDPOINTS.campusCalendarRss);
          const items = parseRss(xmlText, "campus", {
            label: "UT Events RSS",
            feedTags: ["students", "campus"],
          });
          return {
            items,
            traces: [
              {
                provider: "UT Events RSS adapter",
                status: items.length ? "live" : "empty",
                mode: "live",
                detail: items.length
                  ? `Loaded ${items.length} event headlines via browser fallback. Proxy failed first: ${proxyError.message}`
                  : "UT Events RSS returned no parseable items.",
              },
            ],
          };
        } catch (error) {
          return {
            items: [],
            traces: [
              {
                provider: "Campus events proxy",
                status: "error",
                mode: "live",
                detail: `UT calendar fetch failed: ${proxyError.message}. Browser fallback also failed: ${error.message}.`,
              },
            ],
          };
        }
      }
    },
  },
  {
    id: "live-world-rss",
    domain: "world",
    slots: ["evening"],
    async run({ profile }) {
      try {
        return await fetchWorldFromLocalProxy(profile);
      } catch (proxyError) {
        try {
          const xmlResults = await Promise.all(
            LIVE_ENDPOINTS.worldFeeds.map(async (feed) => ({ feed, xml: await fetchText(feed.url) })),
          );
          const items = xmlResults
            .flatMap(({ feed, xml }) => parseRss(xml, "world", { label: feed.label, feedTags: feed.feedTags }))
            .slice(0, 10);
          return {
            items,
            traces: [
              {
                provider: "World news RSS adapter",
                status: items.length ? "live" : "empty",
                mode: "live",
                detail: items.length
                  ? `Loaded ${items.length} live world headlines via browser fallback. Proxy failed first: ${proxyError.message}`
                  : "Public world feeds responded without parseable headlines.",
              },
            ],
          };
        } catch (error) {
          return {
            items: [],
            traces: [
              {
                provider: "World news proxy",
                status: "error",
                mode: "live",
                detail: `World news fetch failed: ${proxyError.message}. Browser fallback also failed: ${error.message}.`,
              },
            ],
          };
        }
      }
    },
  },
];