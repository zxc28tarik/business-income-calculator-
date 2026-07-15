import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import {
  AUTO_SERVICE_SCENARIOS, applyAutoServiceScenario, normalizeAutoServiceInputs,
} from "./auto-config.js";

export function calculateAutoServiceMonth(rawInputs, overrides = {}) {
  const input = normalizeAutoServiceInputs({ ...rawInputs, ...overrides });
  const monthlyVehicles = input.dailyVehicles * input.openDays;
  const dailyCapacity = input.serviceStations * input.workingHoursPerDay * 60 / input.averageServiceDurationMinutes;
  const monthlyCapacity = dailyCapacity * input.openDays;
  const capacityUtilization = percent(monthlyVehicles, monthlyCapacity);

  const serviceGrossRevenue = monthlyVehicles * input.averageServicePrice;
  const partsGrossRevenue = monthlyVehicles * input.averagePartsRevenuePerVehicle;
  const grossRevenue = serviceGrossRevenue + partsGrossRevenue;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;

  const posCommission = calcCommission(adjustedRevenue * input.cardSalesShare, input.posCommissionRate);
  const totalCommissions = posCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const consumableCost = monthlyVehicles * input.consumableCostPerVehicle;
  const waterElectricityVariableCost = monthlyVehicles * input.waterElectricityCostPerVehicle;
  const partsCost = partsGrossRevenue * input.partsCostRate;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = consumableCost + waterElectricityVariableCost + partsCost + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const monthlyDepreciation = input.equipmentInvestment / input.equipmentUsefulLifeMonths;
  const cashFixedCostItems = {
    staffCost: input.staffCost,
    rent: input.rent,
    baseUtilities: input.baseUtilities,
    accounting: input.accounting,
    software: input.software,
    monthlyMarketing: input.monthlyMarketing,
    maintenance: input.maintenance,
    insurance: input.insurance,
    wasteDisposal: input.wasteDisposal,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const cashFixedCosts = sumValues(Object.values(cashFixedCostItems));
  const fixedCostItems = { ...cashFixedCostItems, monthlyDepreciation };
  const totalFixedCosts = cashFixedCosts + monthlyDepreciation;

  const basisValues = {
    grossRevenue,
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
    equipmentInvestment: input.equipmentInvestment,
    deposit: input.deposit,
    licenseFees: input.licenseFees,
    openingMarketing: input.openingMarketing,
    signage: input.signage,
    initialConsumables: input.initialConsumables,
    softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const operatingCashProfit = netProfit + monthlyDepreciation;
  const equipmentPaybackMonths = input.equipmentInvestment > 0 && operatingCashProfit > 0
    ? input.equipmentInvestment / operatingCashProfit
    : null;
  const largestExpense = findLargestExpense({
    ...fixedCostItems,
    consumableCost,
    waterElectricityVariableCost,
    partsCost,
    posCommission,
  });

  return {
    input,
    dailyCapacity,
    monthlyCapacity,
    capacityUtilization,
    monthlyVehicles,
    serviceGrossRevenue,
    partsGrossRevenue,
    grossRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: adjustedRevenue,
    lostSalesAmount: 0,
    adjustedRevenue,
    posCommission,
    totalCommissions,
    revenueAfterCommission,
    consumableCost,
    waterElectricityVariableCost,
    partsCost,
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
    equipmentPaybackMonths,
    unitNetProfit: percent(netProfit, monthlyVehicles),
    contributionPerVehicle: percent(contribution, monthlyVehicles),
    revenuePerVehicle: percent(adjustedRevenue, monthlyVehicles),
    variableCostPerVehicle: percent(totalVariableCosts, monthlyVehicles),
    profitMargin: percent(netProfit, adjustedRevenue),
    rentToRevenue: percent(input.rent, adjustedRevenue),
    staffCostRatio: percent(input.staffCost, adjustedRevenue),
    depreciationLoad: percent(monthlyDepreciation, adjustedRevenue),
    consumableAndEnergyRatio: percent(consumableCost + waterElectricityVariableCost, adjustedRevenue),
    partsGrossMargin: input.averagePartsRevenuePerVehicle > 0 ? 1 - input.partsCostRate : null,
    largestExpense,
  };
}

export function calculateAutoServiceModel(rawInputs) {
  const input = normalizeAutoServiceInputs(rawInputs);
  const current = calculateAutoServiceMonth(input);
  const breakevenDailyVehiclesRaw = solveBreakeven({
    min: 0,
    max: Math.max(100000, current.dailyCapacity * 10),
    tolerance: 0.00001,
    evaluate: (dailyVehicles) => calculateAutoServiceMonth(input, { dailyVehicles }).netProfit,
  });
  const breakevenDailyVehicles = breakevenDailyVehiclesRaw == null ? null : Math.ceil(breakevenDailyVehiclesRaw);
  const breakevenCapacityUtilization = breakevenDailyVehicles == null
    ? null
    : percent(breakevenDailyVehicles, current.dailyCapacity);
  const breakevenRevenue = breakevenDailyVehicles == null
    ? null
    : breakevenDailyVehicles * input.openDays * (input.averageServicePrice + input.averagePartsRevenuePerVehicle);

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
    evaluateMonth: (growthMultiplier) => calculateAutoServiceMonth(input, {
      dailyVehicles: input.dailyVehicles * growthMultiplier,
    }),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.operatingCashProfit > 0 ? current.totalSetupCost / current.operatingCashProfit : null;
  const warnings = buildAutoServiceWarnings({ current, cashFlow, breakevenCapacityUtilization, input });

  return {
    ...current,
    breakevenDailyVehicles,
    breakevenCapacityUtilization,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Brüt hizmet + parça geliri",
        loss: "İade / kayıp",
        commission: "POS komisyonu",
        variable: "Araç, sarf ve parça maliyeti",
        fixed: "Sabit gider + amortisman",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: "Hizmet ve araç başı parça/ürün geliri",
      lossSubtext: "Bu ilk sürümde satış kaybı alanı yok",
      commissionSubtext: "Kartlı satış payına uygulanan POS kesintisi",
      variableSubtext: "Sarf, su/elektrik, parça ve diğer değişken gider",
      fixedSubtext: "Personel, kira, reklam, bakım ve amortisman",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateAutoServiceScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(AUTO_SERVICE_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(AUTO_SERVICE_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap
      ? normalizeAutoServiceInputs(baseOrScenarioInputs[id])
      : applyAutoServiceScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateAutoServiceModel(inputs) };
  });
}

export function buildAutoServiceWarnings({ current, cashFlow, breakevenCapacityUtilization, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda oto hizmet işletmesi aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Kurulum ve ilk ay operasyonları ilk 3 ayda nakit açığı oluşturuyor.");
  if (current.capacityUtilization > 1) add("capacity_overload", "hard", "Girilen günlük araç sayısı teorik hizmet kapasitesini aşıyor.");
  else if (current.capacityUtilization > 0.90) add("capacity_tight", "soft", "Kapasite kullanımı %90'ın üzerinde; gecikme ve kalite riski oluşabilir.");
  else if (current.capacityUtilization < 0.35) add("capacity_low", "soft", "Hizmet kapasitesinin büyük bölümü boş kalıyor.");

  if (current.staffCostRatio > 0.55) add("staff_cost_hard", "hard", "Personel maliyeti KDV sonrası gelirin %55'ini aşıyor.");
  else if (current.staffCostRatio > 0.42) add("staff_cost_soft", "soft", "Personel maliyeti gelire göre yüksek görünüyor.");
  if (current.rentToRevenue > 0.20) add("rent_hard", "hard", "Kira KDV sonrası gelirin %20'sini aşıyor.");
  else if (current.rentToRevenue > 0.14) add("rent_soft", "soft", "Kira/gelir oranı dikkat gerektiriyor.");
  if (current.consumableAndEnergyRatio > 0.30) add("consumables_hard", "hard", "Araç başı sarf ile su/elektrik yükü gelirin %30'unu aşıyor.");
  else if (current.consumableAndEnergyRatio > 0.20) add("consumables_soft", "soft", "Sarf ve enerji maliyetleri hizmet fiyatına göre yüksek.");
  if (input.averagePartsRevenuePerVehicle > 0 && input.partsCostRate > 0.80) add("parts_margin", "soft", "Parça/ürün maliyeti satış gelirinin %80'ini aşıyor.");
  if (current.depreciationLoad > 0.15) add("depreciation", "soft", "Aylık ekipman amortismanı net gelirin %15'ini aşıyor.");

  if (breakevenCapacityUtilization == null || breakevenCapacityUtilization > 1) {
    add("breakeven_impossible", "hard", "Mevcut fiyat ve maliyetlerle teorik kapasite içinde başabaş oluşmuyor.");
  } else if (breakevenCapacityUtilization > 0.85) {
    add("breakeven_high", "soft", "Başabaş için kapasitenin %85'inden fazlası gerekiyor.");
  }
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük maliyet artışları zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir oto hizmetleri uyarısı oluşmadı.");
  return warnings;
}
