import { BRIEFING_SLOTS, DEFAULT_SOURCE_MODE } from "./config.js";
import { generateBriefing } from "./core/briefingEngine.js";
import { clonePersona, PERSONAS } from "./data/personas.js";
import { renderApp } from "./ui/render.js";
import { speakText, stopSpeaking } from "./ui/speech.js";

const STORAGE_KEY = "dirac-dispatch/v3";
const root = document.querySelector("#app");

function buildProfileFromSaved(snapshot = {}) {
  const personaId = snapshot.activePersonaId ?? PERSONAS[0].id;
  const base = clonePersona(personaId);
  const savedProfile = snapshot.profile ?? {};

  return {
    ...base,
    ...savedProfile,
    interests: Array.isArray(savedProfile.interests) ? savedProfile.interests : base.interests,
    liveSources: {
      ...base.liveSources,
      ...(savedProfile.liveSources ?? {}),
    },
    preferredDeliveryTimes: {
      ...base.preferredDeliveryTimes,
      ...(savedProfile.preferredDeliveryTimes ?? {}),
    },
  };
}

function loadSnapshot() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSnapshot(state) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activePersonaId: state.activePersonaId,
        sourceMode: state.sourceMode,
        selectedSlot: state.selectedSlot,
        profile: state.profile,
      }),
    );
  } catch {
  }
}

const snapshot = loadSnapshot();
const initialPersonaId = snapshot?.activePersonaId ?? PERSONAS[0].id;

const state = {
  personas: PERSONAS,
  activePersonaId: initialPersonaId,
  profile: buildProfileFromSaved(snapshot),
  briefings: {},
  selectedSlot: snapshot?.selectedSlot ?? BRIEFING_SLOTS[0].id,
  sourceMode: snapshot?.sourceMode ?? DEFAULT_SOURCE_MODE,
  status: "Ready to generate briefings with pinned real UT links and live public feeds through the local proxy.",
  isGenerating: false,
};

function setState(updater) {
  const nextState = typeof updater === "function" ? updater(state) : updater;
  Object.assign(state, nextState);
  saveSnapshot(state);
  render();
}

function upsertBriefing(entry) {
  return {
    ...state.briefings,
    [entry.slot]: entry,
  };
}

function describeModeSelection(modeId) {
  if (modeId !== "demo" && window.location.protocol === "file:") {
    return "Live or hybrid mode selected, but you need the local server running so the /api proxy routes are available.";
  }

  if (modeId === "live") {
    return "Live mode selected. The app will route public feeds through the local proxy and keep pinned public links in view.";
  }

  if (modeId === "hybrid") {
    return "Hybrid mode selected. The app will mix live public feeds, pinned public stories, and demo-safe fallbacks.";
  }

  return "Demo mode selected. You are on the safest path for a polished hackathon walkthrough.";
}

async function runGeneration(slot) {
  if (state.isGenerating) {
    return;
  }

  setState({
    isGenerating: true,
    selectedSlot: slot,
    status: `Generating the ${slot} edition for ${state.profile.name} in ${state.sourceMode} mode...`,
  });

  try {
    const briefing = await generateBriefing({
      profile: state.profile,
      slot,
      sourceMode: state.sourceMode,
    });

    setState({
      isGenerating: false,
      selectedSlot: slot,
      briefings: upsertBriefing(briefing),
      status: `${slot[0].toUpperCase()}${slot.slice(1)} edition ready. ${briefing.transparencyNote}`,
    });
  } catch (error) {
    setState({
      isGenerating: false,
      status: `Generation failed for ${slot}: ${error.message}`,
    });
  }
}

async function runAll() {
  for (const slot of BRIEFING_SLOTS.map((entry) => entry.id)) {
    await runGeneration(slot);
  }
}

function updateProfileField(field, value) {
  const nextProfile = JSON.parse(JSON.stringify(state.profile));

  if (field === "interests") {
    nextProfile.interests = value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  } else if (field === "calendarUrl") {
    nextProfile.liveSources.calendarUrl = value.trim();
  } else if (field.startsWith("deliveryTime:")) {
    const slot = field.split(":")[1];
    nextProfile.preferredDeliveryTimes[slot] = value;
  } else {
    nextProfile[field] = value;
  }

  setState({
    profile: nextProfile,
    briefings: {},
    status: "Profile updated. Regenerate an edition to see the new ranking and tone decisions.",
  });
}

function applyPersona(personaId) {
  setState({
    activePersonaId: personaId,
    profile: clonePersona(personaId),
    briefings: {},
    selectedSlot: BRIEFING_SLOTS[0].id,
    status: "Persona swapped. The next edition will show a noticeably different briefing mix.",
  });
}

function resetPersona() {
  setState({
    profile: clonePersona(state.activePersonaId),
    briefings: {},
    status: "Persona reset to its seeded defaults.",
  });
}

function clearBriefings() {
  stopSpeaking();
  setState({
    briefings: {},
    status: "Cleared generated editions.",
  });
}

function render() {
  renderApp(root, state);

  root.querySelectorAll("[data-action='change-persona']").forEach((button) => {
    button.addEventListener("click", () => applyPersona(button.dataset.persona));
  });

  root.querySelectorAll("[data-action='change-mode']").forEach((button) => {
    button.addEventListener("click", () => {
      setState({
        sourceMode: button.dataset.mode,
        briefings: {},
        status: describeModeSelection(button.dataset.mode),
      });
    });
  });

  root.querySelectorAll("[data-action='generate-slot']").forEach((button) => {
    button.addEventListener("click", () => runGeneration(button.dataset.slot));
  });

  root.querySelector("[data-action='generate-all']")?.addEventListener("click", runAll);
  root.querySelector("[data-action='clear-briefings']")?.addEventListener("click", clearBriefings);
  root.querySelector("[data-action='reset-persona']")?.addEventListener("click", resetPersona);

  root.querySelectorAll("[data-action='select-slot']").forEach((element) => {
    element.addEventListener("click", () => {
      setState({ selectedSlot: element.dataset.slot });
    });
  });

  root.querySelectorAll("input[data-field], select[data-field]").forEach((field) => {
    field.addEventListener("change", (event) => {
      updateProfileField(field.dataset.field, event.target.value);
    });
  });

  root.querySelector("[data-action='play-audio']")?.addEventListener("click", () => {
    const briefing = state.briefings[state.selectedSlot];
    if (!briefing) {
      return;
    }

    const result = speakText(briefing.audioScript);
    setState({
      status: result.message,
    });
  });

  root.querySelector("[data-action='stop-audio']")?.addEventListener("click", () => {
    stopSpeaking();
    setState({ status: "Audio stopped." });
  });
}

render();
