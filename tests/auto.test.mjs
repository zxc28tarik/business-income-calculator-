import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTO_SERVICE_BUSINESS_TYPES, AUTO_SERVICE_DEFAULT_INPUTS, AUTO_SERVICE_SECTOR,
  calculateAutoServiceModel, calculateAutoServiceMonth, calculateAutoServiceScenarioComparison,
} from "../src/sectors/auto.js";

const close = (actual, expected, tolerance = 0.001) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);

test("oto hizmetleri sektör tanımı ve altı iş türü geçerlidir", () => {
  assert.equal(AUTO_SERVICE_SECTOR.id, "auto_services");
  assert.equal(AUTO_SERVICE_BUSINESS_TYPES.length, 6);
  assert.equal(AUTO_SERVICE_SECTOR.formSections.length, 7);
});

test("günlük araç × hizmet fiyatı × açık gün hizmet gelirini verir", () => {
  const result = calculateAutoServiceMonth({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    dailyVehicles: 20,
    averageServicePrice: 500,
    averagePartsRevenuePerVehicle: 0,
    openDays: 25,
  });
  assert.equal(result.serviceGrossRevenue, 250000);
  assert.equal(result.grossRevenue, 250000);
});

test("kapasite istasyon, çalışma saati ve hizmet süresinden hesaplanır", () => {
  const result = calculateAutoServiceMonth({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    serviceStations: 2,
    workingHoursPerDay: 8,
    averageServiceDurationMinutes: 60,
    dailyVehicles: 12,
  });
  assert.equal(result.dailyCapacity, 16);
  close(result.capacityUtilization, 12 / 16);
});

test("sarf ve su/elektrik araç başına ayrı hesaplanır", () => {
  const result = calculateAutoServiceMonth({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    dailyVehicles: 10,
    openDays: 20,
    consumableCostPerVehicle: 40,
    waterElectricityCostPerVehicle: 15,
  });
  assert.equal(result.consumableCost, 8000);
  assert.equal(result.waterElectricityVariableCost, 3000);
});

test("parça geliri ve maliyeti hizmet gelirinden ayrı hesaplanır", () => {
  const result = calculateAutoServiceMonth({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    dailyVehicles: 10,
    openDays: 20,
    averagePartsRevenuePerVehicle: 300,
    partsCostRate: 0.60,
  });
  assert.equal(result.partsGrossRevenue, 60000);
  assert.equal(result.partsCost, 36000);
  assert.equal(result.grossRevenue, result.serviceGrossRevenue + result.partsGrossRevenue);
});

test("POS komisyonu yalnız kartlı satış payına uygulanır", () => {
  const result = calculateAutoServiceMonth({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    cardSalesShare: 0.40,
    posCommissionRate: 0.03,
  });
  close(result.posCommission, result.adjustedRevenue * 0.40 * 0.03);
});

test("ekipman yatırımı nakitte bir kez, amortisman P&L'de yer alır", () => {
  const low = calculateAutoServiceModel({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    equipmentInvestment: 120000,
    equipmentUsefulLifeMonths: 60,
    startingCash: 2500000,
  });
  const high = calculateAutoServiceModel({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    equipmentInvestment: 720000,
    equipmentUsefulLifeMonths: 60,
    startingCash: 2500000,
  });
  assert.equal(high.totalSetupCost - low.totalSetupCost, 600000);
  assert.equal(high.monthlyDepreciation - low.monthlyDepreciation, 10000);
  close(high.cashFixedCosts, low.cashFixedCosts);
  assert.ok(high.cashFlow.endingCash < low.cashFlow.endingCash);
});

test("başabaş günlük araç hesaplanır ve kira düşünce azalır", () => {
  const base = calculateAutoServiceModel(AUTO_SERVICE_DEFAULT_INPUTS);
  const lowerRent = calculateAutoServiceModel({ ...AUTO_SERVICE_DEFAULT_INPUTS, rent: AUTO_SERVICE_DEFAULT_INPUTS.rent * 0.5 });
  assert.ok(Number.isFinite(base.breakevenDailyVehicles));
  assert.ok(lowerRent.breakevenDailyVehicles < base.breakevenDailyVehicles);
});

test("tedarikçi vadesi kârı değiştirmez fakat ilk ay değişken ödemeyi azaltır", () => {
  const cash = calculateAutoServiceModel({ ...AUTO_SERVICE_DEFAULT_INPUTS, supplierPaymentDelayDays: 0 });
  const delayed = calculateAutoServiceModel({ ...AUTO_SERVICE_DEFAULT_INPUTS, supplierPaymentDelayDays: 30 });
  close(cash.netProfit, delayed.netProfit);
  assert.ok(delayed.cashFlow.rows[0].variableCostsPaid < cash.cashFlow.rows[0].variableCostsPaid);
});

test("kötümser, beklenen ve iyimser senaryolar sıralı sonuç üretir", () => {
  const scenarios = Object.fromEntries(calculateAutoServiceScenarioComparison(AUTO_SERVICE_DEFAULT_INPUTS).map((item) => [item.id, item.result]));
  assert.ok(scenarios.pessimistic.netProfit < scenarios.expected.netProfit);
  assert.ok(scenarios.optimistic.netProfit > scenarios.expected.netProfit);
});

test("kapasite aşımı ve yüksek sarf için oto hizmetleri uyarıları oluşur", () => {
  const result = calculateAutoServiceModel({
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    dailyVehicles: 100,
    serviceStations: 1,
    workingHoursPerDay: 8,
    averageServiceDurationMinutes: 90,
    consumableCostPerVehicle: 500,
    waterElectricityCostPerVehicle: 250,
  });
  const ids = new Set(result.warnings.map((warning) => warning.id));
  assert.ok(ids.has("capacity_overload"));
  assert.ok(ids.has("consumables_hard"));
});
