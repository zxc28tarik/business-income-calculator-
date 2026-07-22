import { calcCommission, calcTaxSplit, findLargestExpense, percent, stakeholderBasisAmount } from "../core/finance-engine.js";
import { calculateAutoServiceMonth as calculateLegacyMonth } from "./auto-core.js";
import { deriveAutoProfileInputs } from "./auto-profile-engine.js";

export function calculateAutoProfileMonth(rawInputs, overrides = {}) {
  const derived = deriveAutoProfileInputs({ ...rawInputs, ...overrides });
  const { input, profile, service, demand, staff, supplier, subcontract, legacyInputs } = derived;
  const base = calculateLegacyMonth({ ...legacyInputs, businessType: "car_wash" });

  const supplementalGrossRevenue = demand.recoveredCancellationRevenue + subcontract.grossRevenue;
  const supplementalTax = calcTaxSplit({ grossRevenue: supplementalGrossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const supplementalCommission = calcCommission(supplementalTax.netBase * input.cardSalesShare, input.posCommissionRate);
  const supplementalNet = supplementalTax.netBase - supplementalCommission;
  const reworkMaterialCost = base.monthlyVehicles * service.reworkRate
    * (service.consumableCost + service.energyCost + service.partsRevenue * legacyInputs.partsCostRate);
  const subcontractCost = subcontract.cost;
  const operatingGrantIncome = input.monthlyOperatingGrantIncome;

  const grossRevenue = base.grossRevenue + supplementalGrossRevenue;
  const adjustedRevenue = base.adjustedRevenue + supplementalTax.netBase + operatingGrantIncome;
  const totalCommissions = base.totalCommissions + supplementalCommission;
  const revenueAfterCommission = base.revenueAfterCommission + supplementalNet + operatingGrantIncome;
  const totalVariableCosts = base.totalVariableCosts + reworkMaterialCost + subcontractCost;
  const contribution = revenueAfterCommission - totalVariableCosts;
  const fixedCostItems = { ...base.fixedCostItems };
  const totalFixedCosts = base.totalFixedCosts;
  const cashFixedCosts = base.cashFixedCosts;

  const partnerBasis = stakeholderBasisAmount("pre_tax_profit", {
    grossRevenue,
    revenueAfterCommission,
    contribution,
    preTaxBeforePartner: contribution - totalFixedCosts,
  });
  const partnerPayout = partnerBasis * input.partnerProfitShareRate;
  const preTaxProfit = contribution - totalFixedCosts - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;
  const operatingCashProfit = netProfit + base.monthlyDepreciation;

  const inventoryMonthlyCost = base.partsCost + base.consumableCost + reworkMaterialCost;
  const inventoryDailyCost = inventoryMonthlyCost / Math.max(1, input.openDays);
  const stockCoverageDays = input.partsInventoryEnabled && inventoryDailyCost > 0
    ? input.currentPartsInventoryCost / inventoryDailyCost : null;
  const targetInventoryCost = input.partsInventoryEnabled ? inventoryDailyCost * input.targetPartsCoverageDays : 0;
  const workingCapitalGap = input.partsInventoryEnabled ? Math.max(0, targetInventoryCost - input.currentPartsInventoryCost) : 0;
  const excessInventoryCost = input.partsInventoryEnabled ? Math.max(0, input.currentPartsInventoryCost - targetInventoryCost) : 0;
  const reorderPointCost = input.partsInventoryEnabled ? inventoryDailyCost * (supplier.leadTimeDays + input.safetyStockDays) : 0;
  const supplierDiscountSavings = base.partsCost > 0 && supplier.discountRate > 0
    ? base.partsCost * supplier.discountRate / Math.max(0.000001, 1 - supplier.discountRate) : 0;
  const subcontractMargin = subcontract.grossRevenue > 0
    ? (supplementalTax.netBase - supplementalCommission - subcontractCost) / supplementalTax.netBase : null;
  const largestExpense = findLargestExpense({
    ...fixedCostItems,
    consumableCost: base.consumableCost,
    waterElectricityVariableCost: base.waterElectricityVariableCost,
    partsCost: base.partsCost,
    reworkMaterialCost,
    subcontractCost,
    posCommission: totalCommissions,
  });

  return {
    ...base,
    input,
    profile,
    serviceMetrics: service,
    demandMetrics: demand,
    staffMetrics: staff,
    supplierMetrics: supplier,
    subcontractMetrics: subcontract,
    dailyCapacity: derived.effectiveDailyCapacity,
    stationDailyCapacity: derived.stationDailyCapacity,
    staffDailyCapacity: derived.staffDailyCapacity,
    monthlyCapacity: derived.effectiveDailyCapacity * input.openDays,
    capacityUtilization: derived.capacityUtilization,
    demandFulfillmentRate: derived.demandFulfillmentRate,
    unmetDailyJobs: derived.unmetDaily,
    grossRevenue,
    cancellationRecoveryRevenue: demand.recoveredCancellationRevenue,
    subcontractGrossRevenue: subcontract.grossRevenue,
    supplementalCommission,
    customerPayment: base.customerPayment + supplementalTax.customerPayment,
    taxAmount: base.taxAmount + supplementalTax.taxAmount,
    adjustedRevenue,
    totalCommissions,
    revenueAfterCommission,
    reworkMaterialCost,
    subcontractCost,
    operatingGrantIncome,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    fixedCostItems,
    totalFixedCosts,
    cashFixedCosts,
    partnerPayout,
    totalStakeholderPayouts: partnerPayout,
    preTaxProfit,
    estimatedTax,
    netProfit,
    operatingCashProfit,
    unitNetProfit: percent(netProfit, base.monthlyVehicles),
    contributionPerVehicle: percent(contribution, base.monthlyVehicles),
    revenuePerVehicle: percent(adjustedRevenue, base.monthlyVehicles),
    variableCostPerVehicle: percent(totalVariableCosts, base.monthlyVehicles),
    profitMargin: percent(netProfit, adjustedRevenue),
    rentToRevenue: percent(input.rent, adjustedRevenue),
    staffCostRatio: percent(staff.monthlyCost, adjustedRevenue),
    consumableAndEnergyRatio: percent(base.consumableCost + base.waterElectricityVariableCost + reworkMaterialCost, adjustedRevenue),
    partsGrossMargin: service.partsRevenue > 0 ? 1 - legacyInputs.partsCostRate : null,
    inventoryPlanningEnabled: input.partsInventoryEnabled,
    inventoryCapital: input.currentPartsInventoryCost,
    inventoryMonthlyCost,
    stockCoverageDays,
    targetInventoryCost,
    workingCapitalGap,
    excessInventoryCost,
    reorderPointCost,
    supplierDiscountSavings,
    subcontractMargin,
    largestExpense,
  };
}
