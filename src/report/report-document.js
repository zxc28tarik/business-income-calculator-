import { escapeHtml, formatValue } from "../ui/formatters.js";

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? "") : date.toLocaleString("tr-TR");
}

function formatCell(value, format, options = {}) {
  return formatValue(value, format, options);
}

function renderKpiCards(cards, className = "") {
  return cards.map((card) => `
    <article class="kpi ${className} ${card.negative ? "negative" : ""} ${card.positive ? "positive" : ""}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${formatCell(card.value, card.format, card)}</strong>
      <small>${escapeHtml(card.note ?? "")}</small>
    </article>`).join("");
}

function renderKpis(report) {
  const primary = report.primaryKpis?.length ? report.primaryKpis : report.kpis.slice(0, 4);
  const secondary = report.secondaryKpis?.length
    ? report.secondaryKpis
    : report.kpis.filter((card) => !primary.includes(card));
  return `<section class="kpi-section"><div class="section-title"><div><p class="section-kicker">Karar özeti</p><h2>Dört ana gösterge</h2></div><span>${primary.length} gösterge</span></div>
    <div class="kpi-grid primary-kpis">${renderKpiCards(primary, "primary")}</div>
    ${secondary.length ? `<details class="secondary-kpis"><summary>Ayrıntılı göstergeler <span>${secondary.length} kalem</span></summary><div class="kpi-grid">${renderKpiCards(secondary)}</div></details>` : ""}
  </section>`;
}

function legacyWarningCard(warning) {
  const severity = warning.severity === "hard" ? "critical" : warning.severity === "soft" ? "warning" : warning.severity === "positive" ? "positive" : "info";
  return {
    severity,
    levelLabel: severity === "critical" ? "Kritik" : severity === "warning" ? "Dikkat" : severity === "positive" ? "Olumlu" : "Bilgi",
    title: severity === "critical" ? "Kritik finansal risk" : severity === "warning" ? "Kontrol edilmesi gereken varsayım" : severity === "positive" ? "Kontrol sonucu" : "Finansal kontrol notu",
    message: String(warning.message ?? ""),
  };
}

function reportWarningCards(report) {
  const sourceWarnings = Array.isArray(report.warnings) ? report.warnings : [];
  const cards = Array.isArray(report.warningCards) ? report.warningCards : [];
  const cardsMatchSource = cards.length === sourceWarnings.length
    && cards.every((card, index) => String(card.message ?? "") === String(sourceWarnings[index]?.message ?? ""));
  if (cardsMatchSource) return cards;
  return sourceWarnings.map(legacyWarningCard);
}

function renderWarnings(report) {
  const rows = reportWarningCards(report);
  const safeRows = rows.length ? rows : [{ severity: "positive", levelLabel: "Olumlu", title: "Kontrol sonucu", message: "Raporlanan eşiklerde uyarı bulunmuyor." }];
  return `<section><div class="section-title"><div><p class="section-kicker">Risk kontrolü</p><h2>Dikkat edilmesi gerekenler</h2></div><span>${safeRows.length} kayıt</span></div><div class="warnings">${safeRows.map((warning) => `
    <article class="warning ${escapeHtml(warning.severity)}"><div><b>${escapeHtml(warning.levelLabel)}</b><strong>${escapeHtml(warning.title)}</strong></div><p>${escapeHtml(warning.message)}</p></article>`).join("")}</div></section>`;
}

