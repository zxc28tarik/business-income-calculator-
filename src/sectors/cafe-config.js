import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";
import {
  CAFE_BUSINESS_PROFILES,
  CAFE_PROFILE_INPUT_DEFAULTS,
  applyCafeProfileDemandScenario,
  getCafeBusinessProfile,
} from "./cafe-business-profile-engine.js";

const clone = (value) => structuredClone(value);
const DAILY_CUSTOMER_TYPES = ["cafe", "coffee_shop", "pastry_shop", "burger_shop", "doner_shop", "buffet"];
const RESTAURANT_TYPES = ["restaurant", "franchise_restaurant"];

export const BUSINESS_TYPES = [
  ["cafe", "Kafe"], ["restaurant", "Restoran"], ["coffee_shop", "Kahveci"],
  ["coffee_kiosk", "Kahve kiosk"], ["pastry_shop", "Tatlıcı / pastane"],
  ["burger_shop", "Burgerci"], ["doner_shop", "Dönerci"], ["buffet", "Tostçu / büfe"],
  ["dark_kitchen", "Dark kitchen"], ["food_truck", "Food truck"],
  ["franchise_restaurant", "Franchise restoran"],
];

export const DEFAULT_INPUTS = {
  businessType: "cafe",
  profileTypeApplied: "cafe",
  dailyCustomers: 120,
  averageTicket: 240,
  openDays: 30,
  serviceCapacity: 180,
  ...clone(CAFE_PROFILE_INPUT_DEFAULTS),
  deliverySalesShare: 0.25,
  cardSalesShare: 0.85,
  lostSalesRate: 0.01,
  taxType: "included",
  vatRate: 0.10,
  deliveryCommissionRate: 0.30,
  posCommissionRate: 0.025,
  materialCostRate: 0.30,
  wasteRate: 0.05,
  packagingCostPerDeliveryOrder: 8,
  otherVariableCostRate: 0.01,
  rent: 120000,
  staffCost: 260000,
  utilities: 45000,
  accounting: 10000,
  software: 5000,
  cleaning: 12000,
  maintenance: 8000,
  insurance: 4000,
  otherFixedExpenses: 15000,
  loanPayment: 0,
  renovation: 500000,
  equipment: 850000,
  furniture: 250000,
  deposit: 240000,
  initialStock: 100000,
  licenseFees: 50000,
  openingMarketing: 75000,
  softwareSetup: 25000,
  franchiseRoyaltyRate: 0,
  franchiseRoyaltyBasis: "net_revenue_after_commission",
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 2500000,
  financingAmount: 0,
  supportAmount: 0,
  monthlyOperatingGrantIncome: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 2,
  supplierPaymentDelayDays: 0,
  firstMonthSalesShare: 0.75,
  monthlyGrowthRate: 0.02,
};

export const SCENARIO_PRESETS = {
  pessimistic: { label: "Kötümser", multipliers: { averageTicket: 0.94, materialCostRate: 1.12, wasteRate: 1.25, utilities: 1.10, firstMonthSalesShare: 0.80 } },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: { label: "İyimser", multipliers: { averageTicket: 1.06, materialCostRate: 0.94, wasteRate: 0.80, utilities: 1.05, firstMonthSalesShare: 1.15 } },
};

const visibleIn = (values) => ({ key: "businessType", in: values });

