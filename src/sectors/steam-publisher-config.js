const clampRate = (value, fallback = 0) => Math.min(1, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback));
const nonNegative = (value, fallback = 0) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback);
const finiteNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const deepClone = (value) => structuredClone(value);

export const STEAM_PUBLISHER_BUSINESS_TYPES = [
  ["steam_publisher", "Steam oyun yayıncısı"],
  ["indie_self_publish", "Indie oyun kendi yayınlama"],
  ["mobile_game", "Mobil oyun gelir modeli"],
  ["dlc_supporter_pack", "DLC / supporter pack modeli"],
  ["game_asset_digital_product", "Oyun asset / dijital ürün satışı"],
  ["publisher_developer_split", "Publisher–developer gelir paylaşımı"],
];

export const STEAM_DEFAULT_REGIONS = [
  { name: "ABD", shareRate: 0.30, localPrice: 19.99, currency: "USD", discountRate: 0.15, refundRate: 0.08, taxRate: 0.07, taxType: "additive", isUsSource: true },
  { name: "Avrupa Birliği", shareRate: 0.25, localPrice: 19.99, currency: "EUR", discountRate: 0.15, refundRate: 0.08, taxRate: 0.21, taxType: "inclusive", isUsSource: false },
  { name: "Türkiye", shareRate: 0.08, localPrice: 299, currency: "TRY", discountRate: 0.20, refundRate: 0.09, taxRate: 0.20, taxType: "inclusive", isUsSource: false },
  { name: "UK", shareRate: 0.07, localPrice: 16.99, currency: "GBP", discountRate: 0.15, refundRate: 0.08, taxRate: 0.20, taxType: "inclusive", isUsSource: false },
  { name: "LATAM", shareRate: 0.08, localPrice: 8.99, currency: "USD", discountRate: 0.20, refundRate: 0.09, taxRate: 0.16, taxType: "inclusive", isUsSource: false },
  { name: "MENA", shareRate: 0.05, localPrice: 10.99, currency: "USD", discountRate: 0.18, refundRate: 0.08, taxRate: 0.10, taxType: "inclusive", isUsSource: false },
  { name: "Asya", shareRate: 0.12, localPrice: 11.99, currency: "USD", discountRate: 0.18, refundRate: 0.08, taxRate: 0.10, taxType: "inclusive", isUsSource: false },
  { name: "Diğer", shareRate: 0.05, localPrice: 13.99, currency: "USD", discountRate: 0.15, refundRate: 0.08, taxRate: 0.12, taxType: "inclusive", isUsSource: false },
];

export const STEAM_DEFAULT_RECOUP_ITEMS = [
  ["Pazarlama", 400000, "TL", true],
  ["PR ajansı", 120000, "TL", true],
  ["Influencer / key kampanyası", 80000, "TL", true],
  ["Trailer üretimi", 60000, "TL", true],
  ["Steam capsule / key art", 35000, "TL", true],
  ["Lokalizasyon", 120000, "TL", true],
  ["LQA", 40000, "TL", true],
  ["QA test", 90000, "TL", true],
  ["Porting", 0, "USD", true],
  ["Steam Deck / Mac / Linux optimizasyonu", 0, "USD", true],
  ["Hukuk / publishing agreement", 60000, "TL", false],
  ["Marka / IP / telif kontrolü", 25000, "TL", false],
  ["Rating / classification", 15000, "TL", true],
  ["Fuar / etkinlik / festival", 70000, "TL", true],
  ["Community management", 0, "TL", false],
  ["Analytics / araç abonelikleri", 0, "TL", false],
].map(([name, amount, currency, recoupable]) => ({
  name,
  amount,
  currency,
  recoupable,
  fromDeveloperShare: false,
}));

