const fixedLabels = {
  serverBaseCost: "Sabit sunucu / altyapı",
  supportStaffCost: "Destek ekibi",
  developmentCost: "Geliştirme ekibi",
  fixedMarketingSpend: "Sabit pazarlama",
  softwareTools: "Yazılım / araçlar",
  officeAndAdmin: "Ofis / idari",
  accounting: "Muhasebe",
  insurance: "Sigorta",
  otherFixedExpenses: "Diğer sabit gider",
};

const setupLabels = {
  initialDevelopmentInvestment: "İlk ürün geliştirme yatırımı",
  legalAndCompanySetup: "Şirket / hukuk / sözleşmeler",
  initialInfrastructureSetup: "İlk altyapı kurulumu",
  brandAndWebsite: "Marka / web sitesi",
  launchMarketing: "Lansman pazarlaması",
};

export function buildSaasPresentation(result) {
  return {
    kpis: [
      { id: "mrr", label: "MRR", value: result.mrr, format: "money", note: `${round(result.endingSubscribers, 0)} ay sonu aktif abone` },
      { id: "arr", label: "ARR", value: result.arr, format: "money", note: "MRR × 12" },
      { id: "net_mrr", label: "Net MRR", value: result.netMRR, format: "money", note: "KDV ve komisyon sonrası", negative: result.netMRR < 0 },
      { id: "net_profit", label: "Aylık net kâr", value: result.netProfit, format: "money", note: `${formatRate(result.profitMargin)} net kâr marjı`, negative: result.netProfit < 0 },
      { id: "ltv", label: "LTV", value: result.ltv, format: "money", note: result.ltv == null ? "Churn sıfır olduğundan hesaplanmadı" : "Abone katkısı / aylık churn" },
      { id: "ltv_cac", label: "LTV / CAC", value: result.ltvCacRatio, format: "numberSuffix", suffix: "×", note: `CAC: ${formatMoneyPlain(result.input.cacPerSubscriber)}`, negative: result.ltvCacRatio != null && result.ltvCacRatio < 3 },
      { id: "cac_payback", label: "CAC geri dönüşü", value: result.cacPaybackMonths, format: "months", note: "Abone başı katkı yaklaşımı", negative: result.cacPaybackMonths != null && result.cacPaybackMonths > 12 },
      { id: "breakeven", label: "Başabaş abone", value: result.breakevenSubscribers, format: "numberSuffix", suffix: " abone", note: result.breakevenSubscribers == null ? "Başabaş bulunamadı" : `MRR: ${formatMoneyPlain(result.breakevenRevenue)}` },
      { id: "server_per_user", label: "Sunucu / abone", value: result.serverCostPerActiveSubscriber, format: "money", note: `${formatRate(result.serverCostPerActiveSubscriber / Math.max(1, result.input.monthlyPrice))} aylık fiyat` },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money", note: `Minimum: ${formatMoneyPlain(result.cashFlow.minimumCash)}`, negative: result.cashFlow.endingCash < 0 },
    ],
    keySplit: [
      { label: "Ay başı MRR", value: result.openingMRR },
      { label: "Yeni MRR", value: result.newMRR },
      { label: "Churned MRR", value: -result.churnedMRR },
      { label: "Ay sonu MRR", value: result.mrr },
      { label: "KDV ve komisyon sonrası net MRR", value: result.netMRR },
      { label: "Sunucu, destek ve CAC", value: -result.totalVariableCosts },
      { label: "Sabit gider sonrası", value: result.preTaxProfit + result.totalStakeholderPayouts },
      { label: "Ortak / yatırımcı payı", value: -result.totalStakeholderPayouts },
      { label: "Aylık net kâr", value: result.netProfit },
      { label: "12 ay sonunda kasada kalan", value: result.cashFlow.endingCash },
    ],
    scenarioMetrics: [
      { id: "ending_subscribers", label: "Ay sonu aktif abone", value: result.endingSubscribers, format: "number" },
      { id: "mrr", label: "MRR", value: result.mrr, format: "money" },
      { id: "net_new_mrr", label: "Net yeni MRR", value: result.netNewMRR, format: "money" },
      { id: "ltv_cac", label: "LTV / CAC", value: result.ltvCacRatio, format: "number" },
      { id: "pre_tax_profit", label: "Vergi öncesi kâr", value: result.preTaxProfit, format: "money" },
      { id: "net_profit", label: "Net kâr", value: result.netProfit, format: "money" },
      { id: "ending_cash", label: "12 ay sonu nakit", value: result.cashFlow.endingCash, format: "money" },
      { id: "roi", label: "Yıllık ROI", value: result.roi, format: "percent" },
    ],
    breakdown: [
      { title: "A · Abone hareketi", rows: [
        ["Ay başı aktif abone", result.openingSubscribers, "number"], ["Yeni abone", result.newSubscribers, "number"],
        ["Churn ile kaybedilen", -result.churnedSubscribers, "number"], ["Net abone değişimi", result.netSubscriberChange, "number"],
        ["Ay sonu aktif abone", result.endingSubscribers, "number"],
      ] },
      { title: "B · MRR ve ARR", rows: [
        ["Ay başı MRR", result.openingMRR], ["Yeni MRR", result.newMRR], ["Churned MRR", -result.churnedMRR],
        ["Net yeni MRR", result.netNewMRR], ["Ay sonu MRR", result.mrr], ["ARR", result.arr],
      ] },
      { title: "C · Vergi ve ödeme kesintileri", rows: [
        ["KDV ayrımı", -result.taxAmount], ["KDV hariç abonelik geliri", result.adjustedRevenue],
        ["Platform komisyonu", -result.platformCommission], ["Ödeme komisyonu", -result.paymentCommission],
        ["Komisyon sonrası net MRR", result.netMRR],
      ] },
      { title: "D · Aboneye bağlı maliyet", rows: [
        ["Sunucu değişken maliyeti", -result.serverVariableCost], ["Destek değişken maliyeti", -result.supportVariableCost],
        ["Yeni müşteri kazanım harcaması", -result.acquisitionSpend], ["Toplam değişken maliyet", -result.totalVariableCosts],
        ["Katkı", result.contribution], ["Abone başı tekrarlayan katkı", result.contributionPerSubscriber],
      ] },
      { title: "E · Sabit gider", rows: [
        ...Object.entries(result.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]),
        ["Toplam sabit gider", -result.totalFixedCosts],
      ] },
      { title: "F · SaaS birim ekonomisi", rows: [
        ["LTV", result.ltv], ["CAC", result.input.cacPerSubscriber], ["LTV / CAC", result.ltvCacRatio, "number"],
        ["CAC geri ödeme süresi", result.cacPaybackMonths, "months"], ["Brüt katkı marjı", result.grossMargin, "percent"],
        ["Sunucu maliyeti / aktif abone", result.serverCostPerActiveSubscriber], ["Destek maliyeti / aktif abone", result.supportCostPerActiveSubscriber],
      ] },
      { title: "G · Kâr-zarar", rows: [
        ["Ortak / yatırımcı payı", -result.partnerPayout], ["Vergi öncesi kâr", result.preTaxProfit],
        ["Vergi ön tahmini", -result.estimatedTax], ["Aylık net kâr", result.netProfit], ["Yıllık tahmini net kâr", result.annualNetProfit],
      ] },
      { title: "H · Nakit akışı", rows: [
        ["Başlangıç nakdi", result.input.startingCash], ["Finansman (P&L dışı)", result.input.financingAmount],
        ["Hibe / destek (ayrı)", result.input.supportAmount], ["Kurulum maliyeti", -result.totalSetupCost],
        ["İlk 3 ay minimum nakit", result.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", result.cashFlow.endingCash],
      ] },
      { title: "I · Nihai sonuç", rows: [
        ["Başabaş abone", result.breakevenSubscribers, "number"], ["Başabaş MRR", result.breakevenRevenue],
        ["Toplam kurulum geri dönüşü", result.paybackMonths, "months"], ["En büyük gider", result.largestExpense.amount],
      ] },
      { title: "Kurulum kalemleri", rows: Object.entries(result.setupCostItems).map(([key, value]) => [setupLabels[key] || key, -value]) },
    ],
  };
}

function round(value, digits = 2) { const number = Number(value); if (!Number.isFinite(number)) return null; const power = 10 ** digits; return Math.round((number + Number.EPSILON) * power) / power; }
function formatRate(value) { return `${round((Number(value) || 0) * 100, 1)}%`; }
function formatMoneyPlain(value) { return `${Math.round(Number(value) || 0).toLocaleString("tr-TR")} TL`; }
