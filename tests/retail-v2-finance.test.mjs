import test from "node:test";
import assert from "node:assert/strict";
import {
  RETAIL_DEFAULT_INPUTS,
  applyRetailBusinessType,
  applyRetailScenario,
  buildRetailPresentation,
  calculateRetailModel,
} from "../src/sectors/retail-v2.js";

const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("gelişmiş ürün karması fiyat, maliyet, iade ve iskonto üretir", () => {
  const result = calculateRetailModel({
    ...RETAIL_DEFAULT_INPUTS,
    advancedProductMixEnabled: true,
    productMix: [
      { name: "A", salesShareRate: 0.5, salePrice: 400, unitCost: 200, returnRate: 0.02, markdownShareRate: 0.2, markdownDiscountRate: 0.25, spoilageRate: 0.01 },
      { name: "B", salesShareRate: 0.5, salePrice: 200, unitCost: 80, returnRate: 0.04, markdownShareRate: 0, markdownDiscountRate: 0, spoilageRate: 0.03 },
    ],
  });
  close(result.productMetrics.salePrice, 300);
  close(result.productMetrics.unitCostBeforeDiscount, 140);
  close(result.productMetrics.returnRate, 0.03);
  close(result.productMetrics.markdownShareRate, 0.1);
  close(result.productMetrics.markdownDiscountRate, 0.125);
  assert.ok(result.grossRevenue < 929500);
});

test("tedarikçi karması vade, teslim süresi ve alım indirimini ağırlıklandırır", () => {
  const result = calculateRetailModel({
    ...RETAIL_DEFAULT_INPUTS,
    advancedSupplierMixEnabled: true,
    suppliers: [
      { name: "A", purchaseShareRate: 0.75, paymentDelayDays: 30, leadTimeDays: 10, discountRate: 0.10, minimumOrderAmount: 10000 },
      { name: "B", purchaseShareRate: 0.25, paymentDelayDays: 10, leadTimeDays: 20, discountRate: 0.02, minimumOrderAmount: 5000 },
    ],
  });
  close(result.supplierMetrics.paymentDelayDays, 25);
  close(result.supplierMetrics.leadTimeDays, 12.5);
  close(result.supplierMetrics.discountRate, 0.08);
  assert.ok(result.purchaseDiscountSavings > 0);
  assert.equal(result.supplierMinimumOrderAmount, 15000);
});

test("stok planı işletme sermayesi açığı ve yeniden sipariş noktası üretir", () => {
  const result = calculateRetailModel({
    ...RETAIL_DEFAULT_INPUTS,
    inventoryPlanningEnabled: true,
    currentInventoryCost: 100000,
    targetStockCoverageDays: 60,
    supplierLeadTimeDays: 20,
    safetyStockDays: 10,
  });
  assert.ok(result.targetInventoryCost > result.currentInventoryCost);
  assert.ok(result.workingCapitalGap > 0);
  assert.ok(result.reorderPointCost > 0);
  assert.ok(result.warnings.some((item) => ["working_capital", "reorder_risk"].includes(item.id)));
});

test("amortisman P&L gideridir fakat nakit sabit giderine girmez", () => {
  const base = calculateRetailModel(RETAIL_DEFAULT_INPUTS);
  const depreciated = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, monthlyDepreciation: 25000 });
  close(depreciated.netProfit, base.netProfit - 25000);
  close(depreciated.cashFixedCosts, base.cashFixedCosts);
});

test("finansman P&L sonucunu değiştirmez, faaliyet hibesi değiştirir", () => {
  const base = calculateRetailModel(RETAIL_DEFAULT_INPUTS);
  const financed = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, financingAmount: 500000 });
  const grant = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, monthlyOperatingGrantIncome: 50000 });
  close(financed.netProfit, base.netProfit);
  assert.ok(financed.cashFlow.endingCash > base.cashFlow.endingCash);
  assert.ok(grant.netProfit > base.netProfit);
});

test("senaryolar trafik ve iskonto sürücülerini bağımsız değiştirir", () => {
  const pessimistic = applyRetailScenario(RETAIL_DEFAULT_INPUTS, "pessimistic");
  const optimistic = applyRetailScenario(RETAIL_DEFAULT_INPUTS, "optimistic");
  assert.ok(pessimistic.dailyFootTraffic < RETAIL_DEFAULT_INPUTS.dailyFootTraffic);
  assert.ok(optimistic.dailyFootTraffic > RETAIL_DEFAULT_INPUTS.dailyFootTraffic);
  assert.ok(pessimistic.markdownShareRate >= optimistic.markdownShareRate);
});

test("sunum profil, stok ve tedarikçi denetim izini içerir", () => {
  const input = applyRetailBusinessType(RETAIL_DEFAULT_INPUTS, "phone_accessories");
  const presentation = buildRetailPresentation(calculateRetailModel({ ...input, inventoryPlanningEnabled: true }));
  assert.ok(presentation.kpis.some((item) => item.id === "profile_driver"));
  assert.ok(presentation.kpis.some((item) => item.id === "working_capital"));
  assert.ok(presentation.breakdown.some((section) => section.title.includes("Tedarikçi ve işletme sermayesi")));
});
