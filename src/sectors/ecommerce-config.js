import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";
import {
  ECOMMERCE_BUSINESS_PROFILES,
  ECOMMERCE_PROFILE_INPUT_DEFAULTS,
  applyEcommerceProfileDemandScenario,
  getEcommerceBusinessProfile,
} from "./ecommerce-business-profile-engine.js";

const clone = (value) => structuredClone(value);
const UNIT_TYPES = ["trendyol", "hepsiburada", "amazon_tr", "stock_ecommerce"];
const TRAFFIC_TYPES = ["amazon_global", "shopify", "dropshipping"];

export const ECOMMERCE_BUSINESS_TYPES = [
  ["trendyol", "Trendyol mağazası"], ["hepsiburada", "Hepsiburada mağazası"],
  ["amazon_tr", "Amazon Türkiye"], ["amazon_global", "Amazon global"],
  ["shopify", "Shopify mağazası"], ["stock_ecommerce", "Stoklu e-ticaret"],
  ["dropshipping", "Dropshipping"], ["instagram", "Instagram satış"],
  ["handmade", "El yapımı ürün satışı"], ["subscription_box", "Abonelik kutusu"],
];

export const ECOMMERCE_DEFAULT_INPUTS = {
  businessType: "trendyol",
  profileTypeApplied: "trendyol",
  unitsSold: 800,
  productPrice: 650,
  averageDiscountRate: 0.08,
  marketplaceSalesShare: 0.85,
  cardPaymentShare: 1,
  ...clone(ECOMMERCE_PROFILE_INPUT_DEFAULTS),
  taxType: "included",
  vatRate: 0.20,
  refundRate: 0.08,
  marketplaceCommissionRate: 0.18,
  paymentCommissionRate: 0.025,
  unitProductCost: 240,
  shippingCostPerOrder: 55,
  packagingCostPerOrder: 12,
  returnShippingCostPerOrder: 70,
  fulfillmentCostPerOrder: 10,
  otherVariableCostRate: 0.01,
  monthlyAdSpend: 70000,
  rent: 25000,
  warehouseCost: 35000,
  staffCost: 90000,
  software: 12000,
  accounting: 8000,
  utilities: 8000,
  insurance: 5000,
  otherFixedExpenses: 10000,
  loanPayment: 0,
  initialStockInvestment: 500000,
  storeSetup: 60000,
  equipment: 80000,
  deposit: 50000,
  legalFees: 20000,
  launchMarketing: 75000,
  otherSetupCosts: 15000,
  stockCoverageMonths: 2,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 1200000,
  financingAmount: 0,
  supportAmount: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 15,
  supplierPaymentDelayDays: 30,
  firstMonthSalesShare: 0.65,
  monthlyGrowthRate: 0.04,
};

export const ECOMMERCE_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      productPrice: 0.95, averageDiscountRate: 1.30, refundRate: 1.45,
      marketplaceCommissionRate: 1.08, shippingCostPerOrder: 1.12,
      monthlyAdSpend: 1.08, firstMonthSalesShare: 0.80,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      productPrice: 1.03, averageDiscountRate: 0.75, refundRate: 0.70,
      marketplaceCommissionRate: 0.96, shippingCostPerOrder: 0.94,
      monthlyAdSpend: 1.15, firstMonthSalesShare: 1.20,
    },
  },
};

const visibleIn = (values) => ({ key: "businessType", in: values });

