import { APP_NAME, BRIEFING_SLOTS, PIPELINE_STAGES, SOURCE_MODES } from "../config.js";

function escapeHtml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slotMeta(slotId) {
  return BRIEFING_SLOTS.find((slot) => slot.id === slotId) ?? BRIEFING_SLOTS[0];
}

function renderSlotButtons(state) {
  return BRIEFING_SLOTS.map((slot) => {
    const isSelected = state.selectedSlot === slot.id;
    const hasBrief = Boolean(state.briefings[slot.id]);

    return `
      <button class="slot-pill ${isSelected ? "is-selected" : ""}" data-slot="${slot.id}" data-action="generate-slot">
        <span>${slot.shortLabel}</span>
        <small>${hasBrief ? "Ready" : "Generate"}</small>
      </button>
    `;
  }).join("");
}

function renderPersonaButtons(state) {
  return state.personas
    .map(
      (persona) => `
        <button
          class="persona-chip ${state.activePersonaId === persona.id ? "is-active" : ""}"
          data-action="change-persona"
          data-persona="${persona.id}"
        >
          ${escapeHtml(persona.name)}
        </button>
      `,
    )
    .join("");
}

function renderModeButtons(state) {
  return SOURCE_MODES.map(
    (mode) => `
      <button
        class="mode-chip ${state.sourceMode === mode.id ? "is-active" : ""}"
        data-action="change-mode"
        data-mode="${mode.id}"
      >
        <span>${escapeHtml(mode.label)}</span>
        <small>${escapeHtml(mode.description)}</small>
      </button>
    `,
  ).join("");
}

function renderMessageThread(state) {
  const ordered = BRIEFING_SLOTS.map((slot) => state.briefings[slot.id]).filter(Boolean);

  if (!ordered.length) {
    return `
      <div class="empty-thread">
        <p>No briefings sent yet.</p>
        <span>Generate a morning, afternoon, or evening dispatch to preview the outbound experience.</span>
      </div>
    `;
  }

  return ordered
    .map((briefing) => {
      const meta = slotMeta(briefing.slot);
      const isActive = state.selectedSlot === briefing.slot;
      return `
        <article class="message-bubble ${isActive ? "is-active" : ""}" data-action="select-slot" data-slot="${briefing.slot}">
          <div class="message-header">
            <strong>${escapeHtml(meta.shortLabel)}</strong>
            <span>${escapeHtml(briefing.generatedStamp)}</span>
          </div>
          <pre>${escapeHtml(briefing.smsText)}</pre>
        </article>
      `;
    })
    .join("");
}

