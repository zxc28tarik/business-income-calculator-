import test from "node:test";
import assert from "node:assert/strict";
import { SECTORS } from "../src/sectors/registry.js";
import { buildDecisionHierarchy } from "../src/ui/decision-summary.js";

test("sekiz sektör karar özeti ve tam dört ana gösterge üretir", () => {
  for (const sector of SECTORS) {
    const result = sector.calculateModel(sector.defaultInputs);
    const presentation = sector.buildPresentation(result);
    const resultBefore = JSON.stringify(result);
    const presentationBefore = JSON.stringify(presentation);
    const hierarchy = buildDecisionHierarchy({ sector, result, presentation });

    assert.equal(hierarchy.primaryKpis.length, 4, `${sector.id}: dört ana gösterge olmalıdır`);
    assert.equal(hierarchy.primaryKpis[0].id, "net_profit", `${sector.id}: ilk gösterge net sonuç olmalıdır`);
    assert.equal(hierarchy.primaryKpis[2].id, "breakeven", `${sector.id}: üçüncü gösterge başabaş olmalıdır`);
    assert.equal(hierarchy.primaryKpis[3].id, "ending_cash", `${sector.id}: dördüncü gösterge nakit olmalıdır`);
    assert.ok(["dengeli", "dikkat", "riskli"].includes(hierarchy.decision.status));
    assert.ok(hierarchy.decision.message.length > 20, `${sector.id}: karar cümlesi bulunmalıdır`);
    assert.ok(hierarchy.secondaryKpis.length >= 4, `${sector.id}: ikincil göstergeler korunmalıdır`);
    assert.equal(JSON.stringify(result), resultBefore, `${sector.id}: finans sonucu değiştirilmemelidir`);
    assert.equal(JSON.stringify(presentation), presentationBefore, `${sector.id}: sunum kaynağı değiştirilmemelidir`);
  }
});

test("zarar veya negatif minimum nakit riskli karar üretir", () => {
  const sector = { id: "test_sector" };
  const result = {
    netProfit: 10_000,
    cashFlow: {
      endingCash: 50_000,
      minimumCash: -25_000,
      rows: [],
    },
    warnings: [],
    grossRevenue: 100_000,
  };
  const presentation = {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: 10_000, format: "money" },
      { id: "breakeven_units", label: "Başabaş satış", value: 80, format: "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: 50_000, format: "money" },
      { id: "other", label: "Diğer", value: 1, format: "number" },
    ],
  };

  const hierarchy = buildDecisionHierarchy({ sector, result, presentation });
  assert.equal(hierarchy.decision.status, "riskli");
  assert.match(hierarchy.decision.message, /nakit dengesi dönem içinde negatife düşüyor/);
  assert.equal(hierarchy.primaryKpis[3].negative, true);
});
