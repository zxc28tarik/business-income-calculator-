import { escapeHtml, formatValue } from "./formatters.js";

const DEFAULT_CASH_COLUMNS = [
  { key: "month", label: "Ay", format: "number" },
  { key: "collections", label: "Tahsilat", format: "money" },
  { key: "financing", label: "Finansman", format: "money" },
  { key: "support", label: "Destek", format: "money" },
  { key: "setupCosts", label: "Kurulum", format: "money" },
  { key: "variableCostsPaid", label: "Değişken ödeme", format: "money" },
  { key: "fixedCosts", label: "Sabit", format: "money" },
  { key: "stakeholderPayouts", label: "Paydaş", format: "money" },
  { key: "estimatedTax", label: "Vergi", format: "money" },
  { key: "loanPayment", label: "Kredi", format: "money" },
  { key: "cashEnd", label: "Dönem sonu", format: "money" },
];

const WARNING_LEVELS = {
  critical: { label: "Kritik", rank: 0 },
  warning: { label: "Dikkat", rank: 1 },
  info: { label: "Bilgi", rank: 2 },
  positive: { label: "Olumlu", rank: 3 },
};

const WARNING_TITLE_RULES = [
  [/healthy|positive|on_track/i, "Kontrol sonucu"],
  [/negative_profit|loss|ebt|zarar/i, "Aylık zarar"],
  [/cash|runway|financing|fund/i, "Nakit açığı"],
  [/capacity|utilization|workload/i, "Kapasite sınırı"],
  [/rent/i, "Kira yükü"],
  [/commission|platform|pos/i, "Komisyon yükü"],
  [/margin/i, "Düşük kâr marjı"],
  [/mix|share_total|total/i, "Pay toplamı"],
  [/cost|cogs|material|food|stock/i, "Maliyet oranı"],
  [/churn|refund|return/i, "Müşteri kaybı / iade"],
  [/debt|loan|credit/i, "Finansman yükü"],
];

export function normalizeWarningSeverity(severity) {
  if (severity === "hard" || severity === "critical" || severity === "danger") return "critical";
  if (severity === "soft" || severity === "warning" || severity === "watch") return "warning";
  if (severity === "positive" || severity === "success") return "positive";
  return "info";
}

function resolveWarningTitle(item, severity) {
  if (item.title) return String(item.title);
  const id = String(item.id ?? "");
  const matched = WARNING_TITLE_RULES.find(([pattern]) => pattern.test(id));
  if (matched) return matched[1];
  return severity === "critical"
    ? "Kritik finansal risk"
    : severity === "warning"
      ? "Kontrol edilmesi gereken varsayım"
      : severity === "positive"
        ? "Olumlu kontrol sonucu"
        : "Finansal kontrol notu";
}

export function buildWarningViewModel(warnings, { expanded = false, limit = 3 } = {}) {
  const normalized = (Array.isArray(warnings) ? warnings : []).map((item, index) => {
    const severity = normalizeWarningSeverity(item?.severity);
    return {
      ...item,
      id: item?.id ?? `warning_${index}`,
      message: String(item?.message ?? ""),
      severity,
      levelLabel: WARNING_LEVELS[severity].label,
      title: resolveWarningTitle(item ?? {}, severity),
      originalIndex: index,
    };
  }).sort((left, right) => (
    WARNING_LEVELS[left.severity].rank - WARNING_LEVELS[right.severity].rank
    || left.originalIndex - right.originalIndex
  ));

  const critical = normalized.filter((item) => item.severity === "critical");
  const remaining = normalized.filter((item) => item.severity !== "critical");
  const collapsed = [
    ...critical,
    ...remaining.slice(0, Math.max(0, Math.max(1, limit) - critical.length)),
  ];
  const collapsedIds = new Set(collapsed.map((item) => item.originalIndex));
  const hiddenWhenCollapsed = normalized.filter((item) => !collapsedIds.has(item.originalIndex));

  return {
    items: expanded ? normalized : collapsed,
    allItems: normalized,
    hiddenWhenCollapsed,
    criticalCount: critical.length,
    warningCount: normalized.filter((item) => item.severity === "warning").length,
    expanded,
  };
}

function warningTargetSelector(item) {
  if (item.target) return String(item.target);
  if (item.fieldKey) return `[data-key="${String(item.fieldKey).replaceAll('"', '\\"')}"]`;
  return "";
}

function renderWarningCard(item) {
  const target = warningTargetSelector(item);
  const actionLabel = item.actionLabel ?? (target ? "İlgili ayara git" : "");
  return `
    <article class="warning warning-${item.severity}" data-warning-id="${escapeHtml(String(item.id))}">
      <div class="warning-heading">
        <span class="warning-level">${escapeHtml(item.levelLabel)}</span>
        <h3>${escapeHtml(item.title)}</h3>
      </div>
      <p>${escapeHtml(item.message)}</p>
      ${target && actionLabel ? `<button class="warning-action" type="button" data-warning-target="${escapeHtml(target)}">${escapeHtml(actionLabel)}</button>` : ""}
    </article>
  `;
}

