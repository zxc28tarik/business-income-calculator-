import test from "node:test";
import assert from "node:assert/strict";
import { buildFinancialReportModel } from "../src/report/report-model.js";
import { buildFinancialReportHtml } from "../src/report/report-document.js";

function presentationFor(netProfit, endingCash) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: netProfit, format: "money", negative: netProfit < 0 },
      { id: "gross_revenue", label: "Aylık ciro", value: 450_000, format: "money" },
      { id: "breakeven_orders", label: "Başabaş sipariş", value: 1_250, format: "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: endingCash, format: "money", negative: endingCash < 0 },
      { id: "gross_margin", label: "Brüt marj", value: 0.42, format: "percent" },
    ],
    keySplit: [
      { label: "Net satış", value: 450_000, format: "money" },
      { label: "Toplam gider", value: 490_000, format: "money" },
    ],
    scenarioMetrics: [
      { id: "net_profit", label: "Aylık net", value: netProfit, format: "money" },
      { id: "ending_cash", label: "12 ay nakit", value: endingCash, format: "money" },
    ],
  };
}

function scenarioResult(netProfit, endingCash) {
  return {
    netProfit,
    grossRevenue: 450_000,
    cashFlow: {
      endingCash,
      minimumCash: Math.min(endingCash, -75_000),
      rows: [
        { month: 1, collections: 300_000, cashEnd: 120_000 },
        { month: 2, collections: 320_000, cashEnd: -75_000 },
        { month: 12, collections: 450_000, cashEnd: endingCash },
      ],
    },
    warnings: [
      { id: "negative_profit", severity: "hard", message: "İşletme aylık zarar ediyor." },
      { id: "margin", severity: "soft", message: "Brüt marj kontrol edilmeli." },
    ],
    presentation: presentationFor(netProfit, endingCash),
  };
}

const sector = {
  id: "cafe_restaurant",
  name: "Kafe / Restoran",
  family: "Yeme İçme",
  version: "2.3",
  scenarios: {
    pessimistic: { label: "Kötümser" },
    expected: { label: "Beklenen" },
    optimistic: { label: "İyimser" },
  },
  formSections: [
    {
      title: "İş modeli",
      fields: [
        { key: "businessType", label: "İş türü", type: "select", options: [["cafe", "Kafe"]] },
        { key: "monthlyCustomers", label: "Aylık müşteri", type: "number" },
      ],
    },
  ],
  buildPresentation(result) { return result.presentation; },
};

function buildReport() {
  const result = scenarioResult(-40_000, -20_000);
  return buildFinancialReportModel({
    sector,
    scenarioId: "expected",
    inputs: { businessType: "cafe", monthlyCustomers: 2_400 },
    result,
    presentation: result.presentation,
    scenarios: [
      { id: "pessimistic", label: "Kötümser", result: scenarioResult(-90_000, -150_000) },
      { id: "expected", label: "Beklenen", result },
      { id: "optimistic", label: "İyimser", result: scenarioResult(80_000, 650_000) },
    ],
    generatedAt: new Date("2026-07-24T12:00:00Z"),
  });
}

test("v0.24 rapor modeli ana ekran hiyerarşisini ekler ve eski sayıları korur", () => {
  const report = buildReport();
  assert.equal(report.reportVersion, "1.1");
  assert.equal(report.decision.status, "riskli");
  assert.match(report.decision.message, /aylık zarar/i);
  assert.equal(report.primaryKpis.length, 4);
  assert.equal(report.primaryKpis[0].value, -40_000);
  assert.equal(report.primaryKpis[3].value, -20_000);
  assert.equal(report.secondaryKpis.some((card) => card.id === "gross_margin"), true);
  assert.equal(report.kpis.find((card) => card.id === "gross_margin").value, 0.42);
  assert.equal(report.warningCards[0].severity, "critical");
  assert.equal(report.warningCards[0].title, "Aylık zarar");
  assert.equal(report.cashFlow.summary.minimumCash, -75_000);
  assert.equal(report.cashFlow.summary.firstNegativeMonth, 2);
  assert.equal(report.cashFlow.summary.additionalFundingNeed, 75_000);
  assert.equal(report.scenarios.metrics.find((metric) => metric.id === "net_profit").values.expected, -40_000);
});

test("rapor HTML'i karar, ana göstergeler, uyarı, nakit ve yazdırma sözleşmesini taşır", () => {
  const html = buildFinancialReportHtml(buildReport());
  assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);
  assert.match(html, /Dört ana gösterge/);
  assert.match(html, /Riskli model/);
  assert.match(html, /Aylık net/);
  assert.match(html, /Dikkat edilmesi gerekenler/);
  assert.match(html, /class="warning critical"/);
  assert.match(html, /class="expected"/);
  assert.match(html, /Ek finansman ihtiyacı/);
  assert.match(html, /class="negative-cash"/);
  assert.match(html, /Ayrıntılı göstergeler/);
  assert.match(html, /Varsayımlar ve girdiler/);
  assert.match(html, /Yazdır \/ PDF/);
  assert.match(html, /@page\{size:A4/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
});
