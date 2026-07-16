import test from "node:test";
import assert from "node:assert/strict";
import {
  ECOMMERCE_DEFAULT_INPUTS,
  applyEcommerceScenario,
  calculateEcommerceModel,
  calculateEcommerceMonth,
  calculateEcommerceScenarioComparison,
} from "../src/sectors/ecommerce.js";

const almost = (actual, expected, tolerance = 0.01) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);
};

test("e-ticaret brüt satışı adet × fiyat × indirim sonrası hesaplanır", () => {
  const result = calculateEcommerceMonth({
    ...ECOMMERCE_DEFAULT_INPUTS,
    unitsSold: 100,
    productPrice: 500,
    averageDiscountRate: 0.10,
    vatRate: 0,
  });
  assert.equal(result.listRevenue, 50000);
  assert.equal(result.discountAmount, 5000);
  assert.equal(result.grossRevenue, 45000);
});

test("pazaryeri komisyonu yalnız pazaryeri satış payına uygulanır", () => {
  const result = calculateEcommerceMonth({
    ...ECOMMERCE_DEFAULT_INPUTS,
    unitsSold: 100,
    productPrice: 100,
    averageDiscountRate: 0,
    vatRate: 0,
    refundRate: 0,
    marketplaceSalesShare: 0.60,
    marketplaceCommissionRate: 0.20,
    paymentCommissionRate: 0,
  });
  assert.equal(result.marketplaceRevenue, 6000);
  assert.equal(result.marketplaceCommission, 1200);
});

test("kargo ve paketleme sipariş başına çalışır", () => {
  const result = calculateEcommerceMonth({
    ...ECOMMERCE_DEFAULT_INPUTS,
    unitsSold: 50,
    shippingCostPerOrder: 40,
    packagingCostPerOrder: 10,
    fulfillmentCostPerOrder: 0,
    refundRate: 0,
  });
  assert.equal(result.outboundShippingCost, 2000);
  assert.equal(result.packagingCost, 500);
});

test("iade oranı satış gelirini ve iade kargosunu etkiler", () => {
  const result = calculateEcommerceMonth({
    ...ECOMMERCE_DEFAULT_INPUTS,
    unitsSold: 100,
    productPrice: 100,
    averageDiscountRate: 0,
    vatRate: 0,
    refundRate: 0.10,
    returnShippingCostPerOrder: 50,
    marketplaceCommissionRate: 0,
    paymentCommissionRate: 0,
  });
  assert.equal(result.returnedUnits, 10);
  assert.equal(result.lostSalesAmount, 1000);
  assert.equal(result.returnShippingCost, 500);
});

test("reklam gideri net kârı aynı tutarda azaltır", () => {
  const withoutAds = calculateEcommerceMonth({ ...ECOMMERCE_DEFAULT_INPUTS, monthlyAdSpend: 0 });
  const withAds = calculateEcommerceMonth({ ...ECOMMERCE_DEFAULT_INPUTS, monthlyAdSpend: 90000 });
  almost(withoutAds.preTaxProfit - withAds.preTaxProfit, 90000);
});

test("ilk stok yatırımı P&L kârını değiştirmez ama nakdi azaltır", () => {
  const lowStock = calculateEcommerceModel({ ...ECOMMERCE_DEFAULT_INPUTS, initialStockInvestment: 0 });
  const highStock = calculateEcommerceModel({ ...ECOMMERCE_DEFAULT_INPUTS, initialStockInvestment: 400000 });
  almost(lowStock.netProfit, highStock.netProfit);
  almost(lowStock.cashFlow.endingCash - highStock.cashFlow.endingCash, 400000);
});

test("e-ticaret başabaş adedinde net kâr sıfıra yaklaşır", () => {
  const result = calculateEcommerceModel(ECOMMERCE_DEFAULT_INPUTS);
  assert.ok(result.breakevenUnits > 0);
  const atBreakeven = calculateEcommerceMonth(ECOMMERCE_DEFAULT_INPUTS, { unitsSold: result.breakevenUnits });
  assert.ok(atBreakeven.netProfit >= -1);
});

test("e-ticaret senaryoları kâr sıralamasını korur", () => {
  const comparison = calculateEcommerceScenarioComparison(ECOMMERCE_DEFAULT_INPUTS);
  const profits = Object.fromEntries(comparison.map((item) => [item.id, item.result.netProfit]));
  assert.ok(profits.pessimistic < profits.expected);
  assert.ok(profits.expected < profits.optimistic);
});

test("e-ticaret senaryo uygulaması temel veriyi değiştirmez", () => {
  const base = { ...ECOMMERCE_DEFAULT_INPUTS };
  const pessimistic = applyEcommerceScenario(base, "pessimistic");
  assert.equal(base.unitsSold, ECOMMERCE_DEFAULT_INPUTS.unitsSold);
  assert.ok(pessimistic.unitsSold < base.unitsSold);
});
