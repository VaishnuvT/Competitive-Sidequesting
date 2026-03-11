import { BRIEFING_SLOTS, DEFAULT_SOURCE_MODE } from "./config.js";
import { generateBriefing } from "./core/briefingEngine.js";
import { clonePersona, PERSONAS } from "./data/personas.js";
import { renderApp } from "./ui/render.js";
import { speakText, stopSpeaking } from "./ui/speech.js";

const root = document.querySelector("#app");

const state = {
  personas: PERSONAS,
  activePersonaId: PERSONAS[0].id,
  profile: clonePersona(PERSONAS[0].id),
  briefings: {},
  selectedSlot: BRIEFING_SLOTS[0].id,
  sourceMode: DEFAULT_SOURCE_MODE,
  status: "Ready to generate stable demo briefings or try public feeds in hybrid mode.",
  isGenerating: false,
};

function setState(updater) {
  const nextState = typeof updater === "function" ? updater(state) : updater;
  Object.assign(state, nextState);
  render();
}

function upsertBriefing(entry) {
  return {
    ...state.briefings,
    [entry.slot]: entry,
  };
}

async function runGeneration(slot) {
  if (state.isGenerating) {
    return;
  }

  setState({
    isGenerating: true,
    selectedSlot: slot,
    status: `Generating the ${slot} briefing for ${state.profile.name} in ${state.sourceMode} mode...`,
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
      status: `${slot[0].toUpperCase()}${slot.slice(1)} briefing ready. ${briefing.transparencyNote}`,
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
    status: "Profile updated. Regenerate a briefing to see new ranking decisions.",
  });
}

function applyPersona(personaId) {
  setState({
    activePersonaId: personaId,
    profile: clonePersona(personaId),
    briefings: {},
    selectedSlot: BRIEFING_SLOTS[0].id,
    status: "Persona swapped. The next briefing will show a noticeably different ranking profile.",
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
        status: `${button.dataset.mode} mode selected. Generate again to refresh the source trace.`,
      });
    });
  });

  root.querySelectorAll("[data-action='generate-slot']").forEach((button) => {
    button.addEventListener("click", () => runGeneration(button.dataset.slot));
  });

  root.querySelector("[data-action='generate-all']")?.addEventListener("click", runAll);

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