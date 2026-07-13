import test from "node:test";
import assert from "node:assert/strict";
import { calcTaxSplit, calculateCashFlow } from "../src/core/finance-engine.js";
import { initializeScenarioInputs, validateSectorDefinition } from "../src/core/sector-schema.js";
import { CAFE_SECTOR, DEFAULT_INPUTS, calculateCafeModel } from "../src/sectors/cafe-restaurant.js";
import { ECOMMERCE_SECTOR } from "../src/sectors/ecommerce.js";

const almost = (actual, expected, tolerance = 0.01) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);
};

test("fiyat üstü KDV müşteri ödemesini artırır ama gelir tabanını bozmaz", () => {
  const result = calcTaxSplit({ grossRevenue: 1000, taxType: "excluded", taxRate: 0.20 });
  assert.equal(result.netBase, 1000);
  assert.equal(result.taxAmount, 200);
  assert.equal(result.customerPayment, 1200);
});

test("hibe ve finansman nakit girişidir, sektör P&L kârını değiştirmez", () => {
  const base = calculateCafeModel({ ...DEFAULT_INPUTS, financingAmount: 0, supportAmount: 0 });
  const funded = calculateCafeModel({ ...DEFAULT_INPUTS, financingAmount: 200000, supportAmount: 100000 });
  almost(base.netProfit, funded.netProfit);
  almost(funded.cashFlow.endingCash - base.cashFlow.endingCash, 300000);
});

test("kurulum maliyeti seçilen ayda yalnız bir kez düşer", () => {
  const flow = calculateCashFlow({
    months: 4,
    startingCash: 1000,
    setupCost: 300,
    setupPaymentMonth: 2,
    evaluateMonth: () => ({ revenueAfterCommission: 0, totalVariableCosts: 0, totalFixedCosts: 0, estimatedTax: 0, totalStakeholderPayouts: 0 }),
  });
  assert.equal(flow.rows[0].setupCosts, 0);
  assert.equal(flow.rows[1].setupCosts, 300);
  assert.equal(flow.rows[2].setupCosts, 0);
});

test("tedarikçi vadesi maliyeti P&L'den silmez, nakit ödemesini kaydırır", () => {
  const flow = calculateCashFlow({
    months: 3,
    supplierPaymentDelayDays: 30,
    evaluateMonth: () => ({ revenueAfterCommission: 0, totalVariableCosts: 100, totalFixedCosts: 0, estimatedTax: 0, totalStakeholderPayouts: 0 }),
  });
  assert.equal(flow.rows[0].variableCostsAccrued, 100);
  assert.equal(flow.rows[0].variableCostsPaid, 0);
  assert.equal(flow.rows[1].variableCostsPaid, 100);
});

test("kafe ve e-ticaret sektör tanımları şemayı geçer", () => {
  assert.equal(validateSectorDefinition(CAFE_SECTOR).valid, true);
  assert.equal(validateSectorDefinition(ECOMMERCE_SECTOR).valid, true);
});

test("sektör şeması tekrarlanan alan anahtarını reddeder", () => {
  const invalid = {
    ...CAFE_SECTOR,
    formSections: [{ title: "Tekrar", fields: [CAFE_SECTOR.formSections[0].fields[1], CAFE_SECTOR.formSections[0].fields[1]] }],
  };
  const validation = validateSectorDefinition(invalid);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((message) => message.includes("birden fazla")));
});

test("senaryo girdileri bağımsız nesneler olarak başlatılır", () => {
  const inputs = initializeScenarioInputs(CAFE_SECTOR);
  inputs.pessimistic.dailyCustomers = 1;
  assert.notEqual(inputs.expected.dailyCustomers, 1);
  assert.notEqual(inputs.optimistic.dailyCustomers, 1);
});
