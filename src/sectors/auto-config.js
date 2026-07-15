import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const AUTO_SERVICE_BUSINESS_TYPES = [
  ["car_wash", "Oto yıkama"],
  ["auto_detailing", "Oto kuaför"],
  ["deep_cleaning", "Detaylı temizlik"],
  ["tire_shop", "Lastikçi"],
  ["window_film_wrap", "Cam filmi / kaplama"],
  ["small_repair_shop", "Küçük servis"],
];

export const AUTO_SERVICE_PACKAGE_TYPES = [
  ["basic", "Temel paket"],
  ["standard", "Standart paket"],
  ["premium", "Premium paket"],
  ["mixed", "Karışık hizmet ortalaması"],
];

export const AUTO_SERVICE_DEFAULT_INPUTS = {
  businessType: "car_wash",
  packageType: "mixed",
  dailyVehicles: 34,
  averageServicePrice: 850,
  averagePartsRevenuePerVehicle: 0,
  openDays: 27,
  serviceStations: 4,
  workingHoursPerDay: 10,
  averageServiceDurationMinutes: 55,
  taxType: "included",
  vatRate: 0.20,
  cardSalesShare: 0.82,
  posCommissionRate: 0.025,
  consumableCostPerVehicle: 115,
  waterElectricityCostPerVehicle: 55,
  partsCostRate: 0.62,
  otherVariableCostRate: 0.01,
  staffCost: 250000,
  rent: 120000,
  baseUtilities: 22000,
  accounting: 9000,
  software: 4500,
  monthlyMarketing: 25000,
  maintenance: 18000,
  insurance: 7500,
  wasteDisposal: 6500,
  otherFixedExpenses: 9000,
  loanPayment: 0,
  renovation: 280000,
  equipmentInvestment: 950000,
  equipmentUsefulLifeMonths: 60,
  deposit: 240000,
  licenseFees: 45000,
  openingMarketing: 55000,
  signage: 40000,
  initialConsumables: 90000,
  softwareSetup: 12000,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 2200000,
  financingAmount: 0,
  supportAmount: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 2,
  supplierPaymentDelayDays: 20,
  firstMonthSalesShare: 0.65,
  monthlyGrowthRate: 0.025,
};

export const AUTO_SERVICE_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      dailyVehicles: 0.72,
      averageServicePrice: 0.94,
      averagePartsRevenuePerVehicle: 0.90,
      consumableCostPerVehicle: 1.12,
      waterElectricityCostPerVehicle: 1.15,
      partsCostRate: 1.08,
      monthlyMarketing: 1.08,
      firstMonthSalesShare: 0.80,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      dailyVehicles: 1.22,
      averageServicePrice: 1.06,
      averagePartsRevenuePerVehicle: 1.08,
      consumableCostPerVehicle: 0.96,
      waterElectricityCostPerVehicle: 0.95,
      partsCostRate: 0.96,
      monthlyMarketing: 1.12,
      firstMonthSalesShare: 1.18,
    },
  },
};

