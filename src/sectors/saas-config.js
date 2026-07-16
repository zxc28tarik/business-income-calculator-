import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import { numberField, rateField, selectField } from "../core/sector-schema.js";

export const SAAS_BUSINESS_TYPES = [
  ["b2b_saas", "B2B SaaS"],
  ["b2c_subscription", "B2C abonelik"],
  ["micro_saas", "Mikro SaaS"],
  ["api_service", "API servis"],
  ["mobile_subscription", "Mobil uygulama aboneliği"],
  ["membership_site", "Üyelik sitesi"],
];

export const SAAS_DEFAULT_INPUTS = {
  businessType: "b2b_saas",
  openingSubscribers: 850,
  monthlyPrice: 1250,
  monthlyNewSubscribers: 75,
  monthlyChurnRate: 0.045,
  cacPerSubscriber: 3900,
  fixedMarketingSpend: 70000,
  taxType: "included",
  vatRate: 0.20,
  platformSalesShare: 0,
  platformCommissionRate: 0.15,
  paymentCommissionRate: 0.025,
  serverBaseCost: 35000,
  serverCostPerSubscriber: 75,
  supportCostPerSubscriber: 55,
  supportStaffCost: 95000,
  developmentCost: 260000,
  softwareTools: 45000,
  officeAndAdmin: 55000,
  accounting: 12000,
  insurance: 7000,
  otherFixedExpenses: 18000,
  initialDevelopmentInvestment: 1200000,
  legalAndCompanySetup: 80000,
  initialInfrastructureSetup: 180000,
  brandAndWebsite: 120000,
  launchMarketing: 250000,
  partnerProfitShareRate: 0,
  estimatedTaxRate: 0.25,
  startingCash: 2400000,
  financingAmount: 0,
  supportAmount: 0,
  setupPaymentMonth: 1,
  collectionDelayDays: 7,
  firstMonthSalesShare: 1,
  loanPayment: 0,
};

export const SAAS_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    multipliers: {
      monthlyPrice: 0.95,
      monthlyNewSubscribers: 0.70,
      monthlyChurnRate: 1.55,
      cacPerSubscriber: 1.25,
      fixedMarketingSpend: 1.10,
      serverCostPerSubscriber: 1.12,
      supportCostPerSubscriber: 1.10,
      firstMonthSalesShare: 0.90,
    },
  },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: {
    label: "İyimser",
    multipliers: {
      monthlyPrice: 1.05,
      monthlyNewSubscribers: 1.35,
      monthlyChurnRate: 0.65,
      cacPerSubscriber: 0.82,
      serverCostPerSubscriber: 0.94,
      supportCostPerSubscriber: 0.94,
      fixedMarketingSpend: 1.12,
      firstMonthSalesShare: 1.05,
    },
  },
};

