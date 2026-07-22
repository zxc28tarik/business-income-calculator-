import { calcCommission, calcTaxSplit, findLargestExpense, percent, stakeholderBasisAmount } from "../core/finance-engine.js";
import { calculateSaasMonth as calculateLegacyMonth } from "./saas-core.js";
import { getSaasBusinessProfile } from "./saas-business-profiles.js";
import { normalizeSaasInputs } from "./saas-v2-config.js";

function weightedPlanMetrics(input) {
  if (!input.advancedPlanMixEnabled || !input.plans.length) {
    const annualMonthlyRecognized = input.monthlyPrice * input.annualBillingShareRate * (1 - input.annualDiscountRate);
    return {
      monthlyPrice: input.monthlyPrice * (1 - input.annualBillingShareRate * input.annualDiscountRate),
      annualMonthlyRecognized,
      annualBillingShareRate: input.annualBillingShareRate,
      annualDiscountRate: input.annualDiscountRate,
    };
  }
  const totalShare = input.plans.reduce((sum, row) => sum + row.subscriberShareRate, 0) || 1;
  return input.plans.reduce((acc, row) => {
    const weight = row.subscriberShareRate / totalShare;
    const annualRecognized = row.monthlyPrice * row.annualBillingShareRate * (1 - row.annualDiscountRate);
    acc.monthlyPrice += (row.monthlyPrice * (1 - row.annualBillingShareRate) + annualRecognized) * weight;
    acc.annualMonthlyRecognized += annualRecognized * weight;
    acc.annualBillingShareRate += row.annualBillingShareRate * weight;
    acc.annualDiscountRate += row.annualDiscountRate * weight;
    return acc;
  }, { monthlyPrice: 0, annualMonthlyRecognized: 0, annualBillingShareRate: 0, annualDiscountRate: 0 });
}

export function deriveSaasProfileInputs(rawInputs) {
  const input = normalizeSaasInputs(rawInputs);
  let plan = weightedPlanMetrics(input);
  let openingSubscribers = input.openingSubscribers;
  let monthlyNewSubscribers = input.monthlyNewSubscribers + input.reactivatedSubscribers;
  let monthlyChurnRate = input.monthlyChurnRate;
  let monthlyPrice = plan.monthlyPrice;

  if (input.businessType === "api_service") {
    openingSubscribers = input.apiCustomers;
    monthlyNewSubscribers = input.apiNewCustomers;
    monthlyChurnRate = input.apiMonthlyChurnRate;
    monthlyPrice = input.usageUnitsPerCustomer * input.pricePerUsageUnit;
    plan = { monthlyPrice, annualMonthlyRecognized: 0, annualBillingShareRate: 0, annualDiscountRate: 0 };
  } else if (input.businessType === "enterprise_license") {
    openingSubscribers = input.enterpriseCustomers;
    monthlyNewSubscribers = input.enterpriseNewCustomers;
    monthlyChurnRate = input.enterpriseMonthlyChurnRate;
    monthlyPrice = input.annualContractValue / 12;
    plan = { monthlyPrice, annualMonthlyRecognized: monthlyPrice, annualBillingShareRate: 1, annualDiscountRate: 0 };
  } else if (["b2c_subscription", "mobile_subscription"].includes(input.businessType)) {
    monthlyNewSubscribers += input.trialUsers * input.trialConversionRate;
  } else if (input.businessType === "freemium_saas") {
    monthlyNewSubscribers += input.freeUsers * input.freeToPaidConversionRate;
  }

  const expansionFactor = Math.max(0, 1 + input.expansionMrrRate - input.contractionMrrRate);
  monthlyPrice *= expansionFactor;
  plan = {
    ...plan,
    monthlyPrice: plan.monthlyPrice * expansionFactor,
    annualMonthlyRecognized: plan.annualMonthlyRecognized * expansionFactor,
  };
  return {
    input,
    profile: getSaasBusinessProfile(input.businessType),
    plan,
    legacyInputs: { ...input, openingSubscribers, monthlyNewSubscribers, monthlyChurnRate, monthlyPrice },
  };
}