function bindWarningInteractions(element) {
  if (element.__bicWarningInteractionsBound) return;
  element.__bicWarningInteractionsBound = true;
  element.addEventListener("click", (event) => {
    const disclosure = event.target.closest?.("[data-warning-disclosure]");
    if (disclosure) {
      element.dataset.expanded = String(element.dataset.expanded !== "true");
      renderWarnings(element, element.__bicWarnings ?? []);
      return;
    }

    const action = event.target.closest?.("[data-warning-target]");
    if (!action) return;
    let target = null;
    try {
      target = document.querySelector(action.dataset.warningTarget);
    } catch {
      target = null;
    }
    if (!target) return;
    target.closest?.("details")?.setAttribute("open", "");
    target.scrollIntoView?.({ behavior: "smooth", block: "center" });
    target.focus?.({ preventScroll: true });
  });
}

export function renderWarnings(element, warnings) {
  element.__bicWarnings = Array.isArray(warnings) ? warnings : [];
  const expanded = element.dataset.expanded === "true";
  const view = buildWarningViewModel(element.__bicWarnings, { expanded });
  const sectionHeading = element.closest?.(".warning-section")?.querySelector?.("h2");
  if (sectionHeading) {
    sectionHeading.textContent = view.criticalCount || view.warningCount
      ? "Dikkat edilmesi gerekenler"
      : "Kontrol sonucu";
  }

  if (!view.allItems.length) {
    element.innerHTML = '<p class="warning-empty">Bu hesapta gösterilecek bir uyarı bulunmuyor.</p>';
    bindWarningInteractions(element);
    return;
  }

  element.innerHTML = `
    <div class="warning-list">${view.items.map(renderWarningCard).join("")}</div>
    ${view.hiddenWhenCollapsed.length ? `
      <button class="warning-disclosure" type="button" data-warning-disclosure aria-expanded="${String(expanded)}">
        ${expanded ? "Daha az uyarı göster" : `${view.allItems.length} uyarının tümünü göster`}
      </button>
    ` : ""}
  `;
  bindWarningInteractions(element);
}

export function renderKPIs(element, cards) {
  element.innerHTML = cards.map((card) => `
    <article class="kpi-card ${card.negative ? "negative" : ""} ${card.positive ? "positive" : ""}">
      <div class="label">${escapeHtml(card.label)}</div>
      <div class="value">${formatValue(card.value, card.format, card)}</div>
      <div class="note">${escapeHtml(card.note ?? "")}</div>
    </article>
  `).join("");
}

export function renderKeySplit(element, rows) {
  element.innerHTML = rows.map((row) =>
    `<div class="split-row"><span>${escapeHtml(row.label)}</span><span>${formatValue(row.value, row.format ?? "money", row)}</span></div>`,
  ).join("");
}

export function renderWaterfall(element, rows) {
  const max = Math.max(...rows.map((item) => Math.abs(item.amount)), 1);
  element.innerHTML = rows.map((item) => `
    <div class="waterfall-row">
      <div class="waterfall-label"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.subtext ?? "")}</small></div>
      <div class="bar-track"><div class="bar ${item.kind}" style="width:${Math.max(1, Math.abs(item.amount) / max * 100)}%"></div></div>
      <div class="waterfall-value">${formatValue(item.amount, "money")}</div>
    </div>
  `).join("");
}

export function renderScenarioTable(element, sector, scenarios) {
  const presentations = scenarios.map((scenario) => ({
    ...scenario,
    metrics: sector.buildPresentation(scenario.result).scenarioMetrics,
  }));
  const template = presentations[0]?.metrics ?? [];
  element.innerHTML = `
    <thead><tr><th>Gösterge</th>${presentations.map((item) => `<th class="${item.id === "expected" ? "expected-column" : ""}">${escapeHtml(item.label)}</th>`).join("")}</tr></thead>
    <tbody>${template.map((metric) => `
      <tr><td>${escapeHtml(metric.label)}</td>${presentations.map((item) => {
        const value = item.metrics.find((candidate) => candidate.id === metric.id) ?? metric;
        return `<td class="${item.id === "expected" ? "expected-column" : ""}">${formatValue(value.value, value.format, value)}</td>`;
      }).join("")}</tr>
    `).join("")}</tbody>
  `;
}

