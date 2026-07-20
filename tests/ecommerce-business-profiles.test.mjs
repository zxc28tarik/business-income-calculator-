import test from "node:test";
import assert from "node:assert/strict";
import {
  ECOMMERCE_BUSINESS_TYPES,
  ECOMMERCE_DEFAULT_INPUTS,
  ECOMMERCE_SECTOR,
  applyEcommerceBusinessType,
  calculateEcommerceModel,
  normalizeEcommerceInputs,
} from "../src/sectors/ecommerce.js";

const close = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected} olmalı`);
};

test("eski Trendyol varsayılan finans sonucu korunur", () => {
  const result = calculateEcommerceModel(ECOMMERCE_DEFAULT_INPUTS);
  close(result.grossRevenue, 478400);
  close(result.revenueAfterCommission, 301487.68);
  close(result.netProfit, -207900.05333333334);
  assert.equal(result.input.advancedChannelMixEnabled, false);
  assert.equal(result.input.advancedProductMixEnabled, false);
});

test("on e-ticaret iş türünün tamamı ayrı profil olarak hesaplanır", () => {
  assert.equal(ECOMMERCE_BUSINESS_TYPES.length, 10);
  for (const [businessType] of ECOMMERCE_BUSINESS_TYPES) {
    const input = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, businessType);
    const result = calculateEcommerceModel(input);
    assert.equal(result.input.businessType, businessType);
    assert.equal(result.input.profileTypeApplied, businessType);
    assert.ok(Number.isFinite(result.grossRevenue));
    assert.ok(Number.isFinite(result.netProfit));
    assert.ok(result.profileMetrics.unitsSold >= 0);
  }
});

test("Shopify ve Amazon global trafik-dönüşüm sürücüsü kullanır", () => {
  for (const businessType of ["shopify", "amazon_global"]) {
    const input = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, businessType);
    const result = calculateEcommerceModel(input);
    close(result.profileMetrics.unitsSold, input.monthlyVisitors * input.conversionRate * input.itemsPerOrder);
    assert.equal(result.profile.driver, "traffic_conversion");
  }
});

test("Instagram talep dönüşümü, el yapımı üretim ve abonelik aktif abone sürücüsü kullanır", () => {
  const instagram = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, "instagram");
  close(calculateEcommerceModel(instagram).profileMetrics.unitsSold, instagram.monthlyLeads * instagram.leadConversionRate * instagram.itemsPerOrder);

  const handmade = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, "handmade");
  close(calculateEcommerceModel(handmade).profileMetrics.unitsSold, handmade.productionUnitsPerDay * handmade.productionDaysPerMonth * handmade.productionUtilizationRate);

  const subscription = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, "subscription_box");
  const subscriptionResult = calculateEcommerceModel(subscription);
  close(subscriptionResult.profileMetrics.unitsSold, subscription.activeSubscribers);
  close(subscriptionResult.profileMetrics.closingSubscribers, subscription.activeSubscribers * (1 - subscription.monthlyChurnRate) + subscription.monthlySubscriberAcquisition);
});

test("gelişmiş kanal, ürün ve reklam tabloları ayrı katmanlar üretir", () => {
  const input = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, "shopify");
  const result = calculateEcommerceModel({
    ...input,
    advancedProductMixEnabled: true,
    productMix: [
      { name: "A", unitShareRate: 0.7, priceMultiplier: 1, unitCost: 200, refundRate: 0.05 },
      { name: "B", unitShareRate: 0.3, priceMultiplier: 1.5, unitCost: 350, refundRate: 0.08 },
    ],
  });
  assert.equal(result.channelRows.length, input.salesChannels.length);
  assert.equal(result.productRows.length, 2);
  assert.equal(result.adRows.length, input.adChannels.length);
  close(result.channelShareTotal, 1);
  close(result.productShareTotal, 1);
  assert.ok(result.effectiveCollectionDelayDays >= 0);
});

test("yatırım ve finansman P&L geliri değildir", () => {
  const base = calculateEcommerceModel({ ...ECOMMERCE_DEFAULT_INPUTS, startingCash: 1000000, financingAmount: 0 });
  const funded = calculateEcommerceModel({ ...ECOMMERCE_DEFAULT_INPUTS, startingCash: 1000000, financingAmount: 2000000 });
  close(funded.netProfit, base.netProfit);
  close(funded.cashFlow.endingCash - base.cashFlow.endingCash, 2000000);
});

test("amortisman P&L gideridir ancak nakitten ikinci kez düşülmez", () => {
  const result = calculateEcommerceModel({
    ...ECOMMERCE_DEFAULT_INPUTS,
    depreciationEnabled: true,
    depreciationYears: 2,
    storeSetup: 120000,
    equipment: 120000,
  });
  close(result.monthlyDepreciation, 10000);
  close(result.totalFixedCosts, result.operatingFixedCosts + result.monthlyDepreciation);
  close(result.cashFixedCosts, result.operatingFixedCosts);
});

test("stok kapsamı ve profil uyarıları hesaplanır", () => {
  const input = applyEcommerceBusinessType(ECOMMERCE_DEFAULT_INPUTS, "amazon_global");
  const result = calculateEcommerceModel({
    ...input,
    crossBorderCostRate: 0,
    beginningInventoryUnits: 10,
    inventoryTrackingEnabled: true,
  });
  assert.ok(result.inventoryCoverageDays >= 0);
  assert.ok(result.reorderPointUnits >= 0);
  assert.ok(result.warnings.some((item) => item.id === "global_cost_missing"));
  assert.ok(result.warnings.some((item) => item.id === "inventory_cover"));
});

test("sektör sözleşmesi v0.13 profil ve gelişmiş tabloları taşır", () => {
  assert.equal(ECOMMERCE_SECTOR.version, "0.13.0");
  assert.equal(Object.keys(ECOMMERCE_SECTOR.businessProfiles).length, 10);
  assert.ok(ECOMMERCE_SECTOR.formSections.some((section) => section.fields.some((field) => field.key === "salesChannels" && field.type === "table")));
  assert.ok(ECOMMERCE_SECTOR.formSections.some((section) => section.fields.some((field) => field.key === "productMix" && field.type === "table")));
  assert.ok(ECOMMERCE_SECTOR.formSections.some((section) => section.fields.some((field) => field.key === "adChannels" && field.type === "table")));
  assert.equal(normalizeEcommerceInputs({ businessType: "invalid" }).businessType, "trendyol");
});
