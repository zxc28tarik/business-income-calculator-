import test from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_TYPES, CAFE_BUSINESS_PROFILES, CAFE_FORM_SECTIONS, DEFAULT_INPUTS,
  applyCafeBusinessType, applyScenario, normalizeCafeInputs,
} from "../src/sectors/cafe-config.js";
import { calculateCafeModel } from "../src/sectors/cafe-core.js";

test("eski Kafe varsayılan sonucu korunur", () => {
  const result = calculateCafeModel(DEFAULT_INPUTS);
  assert.equal(result.grossRevenue, 864000);
  assert.equal(result.revenueAfterCommission, 702756);
  assert.equal(result.netProfit, -36164);
  assert.equal(result.monthlyDepreciation, 0);
});

test("on bir iş türü ayrı profile bağlıdır", () => {
  const ids = BUSINESS_TYPES.map(([id]) => id);
  assert.equal(ids.length, 11);
  assert.deepEqual(Object.keys(CAFE_BUSINESS_PROFILES), ids);
  for (const id of ids) {
    const result = calculateCafeModel(applyCafeBusinessType(DEFAULT_INPUTS, id));
    assert.equal(result.input.businessType, id);
    assert.ok(Number.isFinite(result.grossRevenue));
  }
});

test("iş türü değişimi profile özgü varsayımları uygular", () => {
  const input = normalizeCafeInputs({ ...DEFAULT_INPUTS, businessType: "restaurant" });
  assert.equal(input.profileTypeApplied, "restaurant");
  assert.equal(input.averageTicket, 450);
  assert.equal(input.advancedChannelMixEnabled, true);
});

test("talep sürücüleri iş türüne göre değişir", () => {
  const restaurant = calculateCafeModel(applyCafeBusinessType(DEFAULT_INPUTS, "restaurant"));
  const kiosk = calculateCafeModel(applyCafeBusinessType(DEFAULT_INPUTS, "coffee_kiosk"));
  const dark = calculateCafeModel(applyCafeBusinessType(DEFAULT_INPUTS, "dark_kitchen"));
  const truck = calculateCafeModel(applyCafeBusinessType(DEFAULT_INPUTS, "food_truck"));
  assert.ok(Math.abs(restaurant.profileMetrics.dailyCustomers - 92.4) < 1e-9);
  assert.equal(kiosk.profileMetrics.dailyCustomers, 216);
  assert.equal(dark.deliveryOrders, dark.input.dailyDeliveryOrders * dark.input.openDays);
  assert.equal(truck.monthlyCustomers, truck.input.serviceEventsPerMonth * truck.input.customersPerEvent);
});

test("kanal ve ürün karması toplamları denetlenir", () => {
  const input = applyCafeBusinessType(DEFAULT_INPUTS, "dark_kitchen");
  const result = calculateCafeModel({
    ...input,
    salesChannels: [{ name: "Paket", orderShareRate: 0.5, ticketMultiplier: 1, commissionRate: 0.3, packagingCostPerOrder: 10, isDelivery: true }],
    productMix: [{ name: "Ürün", revenueShareRate: 0.6, materialCostRate: 0.35, wasteRate: 0.04 }],
  });
  assert.ok(result.warnings.some((item) => item.id === "channel_mix_total"));
  assert.ok(result.warnings.some((item) => item.id === "product_mix_total"));
});

test("amortisman P&L gideridir, nakitten ikinci kez düşülmez", () => {
  const result = calculateCafeModel(applyCafeBusinessType(DEFAULT_INPUTS, "restaurant"));
  assert.ok(result.monthlyDepreciation > 0);
  assert.equal(result.totalFixedCosts, result.operatingFixedCosts + result.monthlyDepreciation);
  assert.equal(result.cashFlow.rows[0].fixedCosts, result.operatingFixedCosts);
});

test("finansman kârı değiştirmez ve P&L hibesi ayrı gelir olur", () => {
  const input = applyCafeBusinessType(DEFAULT_INPUTS, "coffee_shop");
  const base = calculateCafeModel(input);
  const financed = calculateCafeModel({ ...input, financingAmount: 500000 });
  const granted = calculateCafeModel({ ...input, monthlyOperatingGrantIncome: 25000 });
  assert.equal(financed.netProfit, base.netProfit);
  assert.ok(financed.cashFlow.endingCash > base.cashFlow.endingCash);
  assert.ok(granted.preTaxProfit > base.preTaxProfit);
});

test("senaryo ve form iş türü sürücülerini içerir", () => {
  const restaurant = applyCafeBusinessType(DEFAULT_INPUTS, "restaurant");
  assert.ok(applyScenario(restaurant, "pessimistic").occupancyRate < restaurant.occupancyRate);
  assert.ok(applyScenario(restaurant, "optimistic").occupancyRate > restaurant.occupancyRate);
  const keys = new Set(CAFE_FORM_SECTIONS.flatMap((section) => section.fields.map((field) => field.key)));
  for (const key of ["seats", "ordersPerHour", "dailyDeliveryOrders", "salesChannels", "productMix", "depreciationEnabled"])
    assert.ok(keys.has(key));
});
