import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { ECOMMERCE_SCENARIOS, applyEcommerceScenario, normalizeEcommerceInputs } from "./ecommerce-config.js";

export function calculateEcommerceMonth(rawInputs, overrides = {}) {
  const input = normalizeEcommerceInputs({ ...rawInputs, ...overrides });
  const listRevenue = input.unitsSold * input.productPrice;
  const discountAmount = listRevenue * input.averageDiscountRate;
  const grossRevenue = listRevenue - discountAmount;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });

  const returnedUnits = input.unitsSold * input.refundRate;
  const fulfilledUnits = Math.max(0, input.unitsSold - returnedUnits);
  const lostSalesAmount = tax.netBase * input.refundRate;
  const adjustedRevenue = tax.netBase - lostSalesAmount;

  const marketplaceRevenue = adjustedRevenue * input.marketplaceSalesShare;
  const directRevenue = adjustedRevenue - marketplaceRevenue;
  const marketplaceCommission = calcCommission(marketplaceRevenue, input.marketplaceCommissionRate);
  const paymentCommission = calcCommission(adjustedRevenue * input.cardPaymentShare, input.paymentCommissionRate);
  const totalCommissions = marketplaceCommission + paymentCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const productCost = fulfilledUnits * input.unitProductCost;
  const outboundShippingCost = input.unitsSold * input.shippingCostPerOrder;
  const packagingCost = input.unitsSold * input.packagingCostPerOrder;
  const returnShippingCost = returnedUnits * input.returnShippingCostPerOrder;
  const fulfillmentCost = input.unitsSold * input.fulfillmentCostPerOrder;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = productCost + outboundShippingCost + packagingCost + returnShippingCost + fulfillmentCost + otherVariableCost;
  const contributionBeforeAdvertising = revenueAfterCommission - totalVariableCosts;

  const fixedCostItems = {
    monthlyAdSpend: input.monthlyAdSpend,
    rent: input.rent,
    warehouseCost: input.warehouseCost,
    staffCost: input.staffCost,
    software: input.software,
    accounting: input.accounting,
    utilities: input.utilities,
    insurance: input.insurance,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const totalFixedCosts = sumValues(Object.values(fixedCostItems));
  const contribution = contributionBeforeAdvertising;
  const profitAfterAdvertising = contributionBeforeAdvertising - input.monthlyAdSpend;

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
    initialStockInvestment: input.initialStockInvestment,
    storeSetup: input.storeSetup,
    equipment: input.equipment,
    deposit: input.deposit,
    legalFees: input.legalFees,
    launchMarketing: input.launchMarketing,
    otherSetupCosts: input.otherSetupCosts,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const inventoryWorkingCapitalNeed = input.unitsSold * input.unitProductCost * input.stockCoverageMonths;
  const stockCashNeed = Math.max(input.initialStockInvestment, inventoryWorkingCapitalNeed);
  const totalOrderLogistics = outboundShippingCost + packagingCost + returnShippingCost + fulfillmentCost;
  const largestExpense = findLargestExpense({ ...fixedCostItems, productCost, outboundShippingCost, returnShippingCost, marketplaceCommission });

  return {
    input,
    listRevenue,
    discountAmount,
    grossRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: tax.netBase,
    lostSalesAmount,
    adjustedRevenue,
    returnedUnits,
    fulfilledUnits,
    marketplaceRevenue,
    directRevenue,
    marketplaceCommission,
    paymentCommission,
    totalCommissions,
    revenueAfterCommission,
    productCost,
    outboundShippingCost,
    packagingCost,
    returnShippingCost,
    fulfillmentCost,
    otherVariableCost,
    totalOrderLogistics,
    totalVariableCosts,
    cashVariableCosts: totalVariableCosts,
    contribution,
    contributionBeforeAdvertising,
    profitAfterAdvertising,
    fixedCostItems,
    totalFixedCosts,
    partnerPayout,
    totalStakeholderPayouts,
    preTaxProfit,
    estimatedTax,
    netProfit,
    setupCostItems,
    totalSetupCost,
    inventoryWorkingCapitalNeed,
    stockCashNeed,
    grossProfit: revenueAfterCommission - productCost,
    profitMargin: percent(netProfit, tax.netBase),
    grossMargin: percent(revenueAfterCommission - productCost, adjustedRevenue),
    commissionLoad: percent(totalCommissions, adjustedRevenue),
    shippingLoad: percent(totalOrderLogistics, adjustedRevenue),
    advertisingLoad: percent(input.monthlyAdSpend, adjustedRevenue),
    unitNetProfit: percent(netProfit, fulfilledUnits),
    roas: percent(grossRevenue, input.monthlyAdSpend),
    largestExpense,
  };
}

export function calculateEcommerceModel(rawInputs) {
  const input = normalizeEcommerceInputs(rawInputs);
  const current = calculateEcommerceMonth(input);
  const breakevenUnits = solveBreakeven({
    min: 0,
    max: Math.max(1000000, input.unitsSold * 100),
    evaluate: (unitsSold) => calculateEcommerceMonth(input, { unitsSold }).netProfit,
  });
  const breakevenRevenue = breakevenUnits == null
    ? null
    : breakevenUnits * input.productPrice * (1 - input.averageDiscountRate);

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
    evaluateMonth: (growthMultiplier) => calculateEcommerceMonth(input, {
      unitsSold: input.unitsSold * growthMultiplier,
    }),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildEcommerceWarnings({ current, cashFlow, breakevenUnits, input });

  return {
    ...current,
    breakevenUnits,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: { loss: "İadeler", variable: "Ürün ve lojistik", fixed: "Reklam + sabit gider" },
      grossSubtext: "İndirim sonrası brüt satış",
      lossSubtext: "İade edilen satışlar",
      commissionSubtext: "Pazaryeri ve ödeme",
      variableSubtext: "Ürün, kargo, paketleme, fulfillment",
      fixedSubtext: "Reklam, personel, depo ve genel gider",
      stakeholderSubtext: "Ortak / yatırımcı payı",
    }),
  };
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
  if (current.input.refundRate > 0.15) add("refund_hard", "hard", "İade oranı %15'in üzerinde; ürün, açıklama ve operasyon kalitesi incelenmeli.");
  else if (current.input.refundRate > 0.08) add("refund_soft", "soft", "İade oranı dikkat gerektiriyor.");
  if (current.commissionLoad > 0.22) add("commission_hard", "hard", "Pazaryeri ve ödeme komisyon yükü satışların %22'sini aşıyor.");
  else if (current.commissionLoad > 0.15) add("commission_soft", "soft", "Pazaryeri kesinti yükü yüksek görünüyor.");
  if (current.shippingLoad > 0.18) add("shipping", "soft", "Kargo, iade kargo ve paketleme yükü net satışın %18'ini aşıyor.");
  if (current.advertisingLoad > 0.25) add("advertising", "soft", "Reklam harcaması net satışın %25'inden yüksek.");
  if (current.unitNetProfit <= 0) add("unit_loss", "hard", "Satılan ürün başına net sonuç negatif.");
  if (breakevenUnits != null && input.unitsSold > 0 && breakevenUnits > input.unitsSold * 2) {
    add("breakeven", "soft", "Başabaş satış adedi mevcut tahminin iki katından fazla.");
  }
  if (current.stockCashNeed > input.startingCash + input.financingAmount + input.supportAmount) {
    add("stock_cash", "hard", "Hedef stok kapsamı için gereken nakit, mevcut başlangıç kaynaklarını aşıyor.");
  }
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir e-ticaret uyarısı oluşmadı.");
  return warnings;
}
