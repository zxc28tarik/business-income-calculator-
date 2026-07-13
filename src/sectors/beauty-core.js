import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { BEAUTY_SCENARIOS, applyBeautyScenario, normalizeBeautyInputs } from "./beauty-config.js";

export function calculateBeautyMonth(rawInputs, overrides = {}) {
  const input = normalizeBeautyInputs({ ...rawInputs, ...overrides });
  const dailyCapacity = input.stations * input.workingHoursPerDay * 60 / input.sessionDurationMinutes;
  const monthlyCapacity = dailyCapacity * input.openDays;
  const bookedAppointments = monthlyCapacity * input.occupancyRate;
  const noShowAppointments = bookedAppointments * input.noShowRate;
  const completedSessions = Math.max(0, bookedAppointments - noShowAppointments);

  const potentialServiceRevenue = bookedAppointments * input.servicePrice;
  const noShowRevenueLoss = noShowAppointments * input.servicePrice;
  const actualGrossRevenue = completedSessions * input.servicePrice;
  const tax = calcTaxSplit({ grossRevenue: actualGrossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;

  const paymentCommission = calcCommission(adjustedRevenue * input.cardPaymentShare, input.paymentCommissionRate);
  const totalCommissions = paymentCommission;
  const revenueAfterCommission = adjustedRevenue - paymentCommission;

  const consumableCost = completedSessions * input.consumableCostPerSession;
  const employeeCommission = adjustedRevenue * input.employeeCommissionRate;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = consumableCost + employeeCommission + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const monthlyDepreciation = input.deviceInvestment / input.deviceUsefulLifeMonths;
  const cashFixedCostItems = {
    staffCost: input.staffCost,
    rent: input.rent,
    utilities: input.utilities,
    accounting: input.accounting,
    software: input.software,
    monthlyAdSpend: input.monthlyAdSpend,
    maintenance: input.maintenance,
    insurance: input.insurance,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const cashFixedCosts = sumValues(Object.values(cashFixedCostItems));
  const fixedCostItems = { ...cashFixedCostItems, monthlyDepreciation };
  const totalFixedCosts = cashFixedCosts + monthlyDepreciation;

  const basisValues = {
    grossRevenue: potentialServiceRevenue,
    revenueAfterCommission,
    contribution,
    preTaxBeforePartner: contribution - totalFixedCosts,
  };
  const partnerBasis = stakeholderBasisAmount("pre_tax_profit", basisValues);
  const partnerPayout = partnerBasis * input.partnerProfitShareRate;
  const totalStakeholderPayouts = partnerPayout;
  const preTaxProfit = contribution - totalFixedCosts - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;

  const setupCostItems = {
    renovation: input.renovation,
    deviceInvestment: input.deviceInvestment,
    furniture: input.furniture,
    deposit: input.deposit,
    licenseFees: input.licenseFees,
    openingMarketing: input.openingMarketing,
    initialConsumables: input.initialConsumables,
    softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const operatingCashProfit = netProfit + monthlyDepreciation;
  const devicePaybackMonths = input.deviceInvestment > 0 && operatingCashProfit > 0
    ? input.deviceInvestment / operatingCashProfit
    : null;
  const largestExpense = findLargestExpense({ ...fixedCostItems, consumableCost, employeeCommission, paymentCommission });

  return {
    input,
    dailyCapacity,
    monthlyCapacity,
    bookedAppointments,
    dailyBookedAppointments: bookedAppointments / input.openDays,
    noShowAppointments,
    completedSessions,
    dailyCompletedSessions: completedSessions / input.openDays,
    potentialServiceRevenue,
    noShowRevenueLoss,
    actualGrossRevenue,
    grossRevenue: potentialServiceRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: adjustedRevenue,
    lostSalesAmount: noShowRevenueLoss,
    adjustedRevenue,
    paymentCommission,
    totalCommissions,
    revenueAfterCommission,
    consumableCost,
    employeeCommission,
    otherVariableCost,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    cashFixedCostItems,
    cashFixedCosts,
    fixedCostItems,
    monthlyDepreciation,
    totalFixedCosts,
    partnerPayout,
    totalStakeholderPayouts,
    preTaxProfit,
    estimatedTax,
    netProfit,
    setupCostItems,
    totalSetupCost,
    operatingCashProfit,
    devicePaybackMonths,
    unitNetProfit: percent(netProfit, completedSessions),
    contributionPerSession: percent(contribution, completedSessions),
    profitMargin: percent(netProfit, adjustedRevenue),
    staffCostRatio: percent(input.staffCost + employeeCommission, adjustedRevenue),
    revenuePerEmployee: percent(actualGrossRevenue, input.staffCount),
    depreciationLoad: percent(monthlyDepreciation, adjustedRevenue),
    noShowLossRate: percent(noShowRevenueLoss, potentialServiceRevenue),
    largestExpense,
  };
}

export function calculateBeautyModel(rawInputs) {
  const input = normalizeBeautyInputs(rawInputs);
  const current = calculateBeautyMonth(input);
  const breakevenOccupancyRate = solveBreakeven({
    min: 0,
    max: 1,
    tolerance: 0.00001,
    evaluate: (occupancyRate) => calculateBeautyMonth(input, { occupancyRate }).netProfit,
  });
  const breakevenDailyAppointments = breakevenOccupancyRate == null
    ? null
    : current.dailyCapacity * breakevenOccupancyRate;
  const breakevenRevenue = breakevenDailyAppointments == null
    ? null
    : breakevenDailyAppointments * input.openDays * input.servicePrice;

  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: input.collectionDelayDays,
    supplierPaymentDelayDays: input.supplierPaymentDelayDays,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier) => calculateBeautyMonth(input, {
      occupancyRate: Math.min(1, input.occupancyRate * growthMultiplier),
    }),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.operatingCashProfit > 0 ? current.totalSetupCost / current.operatingCashProfit : null;
  const warnings = buildBeautyWarnings({ current, cashFlow, breakevenOccupancyRate, input });

  return {
    ...current,
    breakevenOccupancyRate,
    breakevenDailyAppointments,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Planlanan randevu değeri",
        loss: "No-show / iptal",
        commission: "Ödeme komisyonu",
        variable: "Seans ve çalışan maliyeti",
        fixed: "Sabit gider + amortisman",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: "Dolu randevu takviminin parasal değeri",
      lossSubtext: "Gelire dönüşmeyen randevular",
      commissionSubtext: "POS / ödeme kesintisi",
      variableSubtext: "Sarf, çalışan primi ve diğer değişkenler",
      fixedSubtext: "Personel, kira, reklam, genel gider ve amortisman",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateBeautyScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(BEAUTY_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(BEAUTY_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap
      ? normalizeBeautyInputs(baseOrScenarioInputs[id])
      : applyBeautyScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateBeautyModel(inputs) };
  });
}

export function buildBeautyWarnings({ current, cashFlow, breakevenOccupancyRate, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda salon aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Kurulum ve ilk ay operasyonları ilk 3 ayda nakit açığı oluşturuyor.");
  if (input.occupancyRate < 0.30) add("occupancy_hard", "hard", "Doluluk oranı %30'un altında; kapasitenin büyük bölümü boş kalıyor.");
  else if (input.occupancyRate < 0.50) add("occupancy_soft", "soft", "Doluluk oranı düşük; randevu kazanımı ve tekrar ziyaret planı güçlendirilmeli.");
  if (input.noShowRate > 0.15) add("no_show_hard", "hard", "No-show oranı %15'in üzerinde; ön ödeme ve hatırlatma sistemi değerlendirilmelidir.");
  else if (input.noShowRate > 0.08) add("no_show_soft", "soft", "Boş randevu kaybı dikkat gerektiriyor.");
  if (current.staffCostRatio > 0.60) add("staff_cost_hard", "hard", "Personel sabit maliyeti ve primleri net hizmet gelirinin %60'ını aşıyor.");
  else if (current.staffCostRatio > 0.45) add("staff_cost_soft", "soft", "Personel maliyeti ciroya göre yüksek görünüyor.");
  if (current.depreciationLoad > 0.15) add("depreciation", "soft", "Aylık cihaz amortismanı net hizmet gelirinin %15'ini aşıyor.");
  if (breakevenOccupancyRate == null || breakevenOccupancyRate > 1) {
    add("breakeven_impossible", "hard", "Mevcut fiyat ve maliyetlerle tam kapasitede dahi başabaş oluşmuyor.");
  } else if (breakevenOccupancyRate > 0.85) {
    add("breakeven_high", "soft", "Başabaş için %85'in üzerinde doluluk gerekiyor; hedef kırılgan olabilir.");
  }
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük sapmalar zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir güzellik/kuaför uyarısı oluşmadı.");
  return warnings;
}
