import {
  cloneInputValue,
  coerceFieldValue,
  createTableRow,
  updateTableCell,
} from "./core/sector-schema.js";
import {
  createSingleInputSectorState,
  normalizeSingleInputSectorState,
} from "./core/single-input-state.js";
import { SECTORS, getSector } from "./sectors/registry.js";
import { csvCell, escapeHtml, exportValue } from "./ui/formatters.js";
import {
  findFieldDefinition,
  renderFormHtml,
  syncFormInputs,
  syncFormVisibility,
} from "./ui/form-view.js";
import {
  buildDecisionHierarchy,
  renderDecisionSummary,
} from "./ui/decision-summary.js";
import {
  renderBreakdown,
  renderCashFlow,
  renderKeySplit,
  renderKPIs,
  renderWarnings,
  renderWaterfall,
  resolveCashFlowColumns,
} from "./ui/results-view.js";
import { exportFinancialReport } from "./report/report-controller.js";
import { createTrackingController } from "./tracking/tracking-controller.js";
import { createPortfolioController } from "./portfolio/portfolio-controller.js";
import { buildProjectFinancialSummary } from "./portfolio/portfolio-summary.js";
import { createSetupController } from "./setup/setup-controller.js";
import { synchronizeSetupWorkspace } from "./setup/setup-workspace.js";

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
  autosaveStatus: document.querySelector("#autosaveStatus"),
  formSections: document.querySelector("#formSections"),
  resetButton: document.querySelector("#resetButton"),
  resetDialog: document.querySelector("#resetDialog"),
  resetSectorName: document.querySelector("#resetSectorName"),
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
  setupButton: document.querySelector("#setupButton"),
  setupPanel: document.querySelector("#setupPanel"),
  setupCloseButton: document.querySelector("#setupCloseButton"),
  setupSyncButton: document.querySelector("#setupSyncButton"),
  setupAddItemButton: document.querySelector("#setupAddItemButton"),
  setupProfile: document.querySelector("#setupProfile"),
  setupRequirements: document.querySelector("#setupRequirements"),
  setupItemsTable: document.querySelector("#setupItemsTable"),
  setupCashSummary: document.querySelector("#setupCashSummary"),
  printButton: document.querySelector("#printButton"),
  decisionSummary: document.querySelector("#decisionSummary"),
  warnings: document.querySelector("#warnings"),
  kpiGrid: document.querySelector("#kpiGrid"),
  secondaryKpiGrid: document.querySelector("#secondaryKpiGrid"),
  secondaryKpiToggle: document.querySelector("#secondaryKpiToggle"),
  keySplit: document.querySelector("#keySplit"),
  waterfall: document.querySelector("#waterfall"),
  cashFlowTable: document.querySelector("#cashFlowTable"),
  breakdown: document.querySelector("#breakdown"),
};

let state = loadState();
let lastRendered = null;
let portfolioController = null;
let setupController = null;
let autosaveTimer = null;
let resetDialogTrigger = null;
let secondaryKpisExpanded = false;

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
  appVersion: "0.24.2",
  initialWorkspace: state,
  createWorkspace: createDefaultState,
  normalizeWorkspace: normalizeState,
  getWorkspace: () => state,
  setWorkspace: (workspace) => {
    state = normalizeState(workspace);
    persistState();
    renderSectorShell();
    render();
  },
  summarizeWorkspace,
});
state = portfolioController.getActiveWorkspace();
persistState();

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
  getProjectName: () => portfolioController.getActiveProjectName?.() ?? "Aktif kayıt",
  storagePrefix: TRACKING_STORAGE_PREFIX,
});

setupController = createSetupController({
  elements: {
    toggleButton: elements.setupButton,
    panel: elements.setupPanel,
    closeButton: elements.setupCloseButton,
    syncButton: elements.setupSyncButton,
    addButton: elements.setupAddItemButton,
    profile: elements.setupProfile,
    requirements: elements.setupRequirements,
    table: elements.setupItemsTable,
    cashSummary: elements.setupCashSummary,
  },
  getContext: () => ({
    sector: currentSector(),
    inputs: currentInputs(),
    setup: currentSectorState().setup,
  }),
  setSetup: (setup) => {
    currentSectorState().setup = synchronizeSetupWorkspace(setup, currentSetupContext());
    saveState();
    render();
  },
});

renderSectorOptions();
renderSectorShell();
attachEvents();
render();

function createDefaultState() {
  return {
    activeSectorId: SECTORS[0].id,
    sectors: Object.fromEntries(SECTORS.map((sector) => [
      sector.id,
      createSingleInputSectorState(sector),
    ])),
  };
}

