import { buildEcommerceProfileKpis } from "./ecommerce-business-profile-engine.js";

const fixedLabels = {
  monthlyAdSpend: "Aylık reklam", rent: "Kira / ofis", warehouseCost: "Depo",
  staffCost: "Personel", software: "Yazılım", accounting: "Muhasebe",
  utilities: "Faturalar", insurance: "Sigorta", otherFixedExpenses: "Diğer sabit gider",
};

const setupLabels = {
  initialStockInvestment: "İlk stok yatırımı", storeSetup: "Mağaza / site kurulumu",
  equipment: "Ekipman", deposit: "Depozito", legalFees: "Şirket / izin",
  launchMarketing: "Açılış reklamı", otherSetupCosts: "Diğer kurulum",
};

export function buildEcommercePresentation(result) {
  const profileKpis = buildEcommerceProfileKpis(result);
  const breakdown = [
    { title: "A · İş türü ve talep", rows: [
      ["İş türü", result.profile.label, "text"],
      [result.profileMetrics.driverLabel, result.profileMetrics.driverValue, ["traffic_conversion", "lead_conversion", "production_capacity"].includes(result.profile.driver) ? "percent" : "number"],
      ["Tahmini aylık sipariş", result.profileMetrics.orders, "number"],
      ["Tahmini aylık ürün", result.profileMetrics.unitsSold, "number"],
      ["Kapasite kullanımı", result.capacityUtilization, "percent"],
    ] },
    { title: "B · Gelir tarafı", rows: [
      ["Liste fiyatı toplamı", result.listRevenue], ["Ortalama indirim", -result.discountAmount],
      ["İndirim sonrası brüt satış", result.grossRevenue], ["Müşteri ödemesi", result.customerPayment],
    ] },
    { title: "C · Vergi / iade / kesinti", rows: [
      ["KDV ayrımı", -result.taxAmount], ["İade edilen satış", -result.lostSalesAmount],
      ["Tedarikçi kalite kaybı", -result.supplierQualityLossAmount],
      ["Kanal komisyonları", -result.marketplaceCommission], ["Ödeme kesintileri", -result.paymentCommission],
      ["Komisyon sonrası gelir", result.revenueAfterCommission],
    ] },
    { title: "D · Ürün, stok ve lojistik", rows: [
      ["Satılan ürün maliyeti", -result.productCost], ["Birim emek maliyeti toplamı", -result.laborCost],
      ["Gidiş kargo", -result.outboundShippingCost], ["Paketleme", -result.packagingCost],
      ["İade kargo", -result.returnShippingCost], ["Fulfillment", -result.fulfillmentCost],
      ["Sınır ötesi ek maliyet", -result.crossBorderCost], ["Stok kayıp / fire", -result.shrinkageCost],
      ["Yavaş / değersiz stok", -result.deadStockCost], ["Diğer değişken", -result.otherVariableCost],
      ["Ürün ve lojistik sonrası katkı", result.contribution],
    ] },
    { title: "E · Reklam ve sabit gider", rows: [
      ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
      ["Aylık amortisman", -result.monthlyDepreciation], ["Toplam P&L sabit gider", -result.totalFixedCosts],
    ] },
    { title: "F · Paydaş / hibe / kâr-zarar", rows: [
      ["Aylık P&L hibe geliri", result.operatingGrantIncome], ["Ortak / yatırımcı kâr payı", -result.partnerPayout],
      ["Vergi öncesi kâr", result.preTaxProfit], ["Örnek vergi ön tahmini", -result.estimatedTax], ["Net kâr", result.netProfit],
    ] },
    { title: "G · Stok ve işletme sermayesi", rows: [
      ["Stok çalışma sermayesi ihtiyacı", result.inventoryWorkingCapitalNeed],
      ["Yeniden sipariş noktası", result.reorderPointUnits, "number"],
      ["Mevcut stok kapsamı", result.inventoryCoverageDays, "numberSuffix"],
      ["Stok nakit ihtiyacı", result.stockCashNeed],
      ["Yıllık stok devir hızı", result.inventoryTurnover, "multiple"],
    ] },
    { title: "H · Nakit akışı", rows: [
      ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
      ["Hibe / destek nakit girişi", result.input.supportAmount], ["İlk stok dahil kurulum", -result.totalSetupCost],
      ["Ağırlıklı tahsilat vadesi", result.effectiveCollectionDelayDays, "numberSuffix"],
      ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
    ] },
    { title: "I · Nihai sonuç", rows: [
      ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit],
      ["Ürün başı net kâr", result.unitNetProfit], ["Reklam ROAS", result.roas, "multiple"],
      ["Reklam edinme maliyeti", result.cac], ["Kurulum geri dönüş süresi", result.paybackMonths, "months"],
      ["En büyük gider", result.largestExpense.amount],
    ] },
    { title: "Kurulum kalemleri", rows: Object.entries(result.setupCostItems).map(([key, value]) => [setupLabels[key] || key, -value]) },
  ];

  if (result.channelRows.length) {
    breakdown.push({ title: "Satış kanalı denetimi", rows: result.channelRows.flatMap((row) => [
      [`${row.name} · net gelir`, row.netRevenue],
      [`${row.name} · komisyon + ödeme`, -(row.channelCommission + row.paymentFee)],
      [`${row.name} · tahsilat günü`, row.collectionDelayDays, "number"],
    ]) });
  }
  if (result.productRows.length) {
    breakdown.push({ title: "Ürün karması denetimi", rows: result.productRows.flatMap((row) => [
      [`${row.name} · adet`, row.units, "number"], [`${row.name} · liste cirosu`, row.listRevenue],
      [`${row.name} · ürün maliyeti`, -row.productCost], [`${row.name} · iade`, row.refundRate, "percent"],
    ]) });
  }
  if (result.adRows.length) {
    breakdown.push({ title: "Reklam kanalı denetimi", rows: result.adRows.flatMap((row) => [
      [`${row.name} · harcama`, -row.spend], [`${row.name} · atfedilen sipariş`, row.attributedOrders, "number"],
      [`${row.name} · atfedilen ciro`, row.attributedRevenue],
    ]) });
  }

  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "unit_profit", label: "Ürün başı net kâr", value: result.unitNetProfit, format: "money", note: `${round(result.fulfilledUnits, 0)} net satış adedi`, negative: result.unitNetProfit < 0 },
      ...profileKpis,
      { id: "gross_margin", label: "Brüt kâr marjı", value: result.grossMargin, format: "percent", note: "Kanal sonrası gelirden ürün ve emek maliyeti" },
      { id: "breakeven_units", label: `${result.breakevenDriverLabel} başabaş`, value: result.breakevenDriverValue, format: ["traffic_conversion", "lead_conversion", "production_capacity"].includes(result.profile.driver) ? "percent" : "number", note: result.breakevenRevenue == null ? "Başabaş bulunamadı" : `${round(result.breakevenUnits, 0)} ürün · ${formatMoneyPlain(result.breakevenRevenue)}` },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "stock_need", label: "Stok nakit ihtiyacı", value: result.stockCashNeed, format: "money", note: `${round(result.input.stockCoverageMonths, 1)} aylık hedef kapsam` },
      { id: "commission_load", label: "Kanal kesinti yükü", value: result.commissionLoad, format: "percent", note: "İade sonrası satışa göre", negative: result.commissionLoad > 0.22 },
      { id: "roas", label: "Tahmini ROAS", value: result.roas, format: "multiple", note: result.cac > 0 ? `CAC: ${formatMoneyPlain(result.cac)}` : "Brüt veya atfedilen ciro / reklam" },
      { id: "refund_rate", label: "Ağırlıklı iade oranı", value: result.profileMetrics.unitsSold > 0 ? result.returnedUnits / result.profileMetrics.unitsSold : 0, format: "percent", note: `${round(result.returnedUnits, 0)} tahmini iade`, negative: result.returnedUnits / Math.max(result.profileMetrics.unitsSold, 1) > 0.15 },
    ],
    keySplit: [
      { label: "Brüt satış", value: result.customerPayment },
      { label: "İndirim ve KDV sonrası satış", value: result.netSalesBeforeLoss },
      { label: "İade / kalite kaybı sonrası satış", value: result.adjustedRevenue },
      { label: "Kanal / ödeme sonrası tahsilat", value: result.revenueAfterCommission },
      { label: "Ürün, stok ve lojistik sonrası katkı", value: result.contribution },
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
      { id: "breakeven", label: result.breakevenDriverLabel, value: result.breakevenDriverValue, format: ["traffic_conversion", "lead_conversion", "production_capacity"].includes(result.profile.driver) ? "percent" : "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown,
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
