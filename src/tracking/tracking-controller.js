import { csvCell, escapeHtml, formatValue } from "../ui/formatters.js";
import { createWorkspacePanel } from "../ui/workspace-panel.js";
import {
  buildTrackingModel,
  hasTrackingData,
  normalizeTrackingRecords,
  resolveTrackingScope,
  TRACKING_REASON_OPTIONS,
} from "./tracking-model.js";
import { downloadTrackingReport } from "./tracking-report.js";

const STATUS_LABELS = {
  on_track: "Plana yakın",
  watch: "Dikkat gerektiriyor",
  off_track: "Planın gerisinde",
  missing: "Gerçekleşen veri bekleniyor",
};

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* file:// ve gizli modda hesap çalışmaya devam eder. */ }
}

function inputValue(value) {
  return value == null ? "" : String(value);
}

function money(value) {
  return value == null ? "—" : formatValue(value, "money");
}

function signedMoney(value) {
  if (value == null) return "—";
  return `${value > 0 ? "+" : ""}${formatValue(value, "money")}`;
}

function rate(value) {
  return value == null ? "—" : formatValue(value, "percent");
}

function trendText(trend) {
  if (!trend || trend.direction === "insufficient") return "Yetersiz veri";
  if (trend.direction === "flat") return "Yatay";
  return trend.direction === "up" ? "Yükseliyor" : "Düşüyor";
}

function renderContext(ctx, model, projectName) {
  const scenarioLabel = ctx.sector.scenarios?.[ctx.scenarioId]?.label ?? ctx.scenarioId;
  return `
    <div class="tracking-context-item"><span>İşletme kaydı</span><strong>${escapeHtml(projectName)}</strong></div>
    <div class="tracking-context-item"><span>Plan kapsamı</span><strong>${escapeHtml(ctx.sector.name)} · ${escapeHtml(scenarioLabel)}</strong></div>
    <div class="tracking-context-item"><span>Gerçekleşen veri</span><strong>${model.completeFinancialMonths} / 12 ay</strong></div>`;
}

function renderSummary(model) {
  const status = STATUS_LABELS[model.overallStatus] ?? STATUS_LABELS.missing;
  return `
    <article class="tracking-summary-card tracking-summary-primary"><span>Takip durumu</span><strong class="tracking-status ${escapeHtml(model.overallStatus)}">${escapeHtml(status)}</strong><small>${model.completeFinancialMonths} karşılaştırılabilir dönem · plan ve gerçekleşen birlikte değerlendirilir</small></article>
    <article class="tracking-summary-card"><span>Tahsilat sapması</span><strong>${signedMoney(model.totals.collectionsVariance)}</strong><small>${rate(model.totals.collectionsVarianceRate)}</small></article>
    <article class="tracking-summary-card"><span>Faaliyet sonucu sapması</span><strong>${signedMoney(model.totals.operatingResultVariance)}</strong><small>${rate(model.totals.operatingResultVarianceRate)}</small></article>
    <article class="tracking-summary-card"><span>Net nakit hareketi sapması</span><strong>${signedMoney(model.totals.netCashMovementVariance)}</strong><small>${rate(model.totals.netCashMovementVarianceRate)}</small></article>`;
}

function reasonOptions(selected) {
  return TRACKING_REASON_OPTIONS.map(([value, label]) =>
    `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`,
  ).join("");
}

function numberInput(month, key, value, label) {
  return `<input aria-label="${escapeHtml(label)}" type="number" step="0.01" data-tracking-month="${month}" data-tracking-key="${key}" value="${escapeHtml(inputValue(value))}" />`;
}

export function selectTrackingRows(model, showAllMonths = false, compactLimit = 6) {
  const rows = Array.isArray(model?.rows) ? model.rows : [];
  return showAllMonths ? rows : rows.slice(0, Math.max(1, compactLimit));
}

