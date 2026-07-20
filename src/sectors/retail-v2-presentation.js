import { buildRetailPresentation as buildLegacyPresentation } from "./retail-presentation.js";

const driverLabels = {
  traffic_conversion: "Mağaza trafiği × dönüşüm",
  customer_frequency: "Aktif müşteri × alışveriş sıklığı",
  orders_events: "Standart sipariş + etkinlik siparişi",
  hourly_transactions: "Saatlik kasa işlemi × açık saat",
};

export const RETAIL_CASH_FLOW_COLUMNS = [
  { key: "month", label: "Ay", format: "number" },
  { key: "dailyTransactions", label: "Günlük işlem", format: "number" },
  { key: "grossRevenue", label: "Brüt satış", format: "money" },
  { key: "collections", label: "Tahsilat", format: "money" },
  { key: "productCost", label: "Ürün maliyeti", format: "money" },
  { key: "variableCostsPaid", label: "Değişken ödeme", format: "money" },
  { key: "fixedCosts", label: "Sabit gider", format: "money" },
  { key: "cashEnd", label: "Kümülatif nakit", format: "money" },
];

export function buildRetailPresentation(result) {
  const base = buildLegacyPresentation(result);
  const profileKpis = [
    { id: "profile_driver", label: "Satış sürücüsü", value: result.demand.dailyTransactions, format: "numberSuffix", suffix: " işlem/gün", note: driverLabels[result.profile.driver] || "Günlük işlem" },
    { id: "capacity_load", label: "Mağaza kapasite yükü", value: result.salesCapacityLoad, format: "percent", note: `Kapasite: ${round(result.input.storeDailyCapacity, 0)} işlem/gün`, negative: result.salesCapacityLoad > 1 },
    { id: "stock_days", label: "Stok kapsamı", value: result.stockCoverageDays, format: "numberSuffix", suffix: " gün", note: `Hedef: ${round(result.input.targetStockCoverageDays, 0)} gün`, negative: result.inventoryPlanningEnabled && result.stockCoverageDays < result.supplierMetrics.leadTimeDays + result.input.safetyStockDays },
    { id: "working_capital", label: "Stok işletme sermayesi açığı", value: result.workingCapitalGap, format: "money", note: `Hedef stok: ${formatMoneyPlain(result.targetInventoryCost)}`, negative: result.workingCapitalGap > 0 },
    { id: "supplier_terms", label: "Tedarikçi vadesi", value: result.supplierMetrics.paymentDelayDays, format: "numberSuffix", suffix: " gün", note: `Teslim: ${round(result.supplierMetrics.leadTimeDays, 0)} gün` },
  ];

  const kpis = [
    ...base.kpis.slice(0, 2),
    ...profileKpis,
    ...base.kpis.slice(2),
  ];

  const breakdown = [
    { title: "Profil · Talep ve mağaza kapasitesi", rows: [
      ["İş türü", result.profile.label, "text"],
      ["Satış sürücüsü", driverLabels[result.profile.driver] || result.profile.driver, "text"],
      ["Günlük işlem", result.demand.dailyTransactions, "number"],
      ["Aylık işlem", result.demand.monthlyTransactions, "number"],
      ["İşlem kapasite yükü", result.salesCapacityLoad, "percent"],
    ] },
    { title: "Profil · Ürün, iskonto ve fire", rows: [
      ["Ortalama liste fiyatı", result.productMetrics.salePrice],
      ["İskontolu satış payı", result.productMetrics.markdownShareRate, "percent"],
      ["Ortalama iskonto", result.productMetrics.markdownDiscountRate, "percent"],
      ["Ürün maliyeti / birim", result.input.averageUnitCost],
      ["Tedarikçi indirim tasarrufu", result.purchaseDiscountSavings],
      ["Bozulma / son kullanma fire oranı", result.productMetrics.spoilageRate, "percent"],
    ] },
    { title: "Profil · Tedarikçi ve işletme sermayesi", rows: [
      ["Tedarikçi vadesi", result.supplierMetrics.paymentDelayDays, "number"],
      ["Tedarik süresi", result.supplierMetrics.leadTimeDays, "number"],
      ["Ortalama alım indirimi", result.supplierMetrics.discountRate, "percent"],
      ["Mevcut / açılış stok maliyeti", result.inventoryCapital],
      ["Hedef stok maliyeti", result.targetInventoryCost],
      ["İşletme sermayesi açığı", result.workingCapitalGap],
      ["Fazla stok maliyeti", result.excessInventoryCost],
      ["Yeniden sipariş noktası", result.reorderPointCost],
    ] },
    ...base.breakdown.map((section) => ({
      ...section,
      rows: section.rows.map((row) => row[0] === "monthlyDepreciation" ? ["Aylık amortisman", row[1], row[2]] : row),
    })),
  ];

  return {
    ...base,
    kpis,
    breakdown,
    scenarioMetrics: [
      { id: "daily_transactions", label: "Günlük işlem", value: result.demand.dailyTransactions, format: "number" },
      { id: "gross_revenue", label: "Brüt satış", value: result.grossRevenue, format: "money" },
      { id: "contribution", label: "Katkı", value: result.contribution, format: "money" },
      { id: "stock_turnover", label: "Stok devir hızı", value: result.annualStockTurnover, format: "number" },
      { id: "working_capital", label: "İşletme sermayesi açığı", value: result.workingCapitalGap, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
    ],
  };
}

function round(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const power = 10 ** digits;
  return Math.round((number + Number.EPSILON) * power) / power;
}
function formatMoneyPlain(value) { return `${Math.round(Number(value) || 0).toLocaleString("tr-TR")} TL`; }