export const CAFE_FORM_SECTIONS = [
  {
    title: "1 · İş türü ve talep sürücüsü", open: true,
    fields: [
      selectField("businessType", "İş türü", BUSINESS_TYPES, { full: true }),
      numberField("dailyCustomers", "Günlük müşteri", 1, { visibleWhen: visibleIn(DAILY_CUSTOMER_TYPES) }),
      numberField("seats", "Koltuk sayısı", 1, { visibleWhen: visibleIn(RESTAURANT_TYPES) }),
      numberField("tableTurnsPerDay", "Günlük masa devir sayısı", 0.1, { visibleWhen: visibleIn(RESTAURANT_TYPES) }),
      rateField("occupancyRate", "Ortalama doluluk", { visibleWhen: visibleIn(RESTAURANT_TYPES) }),
      numberField("ordersPerHour", "Saatlik sipariş", 1, { visibleWhen: { key: "businessType", equals: "coffee_kiosk" } }),
      numberField("serviceHoursPerDay", "Günlük servis saati", 0.5, { visibleWhen: { key: "businessType", equals: "coffee_kiosk" } }),
      numberField("maxOrdersPerHour", "Saatlik azami kapasite", 1, { visibleWhen: { key: "businessType", equals: "coffee_kiosk" } }),
      numberField("dailyDeliveryOrders", "Günlük paket siparişi", 1, { visibleWhen: { key: "businessType", equals: "dark_kitchen" } }),
      numberField("dailyKitchenCapacity", "Günlük mutfak kapasitesi", 1, { visibleWhen: { key: "businessType", equals: "dark_kitchen" } }),
      numberField("serviceEventsPerMonth", "Aylık servis / etkinlik", 1, { visibleWhen: { key: "businessType", equals: "food_truck" } }),
      numberField("customersPerEvent", "Etkinlik başı müşteri", 1, { visibleWhen: { key: "businessType", equals: "food_truck" } }),
      numberField("maxCustomersPerEvent", "Etkinlik kapasitesi", 1, { visibleWhen: { key: "businessType", equals: "food_truck" } }),
      numberField("averageTicket", "Ortalama fiş (TL)", 10),
      numberField("openDays", "Açık gün / ay", 1, { visibleWhen: { key: "businessType", notEquals: "food_truck" } }),
      numberField("serviceCapacity", "Günlük servis kapasitesi", 1, { visibleWhen: visibleIn(DAILY_CUSTOMER_TYPES) }),
      rateField("cardSalesShare", "Kartlı satış payı"),
      rateField("lostSalesRate", "İptal / gerçekleşmeyen satış"),
    ],
  },
  {
    title: "2 · Satış kanalları", open: true,
    fields: [
      booleanField("advancedChannelMixEnabled", "Gelişmiş satış kanalı karmasını kullan", { full: true }),
      tableField("salesChannels", "Satış kanalları", [
        { type: "text", key: "name", label: "Kanal", defaultValue: "Yeni kanal" },
        { type: "rate", key: "orderShareRate", label: "Sipariş payı", defaultValue: 0 },
        { type: "number", key: "ticketMultiplier", label: "Fiş çarpanı", step: 0.05, defaultValue: 1 },
        { type: "rate", key: "commissionRate", label: "Komisyon", defaultValue: 0 },
        { type: "number", key: "packagingCostPerOrder", label: "Paketleme", step: 1, defaultValue: 0 },
        { type: "boolean", key: "isDelivery", label: "Paket?", defaultValue: false },
      ], {
        visibleWhen: { key: "advancedChannelMixEnabled", equals: true }, minRows: 1, maxRows: 12,
        newRow: { name: "Yeni kanal", orderShareRate: 0, ticketMultiplier: 1, commissionRate: 0, packagingCostPerOrder: 0, isDelivery: false },
      }),
      rateField("deliverySalesShare", "Paket servis satış payı", { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      rateField("deliveryCommissionRate", "Paket servis komisyonu", { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      numberField("packagingCostPerDeliveryOrder", "Paketleme / teslimat siparişi (TL)", 1, { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      rateField("posCommissionRate", "POS komisyonu"),
    ],
  },
  {
    title: "3 · Ürün karması ve değişken maliyet", open: true,
    fields: [
      booleanField("advancedProductMixEnabled", "Gelişmiş ürün karmasını kullan", { full: true }),
      tableField("productMix", "Ürün / kategori karması", [
        { type: "text", key: "name", label: "Kategori", defaultValue: "Yeni kategori" },
        { type: "rate", key: "revenueShareRate", label: "Ciro payı", defaultValue: 0 },
        { type: "rate", key: "materialCostRate", label: "Malzeme oranı", defaultValue: 0 },
        { type: "rate", key: "wasteRate", label: "Fire", defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedProductMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni kategori", revenueShareRate: 0, materialCostRate: 0, wasteRate: 0 },
      }),
      rateField("materialCostRate", "Malzeme maliyeti / net satış", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("wasteRate", "Fire / malzeme maliyeti", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net satış"),
    ],
  },
  {
    title: "4 · Vergi ve komisyon varsayımları",
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
    ],
  },
  {
    title: "5 · Sabit giderler",
    fields: [
      numberField("rent", "Kira (TL)", 1000), numberField("staffCost", "Personel toplam maliyeti (TL)", 1000),
      numberField("utilities", "Faturalar (TL)", 1000), numberField("accounting", "Muhasebe (TL)", 500),
      numberField("software", "Yazılım / abonelikler (TL)", 500), numberField("cleaning", "Temizlik (TL)", 500),
      numberField("maintenance", "Bakım (TL)", 500), numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değil; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "6 · Kurulum ve amortisman",
    note: "Kurulum kalemleri nakitte tek sefer düşülür. Amortisman açılırsa P&L gideridir, nakitten ikinci kez düşülmez.",
    fields: [
      numberField("renovation", "Tadilat (TL)", 1000), numberField("equipment", "Ekipman (TL)", 1000),
      numberField("furniture", "Mobilya (TL)", 1000), numberField("deposit", "Depozito (TL)", 1000),
      numberField("initialStock", "İlk stok (TL)", 1000), numberField("licenseFees", "Ruhsat / izin (TL)", 1000),
      numberField("openingMarketing", "Açılış reklamı (TL)", 1000), numberField("softwareSetup", "Yazılım kurulumu (TL)", 1000),
      booleanField("depreciationEnabled", "Kurulum varlıklarına doğrusal amortisman uygula", { full: true }),
      numberField("depreciationYears", "Amortisman süresi (yıl)", 1, { visibleWhen: { key: "depreciationEnabled", equals: true } }),
    ],
  },
  {
    title: "7 · Paydaş ve vergi ön tahmini",
    fields: [
      rateField("franchiseRoyaltyRate", "Franchise / lisans payı"),
      selectField("franchiseRoyaltyBasis", "Paylaşım tabanı", [
        ["gross_revenue", "Brüt ciro"], ["net_revenue_after_commission", "Komisyon sonrası net gelir"],
        ["contribution_after_variable_cost", "Değişken maliyet sonrası katkı"], ["pre_tax_profit", "Sabit gider sonrası kâr"],
      ]),
      rateField("partnerProfitShareRate", "Ortak kâr payı"),
      rateField("estimatedTaxRate", "Vergi ön tahmin oranı", { hint: "Kesin vergi hesabı değildir." }),
      numberField("monthlyOperatingGrantIncome", "Aylık P&L hibe / destek geliri (TL)", 1000, { hint: "Finansmandan ayrıdır; kâr-zarar hesabına ayrı gelir olarak girer." }),
    ],
  },
  {
    title: "8 · Nakit akışı",
    fields: [
      numberField("startingCash", "Başlangıç nakdi (TL)", 1000),
      numberField("financingAmount", "Yatırım / finansman (TL)", 1000, { hint: "P&L geliri değildir." }),
      numberField("supportAmount", "Hibe / destek nakit girişi (TL)", 1000, { hint: "Ayrı gösterilir; vergi etkisi hesaplanmaz." }),
      numberField("setupPaymentMonth", "Kurulum ödeme ayı", 1),
      numberField("collectionDelayDays", "Tahsilat gecikmesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Tedarikçi ödeme vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay satış gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık müşteri büyümesi", { allowNegative: true }),
    ],
  },
];

function normalizeChannel(item = {}) {
  return {
    name: String(item.name || "Kanal"), orderShareRate: clampRate(item.orderShareRate),
    ticketMultiplier: nonNegative(item.ticketMultiplier, 1), commissionRate: clampRate(item.commissionRate),
    packagingCostPerOrder: nonNegative(item.packagingCostPerOrder), isDelivery: Boolean(item.isDelivery),
  };
}

function normalizeProduct(item = {}) {
  return {
    name: String(item.name || "Kategori"), revenueShareRate: clampRate(item.revenueShareRate),
    materialCostRate: clampRate(item.materialCostRate), wasteRate: clampRate(item.wasteRate),
  };
}

export function normalizeCafeInputs(raw = {}) {
  let source = clone(raw);
  const requestedType = BUSINESS_TYPES.some(([id]) => id === source.businessType)
    ? source.businessType
    : DEFAULT_INPUTS.businessType;
  if (!source.profileTypeApplied) source.profileTypeApplied = requestedType;
  else if (source.profileTypeApplied !== requestedType) {
    const profile = getCafeBusinessProfile(requestedType);
    const preservedKeys = [
      "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
      "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays", "firstMonthSalesShare", "monthlyGrowthRate",
    ];
    const preserved = Object.fromEntries(preservedKeys.map((key) => [key, source[key] ?? DEFAULT_INPUTS[key]]));
    source = { ...clone(DEFAULT_INPUTS), ...clone(profile.defaults), ...preserved, businessType: requestedType, profileTypeApplied: requestedType };
  }
  const input = { ...clone(DEFAULT_INPUTS), ...source };
  const rateKeys = [
    "deliverySalesShare", "cardSalesShare", "lostSalesRate", "vatRate", "deliveryCommissionRate",
    "posCommissionRate", "materialCostRate", "wasteRate", "otherVariableCostRate",
    "franchiseRoyaltyRate", "partnerProfitShareRate", "estimatedTaxRate", "firstMonthSalesShare", "occupancyRate",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(DEFAULT_INPUTS).filter(
    (key) => typeof DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key) && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.openDays = Math.min(31, input.openDays);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.depreciationYears = Math.max(1, input.depreciationYears || 1);
  input.advancedChannelMixEnabled = Boolean(input.advancedChannelMixEnabled);
  input.advancedProductMixEnabled = Boolean(input.advancedProductMixEnabled);
  input.depreciationEnabled = Boolean(input.depreciationEnabled);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = BUSINESS_TYPES.some(([id]) => id === input.businessType) ? input.businessType : DEFAULT_INPUTS.businessType;
  input.profileTypeApplied = input.profileTypeApplied || input.businessType;
  input.franchiseRoyaltyBasis = ["gross_revenue", "net_revenue_after_commission", "contribution_after_variable_cost", "pre_tax_profit"].includes(input.franchiseRoyaltyBasis)
    ? input.franchiseRoyaltyBasis : DEFAULT_INPUTS.franchiseRoyaltyBasis;
  input.salesChannels = (Array.isArray(raw.salesChannels) ? raw.salesChannels : DEFAULT_INPUTS.salesChannels).map(normalizeChannel);
  input.productMix = (Array.isArray(raw.productMix) ? raw.productMix : DEFAULT_INPUTS.productMix).map(normalizeProduct);
  return input;
}

export function applyCafeBusinessType(currentInputs, businessType) {
  const profile = getCafeBusinessProfile(businessType);
  const preservedKeys = [
    "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
    "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays", "firstMonthSalesShare", "monthlyGrowthRate",
  ];
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, currentInputs?.[key] ?? DEFAULT_INPUTS[key]]));
  return normalizeCafeInputs({
    ...clone(DEFAULT_INPUTS), ...clone(profile.defaults), ...preserved, businessType, profileTypeApplied: businessType,
  });
}

export function applyScenario(baseInputs, scenarioId) {
  const normalized = normalizeCafeInputs(baseInputs);
  const preset = SCENARIO_PRESETS[scenarioId] ?? SCENARIO_PRESETS.expected;
  let next = applyCafeProfileDemandScenario(normalized, scenarioId);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = normalized[key] * multiplier;
  if (next.advancedProductMixEnabled && scenarioId !== "expected") {
    const multiplier = scenarioId === "pessimistic" ? 1.08 : 0.96;
    next.productMix = next.productMix.map((item) => ({ ...item, materialCostRate: item.materialCostRate * multiplier }));
  }
  return normalizeCafeInputs(next);
}

export { CAFE_BUSINESS_PROFILES };
