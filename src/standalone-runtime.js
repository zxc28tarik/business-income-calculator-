import {
  cloneInputValue,
  coerceFieldValue,
  createTableRow,
  initializeScenarioInputs,
  updateTableCell,
} from "./core/sector-schema.js";
import { csvCell, escapeHtml, exportValue } from "./ui/formatters.js";
import {
  findFieldDefinition,
  renderFormHtml,
  syncFormInputs,
  syncFormVisibility,
} from "./ui/form-view.js";
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

export function mountStandaloneCalculator(sector) {
  const storageKey = `business-income-calculator:standalone:${sector.id}:${sector.version}`;
  const portfolioStorageKey = `business-income-calculator:standalone-portfolio:${sector.id}:v0.1`;
  const trackingStoragePrefix = "business-income-calculator:tracking:v0.1";
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

    pageTitle: document.querySelector("#pageTitle"),
    pageSubtitle: document.querySelector("#pageSubtitle"),
    sectorSummary: document.querySelector("#sectorSummary"),
    scenarioSwitcher: document.querySelector("#scenarioSwitcher"),
    formSections: document.querySelector("#formSections"),
    resetButton: document.querySelector("#resetButton"),
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
  let lastRendered = null;
  let portfolioController = null;
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
    storageKey: portfolioStorageKey,
    trackingPrefix: trackingStoragePrefix,
    backupScope: `standalone:${sector.id}`,
    appVersion: "0.22.0",
    initialWorkspace: state,
    createWorkspace: createDefaultState,
    normalizeWorkspace: normalizeState,
    getWorkspace: () => state,
    setWorkspace: (workspace) => {
      state = normalizeState(workspace);
      persistLegacyState();
      renderShell();
      render();
    },
    summarizeWorkspace,
    initialName: sector.name,
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
    storagePrefix: trackingStoragePrefix,
  });

  renderShell();
  attachEvents();
  render();

  function createDefaultState(baseInputs) {
    return {
      activeScenario: "expected",
      scenarioInputs: initializeScenarioInputs(sector, baseInputs),
    };
  }

  function normalizeState(raw) {
    const next = createDefaultState();
    next.activeScenario = sector.scenarios[raw?.activeScenario] ? raw.activeScenario : "expected";
    for (const scenarioId of Object.keys(sector.scenarios)) {
      const source = raw?.scenarioInputs?.[scenarioId]
        ?? sector.applyScenario(cloneInputValue(sector.defaultInputs), scenarioId);
      next.scenarioInputs[scenarioId] = sector.normalizeInputs(cloneInputValue(source));
    }
    return next;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.scenarioInputs) return normalizeState(saved);
    } catch {
      // Bozuk veya erişilemeyen yerel veri varsayılanlarla değiştirilir.
    }
    return createDefaultState();
  }

  function persistLegacyState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // file:// veya gizli mod yerel depolamayı engellerse hesap çalışmaya devam eder.
    }
  }

  function saveState() {
    persistLegacyState();
    portfolioController?.syncActiveWorkspace();
  }

  function currentInputs() {
    return state.scenarioInputs[state.activeScenario];
  }

  function summarizeWorkspace(workspace) {
    const normalized = normalizeState(workspace);
    return buildProjectFinancialSummary({
      sector,
      scenarioId: normalized.activeScenario,
      inputs: normalized.scenarioInputs[normalized.activeScenario],
    });
  }

  function renderShell() {
    elements.pageTitle.textContent = `${sector.name} Finansal Fizibilite`;
    elements.pageSubtitle.textContent = sector.description;
    document.title = `Business Income Calculator · ${sector.name}`;
    document.documentElement.dataset.sectorId = sector.id;
    elements.sectorSummary.innerHTML = `
      <p class="eyebrow">${escapeHtml(sector.family)}</p>
      <strong>${escapeHtml(sector.name)}</strong>
      <span>${escapeHtml(sector.version)} · ${sector.status === "simulation" ? "Simülasyon modu" : escapeHtml(sector.status)}</span>
    `;
    renderScenarioButtons();
    renderForm();
  }

  function renderScenarioButtons() {
    elements.scenarioSwitcher.innerHTML = Object.entries(sector.scenarios).map(([id, preset]) =>
      `<button type="button" class="scenario-button ${state.activeScenario === id ? "active" : ""}" data-scenario="${id}">${escapeHtml(preset.label)}</button>`,
    ).join("");
  }

  function renderForm() {
    elements.formSections.innerHTML = renderFormHtml(sector, currentInputs());
  }

  function updateCurrentInputs(patch) {
    state.scenarioInputs[state.activeScenario] = sector.normalizeInputs({
      ...cloneInputValue(state.scenarioInputs[state.activeScenario]),
      ...cloneInputValue(patch),
    });
    saveState();
  }

  function handleFormInput(event) {
    const target = event.target;
    const tableKey = target.dataset.tableKey;
    if (tableKey) {
      const field = findFieldDefinition(sector, tableKey);
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
    const field = findFieldDefinition(sector, key);
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
    const field = findFieldDefinition(sector, tableKey);
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

  function attachEvents() {
    elements.formSections.addEventListener("input", handleFormInput);
    elements.formSections.addEventListener("click", handleTableAction);
    elements.scenarioSwitcher.addEventListener("click", (event) => {
      const scenarioId = event.target.dataset.scenario;
      if (!scenarioId || !sector.scenarios[scenarioId]) return;
      state.activeScenario = scenarioId;
      saveState();
      renderScenarioButtons();
      renderForm();
      render();
    });
    elements.resetButton.addEventListener("click", () => {
      state = createDefaultState();
      saveState();
      renderShell();
      render();
    });
    elements.exportCsvButton.addEventListener("click", exportCsv);
    elements.reportButton.addEventListener("click", exportReport);
    elements.printButton.addEventListener("click", () => window.print());
  }

  function render() {
    const inputs = currentInputs();
    const result = sector.calculateModel(inputs);
    const presentation = sector.buildPresentation(result);
    const scenarios = sector.calculateScenarioComparison(state.scenarioInputs);
    syncFormInputs(elements.formSections, inputs);
    syncFormVisibility(elements.formSections, sector, inputs);
    renderWarnings(elements.warnings, result.warnings);
    renderKPIs(elements.kpiGrid, presentation.kpis);
    renderKeySplit(elements.keySplit, presentation.keySplit);
    renderWaterfall(elements.waterfall, result.waterfall);
    renderScenarioTable(elements.scenarioTable, sector, scenarios);
    renderCashFlow(elements.cashFlowTable, sector, result.cashFlow.rows);
    renderBreakdown(elements.breakdown, presentation.breakdown);
    lastRendered = { sector, scenarioId: state.activeScenario, inputs, result, presentation, scenarios };
    trackingController.render();
  }

  function exportReport() {
    if (!lastRendered) return;
    exportFinancialReport(lastRendered);
  }

  function exportCsv() {
    if (!lastRendered) return;
    const { result, presentation } = lastRendered;
    const rows = [
      ["Business Income Calculator", sector.name],
      ["Senaryo", sector.scenarios[state.activeScenario].label],
      ["Oluşturma tarihi", new Date().toLocaleString("tr-TR")],
      [],
    ];
    for (const group of presentation.breakdown) {
      rows.push([group.title]);
      for (const [label, value, format = "money"] of group.rows) rows.push([label, exportValue(value, format)]);
      rows.push([]);
    }
    rows.push(["12 aylık nakit akışı"]);
    const cashColumns = resolveCashFlowColumns(sector, result.cashFlow.rows);
    rows.push(cashColumns.map((column) => column.label));
    for (const row of result.cashFlow.rows) rows.push(cashColumns.map((column) => exportValue(row[column.key], column.format)));
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sector.id}-${state.activeScenario}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
