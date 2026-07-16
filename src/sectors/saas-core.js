import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { SAAS_SCENARIOS, applySaasScenario, normalizeSaasInputs } from "./saas-config.js";

export function calculateSaasMonth(rawInputs, overrides = {}) {
  const input = normalizeSaasInputs({ ...rawInputs, ...overrides });
  const churnedSubscribers = input.openingSubscribers * input.monthlyChurnRate;
  const endingSubscribers = Math.max(0, input.openingSubscribers - churnedSubscribers + input.monthlyNewSubscribers);
  const netSubscriberChange = endingSubscribers - input.openingSubscribers;

  const openingMRR = input.openingSubscribers * input.monthlyPrice;
  const newMRR = input.monthlyNewSubscribers * input.monthlyPrice;
  const churnedMRR = churnedSubscribers * input.monthlyPrice;
  const netNewMRR = newMRR - churnedMRR;
  const potentialMRR = openingMRR + newMRR;
  const mrr = endingSubscribers * input.monthlyPrice;
  const arr = mrr * 12;

  const tax = calcTaxSplit({ grossRevenue: mrr, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;
  const platformRevenue = adjustedRevenue * input.platformSalesShare;
  const directRevenue = adjustedRevenue - platformRevenue;
  const platformCommission = calcCommission(platformRevenue, input.platformCommissionRate);
  const paymentCommission = calcCommission(directRevenue, input.paymentCommissionRate);
  const totalCommissions = platformCommission + paymentCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;
  const netMRR = revenueAfterCommission;

  const serverVariableCost = endingSubscribers * input.serverCostPerSubscriber;
  const supportVariableCost = endingSubscribers * input.supportCostPerSubscriber;
  const acquisitionSpend = input.monthlyNewSubscribers * input.cacPerSubscriber;
  const totalVariableCosts = serverVariableCost + supportVariableCost + acquisitionSpend;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const fixedCostItems = {
    serverBaseCost: input.serverBaseCost,
    supportStaffCost: input.supportStaffCost,
    developmentCost: input.developmentCost,
    fixedMarketingSpend: input.fixedMarketingSpend,
    softwareTools: input.softwareTools,
    officeAndAdmin: input.officeAndAdmin,
    accounting: input.accounting,
    insurance: input.insurance,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const totalFixedCosts = sumValues(Object.values(fixedCostItems));
  const cashFixedCosts = totalFixedCosts;

  const basisValues = {
    grossRevenue: mrr,
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
    initialDevelopmentInvestment: input.initialDevelopmentInvestment,
    legalAndCompanySetup: input.legalAndCompanySetup,
    initialInfrastructureSetup: input.initialInfrastructureSetup,
    brandAndWebsite: input.brandAndWebsite,
    launchMarketing: input.launchMarketing,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));

  const recurringContributionBeforeAcquisition = revenueAfterCommission - serverVariableCost - supportVariableCost;
  const contributionPerSubscriber = percent(recurringContributionBeforeAcquisition, endingSubscribers);
  const ltv = input.monthlyChurnRate > 0 ? contributionPerSubscriber / input.monthlyChurnRate : null;
  const ltvCacRatio = ltv == null || input.cacPerSubscriber <= 0 ? null : ltv / input.cacPerSubscriber;
  const cacPaybackMonths = contributionPerSubscriber > 0 ? input.cacPerSubscriber / contributionPerSubscriber : null;
  const serverCostPerActiveSubscriber = percent(input.serverBaseCost + serverVariableCost, endingSubscribers);
  const supportCostPerActiveSubscriber = percent(input.supportStaffCost + supportVariableCost, endingSubscribers);
  const grossMargin = percent(recurringContributionBeforeAcquisition, revenueAfterCommission);
  const profitMargin = percent(netProfit, adjustedRevenue);
  const largestExpense = findLargestExpense({
    ...fixedCostItems,
    serverVariableCost,
    supportVariableCost,
    acquisitionSpend,
    platformCommission,
    paymentCommission,
  });

  return {
    input,
    openingSubscribers: input.openingSubscribers,
    churnedSubscribers,
    newSubscribers: input.monthlyNewSubscribers,
    endingSubscribers,
    netSubscriberChange,
    openingMRR,
    newMRR,
    churnedMRR,
    netNewMRR,
    potentialMRR,
    mrr,
    arr,
    grossRevenue: potentialMRR,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: adjustedRevenue,
    lostSalesAmount: churnedMRR,
    adjustedRevenue,
    platformRevenue,
    directRevenue,
    platformCommission,
    paymentCommission,
    totalCommissions,
    revenueAfterCommission,
    netMRR,
    serverVariableCost,
    supportVariableCost,
    acquisitionSpend,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    fixedCostItems,
    totalFixedCosts,
    cashFixedCosts,
    partnerPayout,
    totalStakeholderPayouts,
    preTaxProfit,
    estimatedTax,
    netProfit,
    setupCostItems,
    totalSetupCost,
    recurringContributionBeforeAcquisition,
    contributionPerSubscriber,
    ltv,
    ltvCacRatio,
    cacPaybackMonths,
    serverCostPerActiveSubscriber,
    supportCostPerActiveSubscriber,
    grossMargin,
    profitMargin,
    largestExpense,
  };
}

export function calculateSaasModel(rawInputs) {
  const input = normalizeSaasInputs(rawInputs);
  const current = calculateSaasMonth(input);
  const breakevenOpeningSubscribersRaw = solveBreakeven({
    min: 0,
    max: 100000000,
    tolerance: 0.01,
    evaluate: (openingSubscribers) => calculateSaasMonth(input, { openingSubscribers }).netProfit,
  });
  const breakevenOpeningSubscribers = breakevenOpeningSubscribersRaw == null
    ? null
    : Math.ceil(breakevenOpeningSubscribersRaw);
  const breakevenResult = breakevenOpeningSubscribers == null
    ? null
    : calculateSaasMonth(input, { openingSubscribers: breakevenOpeningSubscribers });
  const breakevenSubscribers = breakevenResult?.endingSubscribers ?? null;
  const breakevenRevenue = breakevenResult?.mrr ?? null;

  const subscriberSchedule = buildSubscriberSchedule(input, 12);
  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: input.collectionDelayDays,
    supplierPaymentDelayDays: 0,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: 0,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier, month) => {
      const openingSubscribers = subscriberSchedule[month - 1]?.openingSubscribers ?? input.openingSubscribers;
      const monthlyNewSubscribers = subscriberSchedule[month - 1]?.newSubscribers ?? input.monthlyNewSubscribers;
      const monthlyPrice = month === 1 ? input.monthlyPrice * growthMultiplier : input.monthlyPrice;
      return calculateSaasMonth(input, { openingSubscribers, monthlyNewSubscribers, monthlyPrice });
    },
  });
  cashFlow.rows = cashFlow.rows.map((row, index) => ({
    ...row,
    openingSubscribers: subscriberSchedule[index]?.openingSubscribers ?? 0,
    churnedSubscribers: subscriberSchedule[index]?.churnedSubscribers ?? 0,
    newSubscribers: subscriberSchedule[index]?.newSubscribers ?? 0,
    endingSubscribers: subscriberSchedule[index]?.endingSubscribers ?? 0,
  }));

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildSaasWarnings({ current, cashFlow, breakevenSubscribers, input });

  return {
    ...current,
    breakevenOpeningSubscribers,
    breakevenSubscribers,
    breakevenRevenue,
    subscriberSchedule,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Ay sonu MRR",
        loss: "Churn MRR etkisi",
        commission: "Platform ve ödeme kesintisi",
        variable: "Altyapı, destek ve CAC",
        fixed: "Ürün ve işletme sabit giderleri",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: "Ay sonu aktif abone × aylık fiyat",
      lossSubtext: "Ay içinde kaybedilen abonelerin MRR karşılığı",
      commissionSubtext: "App Store / platform ve ödeme sağlayıcı",
      variableSubtext: "Abone başı altyapı, destek ve yeni müşteri kazanımı",
      fixedSubtext: "Geliştirme, destek ekibi, pazarlama ve genel giderler",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

function buildSubscriberSchedule(input, months) {
  const rows = [];
  let openingSubscribers = input.openingSubscribers;
  for (let month = 1; month <= months; month += 1) {
    const churnedSubscribers = openingSubscribers * input.monthlyChurnRate;
    const newSubscribers = input.monthlyNewSubscribers;
    const endingSubscribers = Math.max(0, openingSubscribers - churnedSubscribers + newSubscribers);
    rows.push({ month, openingSubscribers, churnedSubscribers, newSubscribers, endingSubscribers });
    openingSubscribers = endingSubscribers;
  }
  return rows;
}

export function calculateSaasScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(SAAS_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(SAAS_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap
      ? normalizeSaasInputs(baseOrScenarioInputs[id])
      : applySaasScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateSaasModel(inputs) };
  });
}