export const AUTO_SERVICE_FORM_SECTIONS = [
  {
    title: "1 · İşletme, paket ve kapasite", open: true,
    fields: [
      selectField("businessType", "İş türü", AUTO_SERVICE_BUSINESS_TYPES),
      selectField("packageType", "Paket / hizmet karması", AUTO_SERVICE_PACKAGE_TYPES),
      numberField("dailyVehicles", "Günlük araç sayısı", 1),
      numberField("averageServicePrice", "Ortalama hizmet fiyatı (TL)", 10),
      numberField("averagePartsRevenuePerVehicle", "Araç başı ortalama parça / ürün geliri (TL)", 10, { hint: "Lastik, parça, film veya bakım ürünü satışı yoksa 0 bırakın." }),
      numberField("openDays", "Açık gün / ay", 1),
      numberField("serviceStations", "Yıkama alanı / lift / hizmet istasyonu", 1),
      numberField("workingHoursPerDay", "Günlük çalışma süresi (saat)", 0.5),
      numberField("averageServiceDurationMinutes", "Araç başı ortalama hizmet süresi (dakika)", 5),
    ],
  },
  {
    title: "2 · Vergi ve ödeme kesintileri", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("cardSalesShare", "Kartlı satış payı"),
      rateField("posCommissionRate", "POS / ödeme komisyonu"),
    ],
  },
  {
    title: "3 · Araç başı değişken maliyetler", open: true,
    fields: [
      numberField("consumableCostPerVehicle", "Sarf malzeme / araç (TL)", 1),
      numberField("waterElectricityCostPerVehicle", "Su ve elektrik / araç (TL)", 1),
      rateField("partsCostRate", "Parça / ürün maliyeti oranı", { hint: "Yalnız parça/ürün gelirine uygulanır." }),
      rateField("otherVariableCostRate", "Diğer değişken gider / KDV sonrası gelir"),
    ],
  },
  {
    title: "4 · Sabit giderler",
    fields: [
      numberField("staffCost", "Personel toplam maliyeti (TL)", 1000),
      numberField("rent", "Kira (TL)", 1000),
      numberField("baseUtilities", "Sabit faturalar / abonelikler (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("software", "Randevu / servis yazılımı (TL)", 500),
      numberField("monthlyMarketing", "Aylık reklam (TL)", 1000),
      numberField("maintenance", "Ekipman bakım / servis (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("wasteDisposal", "Atık / çevre gideri (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değildir; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "5 · Ekipman, amortisman ve kurulum",
    note: "Ekipman yatırımı kurulumda nakitten bir kez düşer. Aylık amortisman P&L gideridir ancak nakit akışından ikinci kez düşülmez.",
    fields: [
      numberField("renovation", "Tadilat / altyapı (TL)", 1000),
      numberField("equipmentInvestment", "Makine / lift / ekipman yatırımı (TL)", 1000),
      numberField("equipmentUsefulLifeMonths", "Ekipman amortisman süresi (ay)", 1),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("licenseFees", "Ruhsat / izin giderleri (TL)", 1000),
      numberField("openingMarketing", "Açılış reklamı (TL)", 1000),
      numberField("signage", "Tabela (TL)", 1000),
      numberField("initialConsumables", "İlk sarf / parça stoku (TL)", 1000),
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
      numberField("supplierPaymentDelayDays", "Sarf / parça tedarikçi vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay araç gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık araç büyümesi", { allowNegative: true }),
    ],
  },
];

export function normalizeAutoServiceInputs(raw = {}) {
  const input = { ...AUTO_SERVICE_DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "vatRate", "cardSalesShare", "posCommissionRate", "partsCostRate", "otherVariableCostRate",
    "partnerProfitShareRate", "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(AUTO_SERVICE_DEFAULT_INPUTS).filter(
    (key) => typeof AUTO_SERVICE_DEFAULT_INPUTS[key] === "number"
      && !rateKeys.includes(key)
      && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.dailyVehicles = Math.min(100000, nonNegative(input.dailyVehicles));
  input.openDays = clampInteger(input.openDays, 1, 31, 27);
  input.serviceStations = clampInteger(input.serviceStations, 1, 200, 1);
  input.workingHoursPerDay = Math.min(24, Math.max(0.5, nonNegative(input.workingHoursPerDay, 10)));
  input.averageServiceDurationMinutes = Math.max(5, nonNegative(input.averageServiceDurationMinutes, 55));
  input.averageServicePrice = Math.max(0.01, nonNegative(input.averageServicePrice, 850));
  input.equipmentUsefulLifeMonths = clampInteger(input.equipmentUsefulLifeMonths, 1, 360, 60);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.collectionDelayDays = Math.min(30, nonNegative(input.collectionDelayDays));
  input.supplierPaymentDelayDays = Math.min(30, nonNegative(input.supplierPaymentDelayDays));
  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = AUTO_SERVICE_BUSINESS_TYPES.some(([id]) => id === input.businessType)
    ? input.businessType
    : AUTO_SERVICE_DEFAULT_INPUTS.businessType;
  input.packageType = AUTO_SERVICE_PACKAGE_TYPES.some(([id]) => id === input.packageType)
    ? input.packageType
    : AUTO_SERVICE_DEFAULT_INPUTS.packageType;
  return input;
}

export function applyAutoServiceScenario(baseInputs, scenarioId) {
  const normalized = normalizeAutoServiceInputs(baseInputs);
  const preset = AUTO_SERVICE_SCENARIOS[scenarioId] ?? AUTO_SERVICE_SCENARIOS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = normalized[key] * multiplier;
  return normalizeAutoServiceInputs(next);
}
