import {
  cloneInputValue,
  coerceFieldValue,
  createTableRow,
  initializeScenarioInputs,
  updateTableCell,
} from "./core/sector-schema.js";
import { SECTORS, getSector } from "./sectors/registry.js";
import { csvCell, escapeHtml, exportValue } from "./ui/formatters.js";
import {
  findFieldDefinition,
  renderFormHtml,
  syncFormInputs,
  syncFormVisibility,
} from "./ui/form-view.js";
import {
  DEFAULT_VIEW_MODE,
  normalizeViewMode,
  VIEW_MODE_STORAGE_KEY,
} from "./ui/view-mode.js";
import {
  renderBreakdown,
  renderCashFlow,
  renderKeySplit,
  renderKPIs,
  renderScenarioTable,
  renderWarnings,
  renderWaterfall,
  resolveCashFlowColumns,
} from "./ui/results-view.js";
import { exportFinancialReport } from "./report/report-controller.js";
import { createTrackingController } from "./tracking/tracking-controller.js";
import { createPortfolioController } from "./portfolio/portfolio-controller.js";
import { buildProjectFinancialSummary } from "./portfolio/portfolio-summary.js";

const STORAGE_KEY = "business-income-calculator:platform:v0.2";
const PORTFOLIO_STORAGE_KEY = "business-income-calculator:portfolio:v0.1";
const TRACKING_STORAGE_PREFIX = "business-income-calculator:tracking:v0.1";
const OLD_CAFE_KEY = "business-income-calculator:cafe:v0.1";
const elements = {
  projectSelect: document.querySelector("#projectSelect"),
  projectNewButton: document.querySelector("#projectNewButton"),
  projectRenameButton: document.querySelector("#projectRenameButton"),
  projectDuplicateButton: document.querySelector("#projectDuplicateButton"),
  portfolioButton: document.querySelector("#portfolioButton"),
  portfolioPanel: document.querySelector("#portfolioPanel"),
  portfolioTable: document.querySelector("#portfolioTable"),
  portfolioDeleteButton: document.querySelector("#portfolioDeleteButton"),
  portfolioCloseButton: document.querySelector("#portfolioCloseButton"),
  backupExportButton: document.querySelector("#backupExportButton"),
  backupImportButton: document.querySelector("#backupImportButton"),
  backupImportInput: document.querySelector("#backupImportInput"),
  recordMenuButton: document.querySelector("#recordMenuButton"),
  recordMenu: document.querySelector("#recordMenu"),
  exportMenuButton: document.querySelector("#exportMenuButton"),
  exportMenu: document.querySelector("#exportMenu"),
  exportMenuReportButton: document.querySelector("#exportMenuReportButton"),
  dataMenuButton: document.querySelector("#dataMenuButton"),
  dataMenu: document.querySelector("#dataMenu"),
  moreMenuButton: document.querySelector("#moreMenuButton"),
  moreMenu: document.querySelector("#moreMenu"),
  sectorSelect: document.querySelector("#sectorSelect"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  sectorSummary: document.querySelector("#sectorSummary"),
  scenarioSwitcher: document.querySelector("#scenarioSwitcher"),
  viewModeSwitcher: document.querySelector("#viewModeSwitcher"),
  viewModeNote: document.querySelector("#viewModeNote"),
  autosaveStatus: document.querySelector("#autosaveStatus"),
  formSections: document.querySelector("#formSections"),
  resetButton: document.querySelector("#resetButton"),
  resetDialog: document.querySelector("#resetDialog"),
  resetSectorName: document.querySelector("#resetSectorName"),
  resetScenarioName: document.querySelector("#resetScenarioName"),
  resetCancelButton: document.querySelector("#resetCancelButton"),
  resetConfirmButton: document.querySelector("#resetConfirmButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  reportButton: document.querySelector("#reportButton"),
  trackingButton: document.querySelector("#trackingButton"),
  trackingPanel: document.querySelector("#trackingPanel"),
  trackingSummary: document.querySelector("#trackingSummary"),
  trackingTable: document.querySelector("#trackingTable"),
  trackingTrends: document.querySelector("#trackingTrends"),
  trackingCloseButton: document.querySelector("#trackingCloseButton"),
  trackingCsvButton: document.querySelector("#trackingCsvButton"),
  trackingReportButton: document.querySelector("#trackingReportButton"),
  printButton: document.querySelector("#printButton"),
  warnings: document.querySelector("#warnings"),
  kpiGrid: document.querySelector("#kpiGrid"),
  keySplit: document.querySelector("#keySplit"),
  waterfall: document.querySelector("#waterfall"),
  scenarioTable: document.querySelector("#scenarioTable"),
  cashFlowTable: document.querySelector("#cashFlowTable"),
  breakdown: document.querySelector("#breakdown"),
};

let state = loadState();
let viewMode = loadViewMode();
let lastRendered = null;
let portfolioController = null;
let autosaveTimer = null;
let resetDialogTrigger = null;
portfolioController = createPortfolioController({
  elements: {
    projectSelect: elements.projectSelect,
    newButton: elements.projectNewButton,
    renameButton: elements.projectRenameButton,
    duplicateButton: elements.projectDuplicateButton,
    deleteButton: elements.portfolioDeleteButton,
    toggleButton: elements.portfolioButton,
    panel: elements.portfolioPanel,
    table: elements.portfolioTable,
    closeButton: elements.portfolioCloseButton,
    exportButton: elements.backupExportButton,
    importButton: elements.backupImportButton,
    importInput: elements.backupImportInput,
  },
  storageKey: PORTFOLIO_STORAGE_KEY,
  trackingPrefix: TRACKING_STORAGE_PREFIX,
  backupScope: "platform",
  appVersion: "0.23.0",
  initialWorkspace: state,
  createWorkspace: createDefaultState,
  normalizeWorkspace: normalizeState,
  getWorkspace: () => state,
  setWorkspace: (workspace) => {
    state = normalizeState(workspace);
    persistLegacyState();
    renderSectorShell();
    render();
  },
  summarizeWorkspace,
});
state = portfolioController.getActiveWorkspace();
persistLegacyState();
const trackingController = createTrackingController({
  elements: {
    toggleButton: elements.trackingButton,
    panel: elements.trackingPanel,
    summary: elements.trackingSummary,
    table: elements.trackingTable,
    trends: elements.trackingTrends,
    closeButton: elements.trackingCloseButton,
    csvButton: elements.trackingCsvButton,
    reportButton: elements.trackingReportButton,
  },
  getContext: () => lastRendered,
  getProjectId: () => portfolioController.getActiveProjectId(),
  storagePrefix: TRACKING_STORAGE_PREFIX,
});

renderSectorOptions();
renderSectorShell();
attachEvents();
render();

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
        ?? sector.applyScenario(cloneInputValue(sector.defaultInputs), scenarioId);
      scenarioInputs[scenarioId] = sector.normalizeInputs(cloneInputValue(source));
    }
    next.sectors[sector.id] = {
      activeScenario: sector.scenarios[savedSector.activeScenario] ? savedSector.activeScenario : "expected",
      scenarioInputs,
    };
  }
  return next;
}

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