export const STEAM_DEFAULT_ADDITIONAL_INCOME_ITEMS = [
  ["Steam DLC", "USD", 0.30, "operating", true],
  ["Deluxe Edition farkı", "USD", 0.30, "operating", true],
  ["Soundtrack", "USD", 0.30, "operating", true],
  ["Artbook", "USD", 0.30, "operating", true],
  ["Supporter Pack", "USD", 0.30, "operating", true],
  ["Bundle gelirleri", "USD", 0.30, "operating", true],
  ["Steam key doğrudan satış", "USD", 0.05, "operating", true],
  ["Epic / GOG / itch.io", "USD", 0.12, "operating", true],
  ["Game Pass / platform anlaşması", "USD", 0, "operating", true],
  ["Konsol port geliri", "USD", 0.30, "operating", true],
  ["Bölgesel lisans geliri", "USD", 0, "operating", true],
  ["Hibe / destek", "TL", 0, "grant", true],
  ["Yatırım / finansman", "TL", 0, "investment", false],
].map(([name, currency, deductionRate, category, taxable]) => ({
  name,
  grossAmount: 0,
  currency,
  deductionRate,
  applyWithholding: false,
  vatRate: 0,
  category,
  taxable,
}));

export const STEAM_PUBLISHER_DEFAULT_INPUTS = {
  businessType: "steam_publisher",
  listPriceUsd: 19.99,
  units: 50000,
  discountRate: 0.15,
  refundRate: 0.08,
  chargebackRate: 0.005,
  usdTry: 42,
  eurUsd: 1.08,
  gbpUsd: 1.27,
  regionMode: false,
  averageTransactionTaxRate: 0.14,
  transactionTaxType: "inclusive",
  usRevenueShareRate: 0.35,
  regions: STEAM_DEFAULT_REGIONS,
  tieredCommissionEnabled: true,
  flatCommissionRate: 0.30,
  tier1Cap: 10_000_000,
  tier1Rate: 0.30,
  tier2Cap: 50_000_000,
  tier2Rate: 0.25,
  tier3Rate: 0.20,
  withholdingMode: "10",
  customWithholdingRate: 0.10,
  directFeeRefundEnabled: true,
  wireFeeUsdPerMonth: 35,
  paymentProviderRate: 0.003,
  fxSpreadRate: 0.008,
  fxGainLossTry: 0,
  collectionPeriodMonths: 12,
  publisherShareRate: 0.40,
  developerShareRate: 0.60,
  shareBasis: "after_recoup",
  recoupEnabled: true,
  recoupOrder: "before_split",
  minimumGuaranteeUsd: 30000,
  milestonesUsd: 0,
  advanceRecoupable: true,
  ipShareRate: 0,
  coPublisherShareRate: 0,
  developerPaymentCurrency: "USD",
  developerPaymentFrequency: "quarterly",
  recoupItems: STEAM_DEFAULT_RECOUP_ITEMS,
  recoupCapTry: 0,
  publisherOperationsTry: 250000,
  monthlyOverheadTry: 500000,
  overheadMonths: 12,
  overheadAllocationRate: 0.25,
  additionalIncomeItems: STEAM_DEFAULT_ADDITIONAL_INCOME_ITEMS,
  entityType: "company",
  corporateTaxRate: 0.25,
  dividendWithholdingRate: 0.15,
  profitDistributionRate: 0,
  lossCarryforwardTry: 0,
  depreciationTry: 0,
  foreignWithholdingCreditEnabled: true,
  softwareExportDeduction80: false,
  technoparkExemption: false,
  incomeTaxBrackets: [
    { upTo: 190000, rate: 0.15 },
    { upTo: 400000, rate: 0.20 },
    { upTo: 1_000_000, rate: 0.27 },
    { upTo: 5_400_000, rate: 0.35 },
    { upTo: Infinity, rate: 0.40 },
  ],
  cashOnHandTry: 3_000_000,
  monthsToLaunch: 4,
  preLaunchMonthlyBurnTry: 450000,
  launchMarketingTry: 400000,
  platformPaymentDelayDays: 30,
  developerPaymentDelayDays: 45,
  firstMonthSalesShareRate: 0.40,
};

