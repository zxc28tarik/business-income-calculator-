import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCashFlowSummary,
  buildWarningViewModel,
  normalizeWarningSeverity,
} from "../src/ui/results-view.js";

test("uyarı önem seviyeleri ortak dört seviyeye dönüştürülür", () => {
  assert.equal(normalizeWarningSeverity("hard"), "critical");
  assert.equal(normalizeWarningSeverity("soft"), "warning");
  assert.equal(normalizeWarningSeverity("info"), "info");
  assert.equal(normalizeWarningSeverity("success"), "positive");
});

test("kritik uyarılar ilk üç sınırından bağımsız olarak görünür kalır", () => {
  const warnings = [
    { id: "margin", severity: "soft", message: "Marj düşük." },
    { id: "negative_profit", severity: "hard", message: "İşletme zarar ediyor." },
    { id: "cash_gap", severity: "hard", message: "Nakit eksiye düşüyor." },
    { id: "commission", severity: "soft", message: "Komisyon yüksek." },
    { id: "healthy", severity: "info", message: "Bilgi notu." },
  ];

  const collapsed = buildWarningViewModel(warnings, { limit: 3 });
  assert.deepEqual(collapsed.items.map((item) => item.id), ["negative_profit", "cash_gap", "margin"]);
  assert.equal(collapsed.criticalCount, 2);
  assert.equal(collapsed.hiddenWhenCollapsed.length, 2);
  assert.equal(collapsed.items[0].title, "Aylık zarar");

  const expanded = buildWarningViewModel(warnings, { expanded: true, limit: 3 });
  assert.equal(expanded.items.length, warnings.length);
  assert.equal(expanded.hiddenWhenCollapsed.length, 2);
});

test("nakit özeti minimumu, ilk negatif ayı ve finansman ihtiyacını hesaplar", () => {
  const summary = buildCashFlowSummary([
    { month: 1, cashEnd: 120_000 },
    { month: 2, cashEnd: -35_000 },
    { month: 3, cashEnd: 18_000 },
  ]);

  assert.deepEqual(summary, {
    endingCash: 18_000,
    minimumCash: -35_000,
    firstNegativeMonth: 2,
    additionalFundingNeed: 35_000,
  });
});

test("boş nakit akışı güvenli sıfır özeti üretir", () => {
  assert.deepEqual(buildCashFlowSummary([]), {
    endingCash: 0,
    minimumCash: 0,
    firstNegativeMonth: null,
    additionalFundingNeed: 0,
  });
});
