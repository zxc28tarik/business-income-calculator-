const fixedLabels = {
  adminStaffCost: "İdari / satış personeli",
  officeRent: "Ofis / çalışma alanı",
  utilities: "Faturalar",
  accounting: "Muhasebe",
  softwareSubscriptions: "Yazılım / abonelikler",
  monthlyMarketing: "Satış / pazarlama",
  insurance: "Sigorta",
  otherFixedExpenses: "Diğer sabit gider",
};

const setupLabels = {
  hardwareInvestment: "Bilgisayar / ekipman",
  officeSetup: "Ofis kurulum ve mobilya",
  deposit: "Depozito",
  legalAndCompanySetup: "Şirket / hukuk / izin",
  websiteAndBranding: "Web sitesi / marka",
  initialMarketing: "İlk satış / pazarlama",
  softwareSetup: "Yazılım kurulumları",
};

export function buildAgencyPresentation(result) {
  return {
    kpis: [
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "project_profit", label: "Proje başı net kâr", value: result.projectNetProfit, format: "money", note: `${round(result.input.monthlyProjectCount, 1)} proje`, negative: result.projectNetProfit < 0 },
      { id: "hourly_profit", label: "Saatlik net kâr", value: result.hourlyNetProfit, format: "money", note: `${round(result.totalDeliveryHours, 0)} üretim + revizyon saati`, negative: result.hourlyNetProfit < 0 },
      { id: "capacity", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent", note: `Hedef: ${formatRate(result.input.targetUtilizationRate)}`, negative: result.capacityUtilization > 1 || result.capacityUtilization < 0.35 },
      { id: "revenue_per_employee", label: "Kişi başı ciro", value: result.revenuePerEmployee, format: "money", note: `${result.input.teamSize} kişilik üretim ekibi` },
      { id: "breakeven_projects", label: "Başabaş proje sayısı", value: result.breakevenProjectCount, format: "numberSuffix", suffix: " proje", note: result.breakevenCapacityUtilization == null ? "Başabaş bulunamadı" : `${formatRate(result.breakevenCapacityUtilization)} kapasite` },
      { id: "revision_cost", label: "Revizyon maliyeti", value: result.revisionCost, format: "money", note: `${round(result.revisionHours, 0)} revizyon saati`, negative: result.revisionCostRatio > 0.08 },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
      { id: "collection_delay", label: "Tahsilat gecikmesi", value: result.input.collectionDelayDays, format: "numberSuffix", suffix: " gün", note: `İlk negatif ay: ${result.cashFlow.firstNegativeMonth ?? "yok"}`, negative: result.input.collectionDelayDays > 30 },
    ],
    keySplit: [
      { label: "Brüt proje geliri", value: result.grossRevenue },
      { label: "KDV ve komisyon sonrası gelir", value: result.revenueAfterCommission },
      { label: "Baz ekip üretim maliyeti", value: -result.baseTeamCost },
      { label: "Revizyon maliyeti", value: -result.revisionCost },
      { label: "Freelancer / taşeron", value: -result.freelancerPayments },
      { label: "Üretim sonrası katkı", value: result.contribution },
      { label: "Sabit gider sonrası", value: result.preTaxProfit + result.totalStakeholderPayouts },
      { label: "Ortak / yatırımcı payı", value: -result.totalStakeholderPayouts },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "gross_revenue", label: "Brüt proje geliri", value: result.grossRevenue, format: "money" },
      { id: "projects", label: "Aylık proje", value: result.input.monthlyProjectCount, format: "number" },
      { id: "capacity", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent" },
      { id: "revision_cost", label: "Revizyon maliyeti", value: result.revisionCost, format: "money" },
      { id: "pre_tax_profit", label: "Vergi öncesi kâr", value: result.preTaxProfit, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Gelir ve proje yükü", rows: [
        ["Aylık proje sayısı", result.input.monthlyProjectCount, "number"], ["Ortalama proje bedeli", result.input.averageProjectFee],
        ["Brüt proje geliri", result.grossRevenue], ["Aktif müşteri", result.input.clientCount, "number"],
        ["En büyük müşteri ciro payı", result.input.largestClientRevenueShare, "percent"],
      ] },
      { title: "B · Vergi / platform / ödeme", rows: [
        ["KDV ayrımı", -result.taxAmount], ["KDV hariç proje geliri", result.adjustedRevenue],
        ["Aracı platform komisyonu", -result.platformCommission], ["Ödeme komisyonu", -result.paymentCommission],
        ["Komisyon sonrası gelir", result.revenueAfterCommission],
      ] },
      { title: "C · Kapasite ve üretim", rows: [
        ["Baz proje saati", result.baseProjectHours, "number"], ["Revizyon saati", result.revisionHours, "number"],
        ["Toplam teslimat saati", result.totalDeliveryHours, "number"], ["Teorik ekip kapasitesi", result.theoreticalCapacityHours, "number"],
        ["Hedef faturalandırılabilir kapasite", result.targetBillableCapacityHours, "number"], ["Gerçek kapasite kullanımı", result.capacityUtilization, "percent"],
        ["Gerçekleşen saatlik satış", result.effectiveHourlySales], ["Hedef saatlik satış", result.input.hourlySalesPrice],
      ] },
      { title: "D · Değişken maliyet", rows: [
        ["Baz ekip üretim maliyeti", -result.baseTeamCost], ["Revizyon maliyeti", -result.revisionCost],
        ["Freelancer / taşeron", -result.freelancerPayments], ["Diğer değişken maliyet", -result.otherVariableCost],
        ["Toplam değişken maliyet", -result.totalVariableCosts], ["Katkı", result.contribution],
      ] },
      { title: "E · Sabit gider", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
        ["Toplam sabit gider", -result.totalFixedCosts],
      ] },
      { title: "F · Paydaş / ortak", rows: [["Ortak / yatırımcı kâr payı", -result.partnerPayout]] },
      { title: "G · Kâr-zarar", rows: [
        ["Vergi öncesi kâr", result.preTaxProfit], ["Vergi ön tahmini", -result.estimatedTax],
        ["Aylık net kâr", result.netProfit], ["Proje başı net kâr", result.projectNetProfit],
        ["Saatlik net kâr", result.hourlyNetProfit], ["Kişi başı ciro", result.revenuePerEmployee],
      ] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
        ["Hibe / destek (ayrı)", result.input.supportAmount], ["Kurulum maliyeti", -result.totalSetupCost],
        ["Tahsilat vadesi", result.input.collectionDelayDays, "number"], ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths],
        ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Başabaş proje sayısı", result.breakevenProjectCount, "number"], ["Başabaş ciro", result.breakevenRevenue],
        ["Başabaş kapasite kullanımı", result.breakevenCapacityUtilization, "percent"], ["Yıllık tahmini net kâr", result.annualNetProfit],
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