function renderActiveBriefing(state) {
  const briefing = state.briefings[state.selectedSlot];
  const slot = slotMeta(state.selectedSlot);

  if (!briefing) {
    return `
      <div class="placeholder-card">
        <h3>${escapeHtml(slot.shortLabel)} preview</h3>
        <p>Generate this briefing to see the SMS output, podcast script, and ranking rationale.</p>
      </div>
    `;
  }

  return `
    <section class="detail-card accent-${briefing.accent}">
      <div class="detail-header">
        <div>
          <p class="eyebrow">${escapeHtml(slot.shortLabel)} briefing</p>
          <h3>${escapeHtml(briefing.headline)}</h3>
        </div>
        <span class="mode-badge">${escapeHtml(briefing.sourceMode)}</span>
      </div>
      <p class="lead-copy">${escapeHtml(briefing.lead)}</p>
      <div class="detail-actions">
        <button class="ghost-button" data-action="play-audio" data-slot="${briefing.slot}">Play audio</button>
        <button class="ghost-button" data-action="stop-audio">Stop audio</button>
        <span>${briefing.estimatedAudioSeconds}s spoken</span>
      </div>
      <div class="script-box">
        <p class="eyebrow">Podcast script</p>
        <p>${escapeHtml(briefing.audioScript)}</p>
      </div>
      <div class="insight-grid">
        ${briefing.items
          .map(
            (item) => `
              <article class="insight-card">
                <div class="insight-topline">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.timeLabel)}</span>
                </div>
                <p>${escapeHtml(item.summary)}</p>
                <p class="why-line">Why it matters: ${escapeHtml(item.whyItMatters)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderTraceList(state) {
  const briefing = state.briefings[state.selectedSlot];

  if (!briefing) {
    return `<p class="subdued">Source trace will appear after a briefing is generated.</p>`;
  }

  return briefing.traces
    .map(
      (trace) => `
        <article class="trace-row">
          <div>
            <strong>${escapeHtml(trace.provider)}</strong>
            <p>${escapeHtml(trace.detail)}</p>
          </div>
          <span class="trace-status trace-${trace.status}">${escapeHtml(trace.status)}</span>
        </article>
      `,
    )
    .join("");
}

function renderRankedItems(state) {
  const briefing = state.briefings[state.selectedSlot];

  if (!briefing) {
    return `<p class="subdued">Personalization reasons will appear here once the engine ranks items.</p>`;
  }

  return briefing.rankedItems
    .slice(0, 5)
    .map(
      (item) => `
        <article class="rank-row">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.reasons.join(" • ") || "General relevance")}</p>
          </div>
          <span>${item.score}</span>
        </article>
      `,
    )
    .join("");
}

function renderPipeline() {
  return PIPELINE_STAGES.map((stage) => `<span class="pipeline-chip">${escapeHtml(stage)}</span>`).join("");
}

export function renderApp(root, state) {
  const briefing = state.briefings[state.selectedSlot];

  root.innerHTML = `
    <div class="app-shell">
      <aside class="left-rail">
        <section class="panel hero-panel">
          <p class="eyebrow">Outbound daily assistant</p>
          <h1>${escapeHtml(APP_NAME)}</h1>
          <p class="hero-copy">
            A UT-student briefing system that reaches out first. The demo centers the message and audio surfaces, not a feed.
          </p>
          <div class="pipeline-row">${renderPipeline()}</div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Demo personas</p>
              <h2>Switch student context</h2>
            </div>
          </div>
          <div class="chip-row">${renderPersonaButtons(state)}</div>
          <p class="tagline">${escapeHtml(state.profile.tagline)}</p>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Profile controls</p>
              <h2>Believable personalization</h2>
            </div>
          </div>
          <div class="form-grid">
            <label>
              <span>Name</span>
              <input data-field="name" value="${escapeHtml(state.profile.name)}" />
            </label>
            <label>
              <span>Year</span>
              <input data-field="year" value="${escapeHtml(state.profile.year)}" />
            </label>
            <label>
              <span>Major</span>
              <input data-field="major" value="${escapeHtml(state.profile.major)}" />
            </label>
            <label>
              <span>Lifestyle</span>
              <select data-field="lifestyle">
                <option value="on-campus" ${state.profile.lifestyle === "on-campus" ? "selected" : ""}>on-campus</option>
                <option value="off-campus" ${state.profile.lifestyle === "off-campus" ? "selected" : ""}>off-campus</option>
                <option value="commuter" ${state.profile.lifestyle === "commuter" ? "selected" : ""}>commuter</option>
              </select>
            </label>
            <label>
              <span>Tone</span>
              <select data-field="tone">
                <option value="concise" ${state.profile.tone === "concise" ? "selected" : ""}>concise</option>
                <option value="balanced" ${state.profile.tone === "balanced" ? "selected" : ""}>balanced</option>
                <option value="deeper" ${state.profile.tone === "deeper" ? "selected" : ""}>deeper</option>
              </select>
            </label>
            <label>
              <span>Stress mode</span>
              <select data-field="stressMode">
                <option value="low-noise" ${state.profile.stressMode === "low-noise" ? "selected" : ""}>low-noise</option>
                <option value="normal" ${state.profile.stressMode === "normal" ? "selected" : ""}>normal</option>
                <option value="power-user" ${state.profile.stressMode === "power-user" ? "selected" : ""}>power-user</option>
              </select>
            </label>
            <label>
              <span>Delivery preference</span>
              <select data-field="deliveryPreference">
                <option value="text" ${state.profile.deliveryPreference === "text" ? "selected" : ""}>text</option>
                <option value="audio" ${state.profile.deliveryPreference === "audio" ? "selected" : ""}>audio</option>
                <option value="both" ${state.profile.deliveryPreference === "both" ? "selected" : ""}>both</option>
              </select>
            </label>
            <label class="full-span">
              <span>Interests</span>
              <input data-field="interests" value="${escapeHtml(state.profile.interests.join(", "))}" />
            </label>
            <div class="time-grid full-span">
              <label>
                <span>Morning send</span>
                <input type="time" data-field="deliveryTime:morning" value="${escapeHtml(state.profile.preferredDeliveryTimes.morning)}" />
              </label>
              <label>
                <span>Afternoon send</span>
                <input type="time" data-field="deliveryTime:afternoon" value="${escapeHtml(state.profile.preferredDeliveryTimes.afternoon)}" />
              </label>
              <label>
                <span>Evening send</span>
                <input type="time" data-field="deliveryTime:evening" value="${escapeHtml(state.profile.preferredDeliveryTimes.evening)}" />
              </label>
            </div>
            <label class="full-span">
              <span>Public calendar ICS URL (optional)</span>
              <input data-field="calendarUrl" value="${escapeHtml(state.profile.liveSources?.calendarUrl ?? "")}" placeholder="Paste a public Google Calendar ICS URL for live mode" />
            </label>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Source strategy</p>
              <h2>Demo vs live</h2>
            </div>
          </div>
          <div class="mode-stack">${renderModeButtons(state)}</div>
          <p class="subdued">${escapeHtml(state.status)}</p>
        </section>
      </aside>

      <main class="stage">
        <section class="dispatch-toolbar">
          <div>
            <p class="eyebrow">Dispatch console</p>
            <h2>Send the day in three pulses</h2>
          </div>
          <div class="slot-row">
            ${renderSlotButtons(state)}
            <button class="launch-button" data-action="generate-all">Dispatch all three</button>
          </div>
        </section>

        <section class="stage-grid">
          <div class="phone-shell">
            <div class="phone-topbar">
              <div>
                <p class="eyebrow">SMS preview</p>
                <strong>${escapeHtml(state.profile.name)}</strong>
              </div>
              <span>${escapeHtml(briefing?.sourceMode ?? state.sourceMode)}</span>
            </div>
            <div class="thread">${renderMessageThread(state)}</div>
          </div>

          <div class="detail-stack">
            ${renderActiveBriefing(state)}

            <section class="panel data-panel">
              <div class="panel-header">
                <div>
                  <p class="eyebrow">Source trace</p>
                  <h2>What got pulled or simulated</h2>
                </div>
              </div>
              <div class="trace-list">${renderTraceList(state)}</div>
            </section>

            <section class="panel data-panel">
              <div class="panel-header">
                <div>
                  <p class="eyebrow">Ranking rationale</p>
                  <h2>Why this student saw these items</h2>
                </div>
              </div>
              <div class="rank-list">${renderRankedItems(state)}</div>
            </section>
          </div>
        </section>
      </main>
    </div>
  `;
}