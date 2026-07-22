const clone = (value) => structuredClone(value);
const rate = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const nonNegative = (value) => Math.max(0, Number(value) || 0);

const channel = (name, orderShareRate, priceMultiplier, commissionRate, paymentRate, shippingCostPerOrder, packagingCostPerOrder, collectionDelayDays, isMarketplace = false) => ({
  name, orderShareRate, priceMultiplier, commissionRate, paymentRate,
  shippingCostPerOrder, packagingCostPerOrder, collectionDelayDays, isMarketplace,
});
const product = (name, unitShareRate, priceMultiplier, unitCost, refundRate) => ({
  name, unitShareRate, priceMultiplier, unitCost, refundRate,
});
const ad = (name, spend, attributedOrders, attributedRevenue) => ({
  name, spend, attributedOrders, attributedRevenue,
});

export const ECOMMERCE_PROFILE_INPUT_DEFAULTS = {
  monthlyVisitors: 45000,
  conversionRate: 0.018,
  itemsPerOrder: 1.08,
  monthlyLeads: 2400,
  leadConversionRate: 0.10,
  productionUnitsPerDay: 35,
  productionDaysPerMonth: 24,
  productionUtilizationRate: 0.80,
  activeSubscribers: 600,
  monthlySubscriberAcquisition: 60,
  monthlyChurnRate: 0.06,
  monthlyOrderCapacity: 1600,
  advancedChannelMixEnabled: false,
  salesChannels: [
    channel("Pazaryeri", 0.85, 1, 0.18, 0.025, 55, 12, 15, true),
    channel("Doğrudan mağaza", 0.15, 1, 0, 0.025, 55, 12, 2, false),
  ],
  advancedProductMixEnabled: false,
  productMix: [
    product("Ana ürün", 0.70, 1, 240, 0.08),
    product("Üst segment", 0.20, 1.35, 340, 0.06),
    product("Aksesuar", 0.10, 0.45, 80, 0.04),
  ],
  advancedAdMixEnabled: false,
  adChannels: [
    ad("Pazaryeri reklamı", 45000, 280, 210000),
    ad("Meta / sosyal", 25000, 120, 90000),
  ],
  inventoryTrackingEnabled: false,
  beginningInventoryUnits: 1600,
  reorderLeadTimeDays: 21,
  safetyStockDays: 20,
  shrinkageRate: 0,
  deadStockRate: 0,
  crossBorderCostRate: 0,
  supplierQualityLossRate: 0,
  laborCostPerUnit: 0,
  subscriptionFulfillmentCostPerBox: 0,
  depreciationEnabled: false,
  depreciationYears: 3,
  monthlyOperatingGrantIncome: 0,
};

