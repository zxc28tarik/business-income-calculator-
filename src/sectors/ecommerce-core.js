import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { ECOMMERCE_SCENARIOS, applyEcommerceScenario, normalizeEcommerceInputs } from "./ecommerce-config.js";
import {
  buildEcommerceProfileWarnings,
  deriveEcommerceDemand,
  getEcommerceBusinessProfile,
} from "./ecommerce-business-profile-engine.js";

function calculateProductLayer(input, unitsSold) {
  if (!input.advancedProductMixEnabled) {
    const listRevenue = unitsSold * input.productPrice;
    const returnedUnits = unitsSold * input.refundRate;
    const fulfilledUnits = Math.max(0, unitsSold - returnedUnits);
    return {
      listRevenue, returnedUnits, fulfilledUnits,
      productCost: fulfilledUnits * input.unitProductCost,
      effectiveUnitCost: input.unitProductCost,
      effectiveRefundRate: input.refundRate,
      productShareTotal: 1,
      productRows: [],
    };
  }

  const productRows = input.productMix.map((item) => {
    const units = unitsSold * item.unitShareRate;
    const listRevenue = units * input.productPrice * item.priceMultiplier;
    const returnedUnits = units * item.refundRate;
    const fulfilledUnits = Math.max(0, units - returnedUnits);
    const productCost = fulfilledUnits * item.unitCost;
    return { ...item, units, listRevenue, returnedUnits, fulfilledUnits, productCost };
  });
  const listRevenue = productRows.reduce((total, row) => total + row.listRevenue, 0);
  const returnedUnits = productRows.reduce((total, row) => total + row.returnedUnits, 0);
  const fulfilledUnits = productRows.reduce((total, row) => total + row.fulfilledUnits, 0);
  const productCost = productRows.reduce((total, row) => total + row.productCost, 0);
  return {
    listRevenue, returnedUnits, fulfilledUnits, productCost,
    effectiveUnitCost: fulfilledUnits > 0 ? productCost / fulfilledUnits : 0,
    effectiveRefundRate: unitsSold > 0 ? returnedUnits / unitsSold : 0,
    productShareTotal: input.productMix.reduce((total, row) => total + row.unitShareRate, 0),
    productRows,
  };
}

function calculateChannelLayer(input, unitsSold, baseListRevenue) {
  if (!input.advancedChannelMixEnabled) {
    return {
      listRevenue: baseListRevenue,
      channelShareTotal: 1,
      channelRows: [],
      outboundShippingCost: unitsSold * input.shippingCostPerOrder,
      packagingCost: unitsSold * input.packagingCostPerOrder,
      effectiveCollectionDelayDays: input.collectionDelayDays,
    };
  }

  const channelRows = input.salesChannels.map((item) => {
    const units = unitsSold * item.orderShareRate;
    const listRevenue = baseListRevenue * item.orderShareRate * item.priceMultiplier;
    return { ...item, units, listRevenue };
  });
  const listRevenue = channelRows.reduce((total, row) => total + row.listRevenue, 0);
  const outboundShippingCost = channelRows.reduce((total, row) => total + row.units * row.shippingCostPerOrder, 0);
  const packagingCost = channelRows.reduce((total, row) => total + row.units * row.packagingCostPerOrder, 0);
  const effectiveCollectionDelayDays = listRevenue > 0
    ? channelRows.reduce((total, row) => total + row.collectionDelayDays * row.listRevenue / listRevenue, 0)
    : input.collectionDelayDays;
  return {
    listRevenue,
    channelShareTotal: input.salesChannels.reduce((total, row) => total + row.orderShareRate, 0),
    channelRows,
    outboundShippingCost,
    packagingCost,
    effectiveCollectionDelayDays,
  };
}

function calculateAdvertisingLayer(input, grossRevenue) {
  if (!input.advancedAdMixEnabled) {
    return {
      adSpend: input.monthlyAdSpend,
      attributedOrders: 0,
      attributedRevenue: grossRevenue,
      adRows: [],
      roas: percent(grossRevenue, input.monthlyAdSpend),
      cac: 0,
    };
  }
  const adSpend = input.adChannels.reduce((total, row) => total + row.spend, 0);
  const attributedOrders = input.adChannels.reduce((total, row) => total + row.attributedOrders, 0);
  const attributedRevenue = input.adChannels.reduce((total, row) => total + row.attributedRevenue, 0);
  return {
    adSpend, attributedOrders, attributedRevenue, adRows: input.adChannels,
    roas: percent(attributedRevenue, adSpend),
    cac: attributedOrders > 0 ? adSpend / attributedOrders : 0,
  };
}