function renderTable(model, showAllMonths) {
  const rows = selectTrackingRows(model, showAllMonths).map((row) => {
    const actual = row.actual ?? { month: row.month };
    const planOperatingCosts = row.plan.variableCosts + row.plan.fixedCosts
      + row.plan.stakeholderPayouts + row.plan.estimatedTax;
    return `<tr data-tracking-row="${row.month}">
      <td><strong>Ay ${row.month}</strong><input aria-label="Takvim dönemi" type="month" data-tracking-month="${row.month}" data-tracking-key="period" value="${escapeHtml(actual.period ?? "")}" /></td>
      <td>${money(row.plan.collections)}</td>
      <td>${numberInput(row.month, "collections", actual.collections, "Gerçek tahsilat")}</td>
      <td class="tracking-variance ${(row.variance.collections ?? 0) < 0 ? "negative" : "positive"}">${signedMoney(row.variance.collections)}</td>
      <td>${money(planOperatingCosts)}</td>
      <td>${numberInput(row.month, "variableCosts", actual.variableCosts, "Gerçek değişken gider")}</td>
      <td>${numberInput(row.month, "fixedCosts", actual.fixedCosts, "Gerçek sabit gider")}</td>
      <td>${numberInput(row.month, "stakeholderPayouts", actual.stakeholderPayouts, "Gerçek paydaş ödemesi")}</td>
      <td>${numberInput(row.month, "estimatedTax", actual.estimatedTax, "Gerçek vergi")}</td>
      <td>${numberInput(row.month, "financing", actual.financing, "Gerçek finansman")}</td>
      <td>${numberInput(row.month, "support", actual.support, "Gerçek destek")}</td>
      <td>${numberInput(row.month, "setupCosts", actual.setupCosts, "Gerçek kurulum ödemesi")}</td>
      <td>${numberInput(row.month, "loanPayment", actual.loanPayment, "Gerçek kredi ödemesi")}</td>
      <td>${numberInput(row.month, "cashEnd", actual.cashEnd, "Gerçek dönem sonu nakit")}</td>
      <td>${numberInput(row.month, "volume", actual.volume, "Gerçek operasyon hacmi")}</td>
      <td><select aria-label="Sapma nedeni" data-tracking-month="${row.month}" data-tracking-key="reason">${reasonOptions(actual.reason ?? "")}</select></td>
      <td><input aria-label="Dönem notu" type="text" maxlength="500" data-tracking-month="${row.month}" data-tracking-key="note" value="${escapeHtml(actual.note ?? "")}" /></td>
    </tr>`;
  }).join("");
  return `<thead><tr><th>Dönem</th><th>Plan tahsilat</th><th>Gerçek tahsilat</th><th>Tahsilat farkı</th><th>Plan faaliyet gideri</th><th>Gerçek değişken</th><th>Gerçek sabit</th><th>Gerçek paydaş</th><th>Gerçek vergi</th><th>Finansman</th><th>Destek</th><th>Kurulum</th><th>Kredi</th><th>Dönem sonu nakit</th><th>Operasyon hacmi</th><th>Ana neden</th><th>Not</th></tr></thead><tbody>${rows}</tbody>`;
}

function renderTrends(model) {
  const items = [
    ["Tahsilat", model.trends.collections],
    ["Faaliyet sonucu", model.trends.operatingResult],
    ["Dönem sonu nakit", model.trends.cashEnd],
    ["Operasyon hacmi", model.trends.volume],
  ];
  return items.map(([label, trend]) => `<div class="tracking-trend-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(trendText(trend))}</strong><small>${rate(trend?.rate)}</small></div>`).join("");
}

function ensureTrackingElements(elements) {
  let context = elements.panel.querySelector("#trackingContext");
  if (!context) {
    context = document.createElement("div");
    context.id = "trackingContext";
    context.className = "tracking-context";
    elements.panel.insertBefore(context, elements.summary);
  }

  let monthsToggle = elements.panel.querySelector("#trackingMonthsToggle");
  if (!monthsToggle) {
    const toolbar = document.createElement("div");
    toolbar.className = "tracking-table-toolbar";
    toolbar.innerHTML = '<p>İlk altı ay gösteriliyor. Diğer dönemler saklanır, veriler silinmez.</p><button id="trackingMonthsToggle" class="secondary-button" type="button" aria-expanded="false">12 ayın tamamını göster</button>';
    const tableRegion = elements.table.closest(".tracking-table-scroll");
    elements.panel.insertBefore(toolbar, tableRegion ?? elements.trends);
    monthsToggle = toolbar.querySelector("#trackingMonthsToggle");
  }
  return { context, monthsToggle };
}