export function buildSaasWarnings({ current, cashFlow, breakevenSubscribers, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda SaaS işletmesi aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Kurulum ve ilk dönem büyümesi ilk 3 ayda nakit açığı oluşturuyor.");
  if (input.monthlyChurnRate > 0.10) add("churn_hard", "hard", "Aylık churn %10'un üzerinde; abone tabanı hızla eriyor.");
  else if (input.monthlyChurnRate > 0.05) add("churn_soft", "soft", "Aylık churn %5'in üzerinde; ürün bağlılığı ve müşteri başarısı izlenmeli.");
  if (current.netSubscriberChange < 0) add("subscriber_decline", "hard", "Yeni aboneler churn kaybını karşılamıyor; aktif abone sayısı küçülüyor.");
  if (current.ltvCacRatio != null && current.ltvCacRatio < 1) add("ltv_cac_hard", "hard", "LTV/CAC 1'in altında; müşteri yaşam boyu katkısı kazanım maliyetini karşılamıyor.");
  else if (current.ltvCacRatio != null && current.ltvCacRatio < 3) add("ltv_cac_soft", "soft", "LTV/CAC 3'ün altında; müşteri kazanım verimliliği zayıf.");
  if (current.cacPaybackMonths != null && current.cacPaybackMonths > 18) add("cac_payback_hard", "hard", "CAC geri ödeme süresi 18 ayı aşıyor.");
  else if (current.cacPaybackMonths != null && current.cacPaybackMonths > 12) add("cac_payback_soft", "soft", "CAC geri ödeme süresi 12 ayı aşıyor.");
  const serverShareOfPrice = percent(current.serverCostPerActiveSubscriber, input.monthlyPrice);
  if (serverShareOfPrice > 0.30) add("server_cost_hard", "hard", "Abone başı sunucu maliyeti aylık fiyatın %30'unu aşıyor.");
  else if (serverShareOfPrice > 0.15) add("server_cost_soft", "soft", "Abone başı sunucu maliyeti aylık fiyata göre yüksek.");
  if (breakevenSubscribers == null) add("breakeven_impossible", "hard", "Mevcut fiyat ve maliyetlerle başabaş abone sayısı bulunamıyor.");
  else if (breakevenSubscribers > current.endingSubscribers * 2) add("breakeven_high", "soft", "Başabaş abone sayısı mevcut aktif abone sayısının iki katından fazla.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.08) add("low_margin", "soft", "Net kâr marjı %8'in altında; churn veya CAC sapması modeli zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir SaaS / abonelik uyarısı oluşmadı.");
  return warnings;
}
