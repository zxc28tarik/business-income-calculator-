const fixedLabels = {
  monthlyAdSpend: "Aylık reklam",
  rent: "Kira / ofis",
  warehouseCost: "Depo",
  staffCost: "Personel",
  software: "Yazılım",
  accounting: "Muhasebe",
  utilities: "Faturalar",
  insurance: "Sigorta",
  otherFixedExpenses: "Diğer sabit gider",
};

const setupLabels = {
  initialStockInvestment: "İlk stok yatırımı",
  storeSetup: "Mağaza / site kurulumu",
  equipment: "Ekipman",
  deposit: "Depozito",
  legalFees: "Şirket / izin",
  launchMarketing: "Açılış reklamı",
  otherSetupCosts: "Diğer kurulum",
};

export function buildEcommercePresentation(result) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "unit_profit", label: "Ürün başı net kâr", value: result.unitNetProfit, format: "money", note: `${round(result.fulfilledUnits, 0)} net satış adedi`, negative: result.unitNetProfit < 0 },
      { id: "gross_margin", label: "Brüt kâr marjı", value: result.grossMargin, format: "percent", note: "Komisyon sonrası gelirden ürün maliyeti" },
      { id: "breakeven_units", label: "Başabaş satış", value: result.breakevenUnits, format: "numberSuffix", suffix: " adet", note: result.breakevenRevenue == null ? "Başabaş bulunamadı" : `Ciro: ${formatMoneyPlain(result.breakevenRevenue)}` },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "stock_need", label: "Stok nakit ihtiyacı", value: result.stockCashNeed, format: "money", note: `${round(result.input.stockCoverageMonths, 1)} aylık hedef kapsam` },
      { id: "commission_load", label: "Pazaryeri kesinti yükü", value: result.commissionLoad, format: "percent", note: "İade sonrası satışa göre", negative: result.commissionLoad > 0.22 },
      { id: "roas", label: "Tahmini ROAS", value: result.roas, format: "multiple", note: "Brüt satış / reklam gideri" },
      { id: "refund_rate", label: "İade oranı", value: result.input.refundRate, format: "percent", note: `${round(result.returnedUnits, 0)} tahmini iade`, negative: result.input.refundRate > 0.15 },
    ],
    keySplit: [
      { label: "Brüt satış", value: result.customerPayment },
      { label: "İndirim ve KDV sonrası satış", value: result.netSalesBeforeLoss },
      { label: "İade sonrası satış", value: result.adjustedRevenue },
      { label: "Pazaryeri / ödeme sonrası tahsilat", value: result.revenueAfterCommission },
      { label: "Ürün ve lojistik sonrası katkı", value: result.contribution },
      { label: "Reklam sonrası kâr", value: result.profitAfterAdvertising },
      { label: "Vergi öncesi kâr", value: result.preTaxProfit },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "gross_revenue", label: "Brüt satış", value: result.grossRevenue, format: "money" },
      { id: "net_collections", label: "Net tahsilat", value: result.revenueAfterCommission, format: "money" },
      { id: "total_expense", label: "Toplam gider", value: result.totalVariableCosts + result.totalFixedCosts + result.totalStakeholderPayouts + result.estimatedTax, format: "money" },
      { id: "pre_tax_profit", label: "Vergi öncesi kâr", value: result.preTaxProfit, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "breakeven", label: "Başabaş satış adedi", value: result.breakevenUnits, format: "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Gelir tarafı", rows: [
        ["Liste fiyatı toplamı", result.listRevenue], ["Ortalama indirim", -result.discountAmount], ["İndirim sonrası brüt satış", result.grossRevenue], ["Müşteri ödemesi", result.customerPayment],
      ] },
      { title: "B · Vergi / kesinti / komisyon", rows: [
        ["KDV ayrımı", -result.taxAmount], ["İade edilen satış", -result.lostSalesAmount], ["Pazaryeri komisyonu", -result.marketplaceCommission], ["Ödeme komisyonu", -result.paymentCommission], ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "C · Değişken maliyet", rows: [
        ["Satılan ürün maliyeti", -result.productCost], ["Gidiş kargo", -result.outboundShippingCost], ["Paketleme", -result.packagingCost], ["İade kargo", -result.returnShippingCost], ["Fulfillment", -result.fulfillmentCost], ["Diğer değişken", -result.otherVariableCost], ["Ürün ve lojistik sonrası katkı", result.contribution],
      ] },
      { title: "D · Sabit gider", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]), ["Toplam reklam + sabit gider", -result.totalFixedCosts],
      ] },
      { title: "E · Paydaş / ortak", rows: [["Ortak / yatırımcı kâr payı", -result.partnerPayout]] },
      { title: "F · Kâr-zarar", rows: [["Reklam sonrası kâr", result.profitAfterAdvertising], ["Vergi öncesi kâr", result.preTaxProfit], ["Net kâr", result.netProfit]] },
      { title: "G · Vergi ön tahmini", rows: [["Örnek vergi ön tahmini", -result.estimatedTax], ["Kullanılan oran", result.input.estimatedTaxRate, "percent"]] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount], ["Hibe / destek (ayrı)", result.input.supportAmount], ["İlk stok dahil kurulum", -result.totalSetupCost], ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit], ["Ürün başı net kâr", result.unitNetProfit], ["Stok nakit ihtiyacı", result.stockCashNeed], ["Kurulum geri dönüş süresi", result.paybackMonths, "months"], ["En büyük gider", result.largestExpense.amount],
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

function formatRate(value) {
  return `${round((Number(value) || 0) * 100, 1)}%`;
}

function formatMoneyPlain(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("tr-TR")} TL`;
}
