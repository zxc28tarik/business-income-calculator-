import test from "node:test";
import assert from "node:assert/strict";
import {
  SAAS_DEFAULT_INPUTS, SAAS_SECTOR, applySaasScenario, calculateSaasModel,
  calculateSaasMonth, calculateSaasScenarioComparison, normalizeSaasInputs,
} from "../src/sectors/saas.js";

test("SaaS sektör tanımı geçerlidir ve 6 iş türü içerir", () => {
  assert.equal(SAAS_SECTOR.id, "saas_subscription");
  assert.equal(SAAS_SECTOR.businessTypes.length, 6);
});

test("MRR ve ARR ay sonu aktif abone üzerinden doğru hesaplanır", () => {
  const result = calculateSaasMonth({
    ...SAAS_DEFAULT_INPUTS,
    openingSubscribers: 100,
    monthlyNewSubscribers: 10,
    monthlyChurnRate: 0.05,
    monthlyPrice: 200,
  });
  assert.equal(result.endingSubscribers, 105);
  assert.equal(result.mrr, 21000);
  assert.equal(result.arr, 252000);
});

test("churn abone sayısını ve churned MRR değerini etkiler", () => {
  const low = calculateSaasMonth({ ...SAAS_DEFAULT_INPUTS, openingSubscribers: 1000, monthlyNewSubscribers: 0, monthlyChurnRate: 0.02, monthlyPrice: 100 });
  const high = calculateSaasMonth({ ...SAAS_DEFAULT_INPUTS, openingSubscribers: 1000, monthlyNewSubscribers: 0, monthlyChurnRate: 0.10, monthlyPrice: 100 });
  assert.ok(high.endingSubscribers < low.endingSubscribers);
  assert.ok(high.churnedMRR > low.churnedMRR);
});

test("platform ve ödeme komisyonları yalnız kendi gelir tabanlarına uygulanır", () => {
  const result = calculateSaasMonth({
    ...SAAS_DEFAULT_INPUTS,
    openingSubscribers: 100,
    monthlyNewSubscribers: 0,
    monthlyChurnRate: 0,
    monthlyPrice: 100,
    taxType: "none",
    platformSalesShare: 0.40,
    platformCommissionRate: 0.20,
    paymentCommissionRate: 0.05,
  });
  assert.equal(result.platformCommission, 800);
  assert.equal(result.paymentCommission, 300);
  assert.equal(result.totalCommissions, 1100);
});

test("sunucu ve destek değişken maliyeti aktif aboneyle artar", () => {
  const small = calculateSaasMonth({ ...SAAS_DEFAULT_INPUTS, openingSubscribers: 100, monthlyNewSubscribers: 0, monthlyChurnRate: 0 });
  const large = calculateSaasMonth({ ...SAAS_DEFAULT_INPUTS, openingSubscribers: 200, monthlyNewSubscribers: 0, monthlyChurnRate: 0 });
  assert.equal(large.serverVariableCost, small.serverVariableCost * 2);
  assert.equal(large.supportVariableCost, small.supportVariableCost * 2);
});

test("LTV, LTV/CAC ve CAC geri ödeme süresi tutarlı hesaplanır", () => {
  const result = calculateSaasMonth({
    ...SAAS_DEFAULT_INPUTS,
    openingSubscribers: 1000,
    monthlyNewSubscribers: 0,
    monthlyChurnRate: 0.05,
    monthlyPrice: 500,
    taxType: "none",
    platformSalesShare: 0,
    paymentCommissionRate: 0,
    serverBaseCost: 0,
    serverCostPerSubscriber: 50,
    supportStaffCost: 0,
    supportCostPerSubscriber: 50,
    cacPerSubscriber: 2000,
  });
  assert.equal(result.contributionPerSubscriber, 400);
  assert.equal(result.ltv, 8000);
  assert.equal(result.ltvCacRatio, 4);
  assert.equal(result.cacPaybackMonths, 5);
});

test("başabaş abone sayısında net kâr sıfıra yaklaşır", () => {
  const model = calculateSaasModel({ ...SAAS_DEFAULT_INPUTS, openingSubscribers: 500, monthlyNewSubscribers: 20 });
  assert.ok(model.breakevenOpeningSubscribers != null);
  const atBreakeven = calculateSaasMonth({ ...model.input, openingSubscribers: model.breakevenOpeningSubscribers });
  const beforeBreakeven = calculateSaasMonth({ ...model.input, openingSubscribers: Math.max(0, model.breakevenOpeningSubscribers - 1) });
  assert.ok(atBreakeven.netProfit >= 0);
  assert.ok(beforeBreakeven.netProfit < 0);
});

test("12 aylık abone planı churn ve yeni kazanımı dönemden döneme taşır", () => {
  const model = calculateSaasModel({
    ...SAAS_DEFAULT_INPUTS,
    openingSubscribers: 100,
    monthlyNewSubscribers: 0,
    monthlyChurnRate: 0.10,
  });
  assert.equal(model.subscriberSchedule[0].endingSubscribers, 90);
  assert.equal(model.subscriberSchedule[1].openingSubscribers, 90);
  assert.equal(model.subscriberSchedule[1].endingSubscribers, 81);
  assert.equal(model.cashFlow.rows[1].endingSubscribers, 81);
});

test("yüksek churn ve düşük LTV/CAC uyarı üretir", () => {
  const result = calculateSaasModel({
    ...SAAS_DEFAULT_INPUTS,
    monthlyChurnRate: 0.15,
    cacPerSubscriber: 50000,
    monthlyNewSubscribers: 10,
  });
  const ids = result.warnings.map((warning) => warning.id);
  assert.ok(ids.includes("churn_hard"));
  assert.ok(ids.includes("ltv_cac_hard") || ids.includes("ltv_cac_soft"));
});

test("üç SaaS senaryosu kâr ve MRR açısından farklı sonuç üretir", () => {
  const scenarios = calculateSaasScenarioComparison(SAAS_DEFAULT_INPUTS);
  const byId = Object.fromEntries(scenarios.map((item) => [item.id, item.result]));
  assert.ok(byId.optimistic.mrr > byId.pessimistic.mrr);
  assert.ok(byId.optimistic.netProfit > byId.pessimistic.netProfit);
});

test("normalize negatif değerleri sıfırlar, oranları sınırlar ve senaryo temeli değiştirmez", () => {
  const normalized = normalizeSaasInputs({ openingSubscribers: -20, monthlyChurnRate: 5, monthlyPrice: -1 });
  assert.equal(normalized.openingSubscribers, 0);
  assert.equal(normalized.monthlyChurnRate, 1);
  assert.equal(normalized.monthlyPrice, 0);
  const base = { ...SAAS_DEFAULT_INPUTS };
  applySaasScenario(base, "pessimistic");
  assert.deepEqual(base, SAAS_DEFAULT_INPUTS);
});
