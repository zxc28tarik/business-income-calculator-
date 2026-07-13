import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const BEAUTY_BUSINESS_TYPES = [
  ["hair_salon", "Kuaför"],
  ["barber", "Berber"],
  ["beauty_salon", "Güzellik salonu"],
  ["nail_studio", "Tırnak stüdyosu"],
  ["skin_care", "Cilt bakım salonu"],
  ["laser_epilation", "Lazer / epilasyon merkezi"],
  ["brow_lash", "Kaş / kirpik stüdyosu"],
  ["massage_spa", "Masaj / spa salonu"],
];

export const BEAUTY_DEFAULT_INPUTS = {
  businessType: "beauty_salon",
  servicePrice: 1400,
  sessionDurationMinutes: 60,
  stations: 4,
  workingHoursPerDay: 9,
  openDays: 26,
  occupancyRate: 0.68,
  noShowRate: 0.08,
  cardPaymentShare: 0.85,
  taxType: "included",
  vatRate: 0.20,
  paymentCommissionRate: 0.025,
  consumableCostPerSession: 135,
  employeeCommissionRate: 0.08,
  otherVariableCostRate: 0.01,
  staffCount: 5,
  staffCost: 260000,
  rent: 110000,
  utilities: 30000,
  accounting: 9000,
  software: 6000,
  monthlyAdSpend: 35000,
  maintenance: 12000,
  insurance: 5000,
  otherFixedExpenses: 10000,
  loanPayment: 0,
  renovation: 450000,
  deviceInvestment: 900000,
  deviceUsefulLifeMonths: 60,
  furniture: 220000,
  deposit: 220000,
  licenseFees: 60000,
  openingMarketing: 70000,
  initialConsumables: 80000,
  softwareSetup: 20000,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 2400000,
  financingAmount: 0,
  supportAmount: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 2,
  supplierPaymentDelayDays: 15,
  firstMonthSalesShare: 0.65,
  monthlyGrowthRate: 0.03,
};

export const BEAUTY_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      servicePrice: 0.95,
      occupancyRate: 0.68,
      noShowRate: 1.55,
      consumableCostPerSession: 1.12,
      employeeCommissionRate: 1.08,
      utilities: 1.10,
      monthlyAdSpend: 1.08,
      firstMonthSalesShare: 0.80,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      servicePrice: 1.06,
      occupancyRate: 1.28,
      noShowRate: 0.62,
      consumableCostPerSession: 0.96,
      employeeCommissionRate: 0.96,
      monthlyAdSpend: 1.12,
      firstMonthSalesShare: 1.18,
    },
  },
};

export const BEAUTY_FORM_SECTIONS = [
  {
    title: "1 · Salon ve randevu kapasitesi", open: true,
    fields: [
      selectField("businessType", "İş türü", BEAUTY_BUSINESS_TYPES),
      numberField("servicePrice", "Ortalama hizmet / seans fiyatı (TL)", 10),
      numberField("sessionDurationMinutes", "Ortalama seans süresi (dakika)", 5),
      numberField("stations", "Koltuk / oda / cihaz istasyonu", 1),
      numberField("workingHoursPerDay", "Günlük çalışma süresi (saat)", 0.5),
      numberField("openDays", "Açık gün / ay", 1),
      rateField("occupancyRate", "Randevu doluluk oranı"),
      rateField("noShowRate", "İptal / no-show oranı"),
    ],
  },
  {
    title: "2 · Vergi ve ödeme kesintileri", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("cardPaymentShare", "Kartlı ödeme payı"),
      rateField("paymentCommissionRate", "POS / ödeme komisyonu"),
    ],
  },
  {
    title: "3 · Seans ve personel değişken maliyetleri", open: true,
    fields: [
      numberField("consumableCostPerSession", "Sarf malzeme / tamamlanan seans (TL)", 1),
      rateField("employeeCommissionRate", "Çalışan primi / gerçekleşen net hizmet geliri"),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net hizmet geliri"),
      numberField("staffCount", "Aktif çalışan sayısı", 1),
    ],
  },
  {
    title: "4 · Sabit giderler",
    fields: [
      numberField("staffCost", "Personel toplam sabit maliyeti (TL)", 1000),
      numberField("rent", "Kira (TL)", 1000),
      numberField("utilities", "Faturalar (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("software", "Randevu / yazılım (TL)", 500),
      numberField("monthlyAdSpend", "Aylık reklam gideri (TL)", 1000),
      numberField("maintenance", "Bakım / servis (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değildir; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "5 · Cihaz, amortisman ve kurulum",
    note: "Cihaz yatırımı kurulumda nakitten bir kez düşer. Aylık amortisman P&L gideridir ancak nakit çıkışı değildir; iki kez nakit düşülmez.",
    fields: [
      numberField("renovation", "Tadilat (TL)", 1000),
      numberField("deviceInvestment", "Cihaz / ekipman yatırımı (TL)", 1000),
      numberField("deviceUsefulLifeMonths", "Cihaz amortisman süresi (ay)", 1),
      numberField("furniture", "Mobilya / dekorasyon (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("licenseFees", "Ruhsat / izin giderleri (TL)", 1000),
      numberField("openingMarketing", "Açılış reklamı (TL)", 1000),
      numberField("initialConsumables", "İlk sarf stoku (TL)", 1000),
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
      numberField("collectionDelayDays", "Tahsilat gecikmesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Sarf tedarikçi vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay randevu gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık doluluk büyümesi", { allowNegative: true }),
    ],
  },
];

export function normalizeBeautyInputs(raw = {}) {
  const input = { ...BEAUTY_DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "occupancyRate", "noShowRate", "cardPaymentShare", "vatRate", "paymentCommissionRate",
    "employeeCommissionRate", "otherVariableCostRate", "partnerProfitShareRate",
    "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(BEAUTY_DEFAULT_INPUTS).filter(
    (key) => typeof BEAUTY_DEFAULT_INPUTS[key] === "number"
      && !rateKeys.includes(key)
      && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.stations = clampInteger(input.stations, 1, 100, 1);
  input.staffCount = clampInteger(input.staffCount, 1, 500, 1);
  input.openDays = clampInteger(input.openDays, 1, 31, 26);
  input.sessionDurationMinutes = Math.max(5, nonNegative(input.sessionDurationMinutes, 60));
  input.workingHoursPerDay = Math.min(24, Math.max(0.5, nonNegative(input.workingHoursPerDay, 9)));
  input.deviceUsefulLifeMonths = clampInteger(input.deviceUsefulLifeMonths, 1, 360, 60);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = BEAUTY_BUSINESS_TYPES.some(([id]) => id === input.businessType)
    ? input.businessType
    : BEAUTY_DEFAULT_INPUTS.businessType;
  return input;
}

export function applyBeautyScenario(baseInputs, scenarioId) {
  const normalized = normalizeBeautyInputs(baseInputs);
  const preset = BEAUTY_SCENARIOS[scenarioId] ?? BEAUTY_SCENARIOS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) {
    next[key] = normalized[key] * multiplier;
  }
  return normalizeBeautyInputs(next);
}