function normalizeState(raw = {}) {
  const next = createDefaultState();
  next.activeSectorId = SECTORS.some((sector) => sector.id === raw?.activeSectorId)
    ? raw.activeSectorId
    : next.activeSectorId;

  for (const sector of SECTORS) {
    const savedSector = raw?.sectors?.[sector.id];
    if (!savedSector) continue;
    next.sectors[sector.id] = normalizeSingleInputSectorState(savedSector, sector);
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
    if (oldCafe?.baseInputs || oldCafe?.scenarioInputs) {
      const cafe = getSector("cafe_restaurant");
      fresh.sectors.cafe_restaurant = normalizeSingleInputSectorState(oldCafe, cafe, oldCafe.baseInputs);
    }
  } catch {
    // Eski veri yoksa sessizce devam edilir.
  }
  return fresh;
}

function persistState() {
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
    persistState();
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
  return currentSectorState().inputs;
}

function currentSetupContext() {
  return {
    sectorId: currentSector().id,
    businessType: String(currentInputs()?.businessType ?? currentInputs()?.businessTypeId ?? ""),
  };
}

function summarizeWorkspace(workspace) {
  const normalized = normalizeState(workspace);
  const sector = getSector(normalized.activeSectorId);
  return buildProjectFinancialSummary({
    sector,
    inputs: normalized.sectors[sector.id].inputs,
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
  renderForm();
}

function renderForm() {
  elements.formSections.innerHTML = renderFormHtml(currentSector(), currentInputs());
}

function updateCurrentInputs(patch) {
  const sector = currentSector();
  currentSectorState().inputs = sector.normalizeInputs({
    ...cloneInputValue(currentInputs()),
    ...cloneInputValue(patch),
  });
  currentSectorState().setup = synchronizeSetupWorkspace(currentSectorState().setup, currentSetupContext());
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

function toggleActionMenu(selectedMenu) {
  const shouldOpen = selectedMenu.panel.hidden;
  closeActionMenus();
  if (!shouldOpen) return;
  selectedMenu.panel.hidden = false;
  selectedMenu.trigger.setAttribute("aria-expanded", "true");
  queueMicrotask(() => selectedMenu.panel.querySelector?.('[role="menuitem"]')?.focus?.());
}

function resetCurrentSector() {
  const sector = currentSector();
  state.sectors[sector.id] = createSingleInputSectorState(sector);
  saveState();
  renderSectorShell();
  render();
}

function openResetDialog() {
  const sector = currentSector();
  elements.resetSectorName.textContent = sector.name;
  resetDialogTrigger = elements.resetButton;
  if (typeof elements.resetDialog.showModal === "function") {
    elements.resetDialog.showModal();
    queueMicrotask(() => elements.resetCancelButton.focus?.());
    return;
  }
  if (confirm(`${sector.name} sektörünün kayıtlı girdileri varsayılan değerlere döndürülsün mü?`)) {
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

  elements.secondaryKpiToggle.addEventListener("click", () => {
    secondaryKpisExpanded = !secondaryKpisExpanded;
    renderSecondaryKpiDisclosure();
  });

  for (const menu of actionMenus()) menu.trigger.addEventListener("click", () => toggleActionMenu(menu));
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
  const inputs = currentInputs();
  const result = sector.calculateModel(inputs);
  const presentation = sector.buildPresentation(result);
  const hierarchy = buildDecisionHierarchy({ sector, result, presentation });

  syncFormInputs(elements.formSections, inputs);
  syncFormVisibility(elements.formSections, sector, inputs);
  renderDecisionSummary(elements.decisionSummary, hierarchy.decision);
  renderKPIs(elements.kpiGrid, hierarchy.primaryKpis);
  renderWarnings(elements.warnings, result.warnings);
  renderKPIs(elements.secondaryKpiGrid, hierarchy.secondaryKpis);
  renderSecondaryKpiDisclosure(hierarchy.secondaryKpis.length);
  renderKeySplit(elements.keySplit, presentation.keySplit);
  renderWaterfall(elements.waterfall, result.waterfall);
  renderCashFlow(elements.cashFlowTable, sector, result.cashFlow.rows);
  renderBreakdown(elements.breakdown, presentation.breakdown);
  lastRendered = { sector, inputs, result, presentation, setup: currentSectorState().setup };
  trackingController.render();
  setupController.render();
}

function renderSecondaryKpiDisclosure(count = elements.secondaryKpiGrid.children?.length ?? 0) {
  const canExpand = count > 6;
  if (!canExpand) secondaryKpisExpanded = false;
  elements.secondaryKpiGrid.dataset.expanded = String(secondaryKpisExpanded);
  elements.secondaryKpiToggle.hidden = !canExpand;
  elements.secondaryKpiToggle.setAttribute("aria-expanded", String(secondaryKpisExpanded));
  elements.secondaryKpiToggle.textContent = secondaryKpisExpanded ? "Daha az göster" : "Tüm göstergeleri göster";
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
    ["Girdi modeli", "Kullanıcı tarafından girilen değerler"],
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
  anchor.download = `${sector.id}-hesap.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
