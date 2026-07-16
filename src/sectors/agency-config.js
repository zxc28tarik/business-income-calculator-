import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const AGENCY_BUSINESS_TYPES = [
  ["software_agency", "Yazılım ajansı"],
  ["social_media_agency", "Sosyal medya ajansı"],
  ["advertising_agency", "Reklam ajansı"],
  ["design_agency", "Tasarım ajansı"],
  ["consulting_company", "Danışmanlık şirketi"],
  ["freelance_developer", "Freelancer yazılımcı"],
  ["freelance_designer", "Freelancer tasarımcı"],
  ["video_editing", "Video / editing hizmeti"],
  ["seo_agency", "SEO ajansı"],
  ["performance_marketing", "Performans reklam ajansı"],
];

export const AGENCY_DEFAULT_INPUTS = {
  businessType: "software_agency",
  averageProjectFee: 240000,
  monthlyProjectCount: 5,
  clientCount: 4,
  largestClientRevenueShare: 0.35,
  averageProjectHours: 135,
  revisionHoursPerProject: 16,
  teamSize: 6,
  monthlyHoursPerPerson: 176,
  targetUtilizationRate: 0.72,
  hourlyCost: 850,
  hourlySalesPrice: 2100,
  taxType: "excluded",
  vatRate: 0.20,
  platformSalesShare: 0.10,
  platformCommissionRate: 0.12,
  cardPaymentShare: 0.25,
  paymentCommissionRate: 0.025,
  freelancerPayments: 90000,
  otherVariableCostRate: 0.015,
  adminStaffCost: 85000,
  officeRent: 65000,
  utilities: 12000,
  accounting: 8000,
  softwareSubscriptions: 28000,
  monthlyMarketing: 45000,
  insurance: 5000,
  otherFixedExpenses: 10000,
  loanPayment: 0,
  hardwareInvestment: 420000,
  officeSetup: 120000,
  deposit: 130000,
  legalAndCompanySetup: 30000,
  websiteAndBranding: 80000,
  initialMarketing: 100000,
  softwareSetup: 30000,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 1600000,
  financingAmount: 0,
  supportAmount: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 30,
  firstMonthSalesShare: 0.60,
  monthlyGrowthRate: 0.04,
};

export const AGENCY_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      averageProjectFee: 0.92,
      monthlyProjectCount: 0.68,
      revisionHoursPerProject: 1.55,
      hourlyCost: 1.10,
      freelancerPayments: 1.18,
      monthlyMarketing: 1.08,
      collectionDelayDays: 1.50,
      firstMonthSalesShare: 0.78,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      averageProjectFee: 1.10,
      monthlyProjectCount: 1.28,
      revisionHoursPerProject: 0.72,
      hourlyCost: 0.97,
      freelancerPayments: 1.05,
      monthlyMarketing: 1.12,
      collectionDelayDays: 0.55,
      firstMonthSalesShare: 1.20,
    },
  },
};

