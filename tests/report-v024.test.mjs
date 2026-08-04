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

function modelResult(netProfit, endingCash) {
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

function buildReport(setup = undefined) {
  const result = modelResult(-40_000, -20_000);
  return buildFinancialReportModel({
    sector,
    inputs: { businessType: "cafe", monthlyCustomers: 2_400 },
    result,
    presentation: result.presentation,
    setup,
    generatedAt: new Date("2026-07-24T12:00:00Z"),
  });
}

test("v0.24 rapor modeli tek kullanıcı girdisi ve kuruluş hiyerarşisini korur", () => {
  const report = buildReport();
  assert.equal(report.reportVersion, "1.3");
  assert.equal(report.scenario.id, "user-input");
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
  assert.equal(report.scenarios.scenarios.length, 1);
  assert.equal(report.scenarios.metrics.find((metric) => metric.id === "net_profit").values["user-input"], -40_000);
  assert.equal(report.setup.version, 2);
  assert.equal(report.setup.cashBridge.grossStartupCashNeed, 0);
  assert.ok(report.setup.items.length >= 10);
  assert.deepEqual(
    report.cashFlow.columns.slice(-8).map((column) => column.key),
    [
      "legacyStartupAdjustment",
      "setupFundingInflow",
      "setupPaymentOutflow",
      "debtPrincipalPayment",
      "debtInterestPayment",
      "debtFeePayment",
      "baseCashEnd",
      "cashEnd",
    ],
  );
});

test("rapor kuruluş maliyeti ve borç servisini birleşik nakde taşır", () => {
  const report = buildReport({
    profile: { sectorId: "cafe_restaurant", businessType: "cafe" },
    reserveRate: 0,
    items: [{
      id: "setup-machine",
      label: "Kahve makinesi",
      status: "included",
      costType: "CAPEX",
      quantity: 1,
      unitCost: 60_000,
      paymentMonth: 1,
      installmentCount: 2,
    }],
    funding: [{
      id: "bank-loan",
      label: "Banka kredisi",
      type: "loan",
      status: "available",
      amount: 60_000,
      availableMonth: 0,
      annualInterestRate: 0.12,
      termMonths: 12,
      upfrontFeeRate: 0.01,
    }],
  });

  assert.equal(report.setup.cashBridge.grossStartupCashNeed, 60_000);
  assert.equal(report.setup.debtService.activeDebtAmount, 60_000);
  assert.equal(report.cashFlow.rows[0].month, 0);
  assert.equal(report.cashFlow.rows[0].setupFundingInflow, 60_000);
  assert.equal(report.cashFlow.rows[0].debtFeePayment, 600);
  assert.equal(report.cashFlow.rows.find((row) => row.month === 1).setupPaymentOutflow, 30_000);
  assert.ok(report.cashFlow.rows.find((row) => row.month === 1).debtInterestPayment > 0);
});

test("rapor HTML'i karar, kuruluş, borç, nakit ve yazdırma sözleşmesini taşır", () => {
  const html = buildFinancialReportHtml(buildReport());
  assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);
  assert.match(html, /Dört ana gösterge/);
  assert.match(html, /Riskli model/);
  assert.match(html, /Aylık net/);
  assert.match(html, /Dikkat edilmesi gerekenler/);
  assert.match(html, /class="warning critical"/);
  assert.doesNotMatch(html, /Senaryo karşılaştırması/);
  assert.doesNotMatch(html, /class="expected"/);
  assert.match(html, /İşletmeyi açmanın gerçek maliyeti/);
  assert.match(html, /Finansman ve borç koşulları/);
  assert.match(html, /Kuruluş ve borç ödeme takvimi/);
  assert.match(html, /Açılış \+ 12 aylık birleşik nakit görünümü/);
  assert.match(html, /Ek finansman ihtiyacı/);
  assert.match(html, /class="negative-cash"/);
  assert.match(html, /Ayrıntılı göstergeler/);
  assert.match(html, /Varsayımlar ve girdiler/);
  assert.match(html, /Yazdır \/ PDF/);
  assert.match(html, /@page\{size:A4/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
});
