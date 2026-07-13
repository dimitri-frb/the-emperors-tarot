// The Emperor's Tarot — Málaga Open matchup companion.
// Vanilla JS port of the design prototype (design_handoff_tournament_matchups).

import { PLAYERS, FACTION_COLORS, MISSION_MATRIX } from "./data.js";

const STORAGE_KEY = "malaga-open-matchups";
const NOTES_KEY = "malaga-open-notes";
const GDM = "https://gdmissions.app/assets/11th";
const ACCENT = "#0A84FF";
const SHOW_POINTS = true;

const state = {
  meId: "dimitri",
  oppId: null,
  pickingSelf: false,
  search: "",
  listOpen: false,
  meMissionOpen: false,
  oppMissionOpen: false,
};

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (saved.meId) state.meId = saved.meId;
  if (saved.oppId !== undefined) state.oppId = saved.oppId;
} catch (e) {}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ meId: state.meId, oppId: state.oppId }));
  } catch (e) {}
}

// Per-opponent notes, keyed by player id: { macro, units }.
// (Older versions stored a plain string — migrated into `macro`.)
let notes = {};
try {
  notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  for (const id of Object.keys(notes)) {
    if (typeof notes[id] === "string") notes[id] = { macro: notes[id], units: "" };
  }
} catch (e) {}

function getNote(oppId) {
  return notes[oppId] || { macro: "", units: "" };
}

function saveNote(oppId, field, text) {
  const n = { ...getNote(oppId), [field]: text };
  if (n.macro.trim() || n.units.trim()) notes[oppId] = n;
  else delete notes[oppId];
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {}
}

const slug = (s) => s.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const DISPO_STYLE = {
  "Take and Hold": ["#2E7D46", "#E8F3EC"],
  "Purge the Foe": ["#8E2323", "#F6E9E9"],
  "Priority Assets": ["#9A7B1E", "#F7F1DE"],
  "Reconnaissance": ["#1F6D66", "#E4F0EF"],
  "Disruption": ["#1673AE", "#E5F1F9"],
};

const dispoStyle = (dispo) => DISPO_STYLE[dispo] || ["#5B5B60", "#EFEFF3"];

