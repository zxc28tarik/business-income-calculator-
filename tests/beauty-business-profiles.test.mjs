import test from "node:test";
import assert from "node:assert/strict";
import {
  BEAUTY_BUSINESS_PROFILES,
  BEAUTY_DEFAULT_INPUTS,
  BEAUTY_SECTOR,
  applyBeautyBusinessType,
  applyBeautyScenario,
  buildBeautyPresentation,
  calculateBeautyModel,
  calculateBeautyMonth,
  normalizeBeautyInputs,
} from "../src/sectors/beauty-v2.js";

const closeTo = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected} olmalı`);
};

test("güzellik sektörü sekiz gerçek iş türü profili içerir", () => {
  assert.equal(Object.keys(BEAUTY_BUSINESS_PROFILES).length, 8);
  assert.equal(BEAUTY_SECTOR.businessTypes.length, 8);
  assert.equal(BEAUTY_SECTOR.version, "v2.0");
});

test("eski güzellik salonu varsayılan sonucu korunur", () => {
  const result = calculateBeautyModel(BEAUTY_DEFAULT_INPUTS);
  closeTo(result.dailyCapacity, 36);
  closeTo(result.monthlyCapacity, 936);
  closeTo(result.bookedAppointments, 636.48);
  closeTo(result.completedSessions, 585.5616);
  closeTo(result.netProfit, 27077.526000000013);
});

test("iş türü değişiminde profil varsayımları uygulanır", () => {
  const hair = applyBeautyBusinessType(BEAUTY_DEFAULT_INPUTS, "hair_salon");
  assert.equal(hair.businessType, "hair_salon");
  assert.equal(hair.profileTypeApplied, "hair_salon");
  assert.equal(hair.chairCount, 5);
  assert.equal(hair.advancedServiceMixEnabled, true);
  assert.equal(hair.advancedStaffMixEnabled, true);
});

test("tüm güzellik profilleri sonlu finans sonucu üretir", () => {
  for (const businessType of Object.keys(BEAUTY_BUSINESS_PROFILES)) {
    const input = applyBeautyBusinessType(BEAUTY_DEFAULT_INPUTS, businessType);
    const result = calculateBeautyModel(input);
    assert.ok(Number.isFinite(result.netProfit), businessType);
    assert.ok(Number.isFinite(result.dailyCapacity), businessType);
    assert.ok(result.resourceCount > 0, businessType);
    assert.equal(result.input.businessType, businessType);
  }
});

test("lazer profili cihaz ve tekrar ziyaret talebiyle çalışır", () => {
  const input = applyBeautyBusinessType(BEAUTY_DEFAULT_INPUTS, "laser_epilation");
  const result = calculateBeautyModel(input);
  assert.equal(result.profile.resourceLabel, "Cihaz");
  assert.equal(result.resourceCount, 2);
  assert.equal(result.input.customerBaseDemandEnabled, true);
  assert.ok(result.rawDemandAppointments > 0);
  assert.ok(result.noShowRecoveredRevenue > 0);
});

test("hizmet karması fiyat, süre ve sarfı ağırlıklı hesaplar", () => {
  const input = normalizeBeautyInputs({
    ...BEAUTY_DEFAULT_INPUTS,
    advancedServiceMixEnabled: true,
    serviceMix: [
      { name: "A", sessionShareRate: 0.5, price: 1000, durationMinutes: 30, consumableCost: 100, employeeCommissionRate: 0.05 },
      { name: "B", sessionShareRate: 0.5, price: 2000, durationMinutes: 90, consumableCost: 300, employeeCommissionRate: 0.15 },
    ],
  });
  const result = calculateBeautyMonth(input);
  closeTo(result.effectiveServicePrice, 1500);
  closeTo(result.effectiveSessionDurationMinutes, 60);
  closeTo(result.effectiveConsumableCostPerSession, 200);
  closeTo(result.effectiveEmployeeCommissionRate, 0.10);
});

test("personel üretken saati fiziksel kapasiteyi sınırlayabilir", () => {
  const input = normalizeBeautyInputs({
    ...BEAUTY_DEFAULT_INPUTS,
    advancedStaffMixEnabled: true,
    staffRoles: [
      { role: "Uzman", count: 1, monthlyCostPerPerson: 50000, productiveHoursPerDay: 2, revenueCommissionRate: 0.08 },
    ],
  });
  const result = calculateBeautyMonth(input);
  assert.equal(result.staffCapacityBottleneck, true);
  assert.ok(result.dailyCapacity < result.resourceDailyCapacity);
});

test("no-show geri kazanımı net sonucu iyileştirir", () => {
  const withoutRecovery = calculateBeautyMonth({ ...BEAUTY_DEFAULT_INPUTS, noShowRecoveryRate: 0 });
  const withRecovery = calculateBeautyMonth({ ...BEAUTY_DEFAULT_INPUTS, noShowRecoveryRate: 0.50 });
  assert.ok(withRecovery.noShowRecoveredRevenue > 0);
  assert.ok(withRecovery.netProfit > withoutRecovery.netProfit);
});

test("ürün satışı geliri ve ürün maliyeti ayrı izlenir", () => {
  const result = calculateBeautyMonth({
    ...BEAUTY_DEFAULT_INPUTS,
    retailSalesEnabled: true,
    monthlyRetailRevenue: 100000,
    retailProductCostRate: 0.40,
  });
  closeTo(result.retailRevenue, 100000);
  closeTo(result.retailProductCost, 40000);
});

test("finansman P&L sonucunu değiştirmez, faaliyet hibesi değiştirir", () => {
  const base = calculateBeautyMonth(BEAUTY_DEFAULT_INPUTS);
  const financed = calculateBeautyMonth({ ...BEAUTY_DEFAULT_INPUTS, financingAmount: 900000 });
  const grant = calculateBeautyMonth({ ...BEAUTY_DEFAULT_INPUTS, monthlyOperatingGrantIncome: 100000 });
  closeTo(financed.netProfit, base.netProfit);
  assert.ok(grant.netProfit > base.netProfit);
});

test("amortisman P&L gideridir ve nakit sabit giderine girmez", () => {
  const result = calculateBeautyMonth(BEAUTY_DEFAULT_INPUTS);
  assert.ok(result.monthlyDepreciation > 0);
  closeTo(result.totalFixedCosts, result.cashFixedCosts + result.monthlyDepreciation);
  closeTo(result.operatingCashProfit, result.netProfit + result.monthlyDepreciation);
});

test("senaryolar profil talebini birbirinden bağımsız değiştirir", () => {
  const input = applyBeautyBusinessType(BEAUTY_DEFAULT_INPUTS, "nail_studio");
  const pessimistic = applyBeautyScenario(input, "pessimistic");
  const optimistic = applyBeautyScenario(input, "optimistic");
  assert.ok(pessimistic.activeCustomerBase < input.activeCustomerBase);
  assert.ok(optimistic.activeCustomerBase > input.activeCustomerBase);
  pessimistic.serviceMix[0].price = 1;
  assert.notEqual(optimistic.serviceMix[0].price, 1);
});

test("sunum profil KPI ve denetim izini içerir", () => {
  const result = calculateBeautyModel(applyBeautyBusinessType(BEAUTY_DEFAULT_INPUTS, "massage_spa"));
  const presentation = buildBeautyPresentation(result);
  assert.ok(presentation.kpis.some((item) => item.id === "profile_resource"));
  assert.ok(presentation.kpis.some((item) => item.id === "capacity_utilization"));
  assert.ok(presentation.breakdown.some((group) => group.title === "Profil · Hizmet karması"));
  assert.ok(presentation.breakdown.some((group) => group.title === "Profil · Tekrar ziyaret ve no-show"));
});
