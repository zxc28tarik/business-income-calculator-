import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTO_SERVICE_DEFAULT_INPUTS,
  applyAutoBusinessType,
  calculateAutoServiceModel,
} from "../src/sectors/auto-v2.js";

function close(actual, expected, tolerance = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
}

test("hizmet karması fiyat süre sarf ve tekrar işçiliği değiştirir", () => {
  const input = {
    ...AUTO_SERVICE_DEFAULT_INPUTS,
    advancedServiceMixEnabled: true,
    services: [
      { name: "Hızlı", serviceShareRate: 0.75, servicePrice: 600, durationMinutes: 30, consumableCost: 70, energyCost: 30, partsRevenue: 0, partsCostRate: 0, reworkRate: 0.02 },
      { name: "Premium", serviceShareRate: 0.25, servicePrice: 1800, durationMinutes: 120, consumableCost: 300, energyCost: 90, partsRevenue: 200, partsCostRate: 0.5, reworkRate: 0.10 },
    ],
  };
  const result = calculateAutoServiceModel(input);
  close(result.serviceMetrics.servicePrice, 900);
  close(result.serviceMetrics.durationMinutes, 52.5);
  close(result.serviceMetrics.reworkRate, 0.04);
  assert.ok(result.reworkMaterialCost > 0);
});

test("personel kapasitesi fiziksel istasyondan düşükse işi sınırlar", () => {
  const base = applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, "small_repair_shop");
  const result = calculateAutoServiceModel({
    ...base,
    advancedStaffEnabled: true,
    staffRoles: [{ name: "Tek usta", count: 1, monthlyCostPerPerson: 70000, productiveHoursPerMonth: 60 }],
  });
  assert.ok(result.staffDailyCapacity < result.stationDailyCapacity);
  assert.ok(result.monthlyVehicles <= result.staffDailyCapacity * result.input.openDays + 0.001);
  assert.ok(result.warnings.some((item) => item.id === "staff_bottleneck"));
});

test("parça stoğu ve tedarik süresi işletme sermayesi uyarısı üretir", () => {
  const base = applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, "tire_shop");
  const result = calculateAutoServiceModel({
    ...base,
    currentPartsInventoryCost: 10000,
    targetPartsCoverageDays: 45,
    safetyStockDays: 10,
    advancedSupplierMixEnabled: true,
    suppliers: [{ name: "Yavaş tedarikçi", purchaseShareRate: 1, paymentDelayDays: 45, leadTimeDays: 30, discountRate: 0.05 }],
  });
  assert.ok(result.workingCapitalGap > 0);
  assert.ok(result.reorderPointCost > 0);
  close(result.supplierMetrics.paymentDelayDays, 45);
  close(result.supplierMetrics.discountRate, 0.05);
  assert.ok(result.warnings.some((item) => item.id === "inventory_gap"));
  assert.ok(result.warnings.some((item) => item.id === "stock_shortage"));
});

test("taşeron satış ve maliyeti ayrı izlenir", () => {
  const base = applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, "body_paint");
  const result = calculateAutoServiceModel({
    ...base,
    subcontractEnabled: true,
    subcontractItems: [{ name: "Boya fırını", monthlyJobs: 8, salePrice: 6000, costPerJob: 4000 }],
  });
  close(result.subcontractMetrics.jobs, 8);
  close(result.subcontractGrossRevenue, 48000);
  close(result.subcontractCost, 32000);
  assert.ok(result.subcontractMargin > 0);
});

test("finansman P&L sonucunu değiştirmez, faaliyet hibesi değiştirir", () => {
  const base = calculateAutoServiceModel(AUTO_SERVICE_DEFAULT_INPUTS);
  const financed = calculateAutoServiceModel({ ...AUTO_SERVICE_DEFAULT_INPUTS, financingAmount: 1000000 });
  close(financed.netProfit, base.netProfit);
  assert.ok(financed.cashFlow.endingCash > base.cashFlow.endingCash);

  const grant = calculateAutoServiceModel({ ...AUTO_SERVICE_DEFAULT_INPUTS, monthlyOperatingGrantIncome: 50000 });
  assert.ok(grant.netProfit > base.netProfit);
});