function dispoIcon(dispo, size) {
  const [fill] = dispoStyle(dispo);
  const glyphs = {
    "Take and Hold": `
      <path d="M4 2 H20 V13 L12 22.5 L4 13 Z" fill="${fill}"/>
      <circle cx="12" cy="9" r="4.2" fill="#fff"/>
      <rect x="9.4" y="12" width="5.2" height="3.4" rx="1" fill="#fff"/>
      <circle cx="10.3" cy="9" r="1.1" fill="${fill}"/>
      <circle cx="13.7" cy="9" r="1.1" fill="${fill}"/>`,
    "Disruption": `
      <path d="M12 1.5 L21.2 6.8 V17.2 L12 22.5 L2.8 17.2 V6.8 Z" fill="${fill}"/>
      <path d="M8.2 8.2 L15.8 15.8 M15.8 8.2 L8.2 15.8" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`,
    "Purge the Foe": `
      <path d="M2.5 3 H21.5 L12 22 Z" fill="${fill}"/>
      <path d="M12 5.5 V14.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M9.6 8.2 H14.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="6" r="1.2" fill="#fff"/>`,
    "Priority Assets": `
      <path d="M12 1 L23 12 L12 23 L1 12 Z" fill="${fill}"/>
      <circle cx="12" cy="12" r="2.4" fill="#fff"/>
      <path d="M12 4.5 L14 8 H10 Z" fill="#fff"/>
      <path d="M12 19.5 L10 16 H14 Z" fill="#fff"/>
      <path d="M4.5 12 L8 10 V14 Z" fill="#fff"/>
      <path d="M19.5 12 L16 14 V10 Z" fill="#fff"/>`,
    "Reconnaissance": `
      <circle cx="12" cy="12" r="10.5" fill="${fill}"/>
      <path d="M4.5 12 C7 7.8 17 7.8 19.5 12 C17 16.2 7 16.2 4.5 12 Z" fill="none" stroke="#fff" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="2.6" fill="#fff"/>
      <circle cx="12" cy="12" r="1.1" fill="${fill}"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex-shrink:0">${glyphs[dispo] || ""}</svg>`;
}

const CHEVRON_RIGHT = `<svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEVRON_BACK = `<svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L2 8.5L9 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chevronDown = (color, open, cls = "") =>
  `<svg class="chevron ${open ? "open" : ""} ${cls}" width="14" height="9" viewBox="0 0 14 9" fill="none"><path d="M1 1L7 7.5L13 1" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SEARCH_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#8E8E93" stroke-width="1.6"/><path d="M11 11L14 14" stroke="#8E8E93" stroke-width="1.6" stroke-linecap="round"/></svg>`;

function decorate(p) {
  const [dispoColor, dispoBg] = dispoStyle(p.dispo);
  return {
    ...p,
    initials: initials(p.name),
    color: FACTION_COLORS[p.faction] || "#8E8E93",
    subtitle: (p.team && p.team !== "—" ? p.team + " · " : "") + p.faction,
    dispoColor,
    dispoBg,
  };
}

// Image with a chain of fallback sources: tries local asset first, then remote,
// then (for layouts) the swapped-slug remote, then the bundled placeholder.
function imgTag(src, fallbacks, alt, radius) {
  const fb = esc(JSON.stringify(fallbacks || []));
  const r = radius ? `border-radius:${radius}px` : "";
  return `<img src="${esc(src)}" alt="${esc(alt)}" data-fallbacks="${fb}" data-fb="0" style="width:100%;display:block;${r}">`;
}

// img error events don't bubble — listen in capture phase.
document.addEventListener(
  "error",
  (e) => {
    const el = e.target;
    if (!(el instanceof HTMLImageElement) || !el.dataset.fallbacks) return;
    const fallbacks = JSON.parse(el.dataset.fallbacks);
    const i = Number(el.dataset.fb || 0);
    if (i < fallbacks.length) {
      el.dataset.fb = String(i + 1);
      el.src = fallbacks[i];
    }
  },
  true
);

function missionImgSources(dispoSlug, missionSlug) {
  return {
    src: `assets/missions/${dispoSlug}/${missionSlug}.png`,
    fallbacks: [`${GDM}/primary-missions/${dispoSlug}/${missionSlug}.png`],
  };
}

function layoutImgSources(meSlug, oppSlug, i) {
  // Mirror matches (same disposition) are published as "{slug}-mirror-{i}" on gdmissions.app.
  const names =
    meSlug === oppSlug
      ? [`${meSlug}-vs-${oppSlug}-${i}`, `${meSlug}-mirror-${i}`]
      : [`${meSlug}-vs-${oppSlug}-${i}`, `${oppSlug}-vs-${meSlug}-${i}`];
  const local = names.map((n) => `assets/layouts/${n}.png`);
  const remote = names.map((n) => `${GDM}/layouts/no-measurements/${n}.png`);
  return {
    src: local[0],
    fallbacks: [...local.slice(1), ...remote, "assets/map-layout.png"],
  };
}

/* ---------- notes PDF export ---------- */

async function exportNotesPDF() {
  const noted = PLAYERS.filter((p) => {
    const n = getNote(p.id);
    return (n.macro.trim() || n.units.trim()) && p.id !== state.meId;
  });
  if (!noted.length) {
    alert("No notes yet — open a matchup and write some first.");
    return;
  }
  if (!window.jspdf) {
    alert("PDF engine not loaded yet — try again in a second.");
    return;
  }

  const me = PLAYERS.find((p) => p.id === state.meId) || PLAYERS[0];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;
  let y = M;

  // Header (first page only)
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(28, 28, 30);
  doc.text("The Emperor's Tarot — Notes", M, y + 4);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(142, 142, 147);
  doc.text(`Málaga Open · playing as ${me.name} (${me.faction} · ${me.dispo})`, M, y + 20);
  y += 40;

  // jsPDF's WinAnsi fonts drop combining accents (BCP names arrive NFD) — compose first.
  const nfc = (s) => s.normalize("NFC");

  const LABEL_W = 62; // indent so note text clears the "Macro"/"Units" label column

  for (const p of noted) {
    const n = getNote(p.id);
    const myMission = MISSION_MATRIX[me.dispo][p.dispo];
    const theirMission = MISSION_MATRIX[p.dispo][me.dispo];
    const infoLine = nfc(`${p.faction} · ${p.summary.detachment}`);
    const missionLine = nfc(`You: ${myMission} (${me.dispo})  ·  Them: ${theirMission} (${p.dispo})`);
    const fields = [
      ["Macro", n.macro.trim()],
      ["Units", n.units.trim()],
    ].filter(([, text]) => text);

    doc.setFontSize(10);
    const fieldLines = fields.map(([label, text]) => [label, doc.splitTextToSize(nfc(text), CW - LABEL_W)]);
    const fieldsH = fieldLines.reduce((h, [, lines]) => h + lines.length * 12 + 4, 0);
    const blockH = 16 + 12 + 12 + 6 + fieldsH + 14;

    if (y + blockH > H - M) {
      doc.addPage();
      y = M;
    }

    doc.setDrawColor(225, 225, 230).setLineWidth(0.75);
    doc.line(M, y, W - M, y);
    y += 16;

    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(28, 28, 30);
    doc.text(nfc(p.name), M, y);
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(142, 142, 147);
    y += 12;
    doc.text(infoLine, M, y, { maxWidth: CW });
    y += 12;
    doc.setTextColor(90, 90, 95);
    doc.text(missionLine, M, y, { maxWidth: CW });
    y += 6 + 12;

    for (const [label, lines] of fieldLines) {
      doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(142, 142, 147);
      doc.text(label.toUpperCase(), M, y - 4);
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(28, 28, 30);
      doc.text(lines, M + LABEL_W, y - 4);
      y += lines.length * 12 + 4;
    }
    y += 10;
  }

  const filename = "emperors-tarot-notes.pdf";
  const blob = doc.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "The Emperor's Tarot — Notes" });
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // user closed the share sheet
    }
  }
  doc.save(filename);
}