export const ECOMMERCE_BUSINESS_PROFILES = {
  trendyol: {
    label: "Trendyol mağazası", driver: "units",
    defaults: {
      monthlyOrderCapacity: 1800,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Trendyol", 0.92, 1, 0.18, 0, 55, 12, 15, true),
        channel("Doğrudan", 0.08, 1, 0, 0.025, 55, 12, 2, false),
      ],
      inventoryTrackingEnabled: true,
    },
  },
  hepsiburada: {
    label: "Hepsiburada mağazası", driver: "units",
    defaults: {
      unitsSold: 720, marketplaceCommissionRate: 0.17, collectionDelayDays: 18,
      monthlyOrderCapacity: 1600, inventoryTrackingEnabled: true,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Hepsiburada", 1, 1, 0.17, 0, 58, 12, 18, true)],
    },
  },
  amazon_tr: {
    label: "Amazon Türkiye", driver: "units",
    defaults: {
      unitsSold: 650, marketplaceCommissionRate: 0.15, fulfillmentCostPerOrder: 28,
      collectionDelayDays: 14, monthlyOrderCapacity: 1500, inventoryTrackingEnabled: true,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Amazon TR", 1, 1, 0.15, 0, 45, 10, 14, true)],
    },
  },
  amazon_global: {
    label: "Amazon global", driver: "traffic_conversion",
    defaults: {
      monthlyVisitors: 70000, conversionRate: 0.014, itemsPerOrder: 1.08,
      productPrice: 1150, unitProductCost: 390, refundRate: 0.10,
      shippingCostPerOrder: 135, fulfillmentCostPerOrder: 35, crossBorderCostRate: 0.08,
      taxType: "none", collectionDelayDays: 21, monthlyOrderCapacity: 2500,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Amazon Global", 1, 1, 0.15, 0, 135, 18, 21, true)],
      inventoryTrackingEnabled: true,
    },
  },
  shopify: {
    label: "Shopify mağazası", driver: "traffic_conversion",
    defaults: {
      monthlyVisitors: 55000, conversionRate: 0.022, itemsPerOrder: 1.12,
      marketplaceSalesShare: 0, marketplaceCommissionRate: 0,
      paymentCommissionRate: 0.029, collectionDelayDays: 2, monthlyOrderCapacity: 2200,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Shopify", 1, 1, 0, 0.029, 55, 12, 2, false)],
      advancedAdMixEnabled: true,
      adChannels: [ad("Meta", 45000, 300, 240000), ad("Google", 35000, 210, 175000)],
      inventoryTrackingEnabled: true,
    },
  },
  stock_ecommerce: {
    label: "Stoklu e-ticaret", driver: "units",
    defaults: {
      unitsSold: 900, monthlyOrderCapacity: 2200, stockCoverageMonths: 2.5,
      beginningInventoryUnits: 2200, inventoryTrackingEnabled: true,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Kendi site", 0.45, 1, 0, 0.025, 55, 12, 2, false),
        channel("Pazaryeri", 0.55, 1, 0.18, 0, 55, 12, 15, true),
      ],
    },
  },
  dropshipping: {
    label: "Dropshipping", driver: "traffic_conversion",
    defaults: {
      monthlyVisitors: 80000, conversionRate: 0.012, itemsPerOrder: 1.05,
      productPrice: 780, unitProductCost: 430, refundRate: 0.12,
      supplierQualityLossRate: 0.03, beginningInventoryUnits: 0,
      initialStockInvestment: 0, warehouseCost: 0, supplierPaymentDelayDays: 0,
      monthlyOrderCapacity: 3000, inventoryTrackingEnabled: false,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Dropshipping mağazası", 1, 1, 0, 0.029, 85, 10, 3, false)],
      advancedAdMixEnabled: true,
      adChannels: [ad("Meta", 65000, 320, 250000), ad("TikTok", 35000, 190, 145000)],
    },
  },
  instagram: {
    label: "Instagram satış", driver: "lead_conversion",
    defaults: {
      monthlyLeads: 4200, leadConversionRate: 0.085, itemsPerOrder: 1.04,
      productPrice: 520, unitProductCost: 190, marketplaceSalesShare: 0,
      marketplaceCommissionRate: 0, cardPaymentShare: 0.75, collectionDelayDays: 2,
      monthlyOrderCapacity: 900, warehouseCost: 0,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Instagram DM / link", 0.75, 1, 0, 0.025, 55, 12, 2, false),
        channel("Kapıda ödeme", 0.25, 1.03, 0.035, 0, 65, 12, 7, false),
      ],
      advancedAdMixEnabled: true,
      adChannels: [ad("Instagram reklamı", 45000, 230, 145000), ad("İçerik / influencer", 25000, 100, 70000)],
    },
  },
  handmade: {
    label: "El yapımı ürün satışı", driver: "production_capacity",
    defaults: {
      productionUnitsPerDay: 28, productionDaysPerMonth: 24, productionUtilizationRate: 0.78,
      productPrice: 950, unitProductCost: 260, laborCostPerUnit: 190, refundRate: 0.03,
      monthlyOrderCapacity: 672, warehouseCost: 0, fulfillmentCostPerOrder: 5,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Kendi mağaza", 0.55, 1, 0, 0.025, 65, 18, 2, false),
        channel("Pazaryeri", 0.45, 1.08, 0.16, 0, 65, 18, 14, true),
      ],
      inventoryTrackingEnabled: false,
      depreciationEnabled: true,
    },
  },
  subscription_box: {
    label: "Abonelik kutusu", driver: "subscribers",
    defaults: {
      activeSubscribers: 600, monthlySubscriberAcquisition: 70, monthlyChurnRate: 0.06,
      productPrice: 720, unitProductCost: 300, refundRate: 0.025,
      subscriptionFulfillmentCostPerBox: 38, monthlyOrderCapacity: 1200,
      marketplaceSalesShare: 0, marketplaceCommissionRate: 0, collectionDelayDays: 2,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Abonelik tahsilatı", 1, 1, 0, 0.025, 60, 16, 2, false)],
      inventoryTrackingEnabled: true,
      stockCoverageMonths: 1.5,
    },
  },
};

export function getEcommerceBusinessProfile(businessType) {
  return ECOMMERCE_BUSINESS_PROFILES[businessType] ?? ECOMMERCE_BUSINESS_PROFILES.trendyol;
}

