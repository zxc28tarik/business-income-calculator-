import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { RETAIL_SCENARIOS, applyRetailScenario, normalizeRetailInputs } from "./retail-config.js";

export function calculateRetailMonth(rawInputs, overrides = {}) {
  const input = normalizeRetailInputs({ ...rawInputs, ...overrides });
  const grossRevenue = input.dailyCustomers * input.averageBasket * input.openDays;
  const returnedGrossRevenue = grossRevenue * input.returnRate;
  const recognizedGrossRevenue = Math.max(0, grossRevenue - returnedGrossRevenue);
  const tax = calcTaxSplit({ grossRevenue: recognizedGrossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;

  const grossUnitsSold = grossRevenue / input.averageUnitSalePrice;
  const returnedUnits = grossUnitsSold * input.returnRate;
  const retainedUnits = Math.max(0, grossUnitsSold - returnedUnits);
  const averageItemsPerBasket = grossUnitsSold / Math.max(1, input.dailyCustomers * input.openDays);

  const posCommission = calcCommission(adjustedRevenue * input.cardSalesShare, input.posCommissionRate);
  const totalCommissions = posCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const productCost = retainedUnits * input.averageUnitCost;
  const inventoryLossCost = grossUnitsSold * input.averageUnitCost * input.inventoryLossRate;
  const shoppingBagCost = input.dailyCustomers * input.openDays * input.shoppingBagCostPerCustomer;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = productCost + inventoryLossCost + shoppingBagCost + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const fixedCostItems = {
    rent: input.rent,
    staffCost: input.staffCost,
    utilities: input.utilities,
    accounting: input.accounting,
    software: input.software,
    security: input.security,
    monthlyMarketing: input.monthlyMarketing,
    insurance: input.insurance,
    maintenance: input.maintenance,
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
    renovation: input.renovation,
    shelvingEquipment: input.shelvingEquipment,
    posSystem: input.posSystem,
    deposit: input.deposit,
    initialStockInvestment: input.initialStockInvestment,
    licenseFees: input.licenseFees,
    openingMarketing: input.openingMarketing,
    signage: input.signage,
    softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const annualStockTurnover = input.initialStockInvestment > 0 ? productCost * 12 / input.initialStockInvestment : null;
  const stockCoverageMonths = productCost > 0 ? input.initialStockInvestment / productCost : null;
  const effectiveNetUnitPrice = retainedUnits > 0 ? adjustedRevenue / retainedUnits : 0;
  const productGrossMargin = percent(effectiveNetUnitPrice - input.averageUnitCost, effectiveNetUnitPrice);
  const largestExpense = findLargestExpense({ ...fixedCostItems, productCost, inventoryLossCost, posCommission });

  return {
    input,
    grossRevenue,
    returnedGrossRevenue,
    recognizedGrossRevenue,
    customerPayment: tax.customerPayment,
    taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate }).netBase,
    lostSalesAmount: returnedGrossRevenue,
    adjustedRevenue,
    grossUnitsSold,
    returnedUnits,
    retainedUnits,
    averageItemsPerBasket,
    posCommission,
    totalCommissions,
    revenueAfterCommission,
    productCost,
    inventoryLossCost,
    shoppingBagCost,
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
    annualStockTurnover,
    stockCoverageMonths,
    productGrossMargin,
    unitNetProfit: percent(netProfit, retainedUnits),
    contributionPerUnit: percent(contribution, retainedUnits),
    profitMargin: percent(netProfit, adjustedRevenue),
    rentToRevenue: percent(input.rent, adjustedRevenue),
    returnLossRate: percent(returnedGrossRevenue, grossRevenue),
    inventoryLossLoad: percent(inventoryLossCost, adjustedRevenue),
    largestExpense,
  };
}

export function calculateRetailModel(rawInputs) {
  const input = normalizeRetailInputs(rawInputs);
  const current = calculateRetailMonth(input);
  const breakevenDailyCustomers = solveBreakeven({
    min: 0,
    max: 100000,
    tolerance: 0.001,
    evaluate: (dailyCustomers) => calculateRetailMonth(input, { dailyCustomers }).netProfit,
  });
  const breakevenRevenue = breakevenDailyCustomers == null
    ? null
    : breakevenDailyCustomers * input.averageBasket * input.openDays;

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
    evaluateMonth: (growthMultiplier) => calculateRetailMonth(input, {
      dailyCustomers: input.dailyCustomers * growthMultiplier,
    }),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildRetailWarnings({ current, cashFlow, breakevenDailyCustomers, input });

  return {
    ...current,
    breakevenDailyCustomers,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Brüt kasa satışı",
        loss: "İadeler",
        commission: "POS komisyonu",
        variable: "Ürün ve stok maliyeti",
        fixed: "Mağaza sabit giderleri",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: "Günlük müşteri × ortalama sepet × açık gün",
      lossSubtext: "Müşteriye geri dönen satış",
      commissionSubtext: "Kartlı satışların ödeme kesintisi",
      variableSubtext: "Satılan ürün, fire/kayıp, poşet ve diğer değişkenler",
      fixedSubtext: "Kira, personel, mağaza ve pazarlama giderleri",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateRetailScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(RETAIL_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(RETAIL_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap
      ? normalizeRetailInputs(baseOrScenarioInputs[id])
      : applyRetailScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateRetailModel(inputs) };
  });
}

export function buildRetailWarnings({ current, cashFlow, breakevenDailyCustomers, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda mağaza aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "İlk stok ve mağaza kurulumu ilk 3 ayda nakit açığı oluşturuyor.");
  if (current.rentToRevenue > 0.20) add("rent_hard", "hard", "Kira, KDV ve iade sonrası satış gelirinin %20'sini aşıyor.");
  else if (current.rentToRevenue > 0.15) add("rent_soft", "soft", "Kira/ciro oranı yüksek görünüyor.");
  if (input.returnRate > 0.12) add("returns_hard", "hard", "İade oranı %12'nin üzerinde; ürün seçimi ve iade nedenleri incelenmelidir.");
  else if (input.returnRate > 0.06) add("returns_soft", "soft", "İadeler mağaza katkısını belirgin biçimde azaltıyor.");
  if (input.inventoryLossRate > 0.05) add("loss_hard", "hard", "Fire/kayıp oranı %5'in üzerinde; stok kontrolü kritik seviyede.");
  else if (input.inventoryLossRate > 0.025) add("loss_soft", "soft", "Fire/kayıp maliyeti dikkat gerektiriyor.");
  if (current.productGrossMargin < 0.20) add("margin_hard", "hard", "Ürün brüt marjı %20'nin altında; mağaza giderlerini karşılamak zor olabilir.");
  else if (current.productGrossMargin < 0.30) add("margin_soft", "soft", "Ürün brüt marjı perakende sabit giderlerine göre düşük olabilir.");
  if (current.annualStockTurnover != null && current.annualStockTurnover < 2) add("turnover_hard", "hard", "Stok yılda 2 kereden az dönüyor; nakit rafta uzun süre bağlı kalıyor.");
  else if (current.annualStockTurnover != null && current.annualStockTurnover < 4) add("turnover_soft", "soft", "Stok devir hızı yavaş; ilk stok seviyesi gözden geçirilmeli.");
  if (current.stockCoverageMonths != null && current.stockCoverageMonths > 6) add("stock_excess", "soft", "İlk stok, mevcut satış hızına göre 6 aydan uzun ürün maliyetini bağlıyor.");
  if (current.stockCoverageMonths != null && current.stockCoverageMonths < 0.5) add("stock_shortage", "soft", "İlk stok yarım aydan az ürün maliyetini karşılıyor; sık tedarik ihtiyacı doğabilir.");
  if (breakevenDailyCustomers == null) add("breakeven_impossible", "hard", "Mevcut ürün marjı ve maliyetlerle başabaş müşteri sayısı bulunamadı.");
  else if (breakevenDailyCustomers > input.dailyCustomers * 1.40) add("breakeven_high", "soft", "Başabaş için mevcut günlük müşterinin en az %40 üzerine çıkmak gerekiyor.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük maliyet sapmaları zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir fiziksel perakende uyarısı oluşmadı.");
  return warnings;
}
