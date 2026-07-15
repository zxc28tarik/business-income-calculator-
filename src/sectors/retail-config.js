import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const RETAIL_BUSINESS_TYPES = [
  ["boutique", "Butik mağaza"],
  ["pet_shop", "Pet shop"],
  ["phone_accessories", "Telefon aksesuar mağazası"],
  ["stationery", "Kırtasiye"],
  ["toy_store", "Oyuncak mağazası"],
  ["florist", "Çiçekçi"],
  ["mini_market", "Küçük market"],
];

export const RETAIL_DEFAULT_INPUTS = {
  businessType: "boutique",
  dailyCustomers: 55,
  averageBasket: 650,
  openDays: 26,
  averageUnitSalePrice: 325,
  averageUnitCost: 145,
  returnRate: 0.035,
  inventoryLossRate: 0.018,
  cardSalesShare: 0.85,
  taxType: "included",
  vatRate: 0.20,
  posCommissionRate: 0.025,
  shoppingBagCostPerCustomer: 6,
  otherVariableCostRate: 0.01,
  rent: 110000,
  staffCost: 180000,
  utilities: 22000,
  accounting: 8000,
  software: 4000,
  security: 10000,
  monthlyMarketing: 25000,
  insurance: 5000,
  maintenance: 6000,
  otherFixedExpenses: 8000,
  loanPayment: 0,
  renovation: 250000,
  shelvingEquipment: 180000,
  posSystem: 30000,
  deposit: 220000,
  initialStockInvestment: 850000,
  licenseFees: 30000,
  openingMarketing: 50000,
  signage: 35000,
  softwareSetup: 10000,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 1800000,
  financingAmount: 0,
  supportAmount: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 2,
  supplierPaymentDelayDays: 30,
  firstMonthSalesShare: 0.65,
  monthlyGrowthRate: 0.025,
};

export const RETAIL_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      dailyCustomers: 0.72,
      averageBasket: 0.92,
      averageUnitCost: 1.10,
      returnRate: 1.55,
      inventoryLossRate: 1.45,
      monthlyMarketing: 1.08,
      firstMonthSalesShare: 0.80,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      dailyCustomers: 1.24,
      averageBasket: 1.07,
      averageUnitCost: 0.96,
      returnRate: 0.68,
      inventoryLossRate: 0.70,
      monthlyMarketing: 1.12,
      firstMonthSalesShare: 1.18,
    },
  },
};

export const RETAIL_FORM_SECTIONS = [
  {
    title: "1 · Mağaza ve satış varsayımları", open: true,
    fields: [
      selectField("businessType", "İş türü", RETAIL_BUSINESS_TYPES),
      numberField("dailyCustomers", "Günlük müşteri", 1),
      numberField("averageBasket", "Ortalama sepet (TL)", 10),
      numberField("openDays", "Açık gün / ay", 1),
      numberField("averageUnitSalePrice", "Ortalama ürün satış fiyatı (TL)", 1),
      numberField("averageUnitCost", "Ortalama ürün maliyeti (TL)", 1),
    ],
  },
  {
    title: "2 · Vergi, ödeme ve satış kayıpları", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("cardSalesShare", "Kartlı satış payı"),
      rateField("posCommissionRate", "POS / ödeme komisyonu"),
      rateField("returnRate", "İade oranı"),
      rateField("inventoryLossRate", "Fire / kayıp oranı", { hint: "Ürün maliyeti üzerinden stok kayıp maliyeti." }),
    ],
  },
  {
    title: "3 · Değişken mağaza giderleri", open: true,
    fields: [
      numberField("shoppingBagCostPerCustomer", "Poşet / ambalaj gideri, müşteri başı (TL)", 1),
      rateField("otherVariableCostRate", "Diğer değişken gider / net satış"),
    ],
  },
  {
    title: "4 · Sabit giderler",
    fields: [
      numberField("rent", "Kira (TL)", 1000),
      numberField("staffCost", "Personel toplam maliyeti (TL)", 1000),
      numberField("utilities", "Faturalar (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("software", "POS / stok yazılımı (TL)", 500),
      numberField("security", "Güvenlik (TL)", 500),
      numberField("monthlyMarketing", "Aylık reklam / kampanya (TL)", 1000),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("maintenance", "Bakım / küçük onarım (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değildir; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "5 · İlk stok ve mağaza kurulumu",
    note: "İlk stok yatırımı kurulumda nakitten bir kez düşer. Satılan ürün maliyeti aylık kâr-zarar hesabında ayrıca hesaplanır.",
    fields: [
      numberField("renovation", "Tadilat (TL)", 1000),
      numberField("shelvingEquipment", "Raf / mağaza ekipmanı (TL)", 1000),
      numberField("posSystem", "Kasa / POS sistemi (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("initialStockInvestment", "İlk stok yatırımı (TL)", 1000),
      numberField("licenseFees", "Ruhsat / izin giderleri (TL)", 1000),
      numberField("openingMarketing", "Açılış reklamı (TL)", 1000),
      numberField("signage", "Tabela / vitrin (TL)", 1000),
      numberField("softwareSetup", "Yazılım kurulumu (TL)", 1000),
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
      numberField("collectionDelayDays", "POS tahsilat gecikmesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Tedarikçi vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay satış gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık müşteri büyümesi", { allowNegative: true }),
    ],
  },
];

export function normalizeRetailInputs(raw = {}) {
  const input = { ...RETAIL_DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "returnRate", "inventoryLossRate", "cardSalesShare", "vatRate", "posCommissionRate",
    "otherVariableCostRate", "partnerProfitShareRate", "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(RETAIL_DEFAULT_INPUTS).filter(
    (key) => typeof RETAIL_DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key) && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.dailyCustomers = Math.min(100000, nonNegative(input.dailyCustomers));
  input.openDays = clampInteger(input.openDays, 1, 31, 26);
  input.averageBasket = Math.max(0.01, nonNegative(input.averageBasket, 650));
  input.averageUnitSalePrice = Math.max(0.01, nonNegative(input.averageUnitSalePrice, 325));
  input.averageUnitCost = nonNegative(input.averageUnitCost);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.collectionDelayDays = Math.min(30, nonNegative(input.collectionDelayDays));
  input.supplierPaymentDelayDays = Math.min(30, nonNegative(input.supplierPaymentDelayDays));
  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = RETAIL_BUSINESS_TYPES.some(([id]) => id === input.businessType)
    ? input.businessType
    : RETAIL_DEFAULT_INPUTS.businessType;
  return input;
}

export function applyRetailScenario(baseInputs, scenarioId) {
  const normalized = normalizeRetailInputs(baseInputs);
  const preset = RETAIL_SCENARIOS[scenarioId] ?? RETAIL_SCENARIOS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = normalized[key] * multiplier;
  return normalizeRetailInputs(next);
}