export const ECOMMERCE_FORM_SECTIONS = [
  {
    title: "1 · İş türü ve talep sürücüsü", open: true,
    fields: [
      selectField("businessType", "İş türü", ECOMMERCE_BUSINESS_TYPES, { full: true }),
      numberField("unitsSold", "Aylık satış adedi", 1, { visibleWhen: visibleIn(UNIT_TYPES) }),
      numberField("monthlyVisitors", "Aylık mağaza ziyaretçisi", 100, { visibleWhen: visibleIn(TRAFFIC_TYPES) }),
      rateField("conversionRate", "Ziyaretçi dönüşüm oranı", { visibleWhen: visibleIn(TRAFFIC_TYPES) }),
      numberField("itemsPerOrder", "Sipariş başı ürün adedi", 0.05, { visibleWhen: visibleIn([...TRAFFIC_TYPES, "instagram"]) }),
      numberField("monthlyLeads", "Aylık DM / talep", 10, { visibleWhen: { key: "businessType", equals: "instagram" } }),
      rateField("leadConversionRate", "Talep dönüşüm oranı", { visibleWhen: { key: "businessType", equals: "instagram" } }),
      numberField("productionUnitsPerDay", "Günlük üretim kapasitesi", 1, { visibleWhen: { key: "businessType", equals: "handmade" } }),
      numberField("productionDaysPerMonth", "Aylık üretim günü", 1, { visibleWhen: { key: "businessType", equals: "handmade" } }),
      rateField("productionUtilizationRate", "Üretim kapasitesi kullanımı", { visibleWhen: { key: "businessType", equals: "handmade" } }),
      numberField("activeSubscribers", "Aktif abone", 1, { visibleWhen: { key: "businessType", equals: "subscription_box" } }),
      numberField("monthlySubscriberAcquisition", "Aylık yeni abone", 1, { visibleWhen: { key: "businessType", equals: "subscription_box" } }),
      rateField("monthlyChurnRate", "Aylık abone kaybı", { visibleWhen: { key: "businessType", equals: "subscription_box" } }),
      numberField("monthlyOrderCapacity", "Aylık sipariş / üretim kapasitesi", 10),
    ],
  },
  {
    title: "2 · Satış kanalları", open: true,
    fields: [
      booleanField("advancedChannelMixEnabled", "Gelişmiş satış kanalı karmasını kullan", { full: true }),
      tableField("salesChannels", "Satış kanalları", [
        { type: "text", key: "name", label: "Kanal", defaultValue: "Yeni kanal" },
        { type: "rate", key: "orderShareRate", label: "Sipariş payı", defaultValue: 0 },
        { type: "number", key: "priceMultiplier", label: "Fiyat çarpanı", step: 0.05, defaultValue: 1 },
        { type: "rate", key: "commissionRate", label: "Kanal komisyonu", defaultValue: 0 },
        { type: "rate", key: "paymentRate", label: "Ödeme kesintisi", defaultValue: 0 },
        { type: "number", key: "shippingCostPerOrder", label: "Kargo", step: 1, defaultValue: 0 },
        { type: "number", key: "packagingCostPerOrder", label: "Paket", step: 1, defaultValue: 0 },
        { type: "number", key: "collectionDelayDays", label: "Tahsilat günü", step: 1, defaultValue: 0 },
        { type: "boolean", key: "isMarketplace", label: "Pazaryeri?", defaultValue: false },
      ], {
        visibleWhen: { key: "advancedChannelMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni kanal", orderShareRate: 0, priceMultiplier: 1, commissionRate: 0, paymentRate: 0, shippingCostPerOrder: 0, packagingCostPerOrder: 0, collectionDelayDays: 0, isMarketplace: false },
      }),
      rateField("marketplaceSalesShare", "Pazaryeri satış payı", { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      rateField("marketplaceCommissionRate", "Pazaryeri komisyonu", { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      rateField("cardPaymentShare", "Ödeme komisyonuna tabi satış payı", { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      rateField("paymentCommissionRate", "POS / ödeme komisyonu", { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
    ],
  },
  {
    title: "3 · Ürün karması, fiyat ve iade", open: true,
    fields: [
      numberField("productPrice", "Temel liste fiyatı (TL)", 10),
      rateField("averageDiscountRate", "Ortalama indirim oranı"),
      booleanField("advancedProductMixEnabled", "Gelişmiş ürün karmasını kullan", { full: true }),
      tableField("productMix", "Ürün / kategori karması", [
        { type: "text", key: "name", label: "Ürün", defaultValue: "Yeni ürün" },
        { type: "rate", key: "unitShareRate", label: "Adet payı", defaultValue: 0 },
        { type: "number", key: "priceMultiplier", label: "Fiyat çarpanı", step: 0.05, defaultValue: 1 },
        { type: "number", key: "unitCost", label: "Birim maliyet", step: 1, defaultValue: 0 },
        { type: "rate", key: "refundRate", label: "İade", defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedProductMixEnabled", equals: true }, minRows: 1, maxRows: 30,
        newRow: { name: "Yeni ürün", unitShareRate: 0, priceMultiplier: 1, unitCost: 0, refundRate: 0 },
      }),
      numberField("unitProductCost", "Ürün alış / üretim maliyeti (TL)", 1, { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("refundRate", "İade oranı", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      numberField("laborCostPerUnit", "Birim emek maliyeti (TL)", 1, { visibleWhen: { key: "businessType", equals: "handmade" } }),
    ],
  },
  {
    title: "4 · Vergi ve ilave kayıplar",
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("supplierQualityLossRate", "Tedarikçi kalite / hasar kaybı", { visibleWhen: { key: "businessType", equals: "dropshipping" } }),
      rateField("crossBorderCostRate", "Sınır ötesi ek maliyet oranı", { visibleWhen: { key: "businessType", equals: "amazon_global" } }),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net satış"),
    ],
  },
  {
    title: "5 · Lojistik ve stok", open: true,
    fields: [
      numberField("shippingCostPerOrder", "Gidiş kargo / sipariş (TL)", 1, { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      numberField("packagingCostPerOrder", "Paketleme / sipariş (TL)", 1, { visibleWhen: { key: "advancedChannelMixEnabled", equals: false } }),
      numberField("returnShippingCostPerOrder", "İade kargo / iade (TL)", 1),
      numberField("fulfillmentCostPerOrder", "Fulfillment / sipariş (TL)", 1),
      numberField("subscriptionFulfillmentCostPerBox", "Abonelik kutusu hazırlama / kutu (TL)", 1, { visibleWhen: { key: "businessType", equals: "subscription_box" } }),
      booleanField("inventoryTrackingEnabled", "Gelişmiş stok yeterliliğini izle", { full: true }),
      numberField("beginningInventoryUnits", "Mevcut stok adedi", 1, { visibleWhen: { key: "inventoryTrackingEnabled", equals: true } }),
      numberField("reorderLeadTimeDays", "Tedarik süresi (gün)", 1, { visibleWhen: { key: "inventoryTrackingEnabled", equals: true } }),
      numberField("safetyStockDays", "Güvenlik stoğu (gün)", 1, { visibleWhen: { key: "inventoryTrackingEnabled", equals: true } }),
      rateField("shrinkageRate", "Kayıp / stok fire oranı", { visibleWhen: { key: "inventoryTrackingEnabled", equals: true } }),
      rateField("deadStockRate", "Değersiz / yavaş stok oranı", { visibleWhen: { key: "inventoryTrackingEnabled", equals: true } }),
      numberField("stockCoverageMonths", "Hedef stok kapsamı (ay)", 0.1, { visibleWhen: { key: "inventoryTrackingEnabled", equals: true } }),
    ],
  },
  {
    title: "6 · Reklam ve edinme",
    fields: [
      booleanField("advancedAdMixEnabled", "Gelişmiş reklam kanalı tablosunu kullan", { full: true }),
      tableField("adChannels", "Reklam kanalları", [
        { type: "text", key: "name", label: "Kanal", defaultValue: "Yeni reklam" },
        { type: "number", key: "spend", label: "Harcama", step: 100, defaultValue: 0 },
        { type: "number", key: "attributedOrders", label: "Atfedilen sipariş", step: 1, defaultValue: 0 },
        { type: "number", key: "attributedRevenue", label: "Atfedilen ciro", step: 100, defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedAdMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni reklam", spend: 0, attributedOrders: 0, attributedRevenue: 0 },
      }),
      numberField("monthlyAdSpend", "Aylık reklam gideri (TL)", 1000, { visibleWhen: { key: "advancedAdMixEnabled", equals: false } }),
    ],
  },
  {
    title: "7 · Sabit giderler",
    fields: [
      numberField("rent", "Ofis / kira (TL)", 1000), numberField("warehouseCost", "Depo gideri (TL)", 1000),
      numberField("staffCost", "Personel toplam maliyeti (TL)", 1000), numberField("software", "Yazılım / abonelikler (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500), numberField("utilities", "Faturalar (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500), numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değil; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "8 · Kurulum, stok yatırımı ve amortisman",
    note: "İlk stok ve kurulum nakitte tek sefer düşülür. Amortisman P&L gideridir; nakitten ikinci kez düşülmez.",
    fields: [
      numberField("initialStockInvestment", "İlk stok yatırımı (TL)", 1000),
      numberField("storeSetup", "Mağaza / site kurulumu (TL)", 1000), numberField("equipment", "Ekipman (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000), numberField("legalFees", "Şirket / izin giderleri (TL)", 1000),
      numberField("launchMarketing", "Açılış reklamı (TL)", 1000), numberField("otherSetupCosts", "Diğer kurulum gideri (TL)", 1000),
      booleanField("depreciationEnabled", "Kurulum varlıklarına doğrusal amortisman uygula", { full: true }),
      numberField("depreciationYears", "Amortisman süresi (yıl)", 1, { visibleWhen: { key: "depreciationEnabled", equals: true } }),
    ],
  },
  {
    title: "9 · Paydaş ve vergi ön tahmini",
    fields: [
      rateField("partnerProfitShareRate", "Ortak / yatırımcı kâr payı"),
      rateField("estimatedTaxRate", "Vergi ön tahmin oranı", { hint: "Kesin vergi hesabı değildir." }),
      numberField("monthlyOperatingGrantIncome", "Aylık P&L hibe / destek geliri (TL)", 1000, { hint: "Finansmandan ayrıdır; kâr-zarar hesabına gelir olarak girer." }),
    ],
  },
  {
    title: "10 · Nakit akışı",
    fields: [
      numberField("startingCash", "Başlangıç nakdi (TL)", 1000),
      numberField("financingAmount", "Yatırım / finansman (TL)", 1000, { hint: "P&L geliri değildir." }),
      numberField("supportAmount", "Hibe / destek nakit girişi (TL)", 1000, { hint: "Ayrı gösterilir; vergi etkisi hesaplanmaz." }),
      numberField("setupPaymentMonth", "Kurulum ödeme ayı", 1),
      numberField("collectionDelayDays", "Varsayılan tahsilat vadesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Tedarikçi ödeme vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay satış gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık satış büyümesi", { allowNegative: true }),
    ],
  },
];

function normalizeChannel(item = {}) {
  return {
    name: String(item.name || "Kanal"), orderShareRate: clampRate(item.orderShareRate),
    priceMultiplier: nonNegative(item.priceMultiplier, 1), commissionRate: clampRate(item.commissionRate),
    paymentRate: clampRate(item.paymentRate), shippingCostPerOrder: nonNegative(item.shippingCostPerOrder),
    packagingCostPerOrder: nonNegative(item.packagingCostPerOrder), collectionDelayDays: nonNegative(item.collectionDelayDays),
    isMarketplace: Boolean(item.isMarketplace),
  };
}

function normalizeProduct(item = {}) {
  return {
    name: String(item.name || "Ürün"), unitShareRate: clampRate(item.unitShareRate),
    priceMultiplier: nonNegative(item.priceMultiplier, 1), unitCost: nonNegative(item.unitCost),
    refundRate: clampRate(item.refundRate),
  };
}

function normalizeAd(item = {}) {
  return {
    name: String(item.name || "Reklam"), spend: nonNegative(item.spend),
    attributedOrders: nonNegative(item.attributedOrders), attributedRevenue: nonNegative(item.attributedRevenue),
  };
}

export function normalizeEcommerceInputs(raw = {}) {
  let source = clone(raw);
  const requestedType = ECOMMERCE_BUSINESS_TYPES.some(([id]) => id === source.businessType)
    ? source.businessType : ECOMMERCE_DEFAULT_INPUTS.businessType;
  if (!source.profileTypeApplied) source.profileTypeApplied = requestedType;
  else if (source.profileTypeApplied !== requestedType) {
    const profile = getEcommerceBusinessProfile(requestedType);
    const preservedKeys = [
      "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
      "monthlyOperatingGrantIncome", "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays",
      "firstMonthSalesShare", "monthlyGrowthRate",
    ];
    const preserved = Object.fromEntries(preservedKeys.map((key) => [key, source[key] ?? ECOMMERCE_DEFAULT_INPUTS[key]]));
    source = { ...clone(ECOMMERCE_DEFAULT_INPUTS), ...clone(profile.defaults), ...preserved, businessType: requestedType, profileTypeApplied: requestedType };
  }
  const input = { ...clone(ECOMMERCE_DEFAULT_INPUTS), ...source };
  const rateKeys = [
    "averageDiscountRate", "marketplaceSalesShare", "cardPaymentShare", "vatRate", "refundRate",
    "marketplaceCommissionRate", "paymentCommissionRate", "otherVariableCostRate", "partnerProfitShareRate",
    "estimatedTaxRate", "firstMonthSalesShare", "conversionRate", "leadConversionRate",
    "productionUtilizationRate", "monthlyChurnRate", "shrinkageRate", "deadStockRate",
    "crossBorderCostRate", "supplierQualityLossRate",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(ECOMMERCE_DEFAULT_INPUTS).filter(
    (key) => typeof ECOMMERCE_DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key) && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.stockCoverageMonths = Math.min(12, nonNegative(input.stockCoverageMonths, 2));
  input.depreciationYears = Math.max(1, input.depreciationYears || 1);
  input.advancedChannelMixEnabled = Boolean(input.advancedChannelMixEnabled);
  input.advancedProductMixEnabled = Boolean(input.advancedProductMixEnabled);
  input.advancedAdMixEnabled = Boolean(input.advancedAdMixEnabled);
  input.inventoryTrackingEnabled = Boolean(input.inventoryTrackingEnabled);
  input.depreciationEnabled = Boolean(input.depreciationEnabled);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = ECOMMERCE_BUSINESS_TYPES.some(([id]) => id === input.businessType) ? input.businessType : ECOMMERCE_DEFAULT_INPUTS.businessType;
  input.profileTypeApplied = input.profileTypeApplied || input.businessType;
  input.salesChannels = (Array.isArray(raw.salesChannels) ? raw.salesChannels : input.salesChannels).map(normalizeChannel);
  input.productMix = (Array.isArray(raw.productMix) ? raw.productMix : input.productMix).map(normalizeProduct);
  input.adChannels = (Array.isArray(raw.adChannels) ? raw.adChannels : input.adChannels).map(normalizeAd);
  return input;
}

export function applyEcommerceBusinessType(currentInputs, businessType) {
  const profile = getEcommerceBusinessProfile(businessType);
  const preservedKeys = [
    "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
    "monthlyOperatingGrantIncome", "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays",
    "firstMonthSalesShare", "monthlyGrowthRate",
  ];
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, currentInputs?.[key] ?? ECOMMERCE_DEFAULT_INPUTS[key]]));
  return normalizeEcommerceInputs({
    ...clone(ECOMMERCE_DEFAULT_INPUTS), ...clone(profile.defaults), ...preserved,
    businessType, profileTypeApplied: businessType,
  });
}

export function applyEcommerceScenario(baseInputs, scenarioId) {
  const normalized = normalizeEcommerceInputs(baseInputs);
  const preset = ECOMMERCE_SCENARIOS[scenarioId] ?? ECOMMERCE_SCENARIOS.expected;
  let next = applyEcommerceProfileDemandScenario(normalized, scenarioId);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = normalized[key] * multiplier;
  if (next.advancedProductMixEnabled && scenarioId !== "expected") {
    const costMultiplier = scenarioId === "pessimistic" ? 1.10 : 0.96;
    const refundMultiplier = scenarioId === "pessimistic" ? 1.20 : 0.80;
    next.productMix = next.productMix.map((item) => ({
      ...item, unitCost: item.unitCost * costMultiplier, refundRate: item.refundRate * refundMultiplier,
    }));
  }
  if (next.advancedAdMixEnabled && scenarioId !== "expected") {
    const spendMultiplier = scenarioId === "pessimistic" ? 1.08 : 1.15;
    next.adChannels = next.adChannels.map((item) => ({ ...item, spend: item.spend * spendMultiplier }));
  }
  return normalizeEcommerceInputs(next);
}

export { ECOMMERCE_BUSINESS_PROFILES };