function loadViewMode() {
  try {
    return normalizeViewMode(localStorage.getItem(VIEW_MODE_STORAGE_KEY));
  } catch {
    return DEFAULT_VIEW_MODE;
  }
}

function saveViewMode() {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  } catch {
    // Görünüm tercihi kaydedilemese de hesaplama çalışmaya devam eder.
  }
}

function persistLegacyState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setAutosaveStatus(status) {
  const states = {
    saving: ["Kaydediliyor…", "saving"],
    saved: ["Kaydedildi", "saved"],
    error: ["Kaydedilemedi", "error"],
  };
  const [label, stateName] = states[status] ?? states.saved;
  elements.autosaveStatus.textContent = label;
  elements.autosaveStatus.dataset.state = stateName;
}

function saveState() {
  setAutosaveStatus("saving");
  if (autosaveTimer) clearTimeout(autosaveTimer);
  try {
    persistLegacyState();
    portfolioController?.syncActiveWorkspace();
    autosaveTimer = setTimeout(() => setAutosaveStatus("saved"), 350);
    return true;
  } catch {
    setAutosaveStatus("error");
    return false;
  }
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

function summarizeWorkspace(workspace) {
  const normalized = normalizeState(workspace);
  const sector = getSector(normalized.activeSectorId);
  const sectorState = normalized.sectors[sector.id];
  return buildProjectFinancialSummary({
    sector,
    scenarioId: sectorState.activeScenario,
    inputs: sectorState.scenarioInputs[sectorState.activeScenario],
  });
}

function renderSectorOptions() {
  elements.sectorSelect.innerHTML = SECTORS
    .map((sector) => `<option value="${sector.id}">${escapeHtml(sector.name)}</option>`)
    .join("");
}

function renderSectorShell() {
  const sector = currentSector();
  elements.sectorSelect.value = sector.id;
  elements.pageTitle.textContent = `${sector.name} Finansal Fizibilite`;
  elements.pageSubtitle.textContent = sector.description;
  document.title = `Business Income Calculator · ${sector.name}`;
  elements.sectorSummary.innerHTML = `
    <p class="eyebrow">${escapeHtml(sector.family)}</p>
    <strong>${escapeHtml(sector.name)}</strong>
    <span>${escapeHtml(sector.version)} · ${sector.status === "simulation" ? "Simülasyon modu" : escapeHtml(sector.status)}</span>
  `;
  renderScenarioButtons();
  renderViewModeControl();
  renderForm();
}

function renderScenarioButtons() {
  const sector = currentSector();
  const sectorState = currentSectorState();
  elements.scenarioSwitcher.innerHTML = Object.entries(sector.scenarios).map(([id, preset]) =>
    `<button type="button" class="scenario-button ${sectorState.activeScenario === id ? "active" : ""}" data-scenario="${id}">${escapeHtml(preset.label)}</button>`,
  ).join("");
}

function renderForm() {
  elements.formSections.innerHTML = renderFormHtml(currentSector(), currentInputs(), { viewMode });
}

function renderViewModeControl() {
  elements.viewModeSwitcher.querySelectorAll?.("[data-view-mode]").forEach((button) => {
    const active = button.dataset.viewMode === viewMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  elements.viewModeNote.textContent = viewMode === "advanced"
    ? "Bütün sektör ayrıntıları gösteriliyor."
    : "Yalnız temel varsayımlar gösteriliyor.";
}

function updateCurrentInputs(patch) {
  const sector = currentSector();
  const sectorState = currentSectorState();
  const scenarioId = sectorState.activeScenario;
  sectorState.scenarioInputs[scenarioId] = sector.normalizeInputs({
    ...cloneInputValue(sectorState.scenarioInputs[scenarioId]),
    ...cloneInputValue(patch),
  });
  saveState();
}

function handleFormInput(event) {
  const target = event.target;
  const tableKey = target.dataset.tableKey;
  if (tableKey) {
    const field = findFieldDefinition(currentSector(), tableKey);
    if (!field || field.type !== "table") return;
    const columnKey = target.dataset.columnKey;
    const column = field.columns.find((item) => item.key === columnKey);
    if (!column) return;
    let rawValue = target.value;
    if (column.type === "rate") rawValue = Number(rawValue) / 100;
    const rows = Array.isArray(currentInputs()[tableKey]) ? currentInputs()[tableKey] : [];
    updateCurrentInputs({
      [tableKey]: updateTableCell(
        rows,
        field,
        Number(target.dataset.rowIndex),
        columnKey,
        rawValue,
        target.checked,
      ),
    });
    render();
    return;
  }

  const key = target.dataset.key;
  if (!key) return;
  const field = findFieldDefinition(currentSector(), key);
  if (!field) return;
  let rawValue = target.value;
  if (field.type === "rate") rawValue = Number(rawValue) / 100;
  updateCurrentInputs({ [key]: coerceFieldValue(field, rawValue, target.checked) });
  render();
}

function handleTableAction(event) {
  const addKey = event.target.dataset.tableAdd;
  const removeKey = event.target.dataset.tableRemove;
  if (!addKey && !removeKey) return;

  const tableKey = addKey ?? removeKey;
  const field = findFieldDefinition(currentSector(), tableKey);
  if (!field || field.type !== "table") return;
  const rows = cloneInputValue(Array.isArray(currentInputs()[tableKey]) ? currentInputs()[tableKey] : []);

  if (addKey) {
    if (Number.isInteger(field.maxRows) && rows.length >= field.maxRows) return;
    rows.push(createTableRow(field));
  } else {
    const rowIndex = Number(event.target.dataset.rowIndex);
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) return;
    if (rows.length <= (field.minRows ?? 0)) return;
    rows.splice(rowIndex, 1);
  }

  updateCurrentInputs({ [tableKey]: rows });
  renderForm();
  render();
}

function actionMenus() {
  return [
    { trigger: elements.recordMenuButton, panel: elements.recordMenu },
    { trigger: elements.exportMenuButton, panel: elements.exportMenu },
    { trigger: elements.dataMenuButton, panel: elements.dataMenu },
    { trigger: elements.moreMenuButton, panel: elements.moreMenu },
  ];
}

function closeActionMenus({ returnFocus = false } = {}) {
  for (const { trigger, panel } of actionMenus()) {
    const wasOpen = !panel.hidden;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus && wasOpen) trigger.focus?.();
  }
}

function toggleActionMenu(selected) {
  const shouldOpen = selected.panel.hidden;
  closeActionMenus();
  if (!shouldOpen) return;
  selected.panel.hidden = false;
  selected.trigger.setAttribute("aria-expanded", "true");
  queueMicrotask(() => selected.panel.querySelector?.('[role="menuitem"]')?.focus?.());
}

function resetCurrentSector() {
  const sector = currentSector();
  state.sectors[sector.id] = {
    activeScenario: "expected",
    scenarioInputs: initializeScenarioInputs(sector),
  };
  saveState();
  renderSectorShell();
  render();
}

function openResetDialog() {
  const sector = currentSector();
  const scenarioId = currentSectorState().activeScenario;
  elements.resetSectorName.textContent = sector.name;
  elements.resetScenarioName.textContent = sector.scenarios[scenarioId]?.label ?? scenarioId;
  resetDialogTrigger = elements.resetButton;
  if (typeof elements.resetDialog.showModal === "function") {
    elements.resetDialog.showModal();
    queueMicrotask(() => elements.resetCancelButton.focus?.());
    return;
  }
  if (confirm(`${sector.name} sektörünün tüm senaryo verileri varsayılan değerlere döndürülsün mü?`)) {
    resetCurrentSector();
  }
}

function closeResetDialog() {
  if (typeof elements.resetDialog.close === "function") elements.resetDialog.close();
}

function attachEvents() {
  elements.sectorSelect.addEventListener("change", (event) => {
    state.activeSectorId = event.target.value;
    saveState();
    renderSectorShell();
    render();
  });

  elements.formSections.addEventListener("input", handleFormInput);
  elements.formSections.addEventListener("click", handleTableAction);

  elements.scenarioSwitcher.addEventListener("click", (event) => {
    const scenarioId = event.target.dataset.scenario;
    if (!scenarioId || !currentSector().scenarios[scenarioId]) return;
    currentSectorState().activeScenario = scenarioId;
    saveState();
    renderScenarioButtons();
    renderForm();
    render();
  });

  elements.viewModeSwitcher.addEventListener("click", (event) => {
    const nextMode = event.target.dataset.viewMode;
    if (!nextMode || normalizeViewMode(nextMode) === viewMode) return;
    viewMode = normalizeViewMode(nextMode);
    saveViewMode();
    renderViewModeControl();
    renderForm();
    render();
  });

  for (const menu of actionMenus()) {
    menu.trigger.addEventListener("click", () => toggleActionMenu(menu));
  }
  for (const item of document.querySelectorAll("[data-menu-action]")) {
    item.addEventListener("click", () => closeActionMenus());
  }
  document.addEventListener?.("click", (event) => {
    if (!event.target.closest?.(".action-menu")) closeActionMenus();
  });
  document.addEventListener?.("keydown", (event) => {
    if (event.key === "Escape" && actionMenus().some(({ panel }) => !panel.hidden)) {
      event.preventDefault();
      closeActionMenus({ returnFocus: true });
    }
  });

  elements.resetButton.addEventListener("click", openResetDialog);
  elements.resetCancelButton.addEventListener("click", closeResetDialog);
  elements.resetConfirmButton.addEventListener("click", () => {
    closeResetDialog();
    resetCurrentSector();
  });
  elements.resetDialog.addEventListener("close", () => resetDialogTrigger?.focus?.());
  elements.resetDialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...elements.resetDialog.querySelectorAll?.("button:not([disabled])") ?? []];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.reportButton.addEventListener("click", exportReport);
  elements.exportMenuReportButton.addEventListener("click", exportReport);
  elements.printButton.addEventListener("click", () => window.print());
}

