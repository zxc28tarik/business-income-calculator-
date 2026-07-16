import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const BUSINESS_TYPES = [
  ["cafe", "Kafe"],
  ["restaurant", "Restoran"],
  ["coffee_shop", "Kahveci"],
  ["coffee_kiosk", "Kahve kiosk"],
  ["pastry_shop", "Tatlıcı / pastane"],
  ["burger_shop", "Burgerci"],
  ["doner_shop", "Dönerci"],
  ["buffet", "Tostçu / büfe"],
  ["dark_kitchen", "Dark kitchen"],
  ["food_truck", "Food truck"],
  ["franchise_restaurant", "Franchise restoran"],
];

export const DEFAULT_INPUTS = {
  businessType: "cafe",
  dailyCustomers: 120,
  averageTicket: 240,
  openDays: 30,
  serviceCapacity: 180,
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
  setupPaymentMonth: 1,
  collectionDelayDays: 2,
  supplierPaymentDelayDays: 0,
  firstMonthSalesShare: 0.75,
  monthlyGrowthRate: 0.02,
};

export const SCENARIO_PRESETS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      dailyCustomers: 0.72,
      averageTicket: 0.94,
      materialCostRate: 1.12,
      wasteRate: 1.25,
      utilities: 1.10,
      firstMonthSalesShare: 0.80,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      dailyCustomers: 1.28,
      averageTicket: 1.06,
      materialCostRate: 0.94,
      wasteRate: 0.80,
      utilities: 1.05,
      firstMonthSalesShare: 1.15,
    },
  },
};

export const CAFE_FORM_SECTIONS = [
  {
    title: "1 · İşletme ve satış varsayımları", open: true,
    fields: [
      selectField("businessType", "İş türü", BUSINESS_TYPES),
      numberField("dailyCustomers", "Günlük müşteri", 1),
      numberField("averageTicket", "Ortalama fiş (TL)", 10),
      numberField("openDays", "Açık gün / ay", 1),
      numberField("serviceCapacity", "Günlük servis kapasitesi", 1),
      rateField("deliverySalesShare", "Paket servis satış payı"),
      rateField("cardSalesShare", "Kartlı satış payı"),
      rateField("lostSalesRate", "İptal / gerçekleşmeyen satış"),
    ],
  },
  {
    title: "2 · Vergi ve komisyonlar", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("deliveryCommissionRate", "Paket servis komisyonu"),
      rateField("posCommissionRate", "POS komisyonu"),
    ],
  },
  {
    title: "3 · Değişken maliyetler", open: true,
    fields: [
      rateField("materialCostRate", "Malzeme maliyeti / net satış"),
      rateField("wasteRate", "Fire / malzeme maliyeti"),
      numberField("packagingCostPerDeliveryOrder", "Paketleme / teslimat siparişi (TL)", 1),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net satış"),
    ],
  },
  {
    title: "4 · Sabit giderler",
    fields: [
      numberField("rent", "Kira (TL)", 1000),
      numberField("staffCost", "Personel toplam maliyeti (TL)", 1000),
      numberField("utilities", "Faturalar (TL)", 1000),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("software", "Yazılım / abonelikler (TL)", 500),
      numberField("cleaning", "Temizlik (TL)", 500),
      numberField("maintenance", "Bakım (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değil; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "5 · Kurulum maliyetleri",
    note: "Kurulum kalemleri nakit akışında tek sefer düşülür. Amortisman ve vergi etkisi bu prototipte hesaplanmaz.",
    fields: [
      numberField("renovation", "Tadilat (TL)", 1000),
      numberField("equipment", "Ekipman (TL)", 1000),
      numberField("furniture", "Mobilya (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("initialStock", "İlk stok (TL)", 1000),
      numberField("licenseFees", "Ruhsat / izin (TL)", 1000),
      numberField("openingMarketing", "Açılış reklamı (TL)", 1000),
      numberField("softwareSetup", "Yazılım kurulumu (TL)", 1000),
    ],
  },
  {
    title: "6 · Paydaş ve vergi varsayımı",
    fields: [
      rateField("franchiseRoyaltyRate", "Franchise / lisans payı"),
      selectField("franchiseRoyaltyBasis", "Paylaşım tabanı", [
        ["gross_revenue", "Brüt ciro"],
        ["net_revenue_after_commission", "Komisyon sonrası net gelir"],
        ["contribution_after_variable_cost", "Değişken maliyet sonrası katkı"],
        ["pre_tax_profit", "Sabit gider sonrası kâr"],
      ]),
      rateField("partnerProfitShareRate", "Ortak kâr payı"),
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
      numberField("collectionDelayDays", "Tahsilat gecikmesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Tedarikçi ödeme vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay satış gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık müşteri büyümesi", { allowNegative: true }),
    ],
  },
];

export function normalizeCafeInputs(raw = {}) {
  const input = { ...DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "deliverySalesShare", "cardSalesShare", "lostSalesRate", "vatRate",
    "deliveryCommissionRate", "posCommissionRate", "materialCostRate", "wasteRate",
    "otherVariableCostRate", "franchiseRoyaltyRate", "partnerProfitShareRate",
    "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(DEFAULT_INPUTS).filter(
    (key) => typeof DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key) && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.openDays = Math.min(31, input.openDays);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = BUSINESS_TYPES.some(([id]) => id === input.businessType) ? input.businessType : DEFAULT_INPUTS.businessType;
  input.franchiseRoyaltyBasis = ["gross_revenue", "net_revenue_after_commission", "contribution_after_variable_cost", "pre_tax_profit"].includes(input.franchiseRoyaltyBasis)
    ? input.franchiseRoyaltyBasis
    : DEFAULT_INPUTS.franchiseRoyaltyBasis;
  return input;
}

export function applyScenario(baseInputs, scenarioId) {
  const normalized = normalizeCafeInputs(baseInputs);
  const preset = SCENARIO_PRESETS[scenarioId] ?? SCENARIO_PRESETS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) {
    next[key] = normalized[key] * multiplier;
  }
  return normalizeCafeInputs(next);
}
