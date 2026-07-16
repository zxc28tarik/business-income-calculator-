const fixedLabels = {
  rent: "Kira", staffCost: "Personel", utilities: "Faturalar", accounting: "Muhasebe",
  software: "POS / stok yazılımı", security: "Güvenlik", monthlyMarketing: "Aylık reklam / kampanya",
  insurance: "Sigorta", maintenance: "Bakım / küçük onarım", otherFixedExpenses: "Diğer sabit gider",
};

const setupLabels = {
  renovation: "Tadilat", shelvingEquipment: "Raf / mağaza ekipmanı", posSystem: "Kasa / POS sistemi",
  deposit: "Depozito", initialStockInvestment: "İlk stok yatırımı", licenseFees: "Ruhsat / izin",
  openingMarketing: "Açılış reklamı", signage: "Tabela / vitrin", softwareSetup: "Yazılım kurulumu",
};

export function buildRetailPresentation(result) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "unit_profit", label: "Ürün başı net kâr", value: result.unitNetProfit, format: "money", note: `${round(result.retainedUnits, 0)} net satılan ürün`, negative: result.unitNetProfit < 0 },
      { id: "breakeven", label: "Günlük başabaş müşteri", value: result.breakevenDailyCustomers, format: "numberSuffix", suffix: " müşteri", note: `Mevcut: ${round(result.input.dailyCustomers, 1)}` },
      { id: "stock_turnover", label: "Yıllık stok devir hızı", value: result.annualStockTurnover, format: "numberSuffix", suffix: " kez", note: result.stockCoverageMonths == null ? "Stok kapsamı bulunamadı" : `${round(result.stockCoverageMonths, 1)} aylık stok kapsamı`, negative: result.annualStockTurnover != null && result.annualStockTurnover < 4 },
      { id: "gross_margin", label: "Ürün brüt marjı", value: result.productGrossMargin, format: "percent", note: "KDV/iade sonrası ürün fiyatı ve maliyeti", negative: result.productGrossMargin < 0.30 },
      { id: "rent_ratio", label: "Kira / ciro", value: result.rentToRevenue, format: "percent", note: "KDV ve iade sonrası satış geliri", negative: result.rentToRevenue > 0.15 },
      { id: "initial_stock", label: "İlk stok nakit ihtiyacı", value: result.input.initialStockInvestment, format: "money", note: "Kurulumda bir kez nakit çıkışı" },
      { id: "return_loss", label: "Aylık iade", value: result.returnedGrossRevenue, format: "money", note: `${formatRate(result.input.returnRate)} iade oranı`, negative: result.input.returnRate > 0.06 },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
    ],
    keySplit: [
      { label: "Brüt kasa satışı", value: result.grossRevenue },
      { label: "İadeler", value: -result.returnedGrossRevenue },
      { label: "KDV sonrası net satış", value: result.adjustedRevenue },
      { label: "POS sonrası tahsilat tabanı", value: result.revenueAfterCommission },
      { label: "Ürün, fire ve poşet sonrası katkı", value: result.contribution },
      { label: "Mağaza sabit giderleri sonrası", value: result.preTaxProfit + result.totalStakeholderPayouts },
      { label: "Ortak / yatırımcı payı", value: -result.totalStakeholderPayouts },
      { label: "Vergi öncesi kâr", value: result.preTaxProfit },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "gross_revenue", label: "Brüt kasa satışı", value: result.grossRevenue, format: "money" },
      { id: "returns", label: "İade", value: result.returnedGrossRevenue, format: "money" },
      { id: "contribution", label: "Ürün maliyeti sonrası katkı", value: result.contribution, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "breakeven", label: "Günlük başabaş müşteri", value: result.breakevenDailyCustomers, format: "number" },
      { id: "turnover", label: "Yıllık stok devir hızı", value: result.annualStockTurnover, format: "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Satış ve müşteri", rows: [
        ["Günlük müşteri", result.input.dailyCustomers, "number"], ["Ortalama sepet", result.input.averageBasket],
        ["Aylık müşteri işlemi", result.input.dailyCustomers * result.input.openDays, "number"],
        ["Sepet başına ürün", result.averageItemsPerBasket, "number"], ["Brüt kasa satışı", result.grossRevenue],
        ["İade edilen satış", -result.returnedGrossRevenue], ["İade edilen ürün", -result.returnedUnits, "number"],
        ["Net satılan ürün", result.retainedUnits, "number"],
      ] },
      { title: "B · Vergi ve ödeme", rows: [
        ["KDV ayrımı", -result.taxAmount], ["KDV sonrası net satış", result.adjustedRevenue],
        ["POS / ödeme komisyonu", -result.posCommission], ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "C · Ürün ve stok maliyeti", rows: [
        ["Satılan ürün maliyeti", -result.productCost], ["Fire / kayıp maliyeti", -result.inventoryLossCost],
        ["Poşet / ambalaj", -result.shoppingBagCost], ["Diğer değişken gider", -result.otherVariableCost],
        ["Katkı", result.contribution], ["Ürün brüt marjı", result.productGrossMargin, "percent"],
      ] },
      { title: "D · Sabit mağaza giderleri", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
        ["Toplam sabit gider", -result.totalFixedCosts],
      ] },
      { title: "E · Paydaş / ortak", rows: [["Ortak / yatırımcı kâr payı", -result.partnerPayout]] },
      { title: "F · Kâr-zarar", rows: [
        ["Vergi öncesi kâr", result.preTaxProfit], ["Vergi ön tahmini", -result.estimatedTax],
        ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit],
      ] },
      { title: "G · Stok verimliliği", rows: [
        ["İlk stok yatırımı", result.input.initialStockInvestment], ["Yıllık stok devir hızı", result.annualStockTurnover, "number"],
        ["Stok kapsamı", result.stockCoverageMonths, "months"], ["Ürün başı katkı", result.contributionPerUnit],
        ["Ürün başı net kâr", result.unitNetProfit],
      ] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
        ["Hibe / destek (ayrı)", result.input.supportAmount], ["Toplam kurulum + ilk stok", -result.totalSetupCost],
        ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Aylık net kâr", result.netProfit], ["Günlük başabaş müşteri", result.breakevenDailyCustomers, "number"],
        ["Başabaş ciro", result.breakevenRevenue], ["Kira / ciro", result.rentToRevenue, "percent"],
        ["Toplam kurulum geri dönüşü", result.paybackMonths, "months"], ["En büyük gider", result.largestExpense.amount],
      ] },
      { title: "Kurulum kalemleri", rows: Object.entries(result.setupCostItems).map(([key, value]) => [setupLabels[key] || key, -value]) },
    ],
  };
}

function round(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const power = 10 ** digits;
  return Math.round((number + Number.EPSILON) * power) / power;
}
function formatRate(value) { return `${round((Number(value) || 0) * 100, 1)}%`; }
function formatMoneyPlain(value) { return `${Math.round(Number(value) || 0).toLocaleString("tr-TR")} TL`; }
