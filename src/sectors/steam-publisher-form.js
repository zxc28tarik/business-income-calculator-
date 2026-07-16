import {
  booleanField,
  numberField,
  rateField,
  selectField,
  tableField,
} from "../core/sector-schema.js";

const CURRENCIES = [["USD", "USD"], ["EUR", "EUR"], ["GBP", "GBP"], ["TRY", "TRY / TL"], ["TL", "TL"]];
const TAX_TYPES = [["inclusive", "Fiyata dahil"], ["additive", "Fiyat üstü"], ["none", "Vergi yok"]];

export const STEAM_PUBLISHER_FORM_SECTIONS = [
  {
    title: "1 · Satış ve kur varsayımları",
    open: true,
    fields: [
      selectField("businessType", "İş modeli", [
        ["steam_publisher", "Steam oyun yayıncısı"],
        ["indie_self_publish", "Indie oyun kendi yayınlama"],
        ["mobile_game", "Mobil oyun gelir modeli"],
        ["dlc_supporter_pack", "DLC / supporter pack modeli"],
        ["game_asset_digital_product", "Oyun asset / dijital ürün satışı"],
        ["publisher_developer_split", "Publisher–developer gelir paylaşımı"],
      ], { full: true }),
      numberField("listPriceUsd", "Liste fiyatı (USD)", 0.01),
      numberField("units", "Satış adedi (ilk yıl)", 100),
      rateField("discountRate", "Ortalama indirim"),
      rateField("refundRate", "İade oranı"),
      rateField("chargebackRate", "Ters ibraz oranı"),
      numberField("usdTry", "USD/TRY", 0.01),
      numberField("eurUsd", "EUR/USD", 0.01),
      numberField("gbpUsd", "GBP/USD", 0.01),
    ],
  },
  {
    title: "2 · Bölge bazlı satış modeli",
    fields: [
      booleanField("regionMode", "Gelişmiş bölge modelini kullan", {
        full: true,
        hint: "Açıldığında yerel fiyat, para birimi ve bölgesel vergi satırları kullanılır.",
      }),
      rateField("averageTransactionTaxRate", "Ortalama işlem vergisi", { visibleWhen: { key: "regionMode", equals: false } }),
      selectField("transactionTaxType", "Vergi tipi", TAX_TYPES, { visibleWhen: { key: "regionMode", equals: false } }),
      rateField("usRevenueShareRate", "ABD kaynaklı gelir payı", { visibleWhen: { key: "regionMode", equals: false } }),
      tableField("regions", "Bölgesel satış satırları", [
        { type: "text", key: "name", label: "Bölge", defaultValue: "Yeni bölge" },
        { type: "rate", key: "shareRate", label: "Pay", defaultValue: 0 },
        { type: "number", key: "localPrice", label: "Yerel fiyat", step: 0.01, defaultValue: 0 },
        { type: "select", key: "currency", label: "PB", options: CURRENCIES, defaultValue: "USD" },
        { type: "rate", key: "discountRate", label: "İndirim", defaultValue: 0 },
        { type: "rate", key: "refundRate", label: "İade", defaultValue: 0 },
        { type: "rate", key: "taxRate", label: "Vergi", defaultValue: 0 },
        { type: "select", key: "taxType", label: "Vergi tipi", options: TAX_TYPES, defaultValue: "inclusive" },
        { type: "boolean", key: "isUsSource", label: "ABD?", defaultValue: false },
      ], { visibleWhen: { key: "regionMode", equals: true }, minRows: 1, maxRows: 20, newRow: { name: "Yeni bölge", currency: "USD", taxType: "inclusive" }, addLabel: "Bölge ekle" }),
    ],
  },
  {
    title: "3 · Steam / platform kesintileri",
    fields: [
      booleanField("tieredCommissionEnabled", "Kademeli komisyon kullan", { full: true }),
      numberField("tier1Cap", "Kademe 1 üst sınırı (USD)", 1000000, { visibleWhen: { key: "tieredCommissionEnabled", equals: true } }),
      rateField("tier1Rate", "Kademe 1 oranı", { visibleWhen: { key: "tieredCommissionEnabled", equals: true } }),
      numberField("tier2Cap", "Kademe 2 üst sınırı (USD)", 1000000, { visibleWhen: { key: "tieredCommissionEnabled", equals: true } }),
      rateField("tier2Rate", "Kademe 2 oranı", { visibleWhen: { key: "tieredCommissionEnabled", equals: true } }),
      rateField("tier3Rate", "Kademe 3 oranı", { visibleWhen: { key: "tieredCommissionEnabled", equals: true } }),
      rateField("flatCommissionRate", "Sabit komisyon oranı", { visibleWhen: { key: "tieredCommissionEnabled", equals: false } }),
      selectField("withholdingMode", "ABD stopajı", [["10", "Anlaşmalı oran %10"], ["30", "Form yok %30"], ["0", "Stopaj yok"], ["custom", "Özel oran"]]),
      rateField("customWithholdingRate", "Özel stopaj oranı", { visibleWhen: { key: "withholdingMode", equals: "custom" } }),
      booleanField("directFeeRefundEnabled", "Steam Direct ücret iadesini uygula", { full: true }),
    ],
  },
  {
    title: "4 · Yayıncı tahsilatı",
    fields: [
      numberField("wireFeeUsdPerMonth", "SWIFT / havale (USD/ay)", 1),
      rateField("paymentProviderRate", "Ödeme sağlayıcı oranı"),
      rateField("fxSpreadRate", "Kur makası oranı"),
      numberField("fxGainLossTry", "Kur farkı gelir/gideri (TL)", 1000, { allowNegative: true }),
      numberField("collectionPeriodMonths", "Tahsilat dönemi (ay)", 1),
    ],
  },
  {
    title: "5 · Yayıncı / geliştirici anlaşması",
    open: true,
    fields: [
      rateField("publisherShareRate", "Yayıncı payı"),
      rateField("developerShareRate", "Geliştirici payı"),
      selectField("shareBasis", "Paylaşım hangi tutardan?", [["platform_net", "Platform sonrası net gelir"], ["after_recoup", "Recoup sonrası gelir"], ["after_publisher_expenses", "Yayıncı giderleri sonrası gelir"]], { full: true }),
      booleanField("recoupEnabled", "Recoup uygulanacak", { full: true }),
      selectField("recoupOrder", "Recoup sırası", [["before_split", "Önce recoup, sonra paylaşım"], ["after_split", "Önce paylaşım, geliştirici payından recoup"]], { visibleWhen: { key: "recoupEnabled", equals: true }, full: true }),
      numberField("minimumGuaranteeUsd", "Minimum garanti / advance (USD)", 1000),
      numberField("milestonesUsd", "Milestone toplamı (USD)", 1000),
      booleanField("advanceRecoupable", "Advance ve milestone recoupable", { full: true }),
      rateField("ipShareRate", "IP / lisans payı"),
      rateField("coPublisherShareRate", "Co-publisher payı"),
      selectField("developerPaymentCurrency", "Geliştirici ödeme para birimi", CURRENCIES),
      selectField("developerPaymentFrequency", "Ödeme sıklığı", [["monthly", "Aylık"], ["quarterly", "Çeyreklik"], ["manual", "Manuel"]]),
    ],
  },
  {
    title: "6 · Recoup / doğrudan oyun giderleri",
    fields: [
      tableField("recoupItems", "Recoup ve oyun giderleri", [
        { type: "text", key: "name", label: "Kalem", defaultValue: "Yeni gider" },
        { type: "number", key: "amount", label: "Tutar", step: 1000, defaultValue: 0 },
        { type: "select", key: "currency", label: "PB", options: [["TL", "TL"], ["USD", "USD"]], defaultValue: "TL" },
        { type: "boolean", key: "recoupable", label: "Recoup?", defaultValue: true },
        { type: "boolean", key: "fromDeveloperShare", label: "Dev payından?", defaultValue: false },
      ], { minRows: 0, maxRows: 50, newRow: { name: "Yeni gider", amount: 0, currency: "TL", recoupable: true, fromDeveloperShare: false }, addLabel: "Gider ekle" }),
      numberField("recoupCapTry", "Recoup üst limiti (TL, 0 = limitsiz)", 10000, { visibleWhen: { key: "recoupEnabled", equals: true }, full: true }),
    ],
  },
  {
    title: "7 · Yayıncı operasyon ve genel giderler",
    fields: [
      numberField("operationsReleaseTry", "Yayın / release / build yönetimi (TL)", 5000),
      numberField("operationsCommunityTry", "Community ve destek (TL)", 5000),
      numberField("operationsToolsTry", "Veri / analitik / crash araçları (TL)", 5000),
      numberField("monthlyOverheadTry", "Aylık şirket genel gideri (TL)", 10000),
      numberField("overheadMonths", "Genel gider dönemi (ay)", 1),
      rateField("overheadAllocationRate", "Bu oyuna atanan genel gider oranı"),
    ],
  },
  {
    title: "8 · Ek gelirler ve finansman",
    fields: [
      tableField("additionalIncomeItems", "Ek gelir ve finansman satırları", [
        { type: "text", key: "name", label: "Kaynak", defaultValue: "Yeni kaynak" },
        { type: "number", key: "grossAmount", label: "Brüt", step: 500, defaultValue: 0 },
        { type: "select", key: "currency", label: "PB", options: CURRENCIES, defaultValue: "TL" },
        { type: "rate", key: "deductionRate", label: "Kesinti", defaultValue: 0 },
        { type: "boolean", key: "applyWithholding", label: "Stopaj?", defaultValue: false },
        { type: "rate", key: "vatRate", label: "KDV", defaultValue: 0 },
        { type: "select", key: "category", label: "Tür", options: [["operating", "Operasyonel"], ["grant", "Hibe / destek"], ["investment", "Yatırım / finansman"]], defaultValue: "operating" },
        { type: "boolean", key: "taxable", label: "Matrah?", defaultValue: true },
      ], { minRows: 0, maxRows: 50, newRow: { name: "Yeni kaynak", currency: "TL", category: "operating", taxable: true }, addLabel: "Gelir / finansman ekle" }),
    ],
  },
  {
    title: "9 · Türkiye vergi ve muhasebe",
    fields: [
      selectField("entityType", "Şirket tipi", [["company", "Ltd. / A.Ş. — Kurumlar vergisi"], ["sole_proprietor", "Şahıs — dilimli gelir vergisi"]], { full: true }),
      rateField("corporateTaxRate", "Kurumlar vergisi oranı", { visibleWhen: { key: "entityType", equals: "company" } }),
      rateField("dividendWithholdingRate", "Temettü stopajı oranı", { visibleWhen: { key: "entityType", equals: "company" } }),
      tableField("incomeTaxBrackets", "Gelir vergisi dilimleri", [
        { type: "number", key: "upTo", label: "Üst sınır (TL)", step: 1000, defaultValue: 0 },
        { type: "rate", key: "rate", label: "Oran", defaultValue: 0 },
      ], { visibleWhen: { key: "entityType", equals: "sole_proprietor" }, minRows: 1, maxRows: 10, newRow: { upTo: 999999999999, rate: 0.40 }, addLabel: "Vergi dilimi ekle" }),
      rateField("profitDistributionRate", "Dağıtılacak kâr oranı", { visibleWhen: { key: "entityType", equals: "company" } }),
      numberField("lossCarryforwardTry", "Devreden zarar (TL)", 10000),
      numberField("depreciationTry", "Amortisman (TL, nakit dışı)", 10000),
      booleanField("foreignWithholdingCreditEnabled", "ABD stopajını Türkiye vergisinden mahsup et", { full: true }),
      booleanField("softwareExportDeduction80", "%80 hizmet / yazılım ihracı indirimi", { full: true }),
      booleanField("technoparkExemption", "Teknopark kazanç istisnası", { full: true }),
    ],
  },
  {
    title: "10 · Nakit akışı varsayımları",
    fields: [
      numberField("cashOnHandTry", "Eldeki nakit (TL)", 100000),
      numberField("monthsToLaunch", "Lansmana kalan ay", 1),
      numberField("preLaunchMonthlyBurnTry", "Lansman öncesi aylık gider (TL)", 10000),
      numberField("launchMarketingTry", "Lansman ayı pazarlama (TL)", 10000),
      numberField("platformPaymentDelayDays", "Platform ödeme gecikmesi (gün)", 5),
      numberField("developerPaymentDelayDays", "Geliştirici ödeme gecikmesi (gün)", 5),
      rateField("firstMonthSalesShareRate", "İlk ay satış payı"),
    ],
  },
];

export const STEAM_PUBLISHER_CASH_FLOW_COLUMNS = [
  { key: "month", label: "Ay", format: "number" },
  { key: "collections", label: "Platform tahsilatı", format: "money" },
  { key: "publisherCosts", label: "Yayıncı gideri", format: "money" },
  { key: "developerPayments", label: "Geliştirici ödemesi", format: "money" },
  { key: "cashEnd", label: "Kümülatif nakit", format: "money" },
  { key: "recoupBalance", label: "Recoup bakiyesi", format: "money" },
];