function demandPatch(input, value) {
  const profile = getEcommerceBusinessProfile(input.businessType);
  if (profile.driver === "traffic_conversion") return { conversionRate: value };
  if (profile.driver === "lead_conversion") return { leadConversionRate: value };
  if (profile.driver === "production_capacity") return { productionUtilizationRate: value };
  if (profile.driver === "subscribers") return { activeSubscribers: value };
  return { unitsSold: value };
}

function driverBounds(input) {
  const profile = getEcommerceBusinessProfile(input.businessType);
  if (["traffic_conversion", "lead_conversion", "production_capacity"].includes(profile.driver)) return { min: 0, max: 1 };
  return { min: 0, max: Math.max(1_000_000, input.monthlyOrderCapacity * 100, input.unitsSold * 100) };
}

function unitsAtDriver(input, value) {
  return deriveEcommerceDemand(normalizeEcommerceInputs({ ...input, ...demandPatch(input, value) })).metrics.unitsSold;
}

function scaleDemand(input, multiplier) {
  const profile = getEcommerceBusinessProfile(input.businessType);
  if (profile.driver === "traffic_conversion") return { conversionRate: input.conversionRate * multiplier };
  if (profile.driver === "lead_conversion") return { leadConversionRate: input.leadConversionRate * multiplier };
  if (profile.driver === "production_capacity") return { productionUtilizationRate: input.productionUtilizationRate * multiplier };
  if (profile.driver === "subscribers") return { activeSubscribers: input.activeSubscribers * multiplier };
  return { unitsSold: input.unitsSold * multiplier };
}