export const STEAM_PUBLISHER_SCENARIOS = {
  pessimistic: {
    label: "Kötümser",
    overrides: { listPriceUsd: 19.99, units: 15000, discountRate: 0.20, refundRate: 0.10, usdTry: 42, developerShareRate: 0.60, marketingRecoupTry: 250000 },
  },
  expected: {
    label: "Beklenen",
    overrides: { listPriceUsd: 19.99, units: 50000, discountRate: 0.15, refundRate: 0.08, usdTry: 42, developerShareRate: 0.60, marketingRecoupTry: 400000 },
  },
  optimistic: {
    label: "İyimser",
    overrides: { listPriceUsd: 19.99, units: 120000, discountRate: 0.12, refundRate: 0.07, usdTry: 42, developerShareRate: 0.60, marketingRecoupTry: 600000 },
  },
};

function normalizeRegion(region, fallback) {
  const source = { ...fallback, ...region };
  return {
    name: String(source.name || fallback.name),
    shareRate: clampRate(source.shareRate, fallback.shareRate),
    localPrice: nonNegative(source.localPrice, fallback.localPrice),
    currency: ["USD", "EUR", "GBP", "TRY", "TL"].includes(source.currency) ? source.currency : fallback.currency,
    discountRate: clampRate(source.discountRate, fallback.discountRate),
    refundRate: clampRate(source.refundRate, fallback.refundRate),
    taxRate: clampRate(source.taxRate, fallback.taxRate),
    taxType: ["inclusive", "additive", "none"].includes(source.taxType) ? source.taxType : fallback.taxType,
    isUsSource: Boolean(source.isUsSource),
  };
}

function normalizeRecoupItem(item, fallback = {}) {
  const source = { ...fallback, ...item };
  return {
    name: String(source.name || "Gider"),
    amount: nonNegative(source.amount),
    currency: source.currency === "USD" ? "USD" : "TL",
    recoupable: Boolean(source.recoupable),
    fromDeveloperShare: Boolean(source.fromDeveloperShare),
  };
}

function normalizeAdditionalIncomeItem(item, fallback = {}) {
  const source = { ...fallback, ...item };
  return {
    name: String(source.name || "Ek gelir"),
    grossAmount: nonNegative(source.grossAmount),
    currency: ["USD", "EUR", "GBP", "TRY", "TL"].includes(source.currency) ? source.currency : "TL",
    deductionRate: clampRate(source.deductionRate),
    applyWithholding: Boolean(source.applyWithholding),
    vatRate: clampRate(source.vatRate),
    category: ["operating", "grant", "investment"].includes(source.category) ? source.category : "operating",
    taxable: Boolean(source.taxable),
  };
}