export const SAAS_FORM_SECTIONS = [
  {
    title: "1 · Abone, fiyat ve büyüme", open: true,
    fields: [
      selectField("businessType", "İş türü", SAAS_BUSINESS_TYPES),
      numberField("openingSubscribers", "Ay başı aktif abone", 1),
      numberField("monthlyPrice", "Aylık abonelik fiyatı (TL)", 10),
      numberField("monthlyNewSubscribers", "Aylık yeni abone", 1),
      rateField("monthlyChurnRate", "Aylık churn / abonelik kaybı"),
    ],
  },
  {
    title: "2 · Müşteri kazanımı", open: true,
    note: "Yeni müşteri kazanım maliyeti = yeni abone × CAC. Sabit marka/pazarlama bütçesi ayrıca gösterilir.",
    fields: [
      numberField("cacPerSubscriber", "CAC / yeni abone (TL)", 10),
      numberField("fixedMarketingSpend", "Sabit aylık pazarlama bütçesi (TL)", 1000),
    ],
  },
  {
    title: "3 · Vergi ve ödeme kesintileri", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("platformSalesShare", "App Store / platform satış payı"),
      rateField("platformCommissionRate", "App Store / platform komisyonu"),
      rateField("paymentCommissionRate", "Ödeme sağlayıcı komisyonu"),
    ],
  },
  {
    title: "4 · Altyapı ve destek maliyetleri", open: true,
    fields: [
      numberField("serverBaseCost", "Aylık sabit sunucu / altyapı (TL)", 1000),
      numberField("serverCostPerSubscriber", "Sunucu maliyeti / aktif abone (TL)", 1),
      numberField("supportCostPerSubscriber", "Destek değişken maliyeti / aktif abone (TL)", 1),
      numberField("supportStaffCost", "Destek ekibi sabit maliyeti (TL)", 1000),
    ],
  },
  {
    title: "5 · Sabit işletme giderleri",
    fields: [
      numberField("developmentCost", "Aylık geliştirme ekibi maliyeti (TL)", 1000),
      numberField("softwareTools", "Yazılım / araç abonelikleri (TL)", 500),
      numberField("officeAndAdmin", "Ofis / idari giderler (TL)", 1000),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değildir; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "6 · Ürün geliştirme ve kurulum",
    fields: [
      numberField("initialDevelopmentInvestment", "İlk ürün geliştirme yatırımı (TL)", 1000),
      numberField("legalAndCompanySetup", "Şirket / hukuk / sözleşmeler (TL)", 1000),
      numberField("initialInfrastructureSetup", "İlk altyapı kurulumu (TL)", 1000),
      numberField("brandAndWebsite", "Marka / web sitesi (TL)", 1000),
      numberField("launchMarketing", "Lansman pazarlaması (TL)", 1000),
    ],
  },
  {
    title: "7 · Paydaş, vergi ve nakit akışı",
    fields: [
      rateField("partnerProfitShareRate", "Ortak / yatırımcı kâr payı"),
      rateField("estimatedTaxRate", "Vergi ön tahmin oranı", { hint: "Kesin vergi hesabı değildir." }),
      numberField("startingCash", "Başlangıç nakdi (TL)", 1000),
      numberField("financingAmount", "Yatırım / finansman (TL)", 1000, { hint: "P&L geliri değildir." }),
      numberField("supportAmount", "Hibe / destek nakit girişi (TL)", 1000, { hint: "Vergi etkisi otomatik varsayılmaz." }),
      numberField("setupPaymentMonth", "Kurulum ödeme ayı", 1),
      numberField("collectionDelayDays", "Tahsilat gecikmesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay tahakkuk / satış gerçekleşme oranı"),
    ],
  },
];

export function normalizeSaasInputs(raw = {}) {
  const input = { ...SAAS_DEFAULT_INPUTS, ...raw };
  const rateKeys = [
    "monthlyChurnRate", "vatRate", "platformSalesShare", "platformCommissionRate",
    "paymentCommissionRate", "partnerProfitShareRate", "estimatedTaxRate", "firstMonthSalesShare",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);

  const numberKeys = Object.keys(SAAS_DEFAULT_INPUTS).filter(
    (key) => typeof SAAS_DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key),
  );
  for (const key of numberKeys) input[key] = nonNegative(input[key]);

  input.openingSubscribers = clampInteger(input.openingSubscribers, 0, 100000000, 0);
  input.monthlyNewSubscribers = clampInteger(input.monthlyNewSubscribers, 0, 100000000, 0);
  input.setupPaymentMonth = clampInteger(input.setupPaymentMonth, 1, 12, 1);
  input.collectionDelayDays = Math.min(30, input.collectionDelayDays);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  input.businessType = SAAS_BUSINESS_TYPES.some(([id]) => id === input.businessType)
    ? input.businessType
    : SAAS_DEFAULT_INPUTS.businessType;
  return input;
}

export function applySaasScenario(baseInputs, scenarioId) {
  const normalized = normalizeSaasInputs(baseInputs);
  const preset = SAAS_SCENARIOS[scenarioId] ?? SAAS_SCENARIOS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) {
    next[key] = normalized[key] * multiplier;
  }
  return normalizeSaasInputs(next);
}