/* ---------- rendering ---------- */

const app = document.getElementById("app");
document.documentElement.style.setProperty("--accent", ACCENT);
document.documentElement.style.setProperty("--accent-soft", ACCENT + "1A");

function filteredRoster() {
  const q = state.search.trim().toLowerCase();
  return PLAYERS.filter((p) => (state.pickingSelf ? true : p.id !== state.meId))
    .filter((p) => !q || (p.name + " " + p.team + " " + p.faction + " " + p.dispo).toLowerCase().includes(q))
    .map(decorate);
}

function playerRowHTML(p) {
  return `
    <div class="player-row" data-select="${esc(p.id)}">
      <div class="avatar" style="background:${p.color}">${esc(p.initials)}</div>
      <div class="flex1">
        <div class="name ellipsis">${esc(p.name)}</div>
        <div class="sub ellipsis">${esc(p.subtitle)}</div>
      </div>
      <div class="right">
        <div class="dispo-pill" style="color:${p.dispoColor};background:${p.dispoBg}">${dispoIcon(p.dispo, 14)}${esc(p.dispo)}</div>
        ${CHEVRON_RIGHT}
      </div>
    </div>`;
}

function dispoStatsHTML() {
  const total = PLAYERS.length;
  const counts = {};
  for (const p of PLAYERS) counts[p.dispo] = (counts[p.dispo] || 0) + 1;
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const R = 44;
  const C = 2 * Math.PI * R;
  let start = 0;
  const arcs = rows
    .map(([dispo, n]) => {
      const len = (n / total) * C;
      const [color] = dispoStyle(dispo);
      const arc = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${color}" stroke-width="16" transform="rotate(-90 60 60)" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-start}"/>`;
      start += len;
      return arc;
    })
    .join("");

  const legend = rows
    .map(([dispo, n]) => {
      const [color] = dispoStyle(dispo);
      return `
      <div class="stat-row">
        <span class="swatch" style="background:${color}"></span>
        <span class="stat-name">${esc(dispo)}</span>
        <span class="stat-pct">${Math.round((n / total) * 100)}%</span>
        <span class="stat-count">${n}/${total}</span>
      </div>`;
    })
    .join("");

  return `
    <div class="card stats-card">
      <svg class="donut" viewBox="0 0 120 120" width="110" height="110">
        ${arcs}
        <text x="60" y="60" text-anchor="middle" font-size="26" font-weight="800" fill="#1C1C1E">${total}</text>
        <text x="60" y="76" text-anchor="middle" font-size="9" font-weight="600" letter-spacing="1.2" fill="#8E8E93">PLAYERS</text>
      </svg>
      <div class="stats-legend">
        <div class="stats-title">Force Dispositions</div>
        ${legend}
      </div>
    </div>`;
}

function rosterHTML() {
  const me = decorate(PLAYERS.find((p) => p.id === state.meId) || PLAYERS[0]);
  const youCard = state.pickingSelf
    ? ""
    : `
    <div class="card you-card">
      <div class="avatar" style="width:44px;height:44px;font-size:16px;background:${me.color}">${esc(me.initials)}</div>
      <div class="flex1">
        <div class="label">You are playing as</div>
        <div class="name ellipsis">${esc(me.name)}</div>
        <div class="meta">${esc(me.faction)} · ${esc(me.dispo)}</div>
      </div>
      <button class="pill-btn" data-action="pick-self">Change</button>
    </div>`;

  const cancelBtn = state.pickingSelf
    ? `<button class="text-btn" data-action="cancel-pick-self">Cancel</button>`
    : `<button class="text-btn" data-action="export-notes">Export notes</button>`;

  return `
    <div class="header">
      <div class="eyebrow">Málaga Open · 40K</div>
      <h1>The Emperor's Tarot</h1>
      <div class="subtitle">20 players · 2000 pts · Force Disposition</div>
    </div>
    ${dispoStatsHTML()}
    ${youCard}
    <div class="roster-title-row">
      <div class="roster-title">${state.pickingSelf ? "Who are you?" : "Choose your opponent"}</div>
      ${cancelBtn}
    </div>
    <div class="search-box">
      ${SEARCH_ICON}
      <input id="search" type="text" placeholder="Search player, faction, disposition" value="${esc(state.search)}">
    </div>
    <div class="card player-list" id="player-list">
      ${filteredRoster().map(playerRowHTML).join("")}
    </div>`;
}

function matchupHTML() {
  const me = decorate(PLAYERS.find((p) => p.id === state.meId) || PLAYERS[0]);
  const opp = decorate(PLAYERS.find((p) => p.id === state.oppId));
  const meSlug = slug(me.dispo);
  const oppSlug = slug(opp.dispo);
  const meMission = MISSION_MATRIX[me.dispo][opp.dispo];
  const oppMission = MISSION_MATRIX[opp.dispo][me.dispo];
  const meImg = missionImgSources(meSlug, slug(meMission));
  const oppImg = missionImgSources(oppSlug, slug(oppMission));

  const unitRows = opp.list
    .map(
      (row) => `
      <div class="unit-row">
        <div class="qty">${row.qty}x</div>
        <div class="flex1">
          <div class="name">${esc(row.name)}</div>
          <div class="gear">${esc(row.gear)}</div>
        </div>
        ${SHOW_POINTS ? `<div class="pts">${row.pts}</div>` : ""}
      </div>`
    )
    .join("");

  const maps = [1, 2, 3]
    .map((i) => {
      const { src, fallbacks } = layoutImgSources(meSlug, oppSlug, i);
      return `
      <div class="card map-card">
        <div class="map-img">${imgTag(src, fallbacks, "Terrain layout " + i)}</div>
        <div class="map-meta">
          <div>
            <div class="layout">Layout ${i}</div>
            <div class="sub">${esc(me.dispo)} vs ${esc(opp.dispo)}</div>
          </div>
          <div class="map-badge">Map ${i}</div>
        </div>
      </div>`;
    })
    .join("");

  return `
    <div class="back-row">
      <button class="back-btn" data-action="back">${CHEVRON_BACK} Players</button>
    </div>

    <div class="card vs-card">
      <div class="vs-grid">
        <div class="vs-side">
          <div class="avatar" style="background:${me.color}">${esc(me.initials)}</div>
          <div style="min-width:0">
            <div class="name ellipsis">${esc(me.name)}</div>
            <div class="faction">${esc(me.faction)}</div>
          </div>
        </div>
        <div class="vs-label">VS</div>
        <div class="vs-side">
          <div class="avatar" style="background:${opp.color}">${esc(opp.initials)}</div>
          <div style="min-width:0">
            <div class="name ellipsis">${esc(opp.name)}</div>
            <div class="faction">${esc(opp.faction)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-header">Opponent's army</div>
    <div class="card army-card">
      <div class="army-head">
        <div class="army-head-row">
          <div>
            <div class="faction">${esc(opp.faction)}</div>
            <div class="detachment">${esc(opp.summary.detachment)}</div>
          </div>
          <div class="dispo-pill" style="color:${opp.dispoColor};background:${opp.dispoBg}">${dispoIcon(opp.dispo, 14)}${esc(opp.dispo)}</div>
        </div>
      </div>
      <button class="list-toggle" data-action="toggle-list">
        <span>${state.listOpen ? "Hide full list" : "Show full list"}</span>
        ${chevronDown(ACCENT, state.listOpen)}
      </button>
      ${state.listOpen ? `<div class="army-list">${unitRows}</div>` : ""}
    </div>

    <div class="section-header">Primary missions</div>
    <div class="card missions-card">
      <div class="mission-row divided" data-action="toggle-me-mission">
        <div class="icon">${dispoIcon(me.dispo, 34)}</div>
        <div class="flex1">
          <div class="mission-name">${esc(meMission)}</div>
          <div class="dispo-name" style="color:${me.dispoColor}">${esc(me.dispo)}</div>
          <div class="who">You · ${esc(me.name)}</div>
        </div>
        ${chevronDown("#C7C7CC", state.meMissionOpen)}
      </div>
      ${state.meMissionOpen ? `<div class="mission-img divided">${imgTag(meImg.src, meImg.fallbacks, meMission + " card", 12)}</div>` : ""}
      <div class="mission-row" data-action="toggle-opp-mission">
        <div class="icon">${dispoIcon(opp.dispo, 34)}</div>
        <div class="flex1">
          <div class="mission-name">${esc(oppMission)}</div>
          <div class="dispo-name" style="color:${opp.dispoColor}">${esc(opp.dispo)}</div>
          <div class="who">Opponent · ${esc(opp.name)}</div>
        </div>
        ${chevronDown("#C7C7CC", state.oppMissionOpen)}
      </div>
      ${state.oppMissionOpen ? `<div class="mission-img">${imgTag(oppImg.src, oppImg.fallbacks, oppMission + " card", 12)}</div>` : ""}
    </div>

    <div class="section-header">Notes · ${esc(opp.name)}</div>
    <div class="card notes-card">
      <div class="notes-field">
        <div class="notes-label">Macro</div>
        <textarea data-note-field="macro" placeholder="Game plan, tempo, scoring…" rows="2">${esc(getNote(opp.id).macro)}</textarea>
      </div>
      <div class="notes-field divided">
        <div class="notes-label">Key units / strats</div>
        <textarea data-note-field="units" placeholder="Threats, targets, stratagems to expect…" rows="2">${esc(getNote(opp.id).units)}</textarea>
      </div>
    </div>

    <div class="section-header">Possible maps · ${esc(opp.dispo)}</div>
    <div class="maps-grid">${maps}</div>
    <div class="credit">Official 11th-edition terrain layouts from <a href="https://gdmissions.app/11th/layouts" target="_blank" rel="noopener">gdmissions.app</a> (requires internet).</div>`;
}

function render() {
  const opp = PLAYERS.find((p) => p.id === state.oppId);
  const showMatchup = !state.pickingSelf && !!opp;
  app.innerHTML = `<div class="page"><div class="container">${showMatchup ? matchupHTML() : rosterHTML()}</div></div>`;

  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", (e) => {
      state.search = e.target.value;
      const list = document.getElementById("player-list");
      if (list) list.innerHTML = filteredRoster().map(playerRowHTML).join("");
    });
  }

  for (const notesEl of document.querySelectorAll("[data-note-field]")) {
    const autosize = () => {
      notesEl.style.height = "auto";
      notesEl.style.height = notesEl.scrollHeight + "px";
    };
    autosize();
    notesEl.addEventListener("input", () => {
      saveNote(state.oppId, notesEl.dataset.noteField, notesEl.value);
      autosize();
    });
  }
}

function selectPlayer(id) {
  if (state.pickingSelf) {
    state.meId = id;
    state.pickingSelf = false;
    if (state.oppId === id) state.oppId = null;
    persist();
  } else {
    state.oppId = id;
    state.listOpen = false;
    state.meMissionOpen = false;
    state.oppMissionOpen = false;
    persist();
    window.scrollTo(0, 0);
  }
  render();
}

app.addEventListener("click", (e) => {
  const row = e.target.closest("[data-select]");
  if (row) return selectPlayer(row.dataset.select);

  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;
  switch (actionEl.dataset.action) {
    case "pick-self":
      state.pickingSelf = true;
      state.search = "";
      render();
      break;
    case "export-notes":
      exportNotesPDF();
      break;
    case "cancel-pick-self":
      state.pickingSelf = false;
      state.search = "";
      render();
      break;
    case "back":
      state.oppId = null;
      state.search = "";
      persist();
      render();
      break;
    case "toggle-list":
      state.listOpen = !state.listOpen;
      render();
      break;
    case "toggle-me-mission":
      state.meMissionOpen = !state.meMissionOpen;
      render();
      break;
    case "toggle-opp-mission":
      state.oppMissionOpen = !state.oppMissionOpen;
      render();
      break;
  }
});

render();
