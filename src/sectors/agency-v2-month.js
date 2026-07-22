import {
  calcCommission, calcTaxSplit, findLargestExpense, percent, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { normalizeAgencyInputs } from "./agency-v2-config.js";
import {
  deriveAgencyCapacity, deriveAgencyRevenueAndHours, deriveAgencySubcontractors,
} from "./agency-profile-engine.js";

export function calculateAgencyMonth(rawInputs, overrides = {}) {
  const input = normalizeAgencyInputs({ ...rawInputs, ...overrides });
  const revenue = deriveAgencyRevenueAndHours(input);
  const capacity = deriveAgencyCapacity(input);
  const subcontractors = deriveAgencySubcontractors(input);

  const grossRevenue = revenue.grossRevenue;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;
  const platformCommission = calcCommission(adjustedRevenue * input.platformSalesShare, input.platformCommissionRate);
  const paymentCommission = calcCommission(adjustedRevenue * input.cardPaymentShare, input.paymentCommissionRate);
  const totalCommissions = platformCommission + paymentCommission;
  const serviceRevenueAfterCommission = adjustedRevenue - totalCommissions;
  const operatingGrantIncome = input.monthlyOperatingGrantIncome;
  const revenueAfterCommission = serviceRevenueAfterCommission + operatingGrantIncome;

  const totalDeliveryHours = revenue.totalDeliveryHours;
  const internalDeliveryHours = Math.max(0, totalDeliveryHours - subcontractors.hoursSupplied);
  const internalShare = totalDeliveryHours > 0 ? internalDeliveryHours / totalDeliveryHours : 0;
  const baseProjectHours = revenue.baseHours;
  const revisionHours = revenue.revisionHours;
  const baseTeamCost = baseProjectHours * internalShare * capacity.weightedHourlyCost;
  const revisionCost = revisionHours * internalShare * capacity.weightedHourlyCost;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const freelancerPayments = subcontractors.monthlyCost;
  const totalVariableCosts = baseTeamCost + revisionCost + freelancerPayments + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const theoreticalCapacityHours = capacity.theoreticalCapacityHours;
  const targetBillableCapacityHours = capacity.targetBillableCapacityHours;
  const capacityUtilization = percent(internalDeliveryHours, theoreticalCapacityHours);
  const targetCapacityLoad = percent(internalDeliveryHours, targetBillableCapacityHours);
  const internalCapacityLoad = targetCapacityLoad;
  const totalAvailableDeliveryHours = targetBillableCapacityHours + subcontractors.hoursSupplied;
  const unfundedDeliveryHours = Math.max(0, totalDeliveryHours - totalAvailableDeliveryHours);

  const fixedCostItems = {
    adminStaffCost: input.adminStaffCost,
    officeRent: input.officeRent,
    utilities: input.utilities,
    accounting: input.accounting,
    softwareSubscriptions: input.softwareSubscriptions,
    monthlyMarketing: input.monthlyMarketing,
    insurance: input.insurance,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const totalFixedCosts = sumValues(Object.values(fixedCostItems));
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
    hardwareInvestment: input.hardwareInvestment,
    officeSetup: input.officeSetup,
    deposit: input.deposit,
    legalAndCompanySetup: input.legalAndCompanySetup,
    websiteAndBranding: input.websiteAndBranding,
    initialMarketing: input.initialMarketing,
    softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const effectiveHourlySales = percent(grossRevenue, totalDeliveryHours);
  const effectiveHourlyContribution = percent(contribution, totalDeliveryHours);
  const referenceHourlyRevenue = totalDeliveryHours * input.hourlySalesPrice;
  const pricingGap = grossRevenue - referenceHourlyRevenue;
  const revisionCostRatio = percent(revisionCost, adjustedRevenue);
  const deliveryCostRatio = percent(baseTeamCost + revisionCost + freelancerPayments, adjustedRevenue);
  const revenuePerEmployee = percent(grossRevenue, capacity.productionHeadcount || input.teamSize);
  const projectNetProfit = percent(netProfit, revenue.equivalentUnits);
  const hourlyNetProfit = percent(netProfit, totalDeliveryHours);
  const largestExpense = findLargestExpense({
    ...fixedCostItems, baseTeamCost, revisionCost, freelancerPayments,
    platformCommission, paymentCommission,
  });

  return {
    input,
    profile: revenue.profile,
    profileMetrics: {
      driverValue: revenue.driverValue,
      driverLabel: revenue.driverLabel,
      coreRevenue: revenue.coreRevenue,
      revisionRevenue: revenue.revisionRevenue,
      equivalentUnits: revenue.equivalentUnits,
    },
    grossRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: adjustedRevenue,
    lostSalesAmount: 0,
    adjustedRevenue,
    platformCommission,
    paymentCommission,
    totalCommissions,
    serviceRevenueAfterCommission,
    operatingGrantIncome,
    revenueAfterCommission,
    baseProjectHours,
    revisionHours,
    totalDeliveryHours,
    theoreticalCapacityHours,
    targetBillableCapacityHours,
    capacityUtilization,
    targetCapacityLoad,
    internalCapacityLoad,
    totalAvailableDeliveryHours,
    unfundedDeliveryHours,
    internalDeliveryHours,
    baseTeamCost,
    revisionCost,
    freelancerPayments,
    otherVariableCost,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    fixedCostItems,
    totalFixedCosts,
    cashFixedCosts: totalFixedCosts,
    partnerPayout,
    totalStakeholderPayouts,
    preTaxProfit,
    estimatedTax,
    netProfit,
    setupCostItems,
    totalSetupCost,
    effectiveHourlySales,
    effectiveHourlyContribution,
    referenceHourlyRevenue,
    pricingGap,
    revisionCostRatio,
    deliveryCostRatio,
    revenuePerEmployee,
    projectNetProfit,
    hourlyNetProfit,
    profitMargin: percent(netProfit, adjustedRevenue),
    staffRows: capacity.staffRows,
    subcontractorRows: subcontractors.subcontractorRows,
    subcontractorHours: subcontractors.hoursSupplied,
    largestExpense,
  };
}
