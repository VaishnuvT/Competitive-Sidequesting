import { DELIVERY_DEFAULTS } from "../config.js";

export const PERSONAS = [
  {
    id: "maya",
    name: "Maya Torres",
    year: "Freshman",
    major: "Biology",
    interests: ["pre-med", "wellness", "research", "live music"],
    lifestyle: "on-campus",
    preferredDeliveryTimes: { ...DELIVERY_DEFAULTS },
    deliveryPreference: "both",
    tone: "balanced",
    stressMode: "normal",
    liveSources: { calendarUrl: "" },
    tagline: "Freshman biology student balancing labs, pre-med planning, and dorm-life logistics.",
  },
  {
    id: "noah",
    name: "Noah Kim",
    year: "Junior",
    major: "Computer Science",
    interests: ["startups", "ai", "longhorn sports", "career"],
    lifestyle: "off-campus",
    preferredDeliveryTimes: {
      morning: "08:05",
      afternoon: "12:40",
      evening: "20:15",
    },
    deliveryPreference: "text",
    tone: "concise",
    stressMode: "power-user",
    liveSources: { calendarUrl: "" },
    tagline: "CS junior living off campus and trying to catch the best startup and internship signals.",
  },
  {
    id: "priya",
    name: "Priya Ramanathan",
    year: "Graduate",
    major: "Public Policy",
    interests: ["policy", "research", "civic tech", "coffee"],
    lifestyle: "commuter",
    preferredDeliveryTimes: {
      morning: "06:55",
      afternoon: "13:30",
      evening: "18:50",
    },
    deliveryPreference: "audio",
    tone: "deeper",
    stressMode: "low-noise",
    liveSources: { calendarUrl: "" },
    tagline: "Grad student commuter who wants signal, not noise, with policy and research relevance baked in.",
  },
];

export function getPersonaById(personaId) {
  return PERSONAS.find((persona) => persona.id === personaId) ?? PERSONAS[0];
}

export function clonePersona(personaId) {
  return JSON.parse(JSON.stringify(getPersonaById(personaId)));
}