import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { SCENARIO_PRESETS, applyScenario, normalizeCafeInputs } from "./cafe-config.js";

export function calculateCafeMonth(rawInputs, overrides = {}) {
  const input = normalizeCafeInputs({ ...rawInputs, ...overrides });
  const grossRevenue = input.dailyCustomers * input.averageTicket * input.openDays;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const lostSalesAmount = tax.netBase * input.lostSalesRate;
  const adjustedRevenue = tax.netBase - lostSalesAmount;

  const deliveryRevenue = adjustedRevenue * input.deliverySalesShare;
  const dineInRevenue = adjustedRevenue - deliveryRevenue;
  const deliveryCommission = calcCommission(deliveryRevenue, input.deliveryCommissionRate);
  const posCommission = calcCommission(adjustedRevenue * input.cardSalesShare, input.posCommissionRate);
  const totalCommissions = deliveryCommission + posCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const materialCost = adjustedRevenue * input.materialCostRate;
  const wasteCost = materialCost * input.wasteRate;
  const monthlyCustomers = input.dailyCustomers * input.openDays;
  const deliveryOrders = monthlyCustomers * input.deliverySalesShare;
  const packagingCost = deliveryOrders * input.packagingCostPerDeliveryOrder;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = materialCost + wasteCost + packagingCost + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const fixedCostItems = {
    rent: input.rent,
    staffCost: input.staffCost,
    utilities: input.utilities,
    accounting: input.accounting,
    software: input.software,
    cleaning: input.cleaning,
    maintenance: input.maintenance,
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
  const royaltyBasis = stakeholderBasisAmount(input.franchiseRoyaltyBasis, basisValues);
  const franchiseRoyalty = royaltyBasis * input.franchiseRoyaltyRate;
  const preTaxBeforePartner = contribution - totalFixedCosts - franchiseRoyalty;
  const partnerPayout = Math.max(0, preTaxBeforePartner) * input.partnerProfitShareRate;
  const totalStakeholderPayouts = franchiseRoyalty + partnerPayout;
  const preTaxProfit = preTaxBeforePartner - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;

  const setupCostItems = {
    renovation: input.renovation,
    equipment: input.equipment,
    furniture: input.furniture,
    deposit: input.deposit,
    initialStock: input.initialStock,
    licenseFees: input.licenseFees,
    openingMarketing: input.openingMarketing,
    softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const largestExpense = findLargestExpense({ ...fixedCostItems, materialCost, wasteCost, packagingCost, deliveryCommission, posCommission });

  return {
    input,
    grossRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: tax.netBase,
    lostSalesAmount,
    adjustedRevenue,
    deliveryRevenue,
    dineInRevenue,
    deliveryCommission,
    posCommission,
    totalCommissions,
    revenueAfterCommission,
    materialCost,
    wasteCost,
    packagingCost,
    otherVariableCost,
    totalVariableCosts,
    contribution,
    fixedCostItems,
    totalFixedCosts,
    royaltyBasis,
    franchiseRoyalty,
    partnerPayout,
    totalStakeholderPayouts,
    preTaxBeforePartner,
    preTaxProfit,
    estimatedTax,
    netProfit,
    setupCostItems,
    totalSetupCost,
    monthlyCustomers,
    deliveryOrders,
    grossProfit: contribution,
    profitMargin: percent(netProfit, tax.netBase),
    rentToRevenue: percent(input.rent, tax.netBase),
    foodCostRate: percent(materialCost + wasteCost, adjustedRevenue),
    commissionLoad: percent(totalCommissions, adjustedRevenue),
    unitNetProfit: percent(netProfit, monthlyCustomers),
    largestExpense,
  };
}

export function calculateCafeModel(rawInputs) {
  const input = normalizeCafeInputs(rawInputs);
  const current = calculateCafeMonth(input);
  const breakevenDailyCustomers = solveBreakeven({
    min: 0,
    max: Math.max(10000, input.serviceCapacity * 20),
    evaluate: (dailyCustomers) => calculateCafeMonth(input, { dailyCustomers }).netProfit,
  });
  const breakevenRevenue = breakevenDailyCustomers == null
    ? null
    : breakevenDailyCustomers * input.averageTicket * input.openDays;

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
    evaluateMonth: (growthMultiplier) => calculateCafeMonth(input, {
      dailyCustomers: input.dailyCustomers * growthMultiplier,
    }),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildCafeWarnings({ current, cashFlow, breakevenDailyCustomers, input });

  return {
    ...current,
    breakevenDailyCustomers,
    breakevenUnits: breakevenDailyCustomers,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: { loss: "İptal / kayıp" },
      variableSubtext: "Malzeme, fire ve paketleme",
      stakeholderSubtext: "Franchise ve ortak",
    }),
  };
}

export function calculateScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(SCENARIO_PRESETS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(SCENARIO_PRESETS).map(([id, preset]) => {
    const inputs = isScenarioMap ? normalizeCafeInputs(baseOrScenarioInputs[id]) : applyScenario(baseOrScenarioInputs, id);
    const result = calculateCafeModel(inputs);
    return { id, label: preset.label, inputs, result };
  });
}

export function buildCafeWarnings({ current, cashFlow, breakevenDailyCustomers, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda işletme aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "İlk 3 ay içinde nakit eksiye düşüyor; ek işletme sermayesi gerekebilir.");
  if (current.rentToRevenue > 0.20) add("rent_hard", "hard", "Kira/ciro oranı %20'nin üzerinde.");
  else if (current.rentToRevenue > 0.15) add("rent_soft", "soft", "Kira/ciro oranı yüksek görünüyor.");
  if (current.foodCostRate > 0.40) add("food_cost_hard", "hard", "Malzeme ve fire toplamı net satışın %40'ını aşıyor.");
  else if (current.foodCostRate > 0.35) add("food_cost_soft", "soft", "Malzeme maliyeti oranı dikkat gerektiriyor.");
  if (current.commissionLoad > 0.10) add("commission", "soft", "Platform ve POS komisyon yükü satışların %10'unu aşıyor.");
  if (breakevenDailyCustomers != null && input.serviceCapacity > 0 && breakevenDailyCustomers > input.serviceCapacity) {
    add("capacity", "hard", "Günlük başabaş müşteri sayısı girilen servis kapasitesinin üzerinde.");
  }
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük sapmalar zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir finansal uyarı oluşmadı.");
  return warnings;
}
