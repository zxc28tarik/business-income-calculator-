import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { BEAUTY_SCENARIOS, applyBeautyScenario, normalizeBeautyInputs } from "./beauty-v2-config.js";
import {
  buildBeautyProfileWarnings,
  deriveBeautyOperations,
} from "./beauty-business-profile-engine.js";

function demandPatch(input, value) {
  if (input.customerBaseDemandEnabled) return { demandScale: value };
  return { occupancyRate: value, demandScale: 1 };
}

function demandBounds(input) {
  return input.customerBaseDemandEnabled ? { min: 0, max: 10 } : { min: 0, max: 1 };
}

function scaleDemand(input, multiplier) {
  if (input.customerBaseDemandEnabled) return { demandScale: multiplier };
  return { occupancyRate: Math.min(1, input.occupancyRate * multiplier), demandScale: 1 };
}

export function calculateBeautyMonth(rawInputs, overrides = {}) {
  const input = normalizeBeautyInputs({ ...rawInputs, ...overrides });
  const operations = deriveBeautyOperations(input);
  const bookedAppointments = operations.bookedAppointments;
  const noShowAppointments = bookedAppointments * input.noShowRate;
  const completedSessions = Math.max(0, bookedAppointments - noShowAppointments);
  const servicePrice = operations.serviceEconomics.effectivePrice;
  const potentialServiceRevenue = bookedAppointments * servicePrice;
  const grossNoShowLoss = noShowAppointments * servicePrice;
  const noShowRecoveredRevenue = grossNoShowLoss * input.noShowRecoveryRate;
  const noShowRevenueLoss = grossNoShowLoss - noShowRecoveredRevenue;
  const completedServiceRevenue = completedSessions * servicePrice;
  const retailRevenue = input.retailSalesEnabled ? input.monthlyRetailRevenue : 0;
  const actualGrossRevenue = completedServiceRevenue + noShowRecoveredRevenue + retailRevenue;
  const grossRevenue = potentialServiceRevenue + retailRevenue;
  const tax = calcTaxSplit({ grossRevenue: actualGrossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;

  const paymentCommission = calcCommission(adjustedRevenue * input.cardPaymentShare, input.paymentCommissionRate);
  const totalCommissions = paymentCommission;
  const revenueAfterCommission = adjustedRevenue - paymentCommission;

  const consumableCost = completedSessions * operations.serviceEconomics.effectiveConsumableCost;
  const retailProductCost = retailRevenue * input.retailProductCostRate;
  const serviceRevenueShare = actualGrossRevenue > 0
    ? (completedServiceRevenue + noShowRecoveredRevenue) / actualGrossRevenue
    : 0;
  const serviceNetRevenue = adjustedRevenue * serviceRevenueShare;
  const employeeCommissionRate = operations.staffEconomics.effectiveCommissionRate
    ?? operations.serviceEconomics.effectiveEmployeeCommissionRate;
  const employeeCommission = serviceNetRevenue * employeeCommissionRate;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = consumableCost + retailProductCost + employeeCommission + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const effectiveStaffCost = operations.staffEconomics.enabled
    ? operations.staffEconomics.monthlyStaffCost
    : input.staffCost;
  const monthlyDepreciation = input.deviceInvestment / input.deviceUsefulLifeMonths;
  const cashFixedCostItems = {
    staffCost: effectiveStaffCost,
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
  const operatingGrantIncome = input.monthlyOperatingGrantIncome;

  const basisValues = {
    grossRevenue,
    revenueAfterCommission,
    contribution,
    preTaxBeforePartner: contribution + operatingGrantIncome - totalFixedCosts,
  };
  const partnerBasis = stakeholderBasisAmount("pre_tax_profit", basisValues);
  const partnerPayout = partnerBasis * input.partnerProfitShareRate;
  const totalStakeholderPayouts = partnerPayout;
  const preTaxProfit = contribution + operatingGrantIncome - totalFixedCosts - partnerPayout;
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
  const resourceDailyCapacity = operations.resourceDailyCapacity;
  const staffDailyCapacity = operations.staffEconomics.dailyStaffCapacity;
  const staffCapacityBottleneck = operations.staffEconomics.enabled
    && staffDailyCapacity + 1e-9 < resourceDailyCapacity;
  const capacityUtilization = operations.monthlyCapacity > 0
    ? bookedAppointments / operations.monthlyCapacity
    : 0;
  const revenuePerResource = operations.resourceCount > 0
    ? actualGrossRevenue / operations.resourceCount
    : 0;
  const effectiveStaffCount = operations.staffEconomics.enabled
    ? operations.staffEconomics.staffCount
    : input.staffCount;
  const largestExpense = findLargestExpense({
    ...fixedCostItems,
    consumableCost,
    retailProductCost,
    employeeCommission,
    paymentCommission,
  });

  return {
    input,
    profile: operations.profile,
    profileMetrics: {
      driverLabel: operations.driverLabel,
      driverValue: operations.driverValue,
    },
    serviceMixRows: operations.serviceEconomics.rows,
    staffRoleRows: operations.staffEconomics.rows,
    serviceMixShareTotal: operations.serviceEconomics.shareTotal,
    effectiveServicePrice: servicePrice,
    effectiveSessionDurationMinutes: operations.serviceEconomics.effectiveDurationMinutes,
    effectiveConsumableCostPerSession: operations.serviceEconomics.effectiveConsumableCost,
    effectiveEmployeeCommissionRate: employeeCommissionRate,
    resourceCount: operations.resourceCount,
    resourceDailyCapacity,
    staffDailyCapacity,
    staffCapacityBottleneck,
    dailyCapacity: operations.dailyCapacity,
    monthlyCapacity: operations.monthlyCapacity,
    rawDemandAppointments: operations.rawDemandAppointments,
    unmetDemandAppointments: operations.unmetDemandAppointments,
    bookedAppointments,
    dailyBookedAppointments: bookedAppointments / input.openDays,
    noShowAppointments,
    completedSessions,
    dailyCompletedSessions: completedSessions / input.openDays,
    potentialServiceRevenue,
    grossNoShowLoss,
    noShowRecoveredRevenue,
    noShowRevenueLoss,
    completedServiceRevenue,
    retailRevenue,
    actualGrossRevenue,
    grossRevenue,
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
    retailProductCost,
    employeeCommission,
    otherVariableCost,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    operatingGrantIncome,
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
    unitNetProfit: completedSessions > 0 ? netProfit / completedSessions : 0,
    contributionPerSession: completedSessions > 0 ? contribution / completedSessions : 0,
    profitMargin: percent(netProfit, adjustedRevenue),
    staffCostRatio: percent(effectiveStaffCost + employeeCommission, adjustedRevenue),
    revenuePerEmployee: effectiveStaffCount > 0 ? actualGrossRevenue / effectiveStaffCount : 0,
    depreciationLoad: percent(monthlyDepreciation, adjustedRevenue),
    noShowLossRate: percent(noShowRevenueLoss, potentialServiceRevenue),
    capacityUtilization,
    revenuePerResource,
    effectiveStaffCount,
    largestExpense,
  };
}

export function calculateBeautyModel(rawInputs) {
  const input = normalizeBeautyInputs(rawInputs);
  const current = calculateBeautyMonth(input);
  const bounds = demandBounds(input);
  const breakevenDriverValue = solveBreakeven({
    ...bounds,
    tolerance: input.customerBaseDemandEnabled ? 0.0001 : 0.00001,
    evaluate: (value) => calculateBeautyMonth(input, demandPatch(input, value)).netProfit,
  });
  const breakevenResult = breakevenDriverValue == null
    ? null
    : calculateBeautyMonth(input, demandPatch(input, breakevenDriverValue));
  const breakevenOccupancyRate = breakevenResult?.capacityUtilization ?? null;
  const breakevenDailyAppointments = breakevenResult?.dailyBookedAppointments ?? null;
  const breakevenRevenue = breakevenResult?.grossRevenue ?? null;

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
    evaluateMonth: (growthMultiplier) => calculateBeautyMonth(input, scaleDemand(input, growthMultiplier)),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.operatingCashProfit > 0 ? current.totalSetupCost / current.operatingCashProfit : null;
  const result = {
    ...current,
    breakevenDriverValue,
    breakevenDriverLabel: input.customerBaseDemandEnabled ? "Talep çarpanı" : "Doluluk",
    breakevenOccupancyRate,
    breakevenDailyAppointments,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
  };
  result.warnings = buildBeautyWarnings({ current: result, cashFlow, breakevenOccupancyRate, input: result.input });
  result.waterfall = buildWaterfall(result, {
    labels: {
      gross: "Planlanan hizmet ve ürün değeri",
      loss: "No-show / iptal",
      commission: "Ödeme komisyonu",
      variable: "Seans, ürün ve çalışan maliyeti",
      fixed: "Sabit gider + amortisman",
      stakeholder: "Ortak / yatırımcı payı",
    },
    grossSubtext: "Planlanan randevular ve ürün satışı",
    lossSubtext: "Ön ödeme sonrası karşılanamayan kayıp",
    commissionSubtext: "POS / ödeme kesintisi",
    variableSubtext: "Sarf, ürün maliyeti, çalışan primi ve diğer değişkenler",
    fixedSubtext: "Personel, kira, reklam, genel gider ve amortisman",
    stakeholderSubtext: "Pozitif vergi öncesi kârdan",
  });
  return result;
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
  if (current.capacityUtilization < 0.30) add("occupancy_hard", "hard", "Kapasite kullanımı %30'un altında; kaynakların büyük bölümü boş kalıyor.");
  else if (current.capacityUtilization < 0.50) add("occupancy_soft", "soft", "Kapasite kullanımı düşük; randevu kazanımı ve tekrar ziyaret planı güçlendirilmeli.");
  if (input.noShowRate > 0.15) add("no_show_hard", "hard", "No-show oranı %15'in üzerinde; ön ödeme ve hatırlatma sistemi değerlendirilmelidir.");
  else if (input.noShowRate > 0.08) add("no_show_soft", "soft", "Boş randevu kaybı dikkat gerektiriyor.");
  if (current.staffCostRatio > 0.60) add("staff_cost_hard", "hard", "Personel sabit maliyeti ve primleri net gelirin %60'ını aşıyor.");
  else if (current.staffCostRatio > 0.45) add("staff_cost_soft", "soft", "Personel maliyeti ciroya göre yüksek görünüyor.");
  if (current.depreciationLoad > 0.15) add("depreciation", "soft", "Aylık cihaz amortismanı net gelirin %15'ini aşıyor.");
  if (breakevenOccupancyRate == null || breakevenOccupancyRate > 1) {
    add("breakeven_impossible", "hard", "Mevcut fiyat ve maliyetlerle tam kapasitede dahi başabaş oluşmuyor.");
  } else if (breakevenOccupancyRate > 0.85) {
    add("breakeven_high", "soft", "Başabaş için %85'in üzerinde kapasite kullanımı gerekiyor.");
  }
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük sapmalar zarara çevirebilir.");
  warnings.push(...buildBeautyProfileWarnings(current));
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir güzellik/kuaför uyarısı oluşmadı.");
  return warnings;
}
