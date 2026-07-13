import { percent } from "../core/finance-engine.js";

const fixedLabels = {
  rent: "Kira",
  staffCost: "Personel",
  utilities: "Faturalar",
  accounting: "Muhasebe",
  software: "Yazılım",
  cleaning: "Temizlik",
  maintenance: "Bakım",
  insurance: "Sigorta",
  otherFixedExpenses: "Diğer sabit gider",
};

const setupLabels = {
  renovation: "Tadilat",
  equipment: "Ekipman",
  furniture: "Mobilya",
  deposit: "Depozito",
  initialStock: "İlk stok",
  licenseFees: "Ruhsat / izin",
  openingMarketing: "Açılış reklamı",
  softwareSetup: "Yazılım kurulumu",
};

export function buildCafePresentation(result) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "gross_profit", label: "Aylık brüt katkı", value: result.contribution, format: "money", note: `${formatRate(percent(result.contribution, result.netSalesBeforeLoss))} net satış` },
      { id: "breakeven_units", label: "Günlük başabaş", value: result.breakevenDailyCustomers, format: "numberSuffix", suffix: " müşteri", note: `Kapasite: ${round(result.input.serviceCapacity, 1)}` },
      { id: "breakeven_revenue", label: "Başabaş ciro", value: result.breakevenRevenue, format: "money", note: "Aylık brüt ciro" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "setup_cost", label: "Kurulum maliyeti", value: result.totalSetupCost, format: "money", note: result.paybackMonths ? `${round(result.paybackMonths, 1)} ay tahmini geri dönüş` : "Geri dönüş oluşmuyor" },
      { id: "unit_profit", label: "Müşteri başı net kâr", value: result.unitNetProfit, format: "money", note: "Aylık müşteri adedine göre", negative: result.unitNetProfit < 0 },
      { id: "rent_ratio", label: "Kira / ciro", value: result.rentToRevenue, format: "percent", note: "Net satış tabanına göre", negative: result.rentToRevenue > 0.20 },
      { id: "food_cost", label: "Malzeme + fire", value: result.foodCostRate, format: "percent", note: "Düzeltilmiş net satışa göre", negative: result.foodCostRate > 0.40 },
    ],
    keySplit: [
      { label: "Brüt müşteri harcaması", value: result.customerPayment },
      { label: "KDV ayrımı sonrası net satış", value: result.netSalesBeforeLoss },
      { label: "Platform ve POS sonrası tahsilat tabanı", value: result.revenueAfterCommission },
      { label: "Malzeme / fire sonrası katkı", value: result.contribution },
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
      { id: "breakeven", label: "Günlük başabaş", value: result.breakevenDailyCustomers, format: "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Gelir tarafı", rows: [
        ["Brüt ciro", result.grossRevenue], ["Müşteri ödemesi", result.customerPayment], ["KDV hariç satış", result.netSalesBeforeLoss], ["İptal / kayıp", -result.lostSalesAmount],
      ] },
      { title: "B · Vergi / kesinti / komisyon", rows: [
        ["KDV ayrımı", -result.taxAmount], ["Paket servis komisyonu", -result.deliveryCommission], ["POS komisyonu", -result.posCommission], ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "C · Değişken maliyet", rows: [
        ["Malzeme", -result.materialCost], ["Fire", -result.wasteCost], ["Paketleme", -result.packagingCost], ["Diğer değişken", -result.otherVariableCost], ["Katkı", result.contribution],
      ] },
      { title: "D · Sabit gider", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]), ["Toplam sabit gider", -result.totalFixedCosts],
      ] },
      { title: "E · Paydaş / ortak / franchise", rows: [
        ["Franchise payı", -result.franchiseRoyalty], ["Ortak kâr payı", -result.partnerPayout], ["Toplam paydaş", -result.totalStakeholderPayouts],
      ] },
      { title: "F · Kâr-zarar", rows: [["Vergi öncesi kâr", result.preTaxProfit], ["Net kâr", result.netProfit]] },
      { title: "G · Vergi ön tahmini", rows: [["Örnek vergi ön tahmini", -result.estimatedTax], ["Kullanılan oran", result.input.estimatedTaxRate, "percent"]] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount], ["Hibe / destek (ayrı)", result.input.supportAmount], ["Kurulum maliyeti", -result.totalSetupCost], ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit], ["Kurulum geri dönüş süresi", result.paybackMonths, "months"], ["En büyük gider", result.largestExpense.amount],
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
