import test from "node:test";
import assert from "node:assert/strict";
import { calcTaxSplit } from "../src/core/finance-engine.js";
import {
  DEFAULT_INPUTS,
  applyScenario,
  calculateCafeModel,
  calculateCafeMonth,
  calculateScenarioComparison,
} from "../src/sectors/cafe-restaurant.js";

const almost = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);

test("fiyata dahil KDV rate/(1+rate) ile ayrılır", () => {
  const result = calcTaxSplit({ grossRevenue: 1100, taxType: "included", taxRate: 0.10 });
  almost(result.taxAmount, 100);
  almost(result.netBase, 1000);
  almost(result.customerPayment, 1100);
});

test("kafe brüt ciro formülü günlük müşteri × fiş × açık gündür", () => {
  const result = calculateCafeMonth({ ...DEFAULT_INPUTS, dailyCustomers: 100, averageTicket: 200, openDays: 25, vatRate: 0 });
  assert.equal(result.grossRevenue, 500000);
});

test("paket servis komisyonu yalnız paket servis gelirine uygulanır", () => {
  const result = calculateCafeMonth({
    ...DEFAULT_INPUTS,
    dailyCustomers: 100,
    averageTicket: 100,
    openDays: 10,
    vatRate: 0,
    lostSalesRate: 0,
    deliverySalesShare: 0.40,
    deliveryCommissionRate: 0.25,
    posCommissionRate: 0,
    cardSalesShare: 0,
  });
  assert.equal(result.grossRevenue, 100000);
  assert.equal(result.deliveryRevenue, 40000);
  assert.equal(result.deliveryCommission, 10000);
});

test("finansman P&L net kârını değiştirmez, nakdi değiştirir", () => {
  const withoutFinancing = calculateCafeModel({ ...DEFAULT_INPUTS, financingAmount: 0 });
  const withFinancing = calculateCafeModel({ ...DEFAULT_INPUTS, financingAmount: 750000 });
  almost(withoutFinancing.netProfit, withFinancing.netProfit);
  almost(withFinancing.cashFlow.endingCash - withoutFinancing.cashFlow.endingCash, 750000);
});

test("kurulum maliyeti ilk ay nakitten bir kez düşer", () => {
  const result = calculateCafeModel({
    ...DEFAULT_INPUTS,
    startingCash: 3000000,
    financingAmount: 0,
    monthlyGrowthRate: 0,
    collectionDelayDays: 0,
  });
  assert.equal(result.cashFlow.rows[0].setupCosts, result.totalSetupCost);
  assert.equal(result.cashFlow.rows[1].setupCosts, 0);
});

test("başabaş müşterisi bulunduğunda net kâr sıfıra yakındır", () => {
  const result = calculateCafeModel(DEFAULT_INPUTS);
  assert.ok(result.breakevenDailyCustomers > 0);
  const atBreakeven = calculateCafeMonth(DEFAULT_INPUTS, { dailyCustomers: result.breakevenDailyCustomers });
  assert.ok(atBreakeven.netProfit >= -1);
});

test("kötümser, beklenen ve iyimser senaryo sıralaması korunur", () => {
  const comparison = calculateScenarioComparison(DEFAULT_INPUTS);
  const profits = Object.fromEntries(comparison.map((item) => [item.id, item.result.netProfit]));
  assert.ok(profits.pessimistic < profits.expected);
  assert.ok(profits.expected < profits.optimistic);
});

test("negatif girdiler sistemi bozmaz ve sıfıra çekilir", () => {
  const result = calculateCafeModel({ ...DEFAULT_INPUTS, dailyCustomers: -50, rent: -1, vatRate: -4 });
  assert.equal(result.input.dailyCustomers, 0);
  assert.equal(result.input.rent, 0);
  assert.equal(result.input.vatRate, 0);
  assert.ok(Number.isFinite(result.netProfit));
});

test("senaryo uygulaması temel veriyi mutasyona uğratmaz", () => {
  const base = { ...DEFAULT_INPUTS };
  const optimistic = applyScenario(base, "optimistic");
  assert.equal(base.dailyCustomers, DEFAULT_INPUTS.dailyCustomers);
  assert.ok(optimistic.dailyCustomers > base.dailyCustomers);
});
