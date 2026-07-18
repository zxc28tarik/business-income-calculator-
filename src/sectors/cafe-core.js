import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { SCENARIO_PRESETS, applyScenario, normalizeCafeInputs } from "./cafe-config.js";
import {
  buildCafeProfileWarnings,
  deriveCafeDemand,
  getCafeBusinessProfile,
} from "./cafe-business-profile-engine.js";

function calculateChannelLayer(input, monthlyCustomers) {
  if (!input.advancedChannelMixEnabled) {
    const grossRevenue = monthlyCustomers * input.averageTicket;
    return {
      grossRevenue,
      channelShareTotal: 1,
      channelRows: [],
      deliveryOrders: monthlyCustomers * input.deliverySalesShare,
      deliveryOrderShare: input.deliverySalesShare,
      deliveryTicketRevenueShare: input.deliverySalesShare,
    };
  }

  const channelRows = input.salesChannels.map((channel) => {
    const orders = monthlyCustomers * channel.orderShareRate;
    const grossRevenue = orders * input.averageTicket * channel.ticketMultiplier;
    return { ...channel, orders, grossRevenue };
  });
  const grossRevenue = channelRows.reduce((total, row) => total + row.grossRevenue, 0);
  const deliveryRows = channelRows.filter((row) => row.isDelivery);
  const deliveryOrders = deliveryRows.reduce((total, row) => total + row.orders, 0);
  const deliveryGross = deliveryRows.reduce((total, row) => total + row.grossRevenue, 0);
  return {
    grossRevenue,
    channelShareTotal: input.salesChannels.reduce((total, row) => total + row.orderShareRate, 0),
    channelRows,
    deliveryOrders,
    deliveryOrderShare: monthlyCustomers > 0 ? deliveryOrders / monthlyCustomers : 0,
    deliveryTicketRevenueShare: grossRevenue > 0 ? deliveryGross / grossRevenue : 0,
  };
}

function calculateProductLayer(input, adjustedRevenue) {
  if (!input.advancedProductMixEnabled) {
    const materialCost = adjustedRevenue * input.materialCostRate;
    const wasteCost = materialCost * input.wasteRate;
    return {
      materialCost,
      wasteCost,
      productShareTotal: 1,
      effectiveMaterialCostRate: input.materialCostRate,
      effectiveWasteRate: input.wasteRate,
      productRows: [],
    };
  }

  const productRows = input.productMix.map((item) => ({
    ...item,
    revenue: adjustedRevenue * item.revenueShareRate,
    materialCost: adjustedRevenue * item.revenueShareRate * item.materialCostRate,
    wasteCost: adjustedRevenue * item.revenueShareRate * item.materialCostRate * item.wasteRate,
  }));
  const materialCost = productRows.reduce((total, row) => total + row.materialCost, 0);
  const wasteCost = productRows.reduce((total, row) => total + row.wasteCost, 0);
  const productShareTotal = input.productMix.reduce((total, row) => total + row.revenueShareRate, 0);
  return {
    materialCost,
    wasteCost,
    productShareTotal,
    effectiveMaterialCostRate: percent(materialCost, adjustedRevenue),
    effectiveWasteRate: percent(wasteCost, materialCost),
    productRows,
  };
}

function demandPatch(input, value) {
  const profile = getCafeBusinessProfile(input.businessType);
  if (profile.driver === "seat_turnover") return { occupancyRate: value };
  if (profile.driver === "hourly_orders") return { ordersPerHour: value };
  if (profile.driver === "delivery_orders") return { dailyDeliveryOrders: value };
  if (profile.driver === "event_customers") return { customersPerEvent: value };
  return { dailyCustomers: value };
}

function driverBounds(input) {
  const profile = getCafeBusinessProfile(input.businessType);
  if (profile.driver === "seat_turnover") return { min: 0, max: 2 };
  if (profile.driver === "hourly_orders") return { min: 0, max: Math.max(1000, input.maxOrdersPerHour * 10) };
  if (profile.driver === "delivery_orders") return { min: 0, max: Math.max(10000, input.dailyKitchenCapacity * 20) };
  if (profile.driver === "event_customers") return { min: 0, max: Math.max(10000, input.maxCustomersPerEvent * 20) };
  return { min: 0, max: Math.max(10000, input.serviceCapacity * 20) };
}