export function createTrackingController({
  elements,
  getContext,
  getProjectId = () => "legacy",
  getProjectName = () => "Aktif kayıt",
  storagePrefix = "business-income-calculator:tracking:v0.1",
}) {
  let currentModel = null;
  let currentStorageKey = "";
  let showAllMonths = false;
  let panelControl = null;
  const stageElements = ensureTrackingElements(elements);

  function context() {
    return typeof getContext === "function" ? getContext() : null;
  }

  function projectId() {
    return String(getProjectId?.() || "legacy").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) || "legacy";
  }

  function legacyStorageKey(ctx) {
    return `${storagePrefix}:${ctx.sector.id}:${resolveTrackingScope(ctx.inputs)}`;
  }

  function storageKey(ctx) {
    return `${storagePrefix}:${projectId()}:${ctx.sector.id}:${resolveTrackingScope(ctx.inputs)}`;
  }

  function loadRecords(ctx) {
    const key = storageKey(ctx);
    currentStorageKey = key;
    let raw = safeGet(key);
    if (!raw) {
      const legacy = safeGet(legacyStorageKey(ctx));
      if (legacy) {
        raw = legacy;
        safeSet(key, legacy);
      }
    }
    try {
      return normalizeTrackingRecords(JSON.parse(raw || "[]"));
    } catch {
      return [];
    }
  }

  function saveRecords(records) {
    const compact = normalizeTrackingRecords(records).filter(hasTrackingData);
    safeSet(currentStorageKey, JSON.stringify(compact));
  }

  function buildCurrentModel() {
    const ctx = context();
    if (!ctx) return null;
    return buildTrackingModel({
      sector: ctx.sector,
      scenarioId: ctx.scenarioId,
      result: ctx.result,
      records: loadRecords(ctx),
    });
  }

  function render() {
    if (!panelControl?.isOpen()) return;
    const ctx = context();
    if (!ctx) return;
    currentModel = buildCurrentModel();
    stageElements.context.innerHTML = renderContext(ctx, currentModel, String(getProjectName?.() || "Aktif kayıt"));
    elements.summary.innerHTML = renderSummary(currentModel);
    elements.table.innerHTML = renderTable(currentModel, showAllMonths);
    elements.trends.innerHTML = renderTrends(currentModel);
    const hasMore = currentModel.rows.length > 6;
    stageElements.monthsToggle.hidden = !hasMore;
    stageElements.monthsToggle.setAttribute("aria-expanded", String(showAllMonths));
    stageElements.monthsToggle.textContent = showAllMonths ? "Yalnız ilk 6 ayı göster" : "12 ayın tamamını göster";
    const note = stageElements.monthsToggle.previousElementSibling;
    if (note) note.textContent = showAllMonths
      ? "On iki ayın tamamı gösteriliyor."
      : "İlk altı ay gösteriliyor. Diğer dönemler saklanır, veriler silinmez.";
  }

  function updateRecord(event) {
    const target = event.target;
    const month = Number(target.dataset.trackingMonth);
    const key = target.dataset.trackingKey;
    if (!Number.isInteger(month) || !key) return;
    const ctx = context();
    if (!ctx) return;
    const records = loadRecords(ctx);
    const index = records.findIndex((record) => record.month === month);
    const record = index >= 0 ? { ...records[index] } : { month };
    record[key] = target.value;
    if (index >= 0) records[index] = record;
    else records.push(record);
    saveRecords(records);
    render();
  }

  function exportCsv() {
    const ctx = context();
    if (!ctx || !currentModel) return;
    const rows = [["Dönem", "Plan tahsilat", "Gerçek tahsilat", "Tahsilat farkı", "Plan faaliyet sonucu", "Gerçek faaliyet sonucu", "Faaliyet farkı", "Plan net nakit", "Gerçek net nakit", "Net nakit farkı", "Gerçek dönem sonu nakit", "Operasyon hacmi", "Sapma nedeni", "Not"]];
    for (const row of currentModel.completedRows) {
      rows.push([
        row.label,
        row.plan.collections,
        row.actual.collections ?? "",
        row.variance.collections ?? "",
        row.plan.operatingResult,
        row.actual.operatingResult ?? "",
        row.variance.operatingResult ?? "",
        row.plan.netCashMovement,
        row.actual.netCashMovement ?? "",
        row.variance.netCashMovement ?? "",
        row.actual.cashEnd ?? "",
        row.actual.volume ?? "",
        row.actual.reason ?? "",
        row.actual.note ?? "",
      ]);
    }
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${ctx.sector.id}-${ctx.scenarioId}-gercek-takip.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportReport() {
    const ctx = context();
    if (!ctx || !currentModel) return;
    downloadTrackingReport({
      sector: ctx.sector,
      scenarioLabel: ctx.sector.scenarios?.[ctx.scenarioId]?.label ?? ctx.scenarioId,
      model: currentModel,
    });
  }

  function attach() {
    elements.table.addEventListener("input", updateRecord);
    elements.table.addEventListener("change", updateRecord);
    elements.csvButton.addEventListener("click", exportCsv);
    elements.reportButton.addEventListener("click", exportReport);
    stageElements.monthsToggle.addEventListener("click", () => {
      showAllMonths = !showAllMonths;
      render();
    });
  }

  attach();
  panelControl = createWorkspacePanel({
    id: "tracking",
    panel: elements.panel,
    toggleButton: elements.toggleButton,
    closeButton: elements.closeButton,
    onOpen: render,
    onClose: () => { currentModel = null; },
  });
  return {
    render,
    getModel: () => currentModel,
    isVisible: panelControl.isOpen,
    open: panelControl.open,
    close: panelControl.close,
  };
}
