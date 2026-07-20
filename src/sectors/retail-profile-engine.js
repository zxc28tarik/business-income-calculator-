import { clampRate, percent, stakeholderBasisAmount, findLargestExpense } from "../core/finance-engine.js";
import { calculateRetailMonth as calculateLegacyMonth } from "./retail-core.js";
import { getRetailBusinessProfile } from "./retail-business-profiles.js";
import { normalizeRetailInputs } from "./retail-v2-config.js";

function weightedRows(rows, shareKey, seed, apply) {
  const total = rows.reduce((sum, row) => sum + row[shareKey], 0) || 1;
  return rows.reduce((acc, row) => apply(acc, row, row[shareKey] / total), structuredClone(seed));
}

function productMetrics(input) {
  if (!input.advancedProductMixEnabled || !input.productMix.length) {
    return {
      salePrice: input.averageUnitSalePrice,
      unitCostBeforeDiscount: input.averageUnitCost,
      returnRate: input.returnRate,
      markdownShareRate: input.markdownShareRate,
      markdownDiscountRate: input.markdownDiscountRate,
      spoilageRate: input.spoilageRate,
    };
  }
  return weightedRows(input.productMix, "salesShareRate", {
    salePrice: 0, unitCostBeforeDiscount: 0, returnRate: 0,
    markdownShareRate: 0, markdownDiscountRate: 0, spoilageRate: 0,
  }, (acc, row, weight) => {
    acc.salePrice += row.salePrice * weight;
    acc.unitCostBeforeDiscount += row.unitCost * weight;
    acc.returnRate += row.returnRate * weight;
    acc.markdownShareRate += row.markdownShareRate * weight;
    acc.markdownDiscountRate += row.markdownDiscountRate * weight;
    acc.spoilageRate += row.spoilageRate * weight;
    return acc;
  });
}

function supplierMetrics(input) {
  if (!input.advancedSupplierMixEnabled || !input.suppliers.length) {
    return {
      paymentDelayDays: input.supplierPaymentDelayDays,
      leadTimeDays: input.supplierLeadTimeDays,
      discountRate: input.purchaseDiscountRate,
      minimumOrderAmount: 0,
    };
  }
  return weightedRows(input.suppliers, "purchaseShareRate", {
    paymentDelayDays: 0, leadTimeDays: 0, discountRate: 0, minimumOrderAmount: 0,
  }, (acc, row, weight) => {
    acc.paymentDelayDays += row.paymentDelayDays * weight;
    acc.leadTimeDays += row.leadTimeDays * weight;
    acc.discountRate += row.discountRate * weight;
    acc.minimumOrderAmount += row.minimumOrderAmount;
    return acc;
  });
}

function deriveDemand(input, profile) {
  const season = input.seasonalityMultiplier || 1;
  if (!input.profileDriverEnabled) {
    return { dailyTransactions: input.dailyCustomers, averageBasket: input.averageBasket, monthlyTransactions: input.dailyCustomers * input.openDays };
  }
  if (profile.driver === "customer_frequency") {
    const monthlyTransactions = input.activeCustomerBase * input.monthlyPurchaseFrequency * season;
    return { monthlyTransactions, dailyTransactions: monthlyTransactions / input.openDays, averageBasket: input.averageBasket };
  }
  if (profile.driver === "orders_events") {
    const standardTransactions = input.dailyOrders * input.openDays * season;
    const eventTransactions = input.eventOrdersPerMonth * season;
    const monthlyTransactions = standardTransactions + eventTransactions;
    const gross = standardTransactions * input.averageBasket + eventTransactions * input.eventOrderValue;
    return { monthlyTransactions, dailyTransactions: monthlyTransactions / input.openDays, averageBasket: monthlyTransactions > 0 ? gross / monthlyTransactions : input.averageBasket };
  }
  if (profile.driver === "hourly_transactions") {
    const dailyTransactions = input.transactionsPerHour * input.openHoursPerDay * season;
    return { dailyTransactions, averageBasket: input.averageBasket, monthlyTransactions: dailyTransactions * input.openDays };
  }
  const dailyTransactions = input.dailyFootTraffic * input.conversionRate * season;
  return { dailyTransactions, averageBasket: input.averageBasket, monthlyTransactions: dailyTransactions * input.openDays };
}