function dailyCustomersAtDriver(input, value) {
  return deriveCafeDemand(normalizeCafeInputs({ ...input, ...demandPatch(input, value) })).metrics.dailyCustomers;
}

function scaleDemand(input, multiplier) {
  const profile = getCafeBusinessProfile(input.businessType);
  if (profile.driver === "seat_turnover") return { occupancyRate: input.occupancyRate * multiplier };
  if (profile.driver === "hourly_orders") return { ordersPerHour: input.ordersPerHour * multiplier };
  if (profile.driver === "delivery_orders") return { dailyDeliveryOrders: input.dailyDeliveryOrders * multiplier };
  if (profile.driver === "event_customers") return { customersPerEvent: input.customersPerEvent * multiplier };
  return { dailyCustomers: input.dailyCustomers * multiplier };
}

export function calculateCafeMonth(rawInputs, overrides = {}) {
  const normalized = normalizeCafeInputs({ ...rawInputs, ...overrides });
  const demand = deriveCafeDemand(normalized);
  const input = demand.input;
  const monthlyCustomers = demand.metrics.monthlyCustomers;
  const channels = calculateChannelLayer(input, monthlyCustomers);
  const tax = calcTaxSplit({ grossRevenue: channels.grossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const lostSalesAmount = tax.netBase * input.lostSalesRate;
  const adjustedRevenue = tax.netBase - lostSalesAmount;

  let deliveryRevenue = adjustedRevenue * channels.deliveryTicketRevenueShare;
  let deliveryCommission = 0;
  let packagingCost = 0;
  let channelRows = channels.channelRows;
  if (input.advancedChannelMixEnabled) {
    channelRows = channels.channelRows.map((row) => {
      const revenueShare = channels.grossRevenue > 0 ? row.grossRevenue / channels.grossRevenue : 0;
      const netRevenue = adjustedRevenue * revenueShare;
      const commission = netRevenue * row.commissionRate;
      const packaging = row.orders * row.packagingCostPerOrder;
      return { ...row, revenueShare, netRevenue, commission, packaging };
    });
    deliveryCommission = channelRows.reduce((total, row) => total + row.commission, 0);
    packagingCost = channelRows.reduce((total, row) => total + row.packaging, 0);
    deliveryRevenue = channelRows.filter((row) => row.isDelivery).reduce((total, row) => total + row.netRevenue, 0);
  } else {
    deliveryCommission = calcCommission(deliveryRevenue, input.deliveryCommissionRate);
    packagingCost = channels.deliveryOrders * input.packagingCostPerDeliveryOrder;
  }

  const dineInRevenue = adjustedRevenue - deliveryRevenue;
  const posCommission = calcCommission(adjustedRevenue * input.cardSalesShare, input.posCommissionRate);
  const totalCommissions = deliveryCommission + posCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const products = calculateProductLayer(input, adjustedRevenue);
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = products.materialCost + products.wasteCost + packagingCost + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const fixedCostItems = {
    rent: input.rent, staffCost: input.staffCost, utilities: input.utilities, accounting: input.accounting,
    software: input.software, cleaning: input.cleaning, maintenance: input.maintenance,
    insurance: input.insurance, otherFixedExpenses: input.otherFixedExpenses,
  };
  const operatingFixedCosts = sumValues(Object.values(fixedCostItems));

  const setupCostItems = {
    renovation: input.renovation, equipment: input.equipment, furniture: input.furniture,
    deposit: input.deposit, initialStock: input.initialStock, licenseFees: input.licenseFees,
    openingMarketing: input.openingMarketing, softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const depreciableSetupCost = input.renovation + input.equipment + input.furniture + input.softwareSetup;
  const monthlyDepreciation = input.depreciationEnabled
    ? depreciableSetupCost / Math.max(1, input.depreciationYears * 12)
    : 0;
  const totalFixedCosts = operatingFixedCosts + monthlyDepreciation;

  const operatingGrantIncome = input.monthlyOperatingGrantIncome;
  const basisValues = {
    grossRevenue: channels.grossRevenue,
    revenueAfterCommission,
    contribution,
    preTaxBeforePartner: contribution + operatingGrantIncome - totalFixedCosts,
  };
  const royaltyBasis = stakeholderBasisAmount(input.franchiseRoyaltyBasis, basisValues);
  const franchiseRoyalty = royaltyBasis * input.franchiseRoyaltyRate;
  const preTaxBeforePartner = contribution + operatingGrantIncome - totalFixedCosts - franchiseRoyalty;
  const partnerPayout = Math.max(0, preTaxBeforePartner) * input.partnerProfitShareRate;
  const totalStakeholderPayouts = franchiseRoyalty + partnerPayout;
  const preTaxProfit = preTaxBeforePartner - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;

  const largestExpense = findLargestExpense({
    ...fixedCostItems, monthlyDepreciation, materialCost: products.materialCost, wasteCost: products.wasteCost,
    packagingCost, deliveryCommission, posCommission,
  });

  return {
    input,
    profile: demand.profile,
    profileMetrics: demand.metrics,
    grossRevenue: channels.grossRevenue,
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
    materialCost: products.materialCost,
    wasteCost: products.wasteCost,
    packagingCost,
    otherVariableCost,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    operatingGrantIncome,
    fixedCostItems,
    operatingFixedCosts,
    monthlyDepreciation,
    cashFixedCosts: operatingFixedCosts,
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
    depreciableSetupCost,
    monthlyCustomers,
    deliveryOrders: channels.deliveryOrders,
    channelRows,
    productRows: products.productRows,
    channelShareTotal: channels.channelShareTotal,
    productShareTotal: products.productShareTotal,
    capacityUtilization: demand.metrics.capacityUtilization,
    grossProfit: contribution,
    profitMargin: percent(netProfit, tax.netBase),
    rentToRevenue: percent(input.rent, tax.netBase),
    foodCostRate: percent(products.materialCost + products.wasteCost, adjustedRevenue),
    commissionLoad: percent(totalCommissions, adjustedRevenue),
    unitNetProfit: monthlyCustomers > 0 ? netProfit / monthlyCustomers : 0,
    largestExpense,
  };
}

export function calculateCafeModel(rawInputs) {
  const input = normalizeCafeInputs(rawInputs);
  const current = calculateCafeMonth(input);
  const bounds = driverBounds(input);
  const breakevenDriverValue = solveBreakeven({
    ...bounds,
    evaluate: (value) => calculateCafeMonth(input, demandPatch(input, value)).netProfit,
  });
  const breakevenDailyCustomers = breakevenDriverValue == null ? null : dailyCustomersAtDriver(input, breakevenDriverValue);
  const breakevenRevenue = breakevenDriverValue == null
    ? null
    : calculateCafeMonth(input, demandPatch(input, breakevenDriverValue)).grossRevenue;

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
    evaluateMonth: (growthMultiplier) => calculateCafeMonth(input, scaleDemand(input, growthMultiplier)),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const result = {
    ...current,
    breakevenDriverValue,
    breakevenDriverLabel: current.profileMetrics.driverLabel,
    breakevenDailyCustomers,
    breakevenUnits: breakevenDriverValue,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
  };
  result.warnings = buildCafeWarnings({ current: result, cashFlow, breakevenDailyCustomers, input: result.input });
  result.waterfall = buildWaterfall(result, {
    labels: { loss: "İptal / kayıp" },
    variableSubtext: "Ürün karması, fire ve paketleme",
    fixedSubtext: "Sabit gider ve amortisman",
    stakeholderSubtext: "Franchise ve ortak",
  });
  return result;
}

export function calculateScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(SCENARIO_PRESETS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(SCENARIO_PRESETS).map(([id, preset]) => {
    const inputs = isScenarioMap ? normalizeCafeInputs(baseOrScenarioInputs[id]) : applyScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateCafeModel(inputs) };
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
  if (input.advancedChannelMixEnabled && Math.abs(current.channelShareTotal - 1) > 0.005) {
    add("channel_mix_total", "hard", "Satış kanallarındaki sipariş paylarının toplamı %100 olmalıdır.");
  }
  if (input.advancedProductMixEnabled && Math.abs(current.productShareTotal - 1) > 0.005) {
    add("product_mix_total", "hard", "Ürün karmasındaki ciro paylarının toplamı %100 olmalıdır.");
  }
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük sapmalar zarara çevirebilir.");
  warnings.push(...buildCafeProfileWarnings(current));
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir finansal uyarı oluşmadı.");
  return warnings;
}