export function deriveEcommerceDemand(input) {
  const profile = getEcommerceBusinessProfile(input.businessType);
  let orders = nonNegative(input.unitsSold);
  let unitsSold = orders;
  let capacity = nonNegative(input.monthlyOrderCapacity);
  let driverValue = unitsSold;
  let driverLabel = "Aylık satış adedi";

  if (profile.driver === "traffic_conversion") {
    orders = nonNegative(input.monthlyVisitors) * rate(input.conversionRate);
    unitsSold = orders * nonNegative(input.itemsPerOrder || 1);
    driverValue = rate(input.conversionRate);
    driverLabel = "Dönüşüm oranı";
  } else if (profile.driver === "lead_conversion") {
    orders = nonNegative(input.monthlyLeads) * rate(input.leadConversionRate);
    unitsSold = orders * nonNegative(input.itemsPerOrder || 1);
    driverValue = rate(input.leadConversionRate);
    driverLabel = "Talep dönüşüm oranı";
  } else if (profile.driver === "production_capacity") {
    capacity = nonNegative(input.productionUnitsPerDay) * nonNegative(input.productionDaysPerMonth);
    unitsSold = capacity * rate(input.productionUtilizationRate);
    orders = unitsSold;
    driverValue = rate(input.productionUtilizationRate);
    driverLabel = "Üretim kapasitesi kullanımı";
  } else if (profile.driver === "subscribers") {
    unitsSold = nonNegative(input.activeSubscribers);
    orders = unitsSold;
    driverValue = unitsSold;
    driverLabel = "Aktif abone";
  }

  const capacityUtilization = capacity > 0 ? unitsSold / capacity : 0;
  const closingSubscribers = profile.driver === "subscribers"
    ? nonNegative(input.activeSubscribers) * (1 - rate(input.monthlyChurnRate)) + nonNegative(input.monthlySubscriberAcquisition)
    : null;
  return {
    profile,
    input: { ...input, unitsSold },
    metrics: { orders, unitsSold, capacity, capacityUtilization, driverValue, driverLabel, closingSubscribers },
  };
}

export function applyEcommerceProfileDemandScenario(input, scenarioId) {
  const factor = scenarioId === "pessimistic" ? 0.65 : scenarioId === "optimistic" ? 1.35 : 1;
  const next = clone(input);
  const profile = getEcommerceBusinessProfile(next.businessType);
  if (profile.driver === "traffic_conversion") next.conversionRate = rate(next.conversionRate * factor);
  else if (profile.driver === "lead_conversion") next.leadConversionRate = rate(next.leadConversionRate * factor);
  else if (profile.driver === "production_capacity") next.productionUtilizationRate = rate(next.productionUtilizationRate * factor);
  else if (profile.driver === "subscribers") next.activeSubscribers = nonNegative(next.activeSubscribers * factor);
  else next.unitsSold = nonNegative(next.unitsSold * factor);
  return next;
}

export function buildEcommerceProfileWarnings(result) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (result.capacityUtilization > 1) add("profile_capacity_over", "hard", "Tahmini satış, aylık sipariş veya üretim kapasitesini aşıyor.");
  else if (result.capacityUtilization > 0.90) add("profile_capacity_tight", "soft", "Kapasite kullanımı %90'ın üzerinde; stok veya operasyon darboğazı oluşabilir.");
  if (result.input.businessType === "amazon_global" && result.input.crossBorderCostRate <= 0) add("global_cost_missing", "hard", "Amazon global seçildi ancak sınır ötesi ek maliyet oranı sıfır.");
  if (result.input.businessType === "dropshipping" && result.input.supplierQualityLossRate > 0.05) add("supplier_quality", "hard", "Dropshipping tedarikçi kalite kaybı %5'in üzerinde.");
  if (result.input.businessType === "instagram" && result.profileMetrics.driverValue < 0.04) add("instagram_conversion", "soft", "Instagram talep dönüşümü %4'ün altında.");
  if (result.input.businessType === "handmade" && result.capacityUtilization > 0.90) add("handmade_capacity", "soft", "El yapımı üretimde kapasite tamponu çok düşük.");
  if (result.input.businessType === "subscription_box" && result.input.monthlyChurnRate > 0.10) add("subscription_churn", "hard", "Abonelik kutusu aylık kayıp oranı %10'un üzerinde.");
  if (result.inventoryTrackingEnabled && result.inventoryCoverageDays < result.input.reorderLeadTimeDays + result.input.safetyStockDays) {
    add("inventory_cover", "hard", "Mevcut stok, tedarik süresi ve güvenlik stoğu toplamını karşılamıyor.");
  }
  return warnings;
}

export function buildEcommerceProfileKpis(result) {
  const profile = getEcommerceBusinessProfile(result.input.businessType);
  const kpis = [
    { id: "profile_driver", label: result.profileMetrics.driverLabel, value: result.profileMetrics.driverValue, format: ["traffic_conversion", "lead_conversion", "production_capacity"].includes(profile.driver) ? "percent" : "number" },
    { id: "capacity_utilization", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent", negative: result.capacityUtilization > 1 },
  ];
  if (result.input.businessType === "subscription_box") {
    kpis.push({ id: "closing_subscribers", label: "Ay sonu tahmini abone", value: result.profileMetrics.closingSubscribers, format: "number" });
  } else if (result.input.businessType === "handmade") {
    kpis.push({ id: "labor_per_unit", label: "Birim emek maliyeti", value: result.input.laborCostPerUnit, format: "money" });
  } else if (result.inventoryTrackingEnabled) {
    kpis.push({ id: "inventory_cover", label: "Stok kapsamı", value: result.inventoryCoverageDays, format: "numberSuffix", suffix: " gün" });
  }
  return kpis;
}
