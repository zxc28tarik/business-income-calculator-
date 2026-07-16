import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const ECOMMERCE_BUSINESS_TYPES = [
  ["trendyol", "Trendyol mağazası"],
  ["hepsiburada", "Hepsiburada mağazası"],
  ["amazon_tr", "Amazon Türkiye"],
  ["amazon_global", "Amazon global"],
  ["shopify", "Shopify mağazası"],
  ["stock_ecommerce", "Stoklu e-ticaret"],
  ["dropshipping", "Dropshipping"],
  ["instagram", "Instagram satış"],
  ["handmade", "El yapımı ürün satışı"],
  ["subscription_box", "Abonelik kutusu"],
];

export const ECOMMERCE_DEFAULT_INPUTS = {
  businessType: "trendyol",
  unitsSold: 800,
  productPrice: 650,
  averageDiscountRate: 0.08,
  marketplaceSalesShare: 0.85,
  cardPaymentShare: 1,
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
      unitsSold: 0.65,
      productPrice: 0.95,
      averageDiscountRate: 1.30,
      refundRate: 1.45,
      marketplaceCommissionRate: 1.08,
      shippingCostPerOrder: 1.12,
      monthlyAdSpend: 1.08,
      firstMonthSalesShare: 0.80,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      unitsSold: 1.35,
      productPrice: 1.03,
      averageDiscountRate: 0.75,
      refundRate: 0.70,
      marketplaceCommissionRate: 0.96,
      shippingCostPerOrder: 0.94,
      monthlyAdSpend: 1.15,
      firstMonthSalesShare: 1.20,
    },
  },
};

export const ECOMMERCE_FORM_SECTIONS = [
  {
    title: "1 · Mağaza ve satış varsayımları", open: true,
    fields: [
      selectField("businessType", "İş türü", ECOMMERCE_BUSINESS_TYPES),
      numberField("unitsSold", "Aylık satış adedi", 1),
      numberField("productPrice", "Liste satış fiyatı (TL)", 10),
      rateField("averageDiscountRate", "Ortalama indirim oranı"),
      rateField("marketplaceSalesShare", "Pazaryeri satış payı"),
      rateField("cardPaymentShare", "Ödeme komisyonuna tabi satış payı"),
    ],
  },
  {
    title: "2 · Vergi, iade ve komisyonlar", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("refundRate", "İade oranı"),
      rateField("marketplaceCommissionRate", "Pazaryeri komisyonu"),
      rateField("paymentCommissionRate", "POS / ödeme komisyonu"),
    ],
  },
  {
    title: "3 · Ürün ve sipariş maliyetleri", open: true,
    fields: [
      numberField("unitProductCost", "Ürün alış / üretim maliyeti (TL)", 1),
      numberField("shippingCostPerOrder", "Gidiş kargo / sipariş (TL)", 1),
      numberField("packagingCostPerOrder", "Paketleme / sipariş (TL)", 1),
      numberField("returnShippingCostPerOrder", "İade kargo / iade (TL)", 1),
      numberField("fulfillmentCostPerOrder", "Fulfillment / sipariş (TL)", 1),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net satış"),
    ],
  },
  {
    title: "4 · Reklam ve sabit giderler",
    fields: [
      numberField("monthlyAdSpend", "Aylık reklam gideri (TL)", 1000),
      numberField("rent", "Ofis / kira (TL)", 1000),
      numberField("warehouseCost", "Depo gideri (TL)", 1000),
      numberField("staffCost", "Personel toplam maliyeti (TL)", 1000),
      numberField("software", "Yazılım / abonelikler (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("utilities", "Faturalar (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değil; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "5 · Stok ve kurulum maliyetleri",
    note: "İlk stok yatırımı nakitten tek sefer düşülür; satılan ürün maliyeti P&L'de ayrıca hesaplanır. Bu iki kalem aynı gider değildir.",
    fields: [
      numberField("initialStockInvestment", "İlk stok yatırımı (TL)", 1000),
      numberField("stockCoverageMonths", "Hedef stok kapsamı (ay)", 0.1),
      numberField("storeSetup", "Mağaza / site kurulumu (TL)", 1000),
      numberField("equipment", "Ekipman (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("legalFees", "Şirket / izin giderleri (TL)", 1000),
      numberField("launchMarketing", "Açılış reklamı (TL)", 1000),
      numberField("otherSetupCosts", "Diğer kurulum gideri (TL)", 1000),
    ],
  },
  {
    title: "6 · Paydaş ve vergi varsayımı",
    fields: [
      rateField("partnerProfitShareRate", "Ortak / yatırımcı kâr payı"),
      rateField("estimatedTaxRate", "Vergi ön tahmin oranı", { hint: "Kesin vergi hesabı değildir." }),
    ],
  },
  {
    title: "7 · Nakit akışı",
    fields: [
      numberField("startingCash", "Başlangıç nakdi (TL)", 1000),
      numberField("financingAmount", "Yatırım / finansman (TL)", 1000, { hint: "P&L geliri değildir." }),
      numberField("supportAmount", "Hibe / destek nakit girişi (TL)", 1000, { hint: "Ayrı gösterilir; vergi etkisi hesaplanmaz." }),
      numberField("setupPaymentMonth", "Kurulum ödeme ayı", 1),
      numberField("collectionDelayDays", "Pazaryeri tahsilat vadesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Tedarikçi ödeme vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay satış gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık satış büyümesi", { allowNegative: true }),
    ],
  },
];

export function normalizeEcommerceInputs(raw = {}) {
  const input = { ...ECOMMERCE_DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "averageDiscountRate", "marketplaceSalesShare", "cardPaymentShare", "vatRate", "refundRate",
    "marketplaceCommissionRate", "paymentCommissionRate", "otherVariableCostRate",
    "partnerProfitShareRate", "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(ECOMMERCE_DEFAULT_INPUTS).filter(
    (key) => typeof ECOMMERCE_DEFAULT_INPUTS[key] === "number"
      && !rateKeys.includes(key)
      && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.stockCoverageMonths = Math.min(12, nonNegative(input.stockCoverageMonths, 2));
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = ECOMMERCE_BUSINESS_TYPES.some(([id]) => id === input.businessType)
    ? input.businessType
    : ECOMMERCE_DEFAULT_INPUTS.businessType;
  return input;
}

export function applyEcommerceScenario(baseInputs, scenarioId) {
  const normalized = normalizeEcommerceInputs(baseInputs);
  const preset = ECOMMERCE_SCENARIOS[scenarioId] ?? ECOMMERCE_SCENARIOS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) {
    next[key] = normalized[key] * multiplier;
  }
  return normalizeEcommerceInputs(next);
}