function renderScenarioTable(report) {
  return `<section><div class="section-title"><div><p class="section-kicker">Karşılaştırma</p><h2>Senaryo karşılaştırması</h2></div></div><div class="table-scroll"><table>
    <thead><tr><th>Gösterge</th>${report.scenarios.scenarios.map((item) => `<th class="${item.id === "expected" ? "expected" : ""}">${escapeHtml(item.label)}</th>`).join("")}</tr></thead>
    <tbody>${report.scenarios.metrics.map((metric) => `<tr><td>${escapeHtml(metric.label)}</td>${report.scenarios.scenarios.map((item) => `<td class="${item.id === "expected" ? "expected" : ""}">${formatCell(metric.values[item.id], metric.format, metric)}</td>`).join("")}</tr>`).join("")}</tbody>
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
  return `<section class="assumptions"><div class="section-title"><div><p class="section-kicker">Denetim izi</p><h2>Varsayımlar ve girdiler</h2></div><span>${report.assumptions.length} bölüm</span></div>${report.assumptions.map((section) => `
    <details class="assumption-group"><summary>${escapeHtml(section.title)} <span>${section.items.length} kalem</span></summary><div class="assumption-body">${section.items.map(renderAssumptionItem).join("")}</div></details>`).join("")}</section>`;
}

function cashSummaryCard(label, value, className = "", format = "money") {
  return `<div class="cash-card ${className}"><span>${escapeHtml(label)}</span><strong>${format === "text" ? escapeHtml(String(value)) : formatCell(value, format)}</strong></div>`;
}

function renderCashFlow(report) {
  const summary = report.cashFlow.summary;
  const firstNegative = summary.firstNegativeMonth == null ? "Yok" : `${summary.firstNegativeMonth}. ay`;
  return `<section><div class="section-title"><div><p class="section-kicker">Likidite</p><h2>12 aylık nakit görünümü</h2></div></div>
    <div class="cash-summary">
      ${cashSummaryCard("Minimum nakit", summary.minimumCash, Number(summary.minimumCash) < 0 ? "negative" : "positive")}
      ${cashSummaryCard("İlk negatif ay", firstNegative, summary.firstNegativeMonth == null ? "positive" : "negative", "text")}
      ${cashSummaryCard("12 ay sonu nakit", summary.endingCash, Number(summary.endingCash) < 0 ? "negative" : "positive")}
      ${cashSummaryCard("Ek finansman ihtiyacı", summary.additionalFundingNeed ?? Math.max(0, -(Number(summary.minimumCash) || 0)), Number(summary.additionalFundingNeed) > 0 ? "negative" : "positive")}
    </div>
    <div class="table-scroll"><table><thead><tr>${report.cashFlow.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
    <tbody>${report.cashFlow.rows.map((row) => `<tr>${report.cashFlow.columns.map((column) => {
      const value = row[column.key];
      const negativeCash = column.key === "cashEnd" && Number(value) < 0;
      return `<td class="${negativeCash ? "negative-cash" : ""}">${formatCell(value, column.format ?? "number", column)}</td>`;
    }).join("")}</tr>`).join("")}</tbody></table></div>
  </section>`;
}

function renderKeySplit(report) {
  return `<section><div class="section-title"><div><p class="section-kicker">Dağılım</p><h2>Finansal dağılım</h2></div></div><div class="split">${report.keySplit.map((row) => `<div><span>${escapeHtml(row.label)}</span><strong>${formatCell(row.value, row.format ?? "money", row)}</strong></div>`).join("")}</div></section>`;
}

const REPORT_CSS = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#17221d;background:#f3f5f4;font-synthesis:none;--ink:#17221d;--soft:#5e6b64;--line:#d8dfdb;--brand:#174a35;--brand-soft:#e5f0ea;--positive:#17603b;--positive-soft:#e4f3ea;--warning:#8a5b08;--warning-soft:#fff2cf;--danger:#a2342d;--danger-soft:#fbe8e5;--info:#355f7a;--info-soft:#e8f0f5}*{box-sizing:border-box}body{margin:0}.toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:flex-end;padding:12px 24px;background:var(--ink)}.toolbar button{min-height:44px;border:1px solid #fff;background:#fff;color:var(--brand);border-radius:8px;padding:9px 14px;font-weight:800;cursor:pointer}.report{max-width:1120px;margin:24px auto;background:#fff;padding:42px;border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 50px rgba(24,32,29,.1)}header{border-bottom:3px solid var(--brand);padding-bottom:24px;margin-bottom:26px}.eyebrow,.section-kicker{margin:0;font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:var(--brand)}h1{font-size:34px;margin:6px 0 8px}h2{font-size:21px;margin:0}h3{font-size:16px;margin:0 0 12px}h4{margin:16px 0 8px}.meta{display:flex;flex-wrap:wrap;gap:10px 24px;color:var(--soft)}section{margin-top:32px}.section-title{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px;padding-bottom:9px;border-bottom:1px solid var(--line)}.section-title>div{display:grid;gap:4px}.section-title>span{color:var(--soft);font-size:12px}.decision{margin:22px 0 0;padding:18px;border-radius:12px;border-left:7px solid #6b7b72;background:#f4f6f3}.decision.hard{border-color:var(--danger);background:var(--danger-soft)}.decision.soft{border-color:var(--warning);background:var(--warning-soft)}.decision.positive{border-color:var(--positive);background:var(--positive-soft)}.decision strong{font-size:20px}.decision-message{margin:8px 0 0;line-height:1.55}.decision-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0 0}.decision-facts div{padding:10px;border:1px solid rgba(23,34,29,.12);border-radius:8px;background:rgba(255,255,255,.65)}.decision-facts span,.decision-facts b{display:block}.decision-facts span{color:var(--soft);font-size:11px}.decision-facts b{margin-top:4px;font-size:14px}.summary{margin:10px 0 0;padding-left:20px;line-height:1.6}.kpi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.primary-kpis{grid-template-columns:repeat(4,minmax(0,1fr))}.kpi{border:1px solid var(--line);border-radius:10px;padding:14px;background:#fafbfa}.kpi.primary{background:#fff}.kpi.negative{border-color:#e0a1a1;background:var(--danger-soft)}.kpi.positive strong{color:var(--positive)}.kpi span,.kpi small{display:block;color:var(--soft)}.kpi strong{display:block;font-size:20px;margin:6px 0;font-variant-numeric:tabular-nums}.secondary-kpis,.assumption-group{margin-top:12px;border:1px solid var(--line);border-radius:10px;overflow:hidden}.secondary-kpis summary,.assumption-group summary{display:flex;justify-content:space-between;gap:12px;padding:12px 14px;background:#f7f9f8;cursor:pointer;font-weight:800}.secondary-kpis summary span,.assumption-group summary span{color:var(--soft);font-size:11px}.secondary-kpis .kpi-grid,.assumption-body{padding:14px}.warnings{display:grid;gap:9px}.warning{display:grid;grid-template-columns:190px 1fr;gap:14px;border:1px solid var(--line);border-left-width:4px;border-radius:9px;padding:12px 14px;background:#f4f6f3}.warning div{display:grid;gap:4px}.warning b{font-size:10px;text-transform:uppercase;letter-spacing:.06em}.warning strong{font-size:13px}.warning p{margin:0;line-height:1.5}.warning.critical{background:var(--danger-soft);border-left-color:var(--danger);color:#7e2020}.warning.warning{background:var(--warning-soft);border-left-color:var(--warning);color:#79500c}.warning.info{background:var(--info-soft);border-left-color:var(--info);color:var(--info)}.warning.positive{background:var(--positive-soft);border-left-color:var(--positive);color:var(--positive)}.split{border:1px solid var(--line);border-radius:10px;overflow:hidden}.split>div,.assumption-row{display:flex;justify-content:space-between;gap:20px;padding:10px 13px;border-bottom:1px solid #edf0ed}.split>div:last-child,.assumption-row:last-child{border-bottom:0}.assumption-table{margin-top:12px}.cash-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.cash-card{padding:14px;border:1px solid var(--line);border-radius:9px;background:#f7f9f8}.cash-card span,.cash-card strong{display:block}.cash-card span{color:var(--soft);font-size:12px}.cash-card strong{margin-top:6px;font-size:17px;font-variant-numeric:tabular-nums}.cash-card.negative{background:var(--danger-soft);border-color:#e0a1a1}.cash-card.negative strong,.negative-cash{color:var(--danger)}.cash-card.positive strong{color:var(--positive)}.table-scroll{overflow:auto;border:1px solid var(--line);border-radius:9px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:right;padding:9px 10px;border-bottom:1px solid #edf0ed;white-space:nowrap;font-variant-numeric:tabular-nums}th:first-child,td:first-child{text-align:left}th{background:#f3f5f3;color:#425148}.expected{background:var(--brand-soft)!important}.negative-cash{background:var(--danger-soft);font-weight:800}.disclaimer{margin-top:34px;padding:14px;border:1px solid var(--line);border-radius:10px;color:var(--soft);font-size:12px;line-height:1.5}@media(max-width:900px){.primary-kpis,.decision-facts,.cash-summary{grid-template-columns:1fr 1fr}}@media(max-width:760px){.report{margin:0;padding:22px;border:0;border-radius:0}.kpi-grid,.primary-kpis,.decision-facts,.cash-summary{grid-template-columns:1fr}.toolbar{position:static}.warning{grid-template-columns:1fr}}@page{size:A4;margin:14mm}@media print{body{background:#fff}.toolbar{display:none}.report{max-width:none;margin:0;padding:0;border:0;box-shadow:none}.secondary-kpis,.assumption-group{break-inside:avoid}.secondary-kpis>div,.assumption-group>.assumption-body{display:block!important}.kpi,.warning,.table-scroll,.cash-card{break-inside:avoid}section{break-inside:auto}h2{break-after:avoid}.primary-kpis{grid-template-columns:repeat(4,1fr)}.kpi-grid{grid-template-columns:repeat(3,1fr)}.cash-summary,.decision-facts{grid-template-columns:repeat(4,1fr)}}
`;

export function buildFinancialReportHtml(report) {
  const subtitle = [report.businessType, report.scenario.label].filter(Boolean).join(" · ");
  const decisionMessage = report.decision.message ?? report.executiveSummary?.[1] ?? "Mevcut hesap sonucu özetlenmiştir.";
  return `<!doctype html><html lang="tr" data-report-sector="${escapeHtml(report.sector.id)}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="description" content="${escapeHtml(report.sector.name)} finansal fizibilite raporu"/><title>${escapeHtml(report.sector.name)} · Finansal Fizibilite Raporu</title><style>${REPORT_CSS}</style></head><body>
  <div class="toolbar"><button type="button" onclick="window.print()">Yazdır / PDF</button></div>
  <main class="report"><header><p class="eyebrow">BUSINESS INCOME CALCULATOR · FİNANSAL FİZİBİLİTE RAPORU</p><h1>${escapeHtml(report.sector.name)}</h1><div class="meta"><span>${escapeHtml(report.sector.family)}</span><span>${escapeHtml(subtitle)}</span><span>Motor ${escapeHtml(report.sector.version)}</span><span>${escapeHtml(formatDate(report.generatedAt))}</span></div>
  <div class="decision ${escapeHtml(report.decision.tone)}"><strong>${escapeHtml(report.decision.label)}</strong><p class="decision-message">${escapeHtml(decisionMessage)}</p><div class="decision-facts"><div><span>Aylık net</span><b>${formatCell(report.decision.netProfit, "money")}</b></div><div><span>12 ay nakit</span><b>${formatCell(report.decision.endingCash, "money")}</b></div><div><span>Başabaş</span><b>${escapeHtml(report.decision.breakevenStatus ?? "Belirsiz")}</b></div><div><span>Kritik risk</span><b>${formatCell(report.decision.hardCount, "number")}</b></div></div><ul class="summary">${report.executiveSummary.map((sentence) => `<li>${escapeHtml(sentence)}</li>`).join("")}</ul></div></header>
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