export function calculateSaasProfileMonth(rawInputs, overrides = {}) {
  const derived = deriveSaasProfileInputs({ ...rawInputs, ...overrides });
  const { input, legacyInputs, profile, plan } = derived;
  const base = calculateLegacyMonth(legacyInputs);

  const onboardingGross = legacyInputs.monthlyNewSubscribers * input.onboardingRevenuePerNewCustomer;
  const onboardingTax = calcTaxSplit({ grossRevenue: onboardingGross, taxType: input.taxType, taxRate: input.vatRate });
  const onboardingCommission = calcCommission(onboardingTax.netBase, input.paymentCommissionRate);
  const onboardingNet = onboardingTax.netBase - onboardingCommission;
  const apiUsageCost = input.businessType === "api_service"
    ? base.endingSubscribers * input.usageUnitsPerCustomer * input.costPerUsageUnit : 0;
  const freeUserCost = input.businessType === "freemium_saas" ? input.freeUsers * input.freeUserCostPerMonth : 0;
  const profileVariableCosts = apiUsageCost + freeUserCost;
  const profileFixedCosts = input.contentProductionCost + input.communityManagementCost;
  const operatingGrantIncome = input.monthlyOperatingGrantIncome;

  const adjustedRevenue = base.adjustedRevenue + onboardingTax.netBase + operatingGrantIncome;
  const revenueAfterCommission = base.revenueAfterCommission + onboardingNet + operatingGrantIncome;
  const totalCommissions = base.totalCommissions + onboardingCommission;
  const totalVariableCosts = base.totalVariableCosts + profileVariableCosts;
  const contribution = revenueAfterCommission - totalVariableCosts;
  const fixedCostItems = {
    ...base.fixedCostItems,
    ...(input.contentProductionCost ? { contentProductionCost: input.contentProductionCost } : {}),
    ...(input.communityManagementCost ? { communityManagementCost: input.communityManagementCost } : {}),
  };
  const totalFixedCosts = base.totalFixedCosts + profileFixedCosts;
  const partnerBasis = stakeholderBasisAmount("pre_tax_profit", {
    grossRevenue: base.mrr + onboardingGross,
    revenueAfterCommission,
    contribution,
    preTaxBeforePartner: contribution - totalFixedCosts,
  });
  const partnerPayout = partnerBasis * input.partnerProfitShareRate;
  const preTaxProfit = contribution - totalFixedCosts - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;
  const recurringContribution = base.revenueAfterCommission
    - base.serverVariableCost - base.supportVariableCost - profileVariableCosts;
  const contributionPerSubscriber = percent(recurringContribution, base.endingSubscribers);
  const ltv = legacyInputs.monthlyChurnRate > 0 ? contributionPerSubscriber / legacyInputs.monthlyChurnRate : null;
  const ltvCacRatio = ltv == null || input.cacPerSubscriber <= 0 ? null : ltv / input.cacPerSubscriber;
  const cacPaybackMonths = contributionPerSubscriber > 0 ? input.cacPerSubscriber / contributionPerSubscriber : null;
  const supportCapacity = input.supportStaffCount * input.supportCapacityPerStaff;
  const supportCapacityLoad = supportCapacity > 0 ? base.endingSubscribers / supportCapacity : (base.endingSubscribers > 0 ? Infinity : 0);
  const annualRevenueShare = plan.monthlyPrice > 0 ? plan.annualMonthlyRecognized / plan.monthlyPrice : 0;
  const annualMonthlyNetCash = base.revenueAfterCommission * annualRevenueShare;
  const largestExpense = findLargestExpense({
    ...fixedCostItems,
    serverVariableCost: base.serverVariableCost,
    supportVariableCost: base.supportVariableCost,
    acquisitionSpend: base.acquisitionSpend,
    apiUsageCost,
    freeUserCost,
    platformCommission: base.platformCommission,
    paymentCommission: base.paymentCommission,
  });

  return {
    ...base,
    input,
    profile,
    planMetrics: plan,
    onboardingGross,
    onboardingNet,
    onboardingCommission,
    apiUsageCost,
    freeUserCost,
    profileVariableCosts,
    operatingGrantIncome,
    adjustedRevenue,
    revenueAfterCommission,
    totalCommissions,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    fixedCostItems,
    totalFixedCosts,
    cashFixedCosts: totalFixedCosts,
    partnerPayout,
    totalStakeholderPayouts: partnerPayout,
    preTaxProfit,
    estimatedTax,
    netProfit,
    contributionPerSubscriber,
    ltv,
    ltvCacRatio,
    cacPaybackMonths,
    grossMargin: percent(recurringContribution, base.revenueAfterCommission),
    profitMargin: percent(netProfit, adjustedRevenue),
    supportCapacity,
    supportCapacityLoad,
    annualRevenueShare,
    annualMonthlyNetCash,
    annualPrepaymentCash: annualMonthlyNetCash * 12,
    annualPrepaymentIncrement: annualMonthlyNetCash * 11,
    largestExpense,
    grossRevenue: base.potentialMRR + onboardingGross,
    customerPayment: base.customerPayment + onboardingTax.customerPayment,
    taxAmount: base.taxAmount + onboardingTax.taxAmount,
  };
}
