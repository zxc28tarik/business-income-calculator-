const fixedLabels = {
  staffCost: "Personel sabit maliyeti",
  rent: "Kira",
  utilities: "Faturalar",
  accounting: "Muhasebe",
  software: "Randevu / yazılım",
  monthlyAdSpend: "Aylık reklam",
  maintenance: "Bakım / servis",
  insurance: "Sigorta",
  otherFixedExpenses: "Diğer sabit gider",
  monthlyDepreciation: "Cihaz amortismanı",
};

const setupLabels = {
  renovation: "Tadilat",
  deviceInvestment: "Cihaz / ekipman yatırımı",
  furniture: "Mobilya / dekorasyon",
  deposit: "Depozito",
  licenseFees: "Ruhsat / izin",
  openingMarketing: "Açılış reklamı",
  initialConsumables: "İlk sarf stoku",
  softwareSetup: "Yazılım kurulumu",
};

export function buildBeautyPresentation(result) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "session_profit", label: "Seans başı net kâr", value: result.unitNetProfit, format: "money", note: `${round(result.completedSessions, 0)} tamamlanan seans`, negative: result.unitNetProfit < 0 },
      { id: "breakeven_appointments", label: "Günlük başabaş randevu", value: result.breakevenDailyAppointments, format: "numberSuffix", suffix: " randevu", note: result.breakevenOccupancyRate == null ? "Başabaş bulunamadı" : `${formatRate(result.breakevenOccupancyRate)} doluluk` },
      { id: "occupancy", label: "Doluluk oranı", value: result.input.occupancyRate, format: "percent", note: `Günlük kapasite: ${round(result.dailyCapacity, 1)}`, negative: result.input.occupancyRate < 0.50 },
      { id: "revenue_per_employee", label: "Personel başı ciro", value: result.revenuePerEmployee, format: "money", note: `${result.input.staffCount} aktif çalışan` },
      { id: "device_payback", label: "Cihaz geri dönüşü", value: result.devicePaybackMonths, format: "months", note: "Net kâr + amortisman yaklaşımı" },
      { id: "no_show_loss", label: "Boş randevu kaybı", value: result.noShowRevenueLoss, format: "money", note: `${formatRate(result.input.noShowRate)} no-show`, negative: result.input.noShowRate > 0.08 },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "staff_cost", label: "Personel maliyet yükü", value: result.staffCostRatio, format: "percent", note: "Sabit personel + prim / net hizmet geliri", negative: result.staffCostRatio > 0.45 },
    ],
    keySplit: [
      { label: "Planlanan randevu değeri", value: result.potentialServiceRevenue },
      { label: "No-show / iptal kaybı", value: -result.noShowRevenueLoss },
      { label: "Gerçekleşen müşteri ödemesi", value: result.customerPayment },
      { label: "KDV ve POS sonrası hizmet geliri", value: result.revenueAfterCommission },
      { label: "Sarf ve çalışan primi sonrası katkı", value: result.contribution },
      { label: "Sabit gider ve amortisman sonrası", value: result.preTaxProfit + result.totalStakeholderPayouts },
      { label: "Ortak / yatırımcı payı", value: -result.totalStakeholderPayouts },
      { label: "Vergi öncesi kâr", value: result.preTaxProfit },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "potential_revenue", label: "Planlanan randevu değeri", value: result.potentialServiceRevenue, format: "money" },
      { id: "completed_sessions", label: "Tamamlanan seans", value: result.completedSessions, format: "number" },
      { id: "no_show_loss", label: "Boş randevu kaybı", value: result.noShowRevenueLoss, format: "money" },
      { id: "pre_tax_profit", label: "Vergi öncesi kâr", value: result.preTaxProfit, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "breakeven", label: "Günlük başabaş randevu", value: result.breakevenDailyAppointments, format: "number" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Gelir tarafı", rows: [
        ["Günlük teorik kapasite", result.dailyCapacity, "number"], ["Aylık randevu kapasitesi", result.monthlyCapacity, "number"],
        ["Planlanan randevu", result.bookedAppointments, "number"], ["No-show / iptal", -result.noShowAppointments, "number"],
        ["Tamamlanan seans", result.completedSessions, "number"], ["Planlanan randevu değeri", result.potentialServiceRevenue],
        ["Boş randevu gelir kaybı", -result.noShowRevenueLoss], ["Gerçekleşen brüt hizmet geliri", result.actualGrossRevenue],
      ] },
      { title: "B · Vergi / kesinti / komisyon", rows: [
        ["KDV ayrımı", -result.taxAmount], ["KDV hariç gerçekleşen hizmet geliri", result.adjustedRevenue],
        ["POS / ödeme komisyonu", -result.paymentCommission], ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "C · Değişken maliyet", rows: [
        ["Seans sarf malzemesi", -result.consumableCost], ["Çalışan primi", -result.employeeCommission],
        ["Diğer değişken maliyet", -result.otherVariableCost], ["Katkı", result.contribution],
      ] },
      { title: "D · Sabit gider", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
        ["Toplam sabit gider + amortisman", -result.totalFixedCosts], ["Nakit sabit gider", -result.cashFixedCosts],
      ] },
      { title: "E · Paydaş / ortak", rows: [["Ortak / yatırımcı kâr payı", -result.partnerPayout]] },
      { title: "F · Kâr-zarar", rows: [
        ["Vergi öncesi kâr", result.preTaxProfit], ["Aylık amortisman (nakit dışı)", -result.monthlyDepreciation],
        ["Operasyonel nakit kâr yaklaşımı", result.operatingCashProfit], ["Net kâr", result.netProfit],
      ] },
      { title: "G · Vergi ön tahmini", rows: [["Örnek vergi ön tahmini", -result.estimatedTax], ["Kullanılan oran", result.input.estimatedTaxRate, "percent"]] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
        ["Hibe / destek (ayrı)", result.input.supportAmount], ["Kurulum maliyeti", -result.totalSetupCost],
        ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit],
        ["Seans başı net kâr", result.unitNetProfit], ["Personel başı ciro", result.revenuePerEmployee],
        ["Cihaz geri dönüş süresi", result.devicePaybackMonths, "months"], ["Toplam kurulum geri dönüşü", result.paybackMonths, "months"],
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

function formatRate(value) {
  return `${round((Number(value) || 0) * 100, 1)}%`;
}

function formatMoneyPlain(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("tr-TR")} TL`;
}
