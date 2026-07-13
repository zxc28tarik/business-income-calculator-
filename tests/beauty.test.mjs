import test from "node:test";
import assert from "node:assert/strict";
import {
  BEAUTY_DEFAULT_INPUTS,
  applyBeautyScenario,
  calculateBeautyModel,
  calculateBeautyMonth,
  calculateBeautyScenarioComparison,
} from "../src/sectors/beauty.js";

const almost = (actual, expected, tolerance = 0.01) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);
};

const neutral = {
  ...BEAUTY_DEFAULT_INPUTS,
  taxType: "none",
  vatRate: 0,
  paymentCommissionRate: 0,
  employeeCommissionRate: 0,
  otherVariableCostRate: 0,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0,
};

test("güzellik randevu kapasitesi istasyon × süre üzerinden hesaplanır", () => {
  const result = calculateBeautyMonth({
    ...neutral,
    stations: 3,
    workingHoursPerDay: 8,
    sessionDurationMinutes: 60,
    openDays: 25,
    occupancyRate: 0.50,
    noShowRate: 0,
  });
  assert.equal(result.dailyCapacity, 24);
  assert.equal(result.monthlyCapacity, 600);
  assert.equal(result.bookedAppointments, 300);
});

test("seans fiyatı × gerçekleşen randevu brüt hizmet gelirini verir", () => {
  const result = calculateBeautyMonth({
    ...neutral,
    stations: 1,
    workingHoursPerDay: 10,
    sessionDurationMinutes: 60,
    openDays: 20,
    occupancyRate: 0.50,
    noShowRate: 0.10,
    servicePrice: 1000,
  });
  assert.equal(result.bookedAppointments, 100);
  assert.equal(result.completedSessions, 90);
  assert.equal(result.actualGrossRevenue, 90000);
  assert.equal(result.noShowRevenueLoss, 10000);
});

test("sarf malzeme tamamlanan seans başına düşer", () => {
  const result = calculateBeautyMonth({
    ...neutral,
    stations: 1,
    workingHoursPerDay: 10,
    sessionDurationMinutes: 60,
    openDays: 10,
    occupancyRate: 1,
    noShowRate: 0.20,
    consumableCostPerSession: 75,
  });
  assert.equal(result.completedSessions, 80);
  assert.equal(result.consumableCost, 6000);
});

test("çalışan primi gerçekleşen KDV hariç hizmet geliri üzerinden hesaplanır", () => {
  const result = calculateBeautyMonth({
    ...neutral,
    servicePrice: 100,
    stations: 1,
    workingHoursPerDay: 10,
    sessionDurationMinutes: 60,
    openDays: 10,
    occupancyRate: 1,
    noShowRate: 0,
    employeeCommissionRate: 0.12,
  });
  assert.equal(result.adjustedRevenue, 10000);
  assert.equal(result.employeeCommission, 1200);
});

test("cihaz amortismanı P&L gideridir fakat nakitten ikinci kez düşmez", () => {
  const base = {
    ...neutral,
    renovation: 0,
    furniture: 0,
    deposit: 0,
    licenseFees: 0,
    openingMarketing: 0,
    initialConsumables: 0,
    softwareSetup: 0,
    startingCash: 500000,
    financingAmount: 0,
    supportAmount: 0,
    deviceUsefulLifeMonths: 12,
  };
  const withoutDevice = calculateBeautyModel({ ...base, deviceInvestment: 0 });
  const withDevice = calculateBeautyModel({ ...base, deviceInvestment: 120000 });
  almost(withoutDevice.preTaxProfit - withDevice.preTaxProfit, 10000);
  almost(withoutDevice.cashFlow.endingCash - withDevice.cashFlow.endingCash, 120000);
});

test("başabaş doluluğunda net kâr sıfıra yaklaşır", () => {
  const result = calculateBeautyModel(BEAUTY_DEFAULT_INPUTS);
  assert.ok(result.breakevenOccupancyRate > 0 && result.breakevenOccupancyRate <= 1);
  const atBreakeven = calculateBeautyMonth(BEAUTY_DEFAULT_INPUTS, { occupancyRate: result.breakevenOccupancyRate });
  assert.ok(atBreakeven.netProfit >= -2 && atBreakeven.netProfit <= 2);
});

test("yüksek no-show oranı uyarı üretir", () => {
  const result = calculateBeautyModel({ ...BEAUTY_DEFAULT_INPUTS, noShowRate: 0.20 });
  assert.ok(result.warnings.some((warning) => warning.id === "no_show_hard"));
});

test("güzellik senaryoları kâr sıralamasını korur", () => {
  const comparison = calculateBeautyScenarioComparison(BEAUTY_DEFAULT_INPUTS);
  const profits = Object.fromEntries(comparison.map((item) => [item.id, item.result.netProfit]));
  assert.ok(profits.pessimistic < profits.expected);
  assert.ok(profits.expected < profits.optimistic);
});

test("güzellik senaryo uygulaması temel veriyi değiştirmez", () => {
  const base = { ...BEAUTY_DEFAULT_INPUTS };
  const pessimistic = applyBeautyScenario(base, "pessimistic");
  assert.equal(base.occupancyRate, BEAUTY_DEFAULT_INPUTS.occupancyRate);
  assert.ok(pessimistic.occupancyRate < base.occupancyRate);
  assert.ok(pessimistic.noShowRate > base.noShowRate);
});
