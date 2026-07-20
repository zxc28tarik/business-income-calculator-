import test from "node:test";
import assert from "node:assert/strict";
import {
  RETAIL_BUSINESS_PROFILES,
  RETAIL_DEFAULT_INPUTS,
  RETAIL_FORM_SECTIONS,
  RETAIL_SECTOR,
  RETAIL_V2_BUSINESS_TYPES,
  applyRetailBusinessType,
  calculateRetailModel,
} from "../src/sectors/retail-v2.js";

const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("perakende v2 yedi gerçek iş türü profili içerir", () => {
  assert.equal(RETAIL_V2_BUSINESS_TYPES.length, 7);
  assert.equal(Object.keys(RETAIL_BUSINESS_PROFILES).length, 7);
  assert.equal(RETAIL_SECTOR.version, "0.17.0");
  assert.equal(RETAIL_SECTOR.businessProfiles.boutique.driver, "traffic_conversion");
});

test("eski Butik mağaza varsayılan finans sonucu korunur", () => {
  const result = calculateRetailModel(RETAIL_DEFAULT_INPUTS);
  close(result.demand.dailyTransactions, 55);
  close(result.grossRevenue, 929500);
  close(result.adjustedRevenue, 747472.9166666667);
  close(result.netProfit, -70115.71197916655);
});

test("yedi perakende profili sonlu finans sonucu üretir", () => {
  for (const [id] of RETAIL_V2_BUSINESS_TYPES) {
    const input = applyRetailBusinessType(RETAIL_DEFAULT_INPUTS, id);
    const result = calculateRetailModel(input);
    assert.equal(result.input.businessType, id);
    assert.ok(Number.isFinite(result.grossRevenue), id);
    assert.ok(Number.isFinite(result.netProfit), id);
    assert.ok(result.demand.dailyTransactions >= 0, id);
  }
});

test("pet shop müşteri tabanı ve alışveriş sıklığını kullanır", () => {
  const input = applyRetailBusinessType(RETAIL_DEFAULT_INPUTS, "pet_shop");
  const result = calculateRetailModel({ ...input, activeCustomerBase: 1000, monthlyPurchaseFrequency: 0.8, openDays: 25 });
  close(result.demand.monthlyTransactions, 800);
  close(result.demand.dailyTransactions, 32);
});

test("çiçekçi standart ve etkinlik siparişlerini birlikte hesaplar", () => {
  const input = applyRetailBusinessType(RETAIL_DEFAULT_INPUTS, "florist");
  const result = calculateRetailModel({ ...input, dailyOrders: 10, openDays: 20, averageBasket: 500, eventOrdersPerMonth: 5, eventOrderValue: 2000 });
  close(result.demand.monthlyTransactions, 205);
  close(result.grossRevenue, 110000);
});

test("küçük market saatlik işlem ve açık saat sürücüsünü kullanır", () => {
  const input = applyRetailBusinessType(RETAIL_DEFAULT_INPUTS, "mini_market");
  const result = calculateRetailModel({ ...input, transactionsPerHour: 20, openHoursPerDay: 15, openDays: 30, averageBasket: 200 });
  close(result.demand.dailyTransactions, 300);
  close(result.grossRevenue, 1800000);
});

test("form profil, ürün, tedarikçi ve stok alanlarını içerir", () => {
  const keys = RETAIL_FORM_SECTIONS.flatMap((section) => section.fields.map((field) => field.key));
  for (const key of ["dailyFootTraffic", "activeCustomerBase", "eventOrdersPerMonth", "transactionsPerHour", "productMix", "suppliers", "currentInventoryCost", "monthlyDepreciation"]) {
    assert.ok(keys.includes(key), key);
  }
});
