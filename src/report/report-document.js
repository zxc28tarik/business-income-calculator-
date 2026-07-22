import { escapeHtml, formatValue } from "../ui/formatters.js";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? "") : date.toLocaleString("tr-TR");
}

function formatCell(value, format, options = {}) {
  return formatValue(value, format, options);
}

function renderKpis(report) {
  return `<section><h2>Karar göstergeleri</h2><div class="kpi-grid">${report.kpis.map((card) => `
    <article class="kpi ${card.negative ? "negative" : ""}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${formatCell(card.value, card.format, card)}</strong>
      <small>${escapeHtml(card.note ?? "")}</small>
    </article>`).join("")}</div></section>`;
}

function renderWarnings(report) {
  const rows = report.warnings.length ? report.warnings : [{ severity: "info", message: "Raporlanan eşiklerde uyarı bulunmuyor." }];
  return `<section><h2>Risk ve dikkat noktaları</h2><div class="warnings">${rows.map((warning) => `
    <div class="warning ${escapeHtml(warning.severity)}"><b>${warning.severity === "hard" ? "Kritik" : warning.severity === "soft" ? "Dikkat" : "Bilgi"}</b><span>${escapeHtml(warning.message)}</span></div>`).join("")}</div></section>`;
}

function renderScenarioTable(report) {
  return `<section><h2>Senaryo karşılaştırması</h2><div class="table-scroll"><table>
    <thead><tr><th>Gösterge</th>${report.scenarios.scenarios.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("")}</tr></thead>
    <tbody>${report.scenarios.metrics.map((metric) => `<tr><td>${escapeHtml(metric.label)}</td>${report.scenarios.scenarios.map((item) => `<td>${formatCell(metric.values[item.id], metric.format, metric)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div></section>`;
}

function renderAssumptionItem(item) {
  if (item.type === "value") {
    return `<div class="assumption-row"><span>${escapeHtml(item.label)}</span><strong>${formatCell(item.value, item.format)}</strong></div>`;
  }
  return `<div class="assumption-table"><h4>${escapeHtml(item.label)}</h4><div class="table-scroll"><table>
    <thead><tr>${item.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
    <tbody>${item.rows.length ? item.rows.map((row) => `<tr>${item.columns.map((column) => `<td>${formatCell(row[column.key], column.format, column)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${item.columns.length}">Satır yok</td></tr>`}</tbody>
  </table></div></div>`;
}

function renderAssumptions(report) {
  return `<section><h2>Varsayımlar ve girdiler</h2>${report.assumptions.map((section) => `
    <article class="assumption-group"><h3>${escapeHtml(section.title)}</h3>${section.items.map(renderAssumptionItem).join("")}</article>`).join("")}</section>`;
}

function renderCashFlow(report) {
  const summary = report.cashFlow.summary;
  return `<section><h2>12 aylık nakit görünümü</h2>
    <div class="cash-summary">
      <div><span>Minimum nakit</span><strong>${formatCell(summary.minimumCash, "money")}</strong></div>
      <div><span>12 ay sonu nakit</span><strong>${formatCell(summary.endingCash, "money")}</strong></div>
      <div><span>İlk negatif ay</span><strong>${summary.firstNegativeMonth == null ? "Yok" : `${escapeHtml(summary.firstNegativeMonth)}. ay`}</strong></div>
    </div>
    <div class="table-scroll"><table><thead><tr>${report.cashFlow.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
    <tbody>${report.cashFlow.rows.map((row) => `<tr>${report.cashFlow.columns.map((column) => `<td>${formatCell(row[column.key], column.format ?? "number", column)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
  </section>`;
}

function renderKeySplit(report) {
  return `<section><h2>Finansal dağılım</h2><div class="split">${report.keySplit.map((row) => `<div><span>${escapeHtml(row.label)}</span><strong>${formatCell(row.value, row.format ?? "money", row)}</strong></div>`).join("")}</div></section>`;
}

const REPORT_CSS = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#18201d;background:#eef1ed;font-synthesis:none}*{box-sizing:border-box}body{margin:0}.toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:flex-end;padding:12px 24px;background:#18201d}.toolbar button{border:1px solid #fff;background:#fff;color:#18201d;border-radius:8px;padding:9px 14px;font-weight:700;cursor:pointer}.report{max-width:1120px;margin:24px auto;background:#fff;padding:42px;border-radius:18px;box-shadow:0 18px 50px rgba(24,32,29,.12)}header{border-bottom:3px solid #18201d;padding-bottom:24px;margin-bottom:26px}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#607068}h1{font-size:32px;margin:6px 0 8px}h2{font-size:21px;margin:32px 0 14px;border-bottom:1px solid #dfe5df;padding-bottom:8px}h3{font-size:16px;margin:0 0 12px}h4{margin:16px 0 8px}.meta{display:flex;flex-wrap:wrap;gap:10px 24px;color:#607068}.decision{margin:22px 0 0;padding:18px;border-radius:12px;border-left:7px solid #6b7b72;background:#f4f6f3}.decision.hard{border-color:#b33b3b;background:#fff1f1}.decision.soft{border-color:#b57916;background:#fff7e7}.decision.positive{border-color:#27724a;background:#edf8f1}.decision strong{font-size:20px}.summary{margin:10px 0 0;padding-left:20px;line-height:1.6}.kpi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.kpi{border:1px solid #dfe5df;border-radius:12px;padding:14px;background:#fafbfa}.kpi.negative{border-color:#e0a1a1;background:#fff7f7}.kpi span,.kpi small{display:block;color:#607068}.kpi strong{display:block;font-size:20px;margin:6px 0}.warnings{display:grid;gap:8px}.warning{display:grid;grid-template-columns:72px 1fr;gap:12px;border-radius:9px;padding:11px 13px;background:#f4f6f3}.warning.hard{background:#fff0f0;color:#7e2020}.warning.soft{background:#fff7e7;color:#79500c}.warning.info{background:#eef5f1;color:#315c46}.split{border:1px solid #dfe5df;border-radius:12px;overflow:hidden}.split>div,.assumption-row{display:flex;justify-content:space-between;gap:20px;padding:10px 13px;border-bottom:1px solid #edf0ed}.split>div:last-child,.assumption-row:last-child{border-bottom:0}.assumption-group{border:1px solid #dfe5df;border-radius:12px;padding:16px;margin:12px 0}.assumption-table{margin-top:12px}.cash-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px}.cash-summary>div{padding:14px;border:1px solid #dfe5df;border-radius:10px}.cash-summary span,.cash-summary strong{display:block}.cash-summary span{color:#607068;font-size:13px}.cash-summary strong{margin-top:6px;font-size:18px}.table-scroll{overflow:auto;border:1px solid #dfe5df;border-radius:10px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:right;padding:9px 10px;border-bottom:1px solid #edf0ed;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{background:#f3f5f3;color:#425148}.disclaimer{margin-top:34px;padding:14px;border:1px solid #dfe5df;border-radius:10px;color:#607068;font-size:13px;line-height:1.5}@media(max-width:760px){.report{margin:0;padding:22px;border-radius:0}.kpi-grid,.cash-summary{grid-template-columns:1fr}.toolbar{position:static}}@media print{body{background:#fff}.toolbar{display:none}.report{max-width:none;margin:0;padding:0;box-shadow:none}.assumption-group,.kpi,.warning,.table-scroll{break-inside:avoid}section{break-inside:auto}h2{break-after:avoid}}
`;

export function buildFinancialReportHtml(report) {
  const subtitle = [report.businessType, report.scenario.label].filter(Boolean).join(" · ");
  return `<!doctype html><html lang="tr" data-report-sector="${escapeHtml(report.sector.id)}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="description" content="${escapeHtml(report.sector.name)} finansal fizibilite raporu"/><title>${escapeHtml(report.sector.name)} · Finansal Fizibilite Raporu</title><style>${REPORT_CSS}</style></head><body>
  <div class="toolbar"><button type="button" onclick="window.print()">Yazdır / PDF</button></div>
  <main class="report"><header><p class="eyebrow">BUSINESS INCOME CALCULATOR · FİNANSAL FİZİBİLİTE RAPORU</p><h1>${escapeHtml(report.sector.name)}</h1><div class="meta"><span>${escapeHtml(report.sector.family)}</span><span>${escapeHtml(subtitle)}</span><span>Motor ${escapeHtml(report.sector.version)}</span><span>${escapeHtml(formatDate(report.generatedAt))}</span></div>
  <div class="decision ${escapeHtml(report.decision.tone)}"><strong>${escapeHtml(report.decision.label)}</strong><ul class="summary">${report.executiveSummary.map((sentence) => `<li>${escapeHtml(sentence)}</li>`).join("")}</ul></div></header>
  ${renderKpis(report)}${renderWarnings(report)}${renderScenarioTable(report)}${renderKeySplit(report)}${renderCashFlow(report)}${renderAssumptions(report)}
  <p class="disclaimer"><strong>Önemli:</strong> ${escapeHtml(report.disclaimer)}</p></main></body></html>`;
}

function safeFilename(value) {
  return String(value ?? "rapor").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function downloadFinancialReport(report) {
  const html = buildFinancialReportHtml(report);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFilename(report.sector.id)}-${safeFilename(report.scenario.id)}-rapor.html`;
  anchor.click();
  URL.revokeObjectURL(url);
  return html;
}