export function resolveCashFlowColumns(sector, rows) {
  if (Array.isArray(sector.cashFlowColumns) && sector.cashFlowColumns.length) return sector.cashFlowColumns;
  const columns = [...DEFAULT_CASH_COLUMNS];
  if (rows.some((row) => Number.isFinite(Number(row.endingSubscribers)))) {
    columns.splice(1, 0, { key: "endingSubscribers", label: "Aktif abone", format: "number" });
  }
  return columns;
}

export function buildCashFlowSummary(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const cashRows = safeRows
    .map((row, index) => ({
      month: Number.isFinite(Number(row?.month)) ? Number(row.month) : index + 1,
      cashEnd: Number(row?.cashEnd),
    }))
    .filter((row) => Number.isFinite(row.cashEnd));
  const endingCash = cashRows.at(-1)?.cashEnd ?? 0;
  const minimumCash = cashRows.length ? Math.min(...cashRows.map((row) => row.cashEnd)) : 0;
  const firstNegativeMonth = cashRows.find((row) => row.cashEnd < 0)?.month ?? null;
  return {
    endingCash,
    minimumCash,
    firstNegativeMonth,
    additionalFundingNeed: Math.max(0, -minimumCash),
  };
}

function renderCashSummaryCard(label, value, { format = "money", negative = false, positive = false } = {}) {
  const formatted = format === "text" ? escapeHtml(String(value)) : formatValue(value, format);
  return `
    <div class="cash-summary-card ${negative ? "negative" : ""} ${positive ? "positive" : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${formatted}</strong>
    </div>
  `;
}

export function renderCashFlow(element, sector, rows) {
  const columns = resolveCashFlowColumns(sector, rows);
  const summary = buildCashFlowSummary(rows);
  const firstNegativeLabel = summary.firstNegativeMonth == null ? "Yok" : `${summary.firstNegativeMonth}. ay`;
  element.innerHTML = `
    <caption class="cash-flow-caption">
      <div class="cash-summary-grid">
        ${renderCashSummaryCard("Minimum nakit", summary.minimumCash, { negative: summary.minimumCash < 0 })}
        ${renderCashSummaryCard("İlk negatif ay", firstNegativeLabel, { format: "text", negative: summary.firstNegativeMonth != null, positive: summary.firstNegativeMonth == null })}
        ${renderCashSummaryCard("12 ay sonu nakit", summary.endingCash, { negative: summary.endingCash < 0, positive: summary.endingCash >= 0 })}
        ${renderCashSummaryCard("Ek finansman ihtiyacı", summary.additionalFundingNeed, { negative: summary.additionalFundingNeed > 0, positive: summary.additionalFundingNeed === 0 })}
      </div>
    </caption>
    <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${columns.map((column) => {
      const value = row[column.key];
      const negativeCash = column.key === "cashEnd" && Number(value) < 0;
      const formatted = formatValue(value, column.format ?? "number", column);
      return `<td class="${negativeCash ? "negative-cash" : ""}"${negativeCash ? ` aria-label="Negatif nakit: ${escapeHtml(String(formatted))}"` : ""}>${negativeCash ? '<span class="sr-only">Negatif nakit: </span>' : ""}${formatted}</td>`;
    }).join("")}</tr>`).join("")}</tbody>
  `;
}

function bindBreakdownInteractions(element) {
  if (element.__bicBreakdownInteractionsBound) return;
  element.__bicBreakdownInteractionsBound = true;
  element.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-breakdown-disclosure]");
    if (!button) return;
    const groups = [...element.querySelectorAll("details.breakdown-group")];
    const shouldOpen = !groups.every((group) => group.open);
    groups.forEach((group) => { group.open = shouldOpen; });
    element.dataset.expanded = String(shouldOpen);
    button.setAttribute("aria-expanded", String(shouldOpen));
    button.textContent = shouldOpen ? "Tümünü kapat" : "Tümünü aç";
  });
}

export function renderBreakdown(element, groups) {
  const expanded = element.dataset.expanded === "true";
  element.innerHTML = `
    <div class="breakdown-toolbar">
      <p>Gelir, gider, vergi ve nakit gruplarını gerektiğinde açın.</p>
      <button class="breakdown-disclosure" type="button" data-breakdown-disclosure aria-expanded="${String(expanded)}">${expanded ? "Tümünü kapat" : "Tümünü aç"}</button>
    </div>
    ${groups.map((group) => `
      <details class="breakdown-group" ${expanded ? "open" : ""}>
        <summary><span>${escapeHtml(group.title)}</span><small>${group.rows.length} kalem</small></summary>
        <div class="breakdown-body">
          ${group.rows.map((rawRow) => {
            const [label, value, format = "money"] = rawRow;
            return `<div class="breakdown-row"><span>${escapeHtml(label)}</span><span>${formatValue(value, format)}</span></div>`;
          }).join("")}
        </div>
      </details>
    `).join("")}
  `;
  bindBreakdownInteractions(element);
}
