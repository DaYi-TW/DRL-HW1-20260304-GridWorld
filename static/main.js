/**
 * main.js – GridWorld frontend state machine
 *
 * States: EMPTY → SET_START → SET_GOAL → SET_OBSTACLES → DONE
 */

// ─── State ─────────────────────────────────────────────────────────────────
let n = 7;
let phase = "EMPTY";   // EMPTY | SET_START | SET_GOAL | SET_OBSTACLES | DONE
let startCell = null;  // [r, c]
let goalCell  = null;  // [r, c]
let obstacles = [];    // [[r,c], ...]
let maxObstacles = 0;

let policy = {};   // { "r,c": arrow }
let values = {};   // { "r,c": float }

// ─── DOM refs ──────────────────────────────────────────────────────────────
const gridContainer = document.getElementById("grid-container");
const statusBar     = document.getElementById("status-bar");
const statusIcon    = document.getElementById("status-icon");
const statusText    = document.getElementById("status-text");
const hw2Panel      = document.getElementById("hw2-panel");
const infoPanel     = document.getElementById("info-panel");
const infoN         = document.getElementById("info-n");
const infoObs       = document.getElementById("info-obs");

const btnBuild    = document.getElementById("btn-build");
const btnReset    = document.getElementById("btn-reset");
const btnGenerate = document.getElementById("btn-generate");
const toggleValues = document.getElementById("toggle-values");
const toggleArrows = document.getElementById("toggle-arrows");