export const AGENCY_FORM_SECTIONS = [
  {
    title: "1 · Proje, müşteri ve kapasite", open: true,
    fields: [
      selectField("businessType", "İş türü", AGENCY_BUSINESS_TYPES),
      numberField("averageProjectFee", "Ortalama proje bedeli (TL)", 1000),
      numberField("monthlyProjectCount", "Aylık proje sayısı", 0.1),
      numberField("clientCount", "Aktif müşteri sayısı", 1),
      rateField("largestClientRevenueShare", "En büyük müşterinin ciro payı"),
      numberField("averageProjectHours", "Proje başına baz üretim saati", 1),
      numberField("revisionHoursPerProject", "Proje başına revizyon saati", 1),
      numberField("teamSize", "Üretim ekibi kişi sayısı", 1),
      numberField("monthlyHoursPerPerson", "Kişi başı aylık çalışma saati", 1),
      rateField("targetUtilizationRate", "Hedef faturalandırılabilir kapasite"),
      numberField("hourlyCost", "Ekip saatlik üretim maliyeti (TL)", 10, { hint: "Maaş, yan hak ve işveren maliyetinin üretim saatine dağıtılmış karşılığıdır." }),
      numberField("hourlySalesPrice", "Hedef saatlik satış fiyatı (TL)", 10),
    ],
  },
  {
    title: "2 · Vergi ve ödeme kesintileri", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("platformSalesShare", "Aracı platformdan gelen gelir payı"),
      rateField("platformCommissionRate", "Aracı platform komisyonu"),
      rateField("cardPaymentShare", "Kart / online ödeme payı"),
      rateField("paymentCommissionRate", "Ödeme komisyonu"),
    ],
  },
  {
    title: "3 · Proje üretim ve revizyon maliyetleri", open: true,
    note: "Baz üretim saatleri ve revizyon saatleri ayrı gösterilir. Freelancer/taşeron ödemesi ayrıca düşülür.",
    fields: [
      numberField("freelancerPayments", "Aylık freelancer / taşeron ödemesi (TL)", 1000),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net proje geliri"),
    ],
  },
  {
    title: "4 · Sabit giderler",
    fields: [
      numberField("adminStaffCost", "İdari / satış personeli sabit maliyeti (TL)", 1000),
      numberField("officeRent", "Ofis / çalışma alanı (TL)", 1000),
      numberField("utilities", "Faturalar (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("softwareSubscriptions", "Yazılım / abonelikler (TL)", 500),
      numberField("monthlyMarketing", "Satış / pazarlama gideri (TL)", 1000),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değildir; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "5 · Kurulum ve başlangıç yatırımı",
    fields: [
      numberField("hardwareInvestment", "Bilgisayar / ekipman yatırımı (TL)", 1000),
      numberField("officeSetup", "Ofis kurulum ve mobilya (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("legalAndCompanySetup", "Şirket / hukuk / izin gideri (TL)", 1000),
      numberField("websiteAndBranding", "Web sitesi / marka hazırlığı (TL)", 1000),
      numberField("initialMarketing", "İlk satış / pazarlama bütçesi (TL)", 1000),
      numberField("softwareSetup", "Yazılım kurulumları (TL)", 1000),
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
      numberField("collectionDelayDays", "Tahsilat vadesi / gecikmesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay proje gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık proje büyümesi", { allowNegative: true }),
    ],
  },
];

export function normalizeAgencyInputs(raw = {}) {
  const input = { ...AGENCY_DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "largestClientRevenueShare", "targetUtilizationRate", "vatRate", "platformSalesShare",
    "platformCommissionRate", "cardPaymentShare", "paymentCommissionRate", "otherVariableCostRate",
    "partnerProfitShareRate", "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);
  const numberKeys = Object.keys(AGENCY_DEFAULT_INPUTS).filter(
    (key) => typeof AGENCY_DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key) && key !== "monthlyGrowthRate",
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);
  input.clientCount = clampInteger(input.clientCount, 1, 100000, 1);
  input.teamSize = clampInteger(input.teamSize, 1, 10000, 1);
  input.monthlyHoursPerPerson = Math.min(744, Math.max(1, nonNegative(input.monthlyHoursPerPerson, 176)));
  input.averageProjectHours = Math.max(0.1, nonNegative(input.averageProjectHours, 1));
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "excluded";
  input.businessType = AGENCY_BUSINESS_TYPES.some(([id]) => id === input.businessType) ? input.businessType : AGENCY_DEFAULT_INPUTS.businessType;
  return input;
}

export function applyAgencyScenario(baseInputs, scenarioId) {
  const normalized = normalizeAgencyInputs(baseInputs);
  const preset = AGENCY_SCENARIOS[scenarioId] ?? AGENCY_SCENARIOS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = normalized[key] * multiplier;
  return normalizeAgencyInputs(next);
}
