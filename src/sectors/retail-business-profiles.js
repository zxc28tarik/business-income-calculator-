export const RETAIL_V2_BUSINESS_TYPES = [
  ["boutique", "Butik mağaza"],
  ["pet_shop", "Pet shop"],
  ["phone_accessories", "Telefon aksesuar mağazası"],
  ["stationery", "Kırtasiye"],
  ["toy_store", "Oyuncak mağazası"],
  ["florist", "Çiçekçi"],
  ["mini_market", "Küçük market"],
];

export const RETAIL_PROFILE_DEFAULT_INPUTS = {
  profileTypeApplied: "boutique",
  profileDriverEnabled: true,
  dailyFootTraffic: 110,
  conversionRate: 0.50,
  activeCustomerBase: 900,
  monthlyPurchaseFrequency: 0.90,
  dailyOrders: 32,
  eventOrdersPerMonth: 8,
  eventOrderValue: 2400,
  transactionsPerHour: 18,
  openHoursPerDay: 14,
  seasonalityMultiplier: 1,
  storeDailyCapacity: 180,
  advancedProductMixEnabled: false,
  productMix: [
    { name: "Ana ürün grubu", salesShareRate: 0.60, salePrice: 390, unitCost: 175, returnRate: 0.035, markdownShareRate: 0, markdownDiscountRate: 0, spoilageRate: 0 },
    { name: "Tamamlayıcı ürün", salesShareRate: 0.40, salePrice: 227.5, unitCost: 100, returnRate: 0.035, markdownShareRate: 0, markdownDiscountRate: 0, spoilageRate: 0 },
  ],
  markdownShareRate: 0,
  markdownDiscountRate: 0,
  spoilageRate: 0,
  advancedSupplierMixEnabled: false,
  suppliers: [
    { name: "Ana tedarikçi", purchaseShareRate: 1, paymentDelayDays: 30, leadTimeDays: 14, discountRate: 0, minimumOrderAmount: 0 },
  ],
  purchaseDiscountRate: 0,
  supplierLeadTimeDays: 14,
  inventoryPlanningEnabled: false,
  currentInventoryCost: 850000,
  targetStockCoverageDays: 55,
  safetyStockDays: 10,
  monthlyDepreciation: 0,
  monthlyOperatingGrantIncome: 0,
};

const profile = (id, label, driver, defaults) => ({ id, label, driver, defaults });

export const RETAIL_BUSINESS_PROFILES = {
  boutique: profile("boutique", "Butik mağaza", "traffic_conversion", {
    dailyFootTraffic: 110, conversionRate: 0.50, averageBasket: 650, averageUnitSalePrice: 325,
    averageUnitCost: 145, returnRate: 0.035, inventoryLossRate: 0.018, storeDailyCapacity: 180,
  }),
  pet_shop: profile("pet_shop", "Pet shop", "customer_frequency", {
    activeCustomerBase: 1100, monthlyPurchaseFrequency: 0.82, averageBasket: 820,
    averageUnitSalePrice: 410, averageUnitCost: 235, returnRate: 0.018,
    inventoryLossRate: 0.012, spoilageRate: 0.008, targetStockCoverageDays: 50,
  }),
  phone_accessories: profile("phone_accessories", "Telefon aksesuar mağazası", "traffic_conversion", {
    dailyFootTraffic: 95, conversionRate: 0.46, averageBasket: 780, averageUnitSalePrice: 390,
    averageUnitCost: 165, returnRate: 0.045, inventoryLossRate: 0.025, targetStockCoverageDays: 70,
  }),
  stationery: profile("stationery", "Kırtasiye", "traffic_conversion", {
    dailyFootTraffic: 150, conversionRate: 0.58, averageBasket: 310, averageUnitSalePrice: 95,
    averageUnitCost: 48, returnRate: 0.012, inventoryLossRate: 0.014, seasonalityMultiplier: 1,
  }),
  toy_store: profile("toy_store", "Oyuncak mağazası", "traffic_conversion", {
    dailyFootTraffic: 85, conversionRate: 0.42, averageBasket: 970, averageUnitSalePrice: 485,
    averageUnitCost: 270, returnRate: 0.05, inventoryLossRate: 0.018, seasonalityMultiplier: 1,
  }),
  florist: profile("florist", "Çiçekçi", "orders_events", {
    dailyOrders: 30, eventOrdersPerMonth: 10, eventOrderValue: 2600, averageBasket: 520,
    averageUnitSalePrice: 260, averageUnitCost: 105, returnRate: 0.005,
    inventoryLossRate: 0.015, spoilageRate: 0.09, supplierPaymentDelayDays: 7,
  }),
  mini_market: profile("mini_market", "Küçük market", "hourly_transactions", {
    transactionsPerHour: 21, openHoursPerDay: 15, averageBasket: 235,
    averageUnitSalePrice: 58, averageUnitCost: 43, returnRate: 0.003,
    inventoryLossRate: 0.022, spoilageRate: 0.018, storeDailyCapacity: 450,
    supplierPaymentDelayDays: 21, targetStockCoverageDays: 24,
  }),
};

export function getRetailBusinessProfile(type) {
  return RETAIL_BUSINESS_PROFILES[type] ?? RETAIL_BUSINESS_PROFILES.boutique;
}
