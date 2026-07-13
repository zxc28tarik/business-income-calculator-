import { initializeScenarioInputs } from "./core/sector-schema.js";
import { SECTORS, getSector } from "./sectors/registry.js";

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 });
const STORAGE_KEY = "business-income-calculator:platform:v0.2";
const OLD_CAFE_KEY = "business-income-calculator:cafe:v0.1";

let state = loadState();
let lastRendered = null;

renderSectorOptions();
renderSectorShell();
attachEvents();
render();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.activeSectorId && saved?.sectors) return normalizeState(saved);
  } catch {
    // Bozuk yerel veri varsayılanlarla değiştirilir.
  }

  const fresh = createDefaultState();
  try {
    const oldCafe = JSON.parse(localStorage.getItem(OLD_CAFE_KEY));
    if (oldCafe?.baseInputs) {
      const cafe = getSector("cafe_restaurant");
      fresh.sectors.cafe_restaurant = {
        activeScenario: oldCafe.activeScenario || "expected",
        scenarioInputs: initializeScenarioInputs(cafe, oldCafe.baseInputs),
      };
    }
  } catch {
    // Eski veri yoksa sessizce devam edilir.
  }
  return fresh;
}

function createDefaultState() {
  return {
    activeSectorId: SECTORS[0].id,
    sectors: Object.fromEntries(SECTORS.map((sector) => [sector.id, {
      activeScenario: "expected",
      scenarioInputs: initializeScenarioInputs(sector),
    }])),
  };
}

