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

function modeMeta(modeId) {
  return SOURCE_MODES.find((mode) => mode.id === modeId) ?? SOURCE_MODES[0];
}

function formatFetchedAt(timestamp) {
  if (!timestamp) {
    return "Seeded or cached for demo reliability";
  }

  return `Updated ${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp))}`;
}

function formatEditionDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function renderSlotButtons(state) {
  return BRIEFING_SLOTS.map((slot) => {
    const isSelected = state.selectedSlot === slot.id;
    const hasBrief = Boolean(state.briefings[slot.id]);

    return `
      <button class="slot-pill ${isSelected ? "is-selected" : ""}" data-slot="${slot.id}" data-action="generate-slot">
        <span>${slot.shortLabel}</span>
        <small>${hasBrief ? "Refresh edition" : "Generate edition"}</small>
      </button>
    `;
  }).join("");
}

function renderEditionNav(state) {
  return BRIEFING_SLOTS.map((slot) => {
    const isSelected = state.selectedSlot === slot.id;
    return `
      <button class="edition-link ${isSelected ? "is-active" : ""}" data-action="select-slot" data-slot="${slot.id}">
        <span>${slot.shortLabel}</span>
        <small>${slot.cue}</small>
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

function renderProfileMeta(state) {
  return [state.profile.year, state.profile.major, state.profile.lifestyle, state.profile.deliveryPreference]
    .map((value) => `<span class="meta-pill">${escapeHtml(value)}</span>`)
    .join("");
}

function renderMessageThread(state) {
  const ordered = BRIEFING_SLOTS.map((slot) => state.briefings[slot.id]).filter(Boolean);

  if (!ordered.length) {
    return `
      <div class="empty-thread">
        <p>No dispatches printed yet.</p>
        <span>Generate a morning, afternoon, or evening edition to preview the outbound message flow.</span>
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
            <strong>${escapeHtml(meta.shortLabel)} edition</strong>
            <span>${escapeHtml(briefing.generatedStamp)}</span>
          </div>
          <pre>${escapeHtml(briefing.smsText)}</pre>
        </article>
      `;
    })
    .join("");
}

function renderSourceRow(item) {
  return `
    <div class="source-row">
      <span>${escapeHtml(item.source?.label ?? "Source")}</span>
      ${item.source?.url ? `<a class="source-link" href="${escapeHtml(item.source.url)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
    </div>
  `;
}

function renderStoryMeta(item) {
  const parts = [item.timeLabel, item.location].filter(Boolean);
  if (!parts.length) {
    return "";
  }

  return `<p class="story-meta">${escapeHtml(parts.join(" • "))}</p>`;
}

function renderActiveBriefing(state) {
  const briefing = state.briefings[state.selectedSlot];
  const slot = slotMeta(state.selectedSlot);

  if (!briefing) {
    return `
      <div class="placeholder-card newspaper-card">
        <p class="eyebrow">${escapeHtml(slot.shortLabel)} edition</p>
        <h2>Nothing on the front page yet</h2>
        <p>Generate this briefing to print the SMS copy, audio script, and source rationale.</p>
      </div>
    `;
  }

  const leadItem = briefing.items[0];
  const secondaryItems = briefing.items.slice(1);

  return `
    <section class="detail-card newspaper-card accent-${briefing.accent}">
      <div class="detail-header">
        <div>
          <p class="eyebrow">${escapeHtml(slot.shortLabel)} edition</p>
          <h2 class="paper-headline">${escapeHtml(briefing.headline)}</h2>
        </div>
        <span class="mode-badge">${escapeHtml(modeMeta(briefing.sourceMode).label)} desk</span>
      </div>
      <p class="lead-copy">${escapeHtml(briefing.lead)}</p>
      <div class="stats-row">
        <span class="stat-pill">${briefing.items.length} item${briefing.items.length === 1 ? "" : "s"}</span>
        <span class="stat-pill">${briefing.liveTraceCount} live feed${briefing.liveTraceCount === 1 ? "" : "s"}</span>
        <span class="stat-pill">${briefing.curatedTraceCount} pinned link${briefing.curatedTraceCount === 1 ? "" : "s"}</span>
        <span class="stat-pill">${formatFetchedAt(briefing.fetchedAt)}</span>
      </div>
      <p class="detail-note">${escapeHtml(briefing.transparencyNote)}</p>
      <div class="feature-layout">
        <article class="lead-story-card">
          <p class="eyebrow">Lead story</p>
          <h3>${escapeHtml(leadItem?.title ?? "Quiet window")}</h3>
          ${leadItem ? renderStoryMeta(leadItem) : ""}
          <p>${escapeHtml(leadItem?.summary ?? "No story landed strongly enough to print.")}</p>
          ${leadItem ? `<p class="why-line">Why it matters: ${escapeHtml(leadItem.whyItMatters)}</p>` : ""}
          ${leadItem ? renderSourceRow(leadItem) : ""}
        </article>
        <aside class="script-box broadcast-box">
          <p class="eyebrow">Broadcast copy</p>
          <p>${escapeHtml(briefing.audioScript)}</p>
          <div class="detail-actions">
            <button class="ghost-button" data-action="play-audio" data-slot="${briefing.slot}">Play audio</button>
            <button class="ghost-button" data-action="stop-audio">Stop audio</button>
            <span>${briefing.estimatedAudioSeconds}s spoken</span>
          </div>
        </aside>
      </div>
      <div class="secondary-grid">
        ${secondaryItems
          .map(
            (item) => `
              <article class="secondary-story">
                <div class="insight-topline">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.timeLabel)}</span>
                </div>
                <p>${escapeHtml(item.summary)}</p>
                <p class="why-line">Why it matters: ${escapeHtml(item.whyItMatters)}</p>
                ${renderSourceRow(item)}
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
            <span class="trace-meta">${escapeHtml(formatFetchedAt(trace.fetchedAt))}</span>
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
  const activeMode = modeMeta(state.sourceMode);

  root.innerHTML = `
    <div class="paper-shell">
      <header class="paper-header">
        <div class="edition-column">
          <p class="edition-label">Austin, Texas</p>
          <p class="edition-date">${escapeHtml(formatEditionDate())}</p>
          <p class="edition-sub">UT student edition</p>
        </div>
        <div class="masthead">
          <p class="eyebrow">Morning / Campus / World</p>
          <h1 class="masthead-title">${escapeHtml(APP_NAME)}</h1>
          <p class="masthead-subtitle">A personal campus paper that texts the student first.</p>
        </div>
        <div class="edition-column edition-column-right">
          <p class="edition-label">${escapeHtml(activeMode.label)} mode</p>
          <p class="edition-date">${escapeHtml(briefing ? formatFetchedAt(briefing.fetchedAt) : "Ready for dispatch")}</p>
          <p class="edition-sub">${escapeHtml(state.profile.name)}</p>
        </div>
      </header>

      <div class="edition-nav">${renderEditionNav(state)}</div>
      <div class="status-strip">
        <span class="status-dot ${state.sourceMode}"></span>
        <p>${escapeHtml(state.status)}</p>
      </div>

      <div class="paper-grid">
        <aside class="news-desk">
          <section class="panel hero-panel newspaper-panel">
            <p class="eyebrow">Outbound daily assistant</p>
            <h2>Three editions. No endless feed.</h2>
            <p class="hero-copy">
              The demo is built to feel like a campus-aware paper and dispatch desk, not a browsing app. Messages and audio are the main product surfaces.
            </p>
            <div class="pipeline-row">${renderPipeline()}</div>
          </section>

          <section class="panel newspaper-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Demo personas</p>
                <h2>Switch the reader</h2>
              </div>
              <button class="inline-button" data-action="reset-persona">Reset</button>
            </div>
            <div class="chip-row">${renderPersonaButtons(state)}</div>
            <div class="persona-meta">${renderProfileMeta(state)}</div>
            <p class="tagline">${escapeHtml(state.profile.tagline)}</p>
          </section>

          <section class="panel newspaper-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Profile controls</p>
                <h2>Personalization desk</h2>
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

          <section class="panel newspaper-panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Source strategy</p>
                <h2>Live desk</h2>
              </div>
            </div>
            <div class="mode-stack">${renderModeButtons(state)}</div>
            <p class="detail-note">Run the app through the included local server if you want live RSS, weather, and calendar proxy routes to work.</p>
          </section>
        </aside>

        <main class="front-page">
          <section class="dispatch-toolbar newspaper-panel">
            <div>
              <p class="eyebrow">Dispatch console</p>
              <h2>Print the day in three pulses</h2>
            </div>
            <div class="slot-row">
              ${renderSlotButtons(state)}
              <button class="launch-button" data-action="generate-all">Dispatch all three</button>
              <button class="ghost-button" data-action="clear-briefings">Clear outputs</button>
            </div>
          </section>

          <section class="front-grid">
            <div class="detail-stack">
              ${renderActiveBriefing(state)}

              <section class="panel data-panel newspaper-panel">
                <div class="panel-header">
                  <div>
                    <p class="eyebrow">Source trace</p>
                    <h2>What got pulled or pinned</h2>
                  </div>
                </div>
                <div class="trace-list">${renderTraceList(state)}</div>
              </section>

              <section class="panel data-panel newspaper-panel">
                <div class="panel-header">
                  <div>
                    <p class="eyebrow">Ranking rationale</p>
                    <h2>Why this reader saw these items</h2>
                  </div>
                </div>
                <div class="rank-list">${renderRankedItems(state)}</div>
              </section>
            </div>

            <aside class="wire-column">
              <section class="phone-shell newspaper-panel">
                <div class="phone-topbar">
                  <div>
                    <p class="eyebrow">SMS proof</p>
                    <strong>${escapeHtml(state.profile.name)}</strong>
                  </div>
                  <span>${escapeHtml(briefing?.sourceMode ?? state.sourceMode)}</span>
                </div>
                <div class="thread">${renderMessageThread(state)}</div>
              </section>
            </aside>
          </section>
        </main>
      </div>
    </div>
  `;
}
