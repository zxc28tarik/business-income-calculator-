import test from "node:test";
import assert from "node:assert/strict";
import {
  SAAS_DEFAULT_INPUTS,
  SAAS_SECTOR,
  SAAS_V2_BUSINESS_TYPES,
  applySaasBusinessType,
  calculateSaasModel,
} from "../src/sectors/saas-v2.js";

const close = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("SaaS v2 sekiz gerçek iş türü profili içerir", () => {
  assert.equal(SAAS_V2_BUSINESS_TYPES.length, 8);
  assert.equal(SAAS_SECTOR.businessTypes.length, 8);
  assert.equal(SAAS_SECTOR.version, "0.16.0");
});

test("eski B2B SaaS varsayılan finans sonucu korunur", () => {
  const result = calculateSaasModel(SAAS_DEFAULT_INPUTS);
  close(result.endingSubscribers, 886.75);
  close(result.mrr, 1_108_437.5);
  close(result.netProfit, -104_172.03125);
});

test("sekiz SaaS profili sonlu finans sonucu üretir", () => {
  for (const [type] of SAAS_V2_BUSINESS_TYPES) {
    const input = applySaasBusinessType(SAAS_DEFAULT_INPUTS, type);
    const result = calculateSaasModel(input);
    assert.ok(Number.isFinite(result.mrr), type);
    assert.ok(Number.isFinite(result.netProfit), type);
    assert.ok(Number.isFinite(result.cashFlow.endingCash), type);
    assert.equal(result.profile.label.length > 0, true, type);
  }
});

test("API profili kullanım birimi üzerinden gelir ve maliyet üretir", () => {
  const input = applySaasBusinessType(SAAS_DEFAULT_INPUTS, "api_service");
  const result = calculateSaasModel(input);
  const expectedCustomers = input.apiCustomers * (1 - input.apiMonthlyChurnRate) + input.apiNewCustomers;
  close(result.endingSubscribers, expectedCustomers);
  close(result.mrr, expectedCustomers * input.usageUnitsPerCustomer * input.pricePerUsageUnit);
  close(result.apiUsageCost, expectedCustomers * input.usageUnitsPerCustomer * input.costPerUsageUnit);
  assert.ok(result.apiUsageCost > 0);
});

test("mobil abonelik mağaza komisyonu ve deneme dönüşümünü kullanır", () => {
  const input = applySaasBusinessType(SAAS_DEFAULT_INPUTS, "mobile_subscription");
  const result = calculateSaasModel(input);
  assert.ok(result.newSubscribers > input.monthlyNewSubscribers);
  assert.ok(result.platformCommission > 0);
  assert.equal(input.platformSalesShare, 0.92);
});

test("freemium profili ücretsiz kullanıcı maliyetini ayrı izler", () => {
  const input = applySaasBusinessType(SAAS_DEFAULT_INPUTS, "freemium_saas");
  const result = calculateSaasModel(input);
  close(result.freeUserCost, input.freeUsers * input.freeUserCostPerMonth);
  assert.ok(result.newSubscribers > input.monthlyNewSubscribers);
});

test("kurumsal lisans yıllık sözleşme ve onboarding geliri kullanır", () => {
  const input = applySaasBusinessType(SAAS_DEFAULT_INPUTS, "enterprise_license");
  const result = calculateSaasModel(input);
  close(result.planMetrics.monthlyPrice, input.annualContractValue / 12);
  assert.ok(result.onboardingGross > 0);
  assert.ok(result.annualPrepaymentIncrement > 0);
  assert.ok(result.cashFlow.rows[0].annualPrepayment > 0);
});
