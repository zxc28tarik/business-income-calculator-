import test from "node:test";
import assert from "node:assert/strict";
import {
  SAAS_DEFAULT_INPUTS,
  SAAS_FORM_SECTIONS,
  applySaasBusinessType,
  applySaasScenario,
  buildSaasPresentation,
  calculateSaasModel,
  normalizeSaasInputs,
} from "../src/sectors/saas-v2.js";

const close = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("gelişmiş plan karması ağırlıklı fiyat ve yıllık ödeme üretir", () => {
  const input = normalizeSaasInputs({
    ...SAAS_DEFAULT_INPUTS,
    advancedPlanMixEnabled: true,
    plans: [
      { name: "A", subscriberShareRate: 0.5, monthlyPrice: 100, annualBillingShareRate: 0, annualDiscountRate: 0 },
      { name: "B", subscriberShareRate: 0.5, monthlyPrice: 300, annualBillingShareRate: 1, annualDiscountRate: 0.2 },
    ],
  });
  const result = calculateSaasModel(input);
  close(result.planMetrics.monthlyPrice, 170);
  close(result.planMetrics.annualMonthlyRecognized, 120);
  assert.ok(result.annualPrepaymentIncrement > 0);
});

test("yıllık peşin ödeme P&L sonucunu değiştirmez, nakit zamanlamasını öne çeker", () => {
  const monthly = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, annualBillingShareRate: 0 });
  const annual = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, annualBillingShareRate: 1, annualDiscountRate: 0 });
  close(annual.netProfit, monthly.netProfit);
  assert.ok(annual.cashFlow.rows[0].cashEnd > monthly.cashFlow.rows[0].cashEnd);
  close(annual.cashFlow.endingCash, monthly.cashFlow.endingCash, 1e-3);
});

test("expansion NRR değerini yükseltir, contraction düşürür", () => {
  const base = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, expansionMrrRate: 0, contractionMrrRate: 0 });
  const expanded = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, expansionMrrRate: 0.08, contractionMrrRate: 0.01 });
  assert.ok(expanded.netRevenueRetention > base.netRevenueRetention);
  assert.ok(expanded.mrr > base.mrr);
});

test("finansman P&L sonucunu değiştirmez, faaliyet hibesi değiştirir", () => {
  const base = calculateSaasModel(SAAS_DEFAULT_INPUTS);
  const financed = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, financingAmount: 600000 });
  const grant = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, monthlyOperatingGrantIncome: 50000 });
  close(financed.netProfit, base.netProfit);
  assert.ok(financed.cashFlow.endingCash > base.cashFlow.endingCash);
  assert.ok(grant.netProfit > base.netProfit);
});

test("senaryolar API büyüme ve kayıp sürücülerini bağımsız değiştirir", () => {
  const input = applySaasBusinessType(SAAS_DEFAULT_INPUTS, "api_service");
  const pessimistic = applySaasScenario(input, "pessimistic");
  const optimistic = applySaasScenario(input, "optimistic");
  assert.ok(pessimistic.apiNewCustomers < input.apiNewCustomers);
  assert.ok(optimistic.apiNewCustomers > input.apiNewCustomers);
  assert.ok(pessimistic.apiMonthlyChurnRate > input.apiMonthlyChurnRate);
  assert.ok(optimistic.apiMonthlyChurnRate < input.apiMonthlyChurnRate);
});

test("form ve sunum plan, freemium, NRR ve destek kapasitesi izlerini içerir", () => {
  const keys = SAAS_FORM_SECTIONS.flatMap((section) => section.fields.map((field) => field.key));
  for (const key of ["plans", "freeUsers", "usageUnitsPerCustomer", "annualContractValue", "expansionMrrRate", "supportStaffCount"]) {
    assert.ok(keys.includes(key), key);
  }
  const result = calculateSaasModel(applySaasBusinessType(SAAS_DEFAULT_INPUTS, "freemium_saas"));
  const presentation = buildSaasPresentation(result);
  assert.ok(presentation.kpis.some((item) => item.id === "nrr"));
  assert.ok(presentation.kpis.some((item) => item.id === "support_capacity"));
  assert.ok(presentation.breakdown.some((section) => section.title.includes("İş modeli ve gelir sürücüsü")));
});