export function deriveRetailProfileInputs(rawInputs) {
  const input = normalizeRetailInputs(rawInputs);
  const profile = getRetailBusinessProfile(input.businessType);
  const demand = deriveDemand(input, profile);
  const product = productMetrics(input);
  const supplier = supplierMetrics(input);
  const markdownFactor = 1 - clampRate(product.markdownShareRate) * clampRate(product.markdownDiscountRate);
  const effectiveBasket = demand.averageBasket * markdownFactor;
  const effectiveSalePrice = Math.max(0.01, product.salePrice * markdownFactor);
  const effectiveUnitCost = product.unitCostBeforeDiscount * (1 - clampRate(supplier.discountRate));
  const combinedLossRate = 1 - (1 - clampRate(input.inventoryLossRate)) * (1 - clampRate(product.spoilageRate));
  return {
    input, profile, demand, product, supplier,
    legacyInputs: {
      ...input,
      dailyCustomers: demand.dailyTransactions,
      averageBasket: effectiveBasket,
      averageUnitSalePrice: effectiveSalePrice,
      averageUnitCost: effectiveUnitCost,
      returnRate: product.returnRate,
      inventoryLossRate: combinedLossRate,
      supplierPaymentDelayDays: Math.min(30, supplier.paymentDelayDays),
    },
  };
}

export function calculateRetailProfileMonth(rawInputs, overrides = {}) {
  const derived = deriveRetailProfileInputs({ ...rawInputs, ...overrides });
  const { input, profile, demand, product, supplier, legacyInputs } = derived;
  const base = calculateLegacyMonth(legacyInputs);
  const operatingGrantIncome = input.monthlyOperatingGrantIncome;
  const adjustedRevenue = base.adjustedRevenue + operatingGrantIncome;
  const revenueAfterCommission = base.revenueAfterCommission + operatingGrantIncome;
  const contribution = base.contribution + operatingGrantIncome;
  const fixedCostItems = {
    ...base.fixedCostItems,
    ...(input.monthlyDepreciation ? { monthlyDepreciation: input.monthlyDepreciation } : {}),
  };
  const totalFixedCosts = base.totalFixedCosts + input.monthlyDepreciation;
  const partnerBasis = stakeholderBasisAmount("pre_tax_profit", {
    grossRevenue: base.grossRevenue,
    revenueAfterCommission,
    contribution,
    preTaxBeforePartner: contribution - totalFixedCosts,
  });
  const partnerPayout = partnerBasis * input.partnerProfitShareRate;
  const preTaxProfit = contribution - totalFixedCosts - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;
  const inventoryCapital = input.inventoryPlanningEnabled ? input.currentInventoryCost : input.initialStockInvestment;
  const dailyProductCost = base.productCost / Math.max(1, input.openDays);
  const stockCoverageDays = dailyProductCost > 0 ? inventoryCapital / dailyProductCost : null;
  const targetInventoryCost = dailyProductCost * input.targetStockCoverageDays;
  const workingCapitalGap = Math.max(0, targetInventoryCost - inventoryCapital);
  const excessInventoryCost = Math.max(0, inventoryCapital - targetInventoryCost);
  const reorderPointCost = dailyProductCost * (supplier.leadTimeDays + input.safetyStockDays);
  const purchaseDiscountSavings = base.retainedUnits * Math.max(0, product.unitCostBeforeDiscount - legacyInputs.averageUnitCost);
  const annualStockTurnover = inventoryCapital > 0 ? base.productCost * 12 / inventoryCapital : null;
  const salesCapacityLoad = percent(demand.dailyTransactions, input.storeDailyCapacity);
  const productGrossMargin = percent(base.adjustedRevenue - base.productCost, base.adjustedRevenue);
  const largestExpense = findLargestExpense({ ...fixedCostItems, productCost: base.productCost, inventoryLossCost: base.inventoryLossCost, posCommission: base.posCommission });

  return {
    ...base,
    input, profile, demand, productMetrics: product, supplierMetrics: supplier,
    operatingGrantIncome, adjustedRevenue, revenueAfterCommission, contribution,
    fixedCostItems, totalFixedCosts, cashFixedCosts: base.totalFixedCosts,
    partnerPayout, totalStakeholderPayouts: partnerPayout, preTaxProfit, estimatedTax, netProfit,
    unitNetProfit: percent(netProfit, base.retainedUnits), profitMargin: percent(netProfit, adjustedRevenue),
    productGrossMargin, annualStockTurnover, stockCoverageDays, inventoryCapital,
    targetInventoryCost, workingCapitalGap, excessInventoryCost, reorderPointCost,
    purchaseDiscountSavings, supplierMinimumOrderAmount: supplier.minimumOrderAmount,
    salesCapacityLoad, largestExpense,
  };
}
