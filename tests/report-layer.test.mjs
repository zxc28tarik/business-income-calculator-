import test from "node:test";
import assert from "node:assert/strict";
import { cloneInputValue, initializeScenarioInputs } from "../src/core/sector-schema.js";
import { SECTORS } from "../src/sectors/registry.js";
import { buildFinancialReportModel } from "../src/report/report-model.js";
import { buildFinancialReportHtml } from "../src/report/report-document.js";

function reportFor(sector, overrides = {}) {
  const scenarioInputs = initializeScenarioInputs(sector);
  const inputs = sector.normalizeInputs({ ...cloneInputValue(scenarioInputs.expected), ...overrides });
  scenarioInputs.expected = inputs;
  const result = sector.calculateModel(inputs);
  const presentation = sector.buildPresentation(result);
  const scenarios = sector.calculateScenarioComparison(scenarioInputs);
  return buildFinancialReportModel({
    sector,
    scenarioId: "expected",
    inputs,
    result,
    presentation,
    scenarios,
    generatedAt: new Date("2026-07-21T12:00:00Z"),
  });
}

test("sekiz sektör ortak rapor sözleşmesi üretir", () => {
  assert.equal(SECTORS.length, 8);
  for (const sector of SECTORS) {
    const report = reportFor(sector);
    assert.equal(report.sector.id, sector.id);
    assert.equal(report.scenario.id, "user-input");
    assert.ok(["riskli", "kosullu", "dengeli"].includes(report.decision.id));
    assert.ok(report.executiveSummary.length >= 2);
    assert.ok(report.kpis.length >= 4);
    assert.ok(report.assumptions.length >= 3);
    assert.equal(report.scenarios.scenarios.length, 1);
    assert.ok(report.scenarios.metrics.length >= 3);
    assert.ok(report.cashFlow.rows.length >= 12);
    assert.ok(report.cashFlow.columns.length >= 4);
  }
});

test("rapor yalnız görünür form alanlarını denetim izine alır", () => {
  let tableCount = 0;
  for (const sector of SECTORS) {
    const report = reportFor(sector);
    const items = report.assumptions.flatMap((section) => section.items);
    assert.ok(items.some((item) => item.type === "value"), `${sector.id} değer varsayımı içermeli`);
    for (const item of items.filter((candidate) => candidate.type === "table")) {
      tableCount += 1;
      assert.ok(item.columns.length > 0);
      assert.ok(Array.isArray(item.rows));
    }
  }
  assert.ok(tableCount > 0, "en az bir görünür gelişmiş tablo rapora girmeli");
});

test("kritik uyarı ve negatif nakit riskli görünüm üretir", () => {
  const sector = SECTORS[0];
  const scenarioInputs = initializeScenarioInputs(sector);
  const inputs = scenarioInputs.expected;
  const baseResult = sector.calculateModel(inputs);
  const result = {
    ...baseResult,
    netProfit: -1000,
    warnings: [
      { id: "a", severity: "hard", message: "Birinci kritik risk" },
      { id: "b", severity: "hard", message: "İkinci kritik risk" },
    ],
    cashFlow: { ...baseResult.cashFlow, endingCash: -5000 },
  };
  const presentation = sector.buildPresentation(result);
  const report = buildFinancialReportModel({
    sector,
    scenarioId: "expected",
    inputs,
    result,
    presentation,
    scenarios: sector.calculateScenarioComparison(scenarioInputs),
  });
  assert.equal(report.decision.id, "riskli");
  assert.equal(report.decision.hardCount, 2);
  assert.equal(report.warnings[0].severity, "hard");
});

test("paylaşılabilir rapor HTML dosyası harici kaynağa ihtiyaç duymaz", () => {
  for (const sector of SECTORS) {
    const html = buildFinancialReportHtml(reportFor(sector));
    assert.match(html, /<!doctype html>/i);
    assert.match(html, new RegExp(`data-report-sector="${sector.id}"`));
    assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);
    assert.match(html, /Yazdır \/ PDF/);
    assert.doesNotMatch(html, /Senaryo karşılaştırması/);
    assert.match(html, /Varsayımlar ve girdiler/);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
    assert.ok(Buffer.byteLength(html) < 2_000_000);
  }
});

test("rapor kullanıcı metnini HTML olarak çalıştırmaz", () => {
  const report = reportFor(SECTORS[0]);
  report.executiveSummary = ['<img src=x onerror="alert(1)">'];
  report.warnings = [{ severity: "hard", message: '<script>alert("x")</script>' }];
  const html = buildFinancialReportHtml(report);
  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
});