function render() {
  const sector = currentSector();
  const sectorState = currentSectorState();
  const inputs = currentInputs();
  const result = sector.calculateModel(inputs);
  const presentation = sector.buildPresentation(result);
  const scenarios = sector.calculateScenarioComparison(sectorState.scenarioInputs);

  syncFormInputs(elements.formSections, inputs);
  syncFormVisibility(elements.formSections, sector, inputs, viewMode);
  renderWarnings(elements.warnings, result.warnings);
  renderKPIs(elements.kpiGrid, presentation.kpis);
  renderKeySplit(elements.keySplit, presentation.keySplit);
  renderWaterfall(elements.waterfall, result.waterfall);
  renderScenarioTable(elements.scenarioTable, sector, scenarios);
  renderCashFlow(elements.cashFlowTable, sector, result.cashFlow.rows);
  renderBreakdown(elements.breakdown, presentation.breakdown);
  lastRendered = { sector, scenarioId: sectorState.activeScenario, inputs, result, presentation, scenarios };
  trackingController.render();
}

function exportReport() {
  if (!lastRendered) return;
  exportFinancialReport(lastRendered);
}

function exportCsv() {
  if (!lastRendered) return;
  const { sector, result, presentation } = lastRendered;
  const rows = [
    ["Business Income Calculator", sector.name],
    ["Senaryo", sector.scenarios[currentSectorState().activeScenario].label],
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
  const cashColumns = resolveCashFlowColumns(sector, result.cashFlow.rows);
  rows.push(cashColumns.map((column) => column.label));
  for (const row of result.cashFlow.rows) {
    rows.push(cashColumns.map((column) => exportValue(row[column.key], column.format)));
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
