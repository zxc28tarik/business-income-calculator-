import { escapeHtml, formatValue } from "../ui/formatters.js";
import { TRACKING_REASON_OPTIONS } from "./tracking-model.js";

const REASON_LABELS = Object.fromEntries(TRACKING_REASON_OPTIONS);
const STATUS_LABELS = {
  on_track: "Plana yakın",
  watch: "Dikkat gerektiriyor",
  off_track: "Planın gerisinde",
  missing: "Gerçekleşen veri bekleniyor",
};

function money(value) {
  return value == null ? "—" : formatValue(value, "money");
}

function rate(value) {
  return value == null ? "—" : formatValue(value, "percent");
}

function signedMoney(value) {
  if (value == null) return "—";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatValue(value, "money")}`;
}

function trendLabel(trend) {
  if (!trend || trend.direction === "insufficient") return "Yetersiz veri";
  if (trend.direction === "flat") return "Yatay";
  return trend.direction === "up" ? "Yükseliyor" : "Düşüyor";
}

function renderSummaryCard(label, value, note = "") {
  return `<article class="summary-card"><span>${escapeHtml(label)}</span><strong>${value}</strong><small>${escapeHtml(note)}</small></article>`;
}

function renderRows(model) {
  const rows = model.completedRows;
  if (!rows.length) return `<tr><td colspan="9">Henüz gerçekleşen dönem kaydı bulunmuyor.</td></tr>`;
  return rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.label)}</td>
      <td>${money(row.plan.collections)}</td>
      <td>${money(row.actual.collections)}</td>
      <td class="${(row.variance.collections ?? 0) < 0 ? "negative" : "positive"}">${signedMoney(row.variance.collections)}</td>
      <td>${money(row.plan.operatingResult)}</td>
      <td>${money(row.actual.operatingResult)}</td>
      <td class="${(row.variance.operatingResult ?? 0) < 0 ? "negative" : "positive"}">${signedMoney(row.variance.operatingResult)}</td>
      <td>${money(row.actual.cashEnd)}</td>
      <td>${escapeHtml(REASON_LABELS[row.actual.reason] || "Belirtilmedi")}</td>
    </tr>`).join("");
}

function renderNotes(model) {
  const notes = model.completedRows.filter((row) => row.actual.note);
  if (!notes.length) return `<p class="muted">Dönem notu girilmedi.</p>`;
  return `<ul>${notes.map((row) => `<li><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.actual.note)}</li>`).join("")}</ul>`;
}

