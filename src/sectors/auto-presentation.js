const fixedLabels = {
  staffCost: "Personel",
  rent: "Kira",
  baseUtilities: "Sabit faturalar",
  accounting: "Muhasebe",
  software: "Randevu / servis yazılımı",
  monthlyMarketing: "Aylık reklam",
  maintenance: "Ekipman bakım / servis",
  insurance: "Sigorta",
  wasteDisposal: "Atık / çevre gideri",
  otherFixedExpenses: "Diğer sabit gider",
  monthlyDepreciation: "Ekipman amortismanı",
};

const setupLabels = {
  renovation: "Tadilat / altyapı",
  equipmentInvestment: "Makine / lift / ekipman",
  deposit: "Depozito",
  licenseFees: "Ruhsat / izin",
  openingMarketing: "Açılış reklamı",
  signage: "Tabela",
  initialConsumables: "İlk sarf / parça stoku",
  softwareSetup: "Yazılım kurulumu",
};

export function buildAutoServicePresentation(result) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "vehicle_profit", label: "Araç başı net kâr", value: result.unitNetProfit, format: "money", note: `${round(result.monthlyVehicles, 0)} araç / ay`, negative: result.unitNetProfit < 0 },
      { id: "breakeven_vehicles", label: "Günlük başabaş araç", value: result.breakevenDailyVehicles, format: "numberSuffix", suffix: " araç", note: result.breakevenCapacityUtilization == null ? "Başabaş bulunamadı" : `${formatRate(result.breakevenCapacityUtilization)} kapasite` },
      { id: "capacity", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent", note: `Günlük kapasite: ${round(result.dailyCapacity, 1)} araç`, negative: result.capacityUtilization > 1 },
      { id: "equipment_payback", label: "Ekipman geri dönüşü", value: result.equipmentPaybackMonths, format: "months", note: "Net kâr + amortisman yaklaşımı" },
      { id: "contribution_vehicle", label: "Araç başı katkı", value: result.contributionPerVehicle, format: "money", note: "Komisyon ve değişken gider sonrası" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "staff_cost", label: "Personel maliyet yükü", value: result.staffCostRatio, format: "percent", note: "Personel / KDV sonrası gelir", negative: result.staffCostRatio > 0.42 },
      { id: "rent_ratio", label: "Kira / gelir", value: result.rentToRevenue, format: "percent", note: "Kira / KDV sonrası gelir", negative: result.rentToRevenue > 0.14 },
    ],
    keySplit: [
      { label: "Brüt hizmet geliri", value: result.serviceGrossRevenue },
      { label: "Brüt parça / ürün geliri", value: result.partsGrossRevenue },
      { label: "KDV ve POS sonrası gelir", value: result.revenueAfterCommission },
      { label: "Sarf, enerji ve parça sonrası katkı", value: result.contribution },
      { label: "Sabit gider ve amortisman sonrası", value: result.preTaxProfit + result.totalStakeholderPayouts },
      { label: "Ortak / yatırımcı payı", value: -result.totalStakeholderPayouts },
      { label: "Vergi öncesi kâr", value: result.preTaxProfit },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "vehicles", label: "Aylık araç", value: result.monthlyVehicles, format: "number" },
      { id: "gross_revenue", label: "Brüt gelir", value: result.grossRevenue, format: "money" },
      { id: "contribution", label: "Katkı", value: result.contribution, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "breakeven", label: "Günlük başabaş araç", value: result.breakevenDailyVehicles, format: "number" },
      { id: "capacity", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Araç ve kapasite", rows: [
        ["Günlük araç", result.input.dailyVehicles, "number"], ["Aylık araç", result.monthlyVehicles, "number"],
        ["Günlük teorik kapasite", result.dailyCapacity, "number"], ["Aylık teorik kapasite", result.monthlyCapacity, "number"],
        ["Kapasite kullanımı", result.capacityUtilization, "percent"], ["Araç başı ortalama hizmet fiyatı", result.input.averageServicePrice],
      ] },
      { title: "B · Gelir, vergi ve ödeme", rows: [
        ["Brüt hizmet geliri", result.serviceGrossRevenue], ["Brüt parça / ürün geliri", result.partsGrossRevenue],
        ["Toplam brüt gelir", result.grossRevenue], ["KDV ayrımı", -result.taxAmount],
        ["KDV sonrası gelir", result.adjustedRevenue], ["POS komisyonu", -result.posCommission],
        ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "C · Değişken maliyet", rows: [
        ["Sarf malzeme", -result.consumableCost], ["Araç başı su / elektrik", -result.waterElectricityVariableCost],
        ["Parça / ürün maliyeti", -result.partsCost], ["Diğer değişken gider", -result.otherVariableCost],
        ["Toplam değişken maliyet", -result.totalVariableCosts], ["Katkı", result.contribution],
        ["Araç başı katkı", result.contributionPerVehicle],
      ] },
      { title: "D · Sabit gider ve amortisman", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
        ["Toplam sabit gider + amortisman", -result.totalFixedCosts], ["Nakit sabit gider", -result.cashFixedCosts],
      ] },
      { title: "E · Paydaş / ortak", rows: [["Ortak / yatırımcı kâr payı", -result.partnerPayout]] },
      { title: "F · Kâr-zarar", rows: [
        ["Vergi öncesi kâr", result.preTaxProfit], ["Vergi ön tahmini", -result.estimatedTax],
        ["Aylık net kâr", result.netProfit], ["Aylık amortisman (nakit dışı)", -result.monthlyDepreciation],
        ["Operasyonel nakit kâr yaklaşımı", result.operatingCashProfit], ["Yıllık tahmini net kâr", result.annualNetProfit],
      ] },
      { title: "G · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
        ["Hibe / destek (ayrı)", result.input.supportAmount], ["Toplam kurulum maliyeti", -result.totalSetupCost],
        ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "H · Nihai sonuç", rows: [
        ["Aylık net kâr", result.netProfit], ["Araç başı net kâr", result.unitNetProfit],
        ["Günlük başabaş araç", result.breakevenDailyVehicles, "number"], ["Başabaş ciro", result.breakevenRevenue],
        ["Ekipman geri dönüşü", result.equipmentPaybackMonths, "months"], ["Toplam kurulum geri dönüşü", result.paybackMonths, "months"],
        ["En büyük gider", result.largestExpense.amount],
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
