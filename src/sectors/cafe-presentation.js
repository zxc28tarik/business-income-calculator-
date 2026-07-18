import { percent } from "../core/finance-engine.js";
import { buildCafeProfileKpis } from "./cafe-business-profile-engine.js";

const fixedLabels = {
  rent: "Kira", staffCost: "Personel", utilities: "Faturalar", accounting: "Muhasebe",
  software: "Yazılım", cleaning: "Temizlik", maintenance: "Bakım", insurance: "Sigorta",
  otherFixedExpenses: "Diğer sabit gider",
};
const setupLabels = {
  renovation: "Tadilat", equipment: "Ekipman", furniture: "Mobilya", deposit: "Depozito",
  initialStock: "İlk stok", licenseFees: "Ruhsat / izin", openingMarketing: "Açılış reklamı",
  softwareSetup: "Yazılım kurulumu",
};

function breakevenFormat(result) {
  return result.profile?.driver === "seat_turnover" ? "percent" : "number";
}

export function buildCafePresentation(result) {
  const profileKpis = buildCafeProfileKpis(result);
  const channelRows = result.input.advancedChannelMixEnabled
    ? result.channelRows.flatMap((row) => [
      [`${row.name} sipariş`, row.orders, "number"],
      [`${row.name} net gelir`, row.netRevenue],
      [`${row.name} komisyon`, -row.commission],
      [`${row.name} paketleme`, -row.packaging],
    ])
    : [["Paket servis geliri", result.deliveryRevenue], ["Paket servis siparişi", result.deliveryOrders, "number"]];
  const productRows = result.input.advancedProductMixEnabled
    ? result.productRows.flatMap((row) => [
      [`${row.name} gelir`, row.revenue],
      [`${row.name} malzeme`, -row.materialCost],
      [`${row.name} fire`, -row.wasteCost],
    ])
    : [["Malzeme", -result.materialCost], ["Fire", -result.wasteCost]];

  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "gross_profit", label: "Aylık brüt katkı", value: result.contribution, format: "money", note: `${formatRate(percent(result.contribution, result.netSalesBeforeLoss))} net satış` },
      { id: "breakeven_driver", label: `${result.breakevenDriverLabel} başabaş`, value: result.breakevenDriverValue, format: breakevenFormat(result), note: `Günlük karşılığı: ${round(result.breakevenDailyCustomers, 1)}` },
      { id: "breakeven_revenue", label: "Başabaş ciro", value: result.breakevenRevenue, format: "money", note: "Aylık brüt ciro" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "setup_cost", label: "Kurulum maliyeti", value: result.totalSetupCost, format: "money", note: result.paybackMonths ? `${round(result.paybackMonths, 1)} ay tahmini geri dönüş` : "Geri dönüş oluşmuyor" },
      { id: "unit_profit", label: "Sipariş / müşteri başı net", value: result.unitNetProfit, format: "money", note: "Aylık işlem adedine göre", negative: result.unitNetProfit < 0 },
      { id: "rent_ratio", label: "Kira / ciro", value: result.rentToRevenue, format: "percent", note: "Net satış tabanına göre", negative: result.rentToRevenue > 0.20 },
      { id: "food_cost", label: "Malzeme + fire", value: result.foodCostRate, format: "percent", note: "Düzeltilmiş net satışa göre", negative: result.foodCostRate > 0.40 },
      ...profileKpis,
    ],
    keySplit: [
      { label: "Brüt müşteri harcaması", value: result.customerPayment },
      { label: "KDV ayrımı sonrası net satış", value: result.netSalesBeforeLoss },
      { label: "Kanal ve POS sonrası tahsilat tabanı", value: result.revenueAfterCommission },
      { label: "Ürün karması sonrası katkı", value: result.contribution },
      { label: "P&L hibe / destek geliri", value: result.operatingGrantIncome },
      { label: "Franchise / ortak payı", value: result.totalStakeholderPayouts },
      { label: "Vergi öncesi işletme kârı", value: result.preTaxProfit },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "gross_revenue", label: "Brüt ciro", value: result.grossRevenue, format: "money" },
      { id: "net_collections", label: "Net tahsilat", value: result.revenueAfterCommission, format: "money" },
      { id: "total_expense", label: "Toplam gider", value: result.totalVariableCosts + result.totalFixedCosts + result.totalStakeholderPayouts + result.estimatedTax, format: "money" },
      { id: "pre_tax_profit", label: "Vergi öncesi kâr", value: result.preTaxProfit, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "breakeven", label: "Başabaş sürücüsü", value: result.breakevenDriverValue, format: breakevenFormat(result) },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · İş türü ve talep", rows: [
        ["İş türü", result.profile.label, "text"],
        [result.profileMetrics.driverLabel, result.profileMetrics.driverValue, result.profile.driver === "seat_turnover" ? "percent" : "number"],
        ["Günlük işlem / müşteri", result.profileMetrics.dailyCustomers, "number"],
        ["Aylık işlem / müşteri", result.monthlyCustomers, "number"],
        ["Kapasite kullanımı", result.capacityUtilization, "percent"],
      ] },
      { title: "B · Gelir tarafı", rows: [
        ["Brüt ciro", result.grossRevenue], ["Müşteri ödemesi", result.customerPayment],
        ["KDV hariç satış", result.netSalesBeforeLoss], ["İptal / kayıp", -result.lostSalesAmount],
      ] },
      { title: "C · Satış kanalları ve komisyon", rows: [
        ...channelRows,
        ["POS komisyonu", -result.posCommission],
        ["Toplam komisyon", -result.totalCommissions],
        ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "D · Ürün karması ve değişken maliyet", rows: [
        ...productRows,
        ["Paketleme", -result.packagingCost], ["Diğer değişken", -result.otherVariableCost],
        ["Toplam değişken maliyet", -result.totalVariableCosts], ["Katkı", result.contribution],
      ] },
      { title: "E · Sabit gider ve amortisman", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
        ["Aylık amortisman (nakit dışı)", -result.monthlyDepreciation],
        ["Toplam P&L sabit gider", -result.totalFixedCosts],
        ["Nakit sabit gider", -result.cashFixedCosts],
      ] },
      { title: "F · Paydaş / ortak / franchise", rows: [
        ["Franchise payı", -result.franchiseRoyalty], ["Ortak kâr payı", -result.partnerPayout],
        ["Toplam paydaş", -result.totalStakeholderPayouts],
      ] },
      { title: "G · Kâr-zarar ve vergi", rows: [
        ["P&L hibe / destek geliri", result.operatingGrantIncome],
        ["Vergi öncesi kâr", result.preTaxProfit], ["Vergi ön tahmini", -result.estimatedTax],
        ["Kullanılan oran", result.input.estimatedTaxRate, "percent"], ["Net kâr", result.netProfit],
      ] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
        ["Hibe / destek nakit girişi", result.input.supportAmount], ["Kurulum maliyeti", -result.totalSetupCost],
        ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit],
        ["Kurulum geri dönüş süresi", result.paybackMonths, "months"], ["En büyük gider", result.largestExpense.amount],
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