export function buildTrackingReportHtml({ sector, scenarioLabel, model, generatedAt = new Date() }) {
  const status = STATUS_LABELS[model.overallStatus] ?? STATUS_LABELS.missing;
  const generated = generatedAt instanceof Date ? generatedAt : new Date(generatedAt);
  const lastCashVariance = model.lastCompleted?.variance.cashEnd ?? null;
  return `<!doctype html>
<html lang="tr" data-tracking-sector="${escapeHtml(sector.id)}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(sector.name)} · Tahmin-Gerçekleşen Raporu</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;color:#17201d;background:#eef2ee}*{box-sizing:border-box}body{margin:0}main{max-width:1180px;margin:0 auto;padding:28px}.toolbar{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:20px}.toolbar button{border:1px solid #1f5d45;background:#1f5d45;color:white;padding:10px 16px;border-radius:8px;font-weight:700}.eyebrow{font-size:12px;letter-spacing:.12em;font-weight:800;color:#39715b;margin:0 0 6px}h1{margin:0 0 6px;font-size:30px}h2{font-size:19px;margin:0 0 14px}.muted,small{color:#61706a}.status{display:inline-flex;padding:8px 12px;border-radius:999px;background:#dfe8e2;font-weight:800}.status.off_track{background:#f4d8d5;color:#842d26}.status.watch{background:#f4e7bd;color:#73570c}.status.on_track{background:#d7ebdf;color:#175b38}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.summary-card,.panel{background:white;border:1px solid #d9e1dc;border-radius:12px}.summary-card{padding:16px}.summary-card span{display:block;font-size:12px;color:#61706a}.summary-card strong{display:block;font-size:22px;margin:7px 0}.panel{padding:18px;margin-top:16px}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:10px 8px;border-bottom:1px solid #e3e9e5;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}.positive{color:#17633d}.negative{color:#a1312a}ul{padding-left:20px;line-height:1.6}.footnote{font-size:12px;color:#68766f;margin-top:18px}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}.toolbar{display:block}.toolbar button{margin-top:12px}}@media print{body{background:white}.toolbar button{display:none}main{max-width:none;padding:0}.panel,.summary-card{break-inside:avoid}}
</style>
</head>
<body>
<main>
  <header class="toolbar">
    <div><p class="eyebrow">BUSINESS INCOME CALCULATOR · GERÇEK TAKİP RAPORU</p><h1>${escapeHtml(sector.name)}</h1><p class="muted">Kullanıcı girdilerine göre bütçe · ${escapeHtml(generated.toLocaleString("tr-TR"))}</p></div>
    <button type="button" onclick="window.print()">Yazdır / PDF</button>
  </header>
  <section class="panel"><h2>Genel görünüm</h2><span class="status ${escapeHtml(model.overallStatus)}">${escapeHtml(status)}</span><p>${model.completedMonths} dönem kaydedildi; ${model.completeFinancialMonths} dönemde tahsilat ve ana giderler karşılaştırılabilir durumda.</p></section>
  <section class="grid">
    ${renderSummaryCard("Tahsilat sapması", signedMoney(model.totals.collectionsVariance), rate(model.totals.collectionsVarianceRate))}
    ${renderSummaryCard("Faaliyet sonucu sapması", signedMoney(model.totals.operatingResultVariance), rate(model.totals.operatingResultVarianceRate))}
    ${renderSummaryCard("Net nakit hareketi sapması", signedMoney(model.totals.netCashMovementVariance), rate(model.totals.netCashMovementVarianceRate))}
    ${renderSummaryCard("Son dönem nakit farkı", signedMoney(lastCashVariance), model.lastCompleted?.label ?? "Dönem yok")}
  </section>
  <section class="panel"><h2>Dönem karşılaştırması</h2><div class="table-wrap"><table><thead><tr><th>Dönem</th><th>Plan tahsilat</th><th>Gerçek tahsilat</th><th>Fark</th><th>Plan faaliyet</th><th>Gerçek faaliyet</th><th>Fark</th><th>Gerçek nakit</th><th>Ana neden</th></tr></thead><tbody>${renderRows(model)}</tbody></table></div></section>
  <section class="panel"><h2>Trend özeti</h2><div class="grid">
    ${renderSummaryCard("Tahsilat trendi", trendLabel(model.trends.collections), rate(model.trends.collections.rate))}
    ${renderSummaryCard("Faaliyet sonucu trendi", trendLabel(model.trends.operatingResult), rate(model.trends.operatingResult.rate))}
    ${renderSummaryCard("Dönem sonu nakit trendi", trendLabel(model.trends.cashEnd), rate(model.trends.cashEnd.rate))}
    ${renderSummaryCard("Operasyon hacmi trendi", trendLabel(model.trends.volume), rate(model.trends.volume.rate))}
  </div></section>
  <section class="panel"><h2>Sapma notları</h2>${renderNotes(model)}</section>
  <p class="footnote"><strong>Önemli:</strong> Bu belge işletme içi tahmin-gerçekleşen takibidir. Muhasebe kaydı, mali müşavirlik, vergi danışmanlığı veya yatırım tavsiyesi değildir.</p>
</main>
</body>
</html>`;
}

export function downloadTrackingReport(context) {
  const html = buildTrackingReportHtml(context);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${context.sector.id}-gercek-takip.html`;
  anchor.click();
  URL.revokeObjectURL(url);
  return html;
}