export function calculateEcommerceMonth(rawInputs, overrides = {}) {
  const normalized = normalizeEcommerceInputs({ ...rawInputs, ...overrides });
  const demand = deriveEcommerceDemand(normalized);
  const input = demand.input;
  const products = calculateProductLayer(input, demand.metrics.unitsSold);
  const channels = calculateChannelLayer(input, demand.metrics.unitsSold, products.listRevenue);
  const discountAmount = channels.listRevenue * input.averageDiscountRate;
  const grossRevenue = channels.listRevenue - discountAmount;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });

  const lostSalesAmount = tax.netBase * products.effectiveRefundRate;
  const supplierQualityLossAmount = tax.netBase * input.supplierQualityLossRate;
  const adjustedRevenue = Math.max(0, tax.netBase - lostSalesAmount - supplierQualityLossAmount);

  let marketplaceRevenue = adjustedRevenue * input.marketplaceSalesShare;
  let directRevenue = adjustedRevenue - marketplaceRevenue;
  let marketplaceCommission = calcCommission(marketplaceRevenue, input.marketplaceCommissionRate);
  let paymentCommission = calcCommission(adjustedRevenue * input.cardPaymentShare, input.paymentCommissionRate);
  let channelRows = channels.channelRows;
  if (input.advancedChannelMixEnabled) {
    channelRows = channels.channelRows.map((row) => {
      const revenueShare = channels.listRevenue > 0 ? row.listRevenue / channels.listRevenue : 0;
      const netRevenue = adjustedRevenue * revenueShare;
      const channelCommission = netRevenue * row.commissionRate;
      const paymentFee = netRevenue * row.paymentRate;
      return { ...row, revenueShare, netRevenue, channelCommission, paymentFee };
    });
    marketplaceRevenue = channelRows.filter((row) => row.isMarketplace).reduce((total, row) => total + row.netRevenue, 0);
    directRevenue = adjustedRevenue - marketplaceRevenue;
    marketplaceCommission = channelRows.reduce((total, row) => total + row.channelCommission, 0);
    paymentCommission = channelRows.reduce((total, row) => total + row.paymentFee, 0);
  }
  const totalCommissions = marketplaceCommission + paymentCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const laborCost = products.fulfilledUnits * input.laborCostPerUnit;
  const returnShippingCost = products.returnedUnits * input.returnShippingCostPerOrder;
  const fulfillmentCost = demand.metrics.unitsSold * input.fulfillmentCostPerOrder
    + products.fulfilledUnits * input.subscriptionFulfillmentCostPerBox;
  const crossBorderCost = adjustedRevenue * input.crossBorderCostRate;
  const shrinkageCost = input.inventoryTrackingEnabled ? products.productCost * input.shrinkageRate : 0;
  const deadStockCost = input.inventoryTrackingEnabled
    ? input.beginningInventoryUnits * products.effectiveUnitCost * input.deadStockRate / 12
    : 0;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalOrderLogistics = channels.outboundShippingCost + channels.packagingCost + returnShippingCost + fulfillmentCost;
  const totalVariableCosts = products.productCost + laborCost + totalOrderLogistics + crossBorderCost
    + shrinkageCost + deadStockCost + otherVariableCost;
  const contributionBeforeAdvertising = revenueAfterCommission - totalVariableCosts;

  const advertising = calculateAdvertisingLayer(input, grossRevenue);
  const fixedCostItems = {
    monthlyAdSpend: advertising.adSpend,
    rent: input.rent,
    warehouseCost: input.warehouseCost,
    staffCost: input.staffCost,
    software: input.software,
    accounting: input.accounting,
    utilities: input.utilities,
    insurance: input.insurance,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const operatingFixedCosts = sumValues(Object.values(fixedCostItems));

  const setupCostItems = {
    initialStockInvestment: input.initialStockInvestment,
    storeSetup: input.storeSetup,
    equipment: input.equipment,
    deposit: input.deposit,
    legalFees: input.legalFees,
    launchMarketing: input.launchMarketing,
    otherSetupCosts: input.otherSetupCosts,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const depreciableSetupCost = input.storeSetup + input.equipment;
  const monthlyDepreciation = input.depreciationEnabled
    ? depreciableSetupCost / Math.max(1, input.depreciationYears * 12)
    : 0;
  const totalFixedCosts = operatingFixedCosts + monthlyDepreciation;
  const contribution = contributionBeforeAdvertising;
  const profitAfterAdvertising = contributionBeforeAdvertising - advertising.adSpend;
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

  const inventoryWorkingCapitalNeed = demand.metrics.unitsSold * products.effectiveUnitCost * input.stockCoverageMonths;
  const dailyUnitDemand = products.fulfilledUnits / 30;
  const reorderPointUnits = dailyUnitDemand * (input.reorderLeadTimeDays + input.safetyStockDays);
  const inventoryCoverageDays = dailyUnitDemand > 0 ? input.beginningInventoryUnits / dailyUnitDemand : Infinity;
  const reorderPointCashNeed = reorderPointUnits * products.effectiveUnitCost;
  const stockCashNeed = Math.max(
    input.initialStockInvestment,
    inventoryWorkingCapitalNeed,
    input.inventoryTrackingEnabled ? reorderPointCashNeed : 0,
  );
  const inventoryTurnover = input.beginningInventoryUnits > 0
    ? products.fulfilledUnits * 12 / input.beginningInventoryUnits
    : null;
  const largestExpense = findLargestExpense({
    ...fixedCostItems, monthlyDepreciation, productCost: products.productCost,
    outboundShippingCost: channels.outboundShippingCost, returnShippingCost, marketplaceCommission,
  });

  return {
    input,
    profile: demand.profile,
    profileMetrics: demand.metrics,
    listRevenue: channels.listRevenue,
    discountAmount,
    grossRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: tax.netBase,
    lostSalesAmount,
    supplierQualityLossAmount,
    adjustedRevenue,
    returnedUnits: products.returnedUnits,
    fulfilledUnits: products.fulfilledUnits,
    marketplaceRevenue,
    directRevenue,
    marketplaceCommission,
    paymentCommission,
    totalCommissions,
    revenueAfterCommission,
    productCost: products.productCost,
    laborCost,
    outboundShippingCost: channels.outboundShippingCost,
    packagingCost: channels.packagingCost,
    returnShippingCost,
    fulfillmentCost,
    crossBorderCost,
    shrinkageCost,
    deadStockCost,
    otherVariableCost,
    totalOrderLogistics,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    contributionBeforeAdvertising,
    profitAfterAdvertising,
    advertising,
    fixedCostItems,
    operatingFixedCosts,
    monthlyDepreciation,
    cashFixedCosts: operatingFixedCosts,
    totalFixedCosts,
    operatingGrantIncome,
    partnerPayout,
    totalStakeholderPayouts,
    preTaxProfit,
    estimatedTax,
    netProfit,
    setupCostItems,
    totalSetupCost,
    depreciableSetupCost,
    inventoryWorkingCapitalNeed,
    reorderPointUnits,
    inventoryCoverageDays,
    stockCashNeed,
    inventoryTurnover,
    inventoryTrackingEnabled: input.inventoryTrackingEnabled,
    effectiveCollectionDelayDays: channels.effectiveCollectionDelayDays,
    channelRows,
    productRows: products.productRows,
    adRows: advertising.adRows,
    channelShareTotal: channels.channelShareTotal,
    productShareTotal: products.productShareTotal,
    capacityUtilization: demand.metrics.capacityUtilization,
    grossProfit: revenueAfterCommission - products.productCost - laborCost,
    profitMargin: percent(netProfit, tax.netBase),
    grossMargin: percent(revenueAfterCommission - products.productCost - laborCost, adjustedRevenue),
    commissionLoad: percent(totalCommissions, adjustedRevenue),
    shippingLoad: percent(totalOrderLogistics, adjustedRevenue),
    advertisingLoad: percent(advertising.adSpend, adjustedRevenue),
    unitNetProfit: products.fulfilledUnits > 0 ? netProfit / products.fulfilledUnits : 0,
    roas: advertising.roas,
    cac: advertising.cac,
    largestExpense,
  };
}

export function calculateEcommerceModel(rawInputs) {
  const input = normalizeEcommerceInputs(rawInputs);
  const current = calculateEcommerceMonth(input);
  const bounds = driverBounds(input);
  const breakevenDriverValue = solveBreakeven({
    ...bounds,
    evaluate: (value) => calculateEcommerceMonth(input, demandPatch(input, value)).netProfit,
  });
  const breakevenUnits = breakevenDriverValue == null ? null : unitsAtDriver(input, breakevenDriverValue);
  const breakevenRevenue = breakevenDriverValue == null
    ? null
    : calculateEcommerceMonth(input, demandPatch(input, breakevenDriverValue)).grossRevenue;

  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: current.effectiveCollectionDelayDays,
    supplierPaymentDelayDays: input.supplierPaymentDelayDays,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier) => calculateEcommerceMonth(input, scaleDemand(input, growthMultiplier)),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const result = {
    ...current,
    breakevenDriverValue,
    breakevenDriverLabel: current.profileMetrics.driverLabel,
    breakevenUnits,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
  };
  result.warnings = buildEcommerceWarnings({ current: result, cashFlow, breakevenUnits, input: result.input });
  result.waterfall = buildWaterfall(result, {
    labels: { loss: "İade ve kalite kaybı", variable: "Ürün, stok ve lojistik", fixed: "Reklam + sabit gider" },
    grossSubtext: "İndirim sonrası brüt satış",
    lossSubtext: "İade ve tedarikçi kalite kaybı",
    commissionSubtext: "Kanal ve ödeme kesintileri",
    variableSubtext: "Ürün, emek, kargo, stok ve fulfillment",
    fixedSubtext: "Reklam, personel, depo, amortisman ve genel gider",
    stakeholderSubtext: "Ortak / yatırımcı payı",
  });
  return result;
}