function normalizeState(raw) {
  const next = createDefaultState();
  next.activeSectorId = SECTORS.some((sector) => sector.id === raw.activeSectorId)
    ? raw.activeSectorId
    : next.activeSectorId;

  for (const sector of SECTORS) {
    const savedSector = raw.sectors?.[sector.id];
    if (!savedSector) continue;
    const scenarioInputs = {};
    for (const scenarioId of Object.keys(sector.scenarios)) {
      const source = savedSector.scenarioInputs?.[scenarioId]
        ?? sector.applyScenario(sector.defaultInputs, scenarioId);
      scenarioInputs[scenarioId] = sector.normalizeInputs(source);
    }
    next.sectors[sector.id] = {
      activeScenario: sector.scenarios[savedSector.activeScenario] ? savedSector.activeScenario : "expected",
      scenarioInputs,
    };
  }
  return next;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentSector() {
  return getSector(state.activeSectorId);
}

function currentSectorState() {
  return state.sectors[state.activeSectorId];
}

function currentInputs() {
  const sectorState = currentSectorState();
  return sectorState.scenarioInputs[sectorState.activeScenario];
}

function renderSectorOptions() {
  document.querySelector("#sectorSelect").innerHTML = SECTORS
    .map((sector) => `<option value="${sector.id}">${escapeHtml(sector.name)}</option>`)
    .join("");
}

function renderSectorShell() {
  const sector = currentSector();
  document.querySelector("#sectorSelect").value = sector.id;
  document.querySelector("#pageTitle").textContent = `${sector.name} Finansal Fizibilite`;
  document.querySelector("#pageSubtitle").textContent = sector.description;
  document.title = `Business Income Calculator · ${sector.name}`;
  document.querySelector("#sectorSummary").innerHTML = `
    <p class="eyebrow">${escapeHtml(sector.family)}</p>
    <strong>${escapeHtml(sector.name)}</strong>
    <span>${escapeHtml(sector.version)} · ${sector.status === "simulation" ? "Simülasyon modu" : escapeHtml(sector.status)}</span>
  `;
  renderScenarioButtons();
  renderForm();
}

function renderScenarioButtons() {
  const sector = currentSector();
  const sectorState = currentSectorState();
  document.querySelector("#scenarioSwitcher").innerHTML = Object.entries(sector.scenarios).map(([id, preset]) =>
    `<button type="button" class="scenario-button ${sectorState.activeScenario === id ? "active" : ""}" data-scenario="${id}">${escapeHtml(preset.label)}</button>`,
  ).join("");
}

function renderForm() {
  const sector = currentSector();
  document.querySelector("#formSections").innerHTML = sector.formSections.map((section) => `
    <details class="form-section" ${section.open ? "open" : ""}>
      <summary>${escapeHtml(section.title)}</summary>
      ${section.note ? `<p class="section-note">${escapeHtml(section.note)}</p>` : ""}
      <div class="form-fields">${section.fields.map(renderField).join("")}</div>
    </details>
  `).join("");
}

function renderField(field) {
  if (field.type === "select") {
    return `<div class="field ${field.full ? "full" : ""}">
      <label for="${field.key}">${escapeHtml(field.label)}</label>
      <select id="${field.key}" data-key="${field.key}">
        ${field.options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}
      </select>
      ${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}
    </div>`;
  }

  const isRate = field.type === "rate";
  const hint = field.hint ?? (isRate ? "Yüzde olarak girin (ör. 25 = %25)" : "");
  return `<div class="field ${field.full ? "full" : ""}">
    <label for="${field.key}">${escapeHtml(field.label)}</label>
    <input id="${field.key}" data-key="${field.key}" data-rate="${isRate}" data-negative="${Boolean(field.allowNegative)}" type="number" step="${field.step ?? 1}" />
    ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
  </div>`;
}

function attachEvents() {
  document.querySelector("#sectorSelect").addEventListener("change", (event) => {
    state.activeSectorId = event.target.value;
    saveState();
    renderSectorShell();
    render();
  });

  document.querySelector("#formSections").addEventListener("input", (event) => {
    const target = event.target;
    const key = target.dataset.key;
    if (!key) return;

    let value = target.value;
    if (target.tagName !== "SELECT") {
      value = Number(value);
      if (target.dataset.rate === "true") value /= 100;
      if (target.dataset.negative !== "true") value = Math.max(0, value || 0);
    }

    const sector = currentSector();
    const sectorState = currentSectorState();
    const scenarioId = sectorState.activeScenario;
    sectorState.scenarioInputs[scenarioId] = sector.normalizeInputs({
      ...sectorState.scenarioInputs[scenarioId],
      [key]: value,
    });
    saveState();
    render();
  });

  document.querySelector("#scenarioSwitcher").addEventListener("click", (event) => {
    const scenarioId = event.target.dataset.scenario;
    if (!scenarioId || !currentSector().scenarios[scenarioId]) return;
    currentSectorState().activeScenario = scenarioId;
    saveState();
    renderScenarioButtons();
    render();
  });

  document.querySelector("#resetButton").addEventListener("click", () => {
    const sector = currentSector();
    state.sectors[sector.id] = {
      activeScenario: "expected",
      scenarioInputs: initializeScenarioInputs(sector),
    };
    saveState();
    renderSectorShell();
    render();
  });

  document.querySelector("#exportCsvButton").addEventListener("click", exportCsv);
  document.querySelector("#printButton").addEventListener("click", () => window.print());
}

function syncInputs(inputs) {
  document.querySelectorAll("[data-key]").forEach((element) => {
    const key = element.dataset.key;
    if (!(key in inputs)) return;
    if (element.tagName === "SELECT") element.value = inputs[key];
    else element.value = element.dataset.rate === "true" ? round(inputs[key] * 100, 2) : round(inputs[key], 2);
  });
}

function render() {
  const sector = currentSector();
  const sectorState = currentSectorState();
  const inputs = currentInputs();
  const result = sector.calculateModel(inputs);
  const presentation = sector.buildPresentation(result);
  const scenarios = sector.calculateScenarioComparison(sectorState.scenarioInputs);
  syncInputs(inputs);
  renderWarnings(result.warnings);
  renderKPIs(presentation.kpis);
  renderKeySplit(presentation.keySplit);
  renderWaterfall(result.waterfall);
  renderScenarioTable(sector, scenarios);
  renderCashFlow(result.cashFlow.rows);
  renderBreakdown(presentation.breakdown);
  lastRendered = { sector, inputs, result, presentation, scenarios };
}

function renderWarnings(warnings) {
  document.querySelector("#warnings").innerHTML = warnings
    .map((item) => `<div class="warning ${item.severity}">${escapeHtml(item.message)}</div>`)
    .join("");
}

function renderKPIs(cards) {
  document.querySelector("#kpiGrid").innerHTML = cards.map((card) => `
    <article class="kpi-card ${card.negative ? "negative" : ""}">
      <div class="label">${escapeHtml(card.label)}</div>
      <div class="value">${formatValue(card.value, card.format, card)}</div>
      <div class="note">${escapeHtml(card.note ?? "")}</div>
    </article>
  `).join("");
}

function renderKeySplit(rows) {
  document.querySelector("#keySplit").innerHTML = rows
    .map((row) => `<div class="split-row"><span>${escapeHtml(row.label)}</span><span>${formatValue(row.value, row.format ?? "money", row)}</span></div>`)
    .join("");
}

function renderWaterfall(rows) {
  const max = Math.max(...rows.map((item) => Math.abs(item.amount)), 1);
  document.querySelector("#waterfall").innerHTML = rows.map((item) => `
    <div class="waterfall-row">
      <div class="waterfall-label"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.subtext ?? "")}</small></div>
      <div class="bar-track"><div class="bar ${item.kind}" style="width:${Math.max(1, Math.abs(item.amount) / max * 100)}%"></div></div>
      <div class="waterfall-value">${formatValue(item.amount, "money")}</div>
    </div>
  `).join("");
}

function renderScenarioTable(sector, scenarios) {
  const presentations = scenarios.map((scenario) => ({
    ...scenario,
    metrics: sector.buildPresentation(scenario.result).scenarioMetrics,
  }));
  const template = presentations[0]?.metrics ?? [];
  document.querySelector("#scenarioTable").innerHTML = `
    <thead><tr><th>Gösterge</th>${presentations.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("")}</tr></thead>
    <tbody>${template.map((metric) => `
      <tr><td>${escapeHtml(metric.label)}</td>${presentations.map((item) => {
        const value = item.metrics.find((candidate) => candidate.id === metric.id) ?? metric;
        return `<td>${formatValue(value.value, value.format, value)}</td>`;
      }).join("")}</tr>
    `).join("")}</tbody>
  `;
}

function renderCashFlow(rows) {
  const hasSubscriberData = rows.some((row) => Number.isFinite(Number(row.endingSubscribers)));
  document.querySelector("#cashFlowTable").innerHTML = `
    <thead><tr><th>Ay</th>${hasSubscriberData ? "<th>Aktif abone</th>" : ""}<th>Tahsilat</th><th>Finansman</th><th>Destek</th><th>Kurulum</th><th>Değişken ödeme</th><th>Sabit</th><th>Paydaş</th><th>Vergi</th><th>Kredi</th><th>Dönem sonu</th></tr></thead>
    <tbody>${rows.map((row) => `<tr>
      <td>${row.month}</td>${hasSubscriberData ? `<td>${formatValue(row.endingSubscribers, "number")}</td>` : ""}<td>${formatValue(row.collections, "money")}</td><td>${formatValue(row.financing, "money")}</td>
      <td>${formatValue(row.support, "money")}</td><td>${formatValue(row.setupCosts, "money")}</td><td>${formatValue(row.variableCostsPaid, "money")}</td>
      <td>${formatValue(row.fixedCosts, "money")}</td><td>${formatValue(row.stakeholderPayouts, "money")}</td><td>${formatValue(row.estimatedTax, "money")}</td>
      <td>${formatValue(row.loanPayment, "money")}</td><td>${formatValue(row.cashEnd, "money")}</td>
    </tr>`).join("")}</tbody>
  `;
}

function renderBreakdown(groups) {
  document.querySelector("#breakdown").innerHTML = groups.map((group) => `
    <div class="breakdown-group">
      <h3>${escapeHtml(group.title)}</h3>
      ${group.rows.map((rawRow) => {
        const [label, value, format = "money"] = rawRow;
        return `<div class="breakdown-row"><span>${escapeHtml(label)}</span><span>${formatValue(value, format)}</span></div>`;
      }).join("")}
    </div>
  `).join("");
}

function exportCsv() {
  if (!lastRendered) return;
  const { sector, result, presentation } = lastRendered;
  const rows = [
    ["Business Income Calculator", sector.name],
    ["Senaryo", currentSector().scenarios[currentSectorState().activeScenario].label],
    ["Oluşturma tarihi", new Date().toLocaleString("tr-TR")],
    [],
  ];

  for (const group of presentation.breakdown) {
    rows.push([group.title]);
    for (const [label, value, format = "money"] of group.rows) {
      rows.push([label, exportValue(value, format)]);
    }
    rows.push([]);
  }

  rows.push(["12 aylık nakit akışı"]);
  const hasSubscriberData = result.cashFlow.rows.some((row) => Number.isFinite(Number(row.endingSubscribers)));
  rows.push(["Ay", ...(hasSubscriberData ? ["Aktif abone"] : []), "Tahsilat", "Finansman", "Destek", "Kurulum", "Değişken ödeme", "Sabit", "Paydaş", "Vergi", "Kredi", "Dönem sonu"]);
  for (const row of result.cashFlow.rows) {
    rows.push([row.month, ...(hasSubscriberData ? [row.endingSubscribers] : []), row.collections, row.financing, row.support, row.setupCosts, row.variableCostsPaid, row.fixedCosts, row.stakeholderPayouts, row.estimatedTax, row.loanPayment, row.cashEnd]);
  }

  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sector.id}-${currentSectorState().activeScenario}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportValue(value, format) {
  if (value == null || !Number.isFinite(Number(value))) return "";
  if (format === "percent") return Number(value);
  return Number(value);
}

function csvCell(value) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

function formatValue(value, format = "number", options = {}) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const numeric = Number(value);
  switch (format) {
    case "money": return currency.format(numeric);
    case "percent": return percent.format(numeric);
    case "numberSuffix": return `${number.format(numeric)}${escapeHtml(options.suffix ?? "")}`;
    case "multiple": return `${number.format(numeric)}x`;
    case "months": return `${number.format(numeric)} ay`;
    default: return number.format(numeric);
  }
}

function round(value, digits = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  const power = 10 ** digits;
  return Math.round((parsed + Number.EPSILON) * power) / power;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
