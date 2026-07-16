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

export function renderWarnings(element, warnings) {
  element.innerHTML = warnings.map((item) =>
    `<div class="warning ${item.severity}">${escapeHtml(item.message)}</div>`,
  ).join("");
}

export function renderKPIs(element, cards) {
  element.innerHTML = cards.map((card) => `
    <article class="kpi-card ${card.negative ? "negative" : ""}">
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
    <thead><tr><th>Gösterge</th>${presentations.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("")}</tr></thead>
    <tbody>${template.map((metric) => `
      <tr><td>${escapeHtml(metric.label)}</td>${presentations.map((item) => {
        const value = item.metrics.find((candidate) => candidate.id === metric.id) ?? metric;
        return `<td>${formatValue(value.value, value.format, value)}</td>`;
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

export function renderCashFlow(element, sector, rows) {
  const columns = resolveCashFlowColumns(sector, rows);
  element.innerHTML = `
    <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((row) => `<tr>${columns.map((column) =>
      `<td>${formatValue(row[column.key], column.format ?? "number", column)}</td>`,
    ).join("")}</tr>`).join("")}</tbody>
  `;
}

export function renderBreakdown(element, groups) {
  element.innerHTML = groups.map((group) => `
    <div class="breakdown-group">
      <h3>${escapeHtml(group.title)}</h3>
      ${group.rows.map((rawRow) => {
        const [label, value, format = "money"] = rawRow;
        return `<div class="breakdown-row"><span>${escapeHtml(label)}</span><span>${formatValue(value, format)}</span></div>`;
      }).join("")}
    </div>
  `).join("");
}
