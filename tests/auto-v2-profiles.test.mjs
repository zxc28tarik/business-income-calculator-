import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTO_SERVICE_DEFAULT_INPUTS,
  AUTO_V2_BUSINESS_TYPES,
  applyAutoBusinessType,
  calculateAutoServiceModel,
} from "../src/sectors/auto-v2.js";

function close(actual, expected, tolerance = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
}

test("eski oto yıkama varsayılan sonucu korunur", () => {
  const result = calculateAutoServiceModel(AUTO_SERVICE_DEFAULT_INPUTS);
  close(result.input.dailyVehicles, 34);
  close(result.monthlyVehicles, 918);
  close(result.grossRevenue, 780300);
  close(result.adjustedRevenue, 650250);
  close(result.netProfit, -12975.958333333314);
  close(result.capacityUtilization, 34 / (4 * 10 * 60 / 55));
});

test("sekiz oto hizmet profili ayrı sürücülerle hesaplanır", () => {
  assert.equal(AUTO_V2_BUSINESS_TYPES.length, 8);
  for (const [type, label] of AUTO_V2_BUSINESS_TYPES) {
    const input = applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, type);
    const result = calculateAutoServiceModel(input);
    assert.equal(result.profile.label, label);
    assert.ok(Number.isFinite(result.grossRevenue));
    assert.ok(Number.isFinite(result.netProfit));
    assert.ok(result.monthlyVehicles >= 0);
    assert.ok(result.dailyCapacity > 0);
  }
});

test("randevu, aylık iş ve mobil rota sürücüleri doğru çalışır", () => {
  const detailing = calculateAutoServiceModel(applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, "auto_detailing"));
  close(detailing.demandMetrics.requestedDaily, 5);
  close(detailing.input.dailyVehicles, 4.6);
  assert.ok(detailing.cancellationRecoveryRevenue > 0);

  const body = calculateAutoServiceModel(applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, "body_paint"));
  close(body.demandMetrics.requestedDaily, 35 / body.input.openDays);

  const mobile = calculateAutoServiceModel(applyAutoBusinessType(AUTO_SERVICE_DEFAULT_INPUTS, "mobile_service"));
  close(mobile.demandMetrics.requestedDaily, 9);
  close(mobile.input.dailyVehicles, 9 * (1 - mobile.input.appointmentNoShowRate));
});

test("iş türü geçişi vergi ve nakit tercihlerini korur", () => {
  const current = { ...AUTO_SERVICE_DEFAULT_INPUTS, vatRate: 0.18, startingCash: 3456789, financingAmount: 250000 };
  const next = applyAutoBusinessType(current, "tire_shop");
  assert.equal(next.businessType, "tire_shop");
  close(next.vatRate, 0.18);
  close(next.startingCash, 3456789);
  close(next.financingAmount, 250000);
  assert.equal(next.partsInventoryEnabled, true);
});
