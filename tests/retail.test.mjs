import test from "node:test";
import assert from "node:assert/strict";
import {
  RETAIL_BUSINESS_TYPES, RETAIL_DEFAULT_INPUTS, RETAIL_SECTOR,
  calculateRetailModel, calculateRetailMonth, calculateRetailScenarioComparison,
} from "../src/sectors/retail.js";

const close = (actual, expected, tolerance = 0.001) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

test("perakende sektör tanımı ve yedi iş türü geçerlidir", () => {
  assert.equal(RETAIL_SECTOR.id, "physical_retail");
  assert.equal(RETAIL_BUSINESS_TYPES.length, 7);
  assert.equal(RETAIL_SECTOR.formSections.length, 7);
});

test("günlük müşteri × ortalama sepet × açık gün brüt satışı verir", () => {
  const result = calculateRetailMonth({ ...RETAIL_DEFAULT_INPUTS, dailyCustomers: 20, averageBasket: 500, openDays: 25, returnRate: 0 });
  assert.equal(result.grossRevenue, 250000);
});

test("iadeler tanınan satışı ve net geliri azaltır", () => {
  const noReturn = calculateRetailMonth({ ...RETAIL_DEFAULT_INPUTS, returnRate: 0 });
  const withReturn = calculateRetailMonth({ ...RETAIL_DEFAULT_INPUTS, returnRate: 0.10 });
  close(withReturn.returnedGrossRevenue, withReturn.grossRevenue * 0.10);
  assert.ok(withReturn.adjustedRevenue < noReturn.adjustedRevenue);
  assert.ok(withReturn.netProfit < noReturn.netProfit);
});

test("satılan ürün maliyeti ile fire/kayıp ayrı hesaplanır", () => {
  const result = calculateRetailMonth({ ...RETAIL_DEFAULT_INPUTS, returnRate: 0, inventoryLossRate: 0.05 });
  close(result.productCost, result.retainedUnits * result.input.averageUnitCost);
  close(result.inventoryLossCost, result.grossUnitsSold * result.input.averageUnitCost * 0.05);
  assert.ok(result.totalVariableCosts > result.productCost);
});

test("POS komisyonu yalnız kartlı satış payına uygulanır", () => {
  const result = calculateRetailMonth({ ...RETAIL_DEFAULT_INPUTS, cardSalesShare: 0.40, posCommissionRate: 0.03 });
  close(result.posCommission, result.adjustedRevenue * 0.40 * 0.03);
});

test("ilk stok yatırımı P&L gideri değildir fakat kurulum ve nakitte yer alır", () => {
  const lowStock = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, initialStockInvestment: 100000, startingCash: 2000000 });
  const highStock = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, initialStockInvestment: 900000, startingCash: 2000000 });
  close(lowStock.netProfit, highStock.netProfit);
  assert.equal(highStock.totalSetupCost - lowStock.totalSetupCost, 800000);
  assert.ok(highStock.cashFlow.endingCash < lowStock.cashFlow.endingCash);
});

test("stok devir hızı yıllık ürün maliyetinin ilk stoka oranıdır", () => {
  const result = calculateRetailMonth({ ...RETAIL_DEFAULT_INPUTS, initialStockInvestment: 600000 });
  close(result.annualStockTurnover, result.productCost * 12 / 600000);
  close(result.stockCoverageMonths, 600000 / result.productCost);
});

test("başabaş müşteri sayısı hesaplanır ve maliyet düşünce azalır", () => {
  const base = calculateRetailModel(RETAIL_DEFAULT_INPUTS);
  const lowerRent = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, rent: RETAIL_DEFAULT_INPUTS.rent * 0.5 });
  assert.ok(Number.isFinite(base.breakevenDailyCustomers));
  assert.ok(lowerRent.breakevenDailyCustomers < base.breakevenDailyCustomers);
});

test("tedarikçi vadesi kârı değiştirmez ama erken dönem nakdi değiştirir", () => {
  const cash = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, supplierPaymentDelayDays: 0 });
  const delayed = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, supplierPaymentDelayDays: 30 });
  close(cash.netProfit, delayed.netProfit);
  assert.ok(delayed.cashFlow.rows[0].variableCostsPaid < cash.cashFlow.rows[0].variableCostsPaid);
});

test("kötümser, beklenen ve iyimser senaryolar sıralı sonuç üretir", () => {
  const scenarios = Object.fromEntries(calculateRetailScenarioComparison(RETAIL_DEFAULT_INPUTS).map((item) => [item.id, item.result]));
  assert.ok(scenarios.pessimistic.netProfit < scenarios.expected.netProfit);
  assert.ok(scenarios.optimistic.netProfit > scenarios.expected.netProfit);
});

test("yüksek iade ve fire için perakende uyarıları oluşur", () => {
  const result = calculateRetailModel({ ...RETAIL_DEFAULT_INPUTS, returnRate: 0.15, inventoryLossRate: 0.07 });
  const ids = new Set(result.warnings.map((warning) => warning.id));
  assert.ok(ids.has("returns_hard"));
  assert.ok(ids.has("loss_hard"));
});