export function calculateEcommerceScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(ECOMMERCE_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(ECOMMERCE_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap
      ? normalizeEcommerceInputs(baseOrScenarioInputs[id])
      : applyEcommerceScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateEcommerceModel(inputs) };
  });
}

export function buildEcommerceWarnings({ current, cashFlow, breakevenUnits, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda e-ticaret operasyonu aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Stok ve operasyon giderleri ilk 3 ayda nakit açığı oluşturuyor.");
  if (current.profileMetrics && current.returnedUnits / Math.max(current.profileMetrics.unitsSold, 1) > 0.15) add("refund_hard", "hard", "Ağırlıklı iade oranı %15'in üzerinde.");
  else if (current.profileMetrics && current.returnedUnits / Math.max(current.profileMetrics.unitsSold, 1) > 0.08) add("refund_soft", "soft", "Ağırlıklı iade oranı dikkat gerektiriyor.");
  if (current.commissionLoad > 0.22) add("commission_hard", "hard", "Kanal ve ödeme kesinti yükü satışların %22'sini aşıyor.");
  else if (current.commissionLoad > 0.15) add("commission_soft", "soft", "Kanal kesinti yükü yüksek görünüyor.");
  if (current.shippingLoad > 0.18) add("shipping", "soft", "Kargo, iade kargo ve paketleme yükü net satışın %18'ini aşıyor.");
  if (current.advertisingLoad > 0.25) add("advertising", "soft", "Reklam harcaması net satışın %25'inden yüksek.");
  if (current.unitNetProfit <= 0) add("unit_loss", "hard", "Satılan ürün başına net sonuç negatif.");
  if (breakevenUnits != null && current.profileMetrics.unitsSold > 0 && breakevenUnits > current.profileMetrics.unitsSold * 2) {
    add("breakeven", "soft", "Başabaş satış adedi mevcut tahminin iki katından fazla.");
  }
  if (current.stockCashNeed > input.startingCash + input.financingAmount + input.supportAmount) {
    add("stock_cash", "hard", "Hedef stok kapsamı için gereken nakit, mevcut başlangıç kaynaklarını aşıyor.");
  }
  if (input.advancedChannelMixEnabled && Math.abs(current.channelShareTotal - 1) > 0.01) add("channel_share", "hard", "Satış kanalı paylarının toplamı %100 olmalıdır.");
  if (input.advancedProductMixEnabled && Math.abs(current.productShareTotal - 1) > 0.01) add("product_share", "hard", "Ürün karması adet paylarının toplamı %100 olmalıdır.");
  warnings.push(...buildEcommerceProfileWarnings(current));
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir e-ticaret uyarısı oluşmadı.");
  return warnings;
}