export function normalizeSteamPublisherInputs(raw = {}) {
  const input = { ...deepClone(STEAM_PUBLISHER_DEFAULT_INPUTS), ...deepClone(raw) };

  const rateKeys = [
    "discountRate", "refundRate", "chargebackRate", "averageTransactionTaxRate", "usRevenueShareRate",
    "flatCommissionRate", "tier1Rate", "tier2Rate", "tier3Rate", "customWithholdingRate",
    "paymentProviderRate", "fxSpreadRate", "publisherShareRate", "developerShareRate", "ipShareRate",
    "coPublisherShareRate", "overheadAllocationRate", "corporateTaxRate", "dividendWithholdingRate",
    "profitDistributionRate", "firstMonthSalesShareRate",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key], STEAM_PUBLISHER_DEFAULT_INPUTS[key]);

  const nonNegativeKeys = [
    "listPriceUsd", "units", "usdTry", "eurUsd", "gbpUsd", "tier1Cap", "tier2Cap",
    "wireFeeUsdPerMonth", "collectionPeriodMonths", "minimumGuaranteeUsd", "milestonesUsd",
    "recoupCapTry", "publisherOperationsTry", "monthlyOverheadTry", "overheadMonths",
    "lossCarryforwardTry", "depreciationTry", "cashOnHandTry", "monthsToLaunch",
    "preLaunchMonthlyBurnTry", "launchMarketingTry", "platformPaymentDelayDays", "developerPaymentDelayDays",
  ];
  for (const key of nonNegativeKeys) input[key] = nonNegative(input[key], STEAM_PUBLISHER_DEFAULT_INPUTS[key]);

  input.fxGainLossTry = finiteNumber(input.fxGainLossTry, 0);
  input.regionMode = Boolean(input.regionMode);
  input.tieredCommissionEnabled = Boolean(input.tieredCommissionEnabled);
  input.directFeeRefundEnabled = Boolean(input.directFeeRefundEnabled);
  input.recoupEnabled = Boolean(input.recoupEnabled);
  input.advanceRecoupable = Boolean(input.advanceRecoupable);
  input.foreignWithholdingCreditEnabled = Boolean(input.foreignWithholdingCreditEnabled);
  input.softwareExportDeduction80 = Boolean(input.softwareExportDeduction80);
  input.technoparkExemption = Boolean(input.technoparkExemption);
  if (input.technoparkExemption) input.softwareExportDeduction80 = false;

  input.businessType = STEAM_PUBLISHER_BUSINESS_TYPES.some(([id]) => id === input.businessType)
    ? input.businessType
    : STEAM_PUBLISHER_DEFAULT_INPUTS.businessType;
  input.transactionTaxType = ["inclusive", "additive", "none"].includes(input.transactionTaxType)
    ? input.transactionTaxType
    : "inclusive";
  input.withholdingMode = ["0", "10", "30", "custom"].includes(String(input.withholdingMode))
    ? String(input.withholdingMode)
    : "10";
  input.shareBasis = ["platform_net", "after_recoup", "after_publisher_expenses"].includes(input.shareBasis)
    ? input.shareBasis
    : "after_recoup";
  input.recoupOrder = ["before_split", "after_split"].includes(input.recoupOrder)
    ? input.recoupOrder
    : "before_split";
  input.entityType = ["company", "sole_proprietor"].includes(input.entityType) ? input.entityType : "company";

  input.regions = (Array.isArray(raw.regions) ? raw.regions : STEAM_DEFAULT_REGIONS)
    .map((region, index) => normalizeRegion(region, STEAM_DEFAULT_REGIONS[index] ?? STEAM_DEFAULT_REGIONS.at(-1)));
  input.recoupItems = (Array.isArray(raw.recoupItems) ? raw.recoupItems : STEAM_DEFAULT_RECOUP_ITEMS)
    .map((item, index) => normalizeRecoupItem(item, STEAM_DEFAULT_RECOUP_ITEMS[index]));
  input.additionalIncomeItems = (Array.isArray(raw.additionalIncomeItems) ? raw.additionalIncomeItems : STEAM_DEFAULT_ADDITIONAL_INCOME_ITEMS)
    .map((item, index) => normalizeAdditionalIncomeItem(item, STEAM_DEFAULT_ADDITIONAL_INCOME_ITEMS[index]));
  input.incomeTaxBrackets = (Array.isArray(raw.incomeTaxBrackets) ? raw.incomeTaxBrackets : STEAM_PUBLISHER_DEFAULT_INPUTS.incomeTaxBrackets)
    .map((bracket, index) => ({
      upTo: bracket?.upTo === Infinity ? Infinity : nonNegative(bracket?.upTo, STEAM_PUBLISHER_DEFAULT_INPUTS.incomeTaxBrackets[index]?.upTo ?? Infinity),
      rate: clampRate(bracket?.rate, STEAM_PUBLISHER_DEFAULT_INPUTS.incomeTaxBrackets[index]?.rate ?? 0),
    }));

  return input;
}

export function applySteamPublisherScenario(baseInputs, scenarioId) {
  const input = normalizeSteamPublisherInputs(baseInputs);
  const scenario = STEAM_PUBLISHER_SCENARIOS[scenarioId] ?? STEAM_PUBLISHER_SCENARIOS.expected;
  const next = deepClone(input);
  const { marketingRecoupTry, ...overrides } = scenario.overrides;
  Object.assign(next, overrides);
  const marketing = next.recoupItems.find((item) => item.name === "Pazarlama");
  if (marketing) marketing.amount = marketingRecoupTry;
  return normalizeSteamPublisherInputs(next);
}