// ─── Build grid ────────────────────────────────────────────────────────────
function buildGrid() {
  n = parseInt(document.getElementById("grid-size").value, 10);
  maxObstacles = n - 2;

  // Reset state
  phase = "SET_START";
  startCell = null;
  goalCell  = null;
  obstacles = [];
  policy = {};
  values = {};
  hw2Panel.style.display = "none";
  infoPanel.style.display = "block";
  infoN.textContent = `${n}×${n}`;
  infoObs.textContent = `0 / ${maxObstacles}`;

  // Render table
  const table = document.createElement("table");
  for (let r = 0; r < n; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < n; c++) {
      const td = document.createElement("td");
      td.className = "grid-cell";
      td.id = `cell-${r}-${c}`;
      td.dataset.row = r;
      td.dataset.col = c;

      td.innerHTML = `
        <span class="cell-label"></span>
        <span class="cell-arrow" style="opacity:0"></span>
        <span class="cell-value" style="opacity:0"></span>`;

      td.addEventListener("click", onCellClick);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  gridContainer.innerHTML = "";
  gridContainer.appendChild(table);
  gridContainer.classList.remove("grid-placeholder");
  gridContainer.style.cssText = "display:flex;justify-content:center;padding:1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:10px;";

  statusBar.style.display = "flex";
  updateStatus();
}

// ─── Cell click handler ────────────────────────────────────────────────────
function onCellClick(e) {
  const td  = e.currentTarget;
  const r   = parseInt(td.dataset.row, 10);
  const c   = parseInt(td.dataset.col, 10);
  const key = `${r},${c}`;

  if (phase === "EMPTY" || phase === "DONE") return;

  // Prevent clicking already occupied cells (except DONE reset)
  if (td.classList.contains("obstacle")) return;
  if (phase !== "SET_START" && td.classList.contains("start")) return;
  if (phase !== "SET_GOAL"  && td.classList.contains("goal"))  return;

  if (phase === "SET_START") {
    startCell = [r, c];
    setCellState(td, "start", "S");
    phase = "SET_GOAL";

  } else if (phase === "SET_GOAL") {
    if (td.classList.contains("start")) return;
    goalCell = [r, c];
    setCellState(td, "goal", "G");
    phase = obstacles.length < maxObstacles ? "SET_OBSTACLES" : "DONE";

  } else if (phase === "SET_OBSTACLES") {
    if (td.classList.contains("start") || td.classList.contains("goal")) return;
    obstacles.push([r, c]);
    setCellState(td, "obstacle", "X");
    infoObs.textContent = `${obstacles.length} / ${maxObstacles}`;
    if (obstacles.length >= maxObstacles) {
      phase = "DONE";
      hw2Panel.style.display = "flex";
      hw2Panel.style.flexDirection = "column";
      hw2Panel.style.gap = ".7rem";
    }
  }

  updateStatus();
}

// ─── Set visual state of a cell ────────────────────────────────────────────
function setCellState(td, cls, label) {
  td.classList.remove("start", "goal", "obstacle");
  if (cls) td.classList.add(cls);
  td.querySelector(".cell-label").textContent = label || "";
}

// ─── Status bar update ──────────────────────────────────────────────────────
function updateStatus() {
  const remaining = maxObstacles - obstacles.length;
  const map = {
    SET_START:     ["🟢", `請點擊一個格子設定起點 S`],
    SET_GOAL:      ["🔴", `請點擊一個格子設定終點 G`],
    SET_OBSTACLES: ["⬜", `請設定障礙物（剩餘 ${remaining} 個）`],
    DONE:          ["✅", `設定完成！可點擊「生成隨機策略 + V(s)」`],
  };
  const [icon, text] = map[phase] || ["ℹ️", ""];
  statusIcon.textContent = icon;
  statusText.textContent = text;
}

// ─── Generate policy + V(s) ────────────────────────────────────────────────
async function generatePolicy() {
  if (!startCell || !goalCell) return;

  btnGenerate.disabled = true;
  btnGenerate.textContent = "計算中…";

  const body = {
    n,
    start: startCell,
    goal:  goalCell,
    obstacles,
  };

  try {
    const res  = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    policy = data.policy;
    values = data.values;
    renderPolicyAndValues();
  } catch (err) {
    console.error(err);
  } finally {
    btnGenerate.disabled = false;
    btnGenerate.textContent = "重新生成";
  }
}

// ─── Render arrows and V(s) ────────────────────────────────────────────────
function renderPolicyAndValues() {
  const showVals   = toggleValues.checked;
  const showArrows = toggleArrows.checked;

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r},${c}`;
      const td  = document.getElementById(`cell-${r}-${c}`);
      if (!td) continue;

      const arrowEl = td.querySelector(".cell-arrow");
      const valueEl = td.querySelector(".cell-value");

      // Arrow
      if (policy[key]) {
        arrowEl.textContent = policy[key];
        arrowEl.style.opacity = showArrows ? "1" : "0";
      } else {
        arrowEl.textContent = "";
        arrowEl.style.opacity = "0";
      }

      // Value
      if (values[key] !== undefined && !td.classList.contains("obstacle")) {
        valueEl.textContent = values[key].toFixed(2);
        valueEl.style.opacity = showVals ? "1" : "0";
      } else {
        valueEl.textContent = "";
        valueEl.style.opacity = "0";
      }
    }
  }
}

// ─── Toggle handlers ───────────────────────────────────────────────────────
function applyToggles() {
  const showVals   = toggleValues.checked;
  const showArrows = toggleArrows.checked;

  document.querySelectorAll(".cell-value").forEach(el => {
    if (el.textContent !== "") el.style.opacity = showVals ? "1" : "0";
  });
  document.querySelectorAll(".cell-arrow").forEach(el => {
    if (el.textContent !== "") el.style.opacity = showArrows ? "1" : "0";
  });
}

// ─── Full reset ────────────────────────────────────────────────────────────
function fullReset() {
  phase = "EMPTY";
  startCell = null;
  goalCell  = null;
  obstacles = [];
  policy = {};
  values = {};

  gridContainer.innerHTML = `
    <div class="placeholder-text">
      <span class="ph-icon">⊞</span>
      <p>請選擇網格大小，然後點擊「建立網格」</p>
    </div>`;
  gridContainer.className = "grid-placeholder";
  gridContainer.style.cssText = "";

  statusBar.style.display = "none";
  hw2Panel.style.display  = "none";
  infoPanel.style.display = "none";

  fetch("/api/reset", { method: "POST" }).catch(() => {});
}

// ─── Event listeners ───────────────────────────────────────────────────────
btnBuild.addEventListener("click", buildGrid);
btnReset.addEventListener("click", fullReset);
btnGenerate.addEventListener("click", generatePolicy);
toggleValues.addEventListener("change", applyToggles);
toggleArrows.addEventListener("change", applyToggles);
