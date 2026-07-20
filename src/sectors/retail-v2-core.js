import { buildWaterfall, calculateCashFlow, solveBreakeven } from "../core/finance-engine.js";
import { RETAIL_SCENARIOS, applyRetailScenario, normalizeRetailInputs } from "./retail-v2-config.js";
import { calculateRetailProfileMonth } from "./retail-profile-engine.js";

function driverKey(input) {
  if (!input.profileDriverEnabled) return "dailyCustomers";
  if (input.businessType === "pet_shop") return "activeCustomerBase";
  if (input.businessType === "florist") return "dailyOrders";
  if (input.businessType === "mini_market") return "transactionsPerHour";
  return "dailyFootTraffic";
}

function growthOverrides(input, multiplier) {
  const key = driverKey(input);
  return { [key]: input[key] * multiplier };
}

export function calculateRetailMonth(rawInputs, overrides = {}) {
  return calculateRetailProfileMonth(rawInputs, overrides);
}

export function calculateRetailModel(rawInputs) {
  const input = normalizeRetailInputs(rawInputs);
  const current = calculateRetailProfileMonth(input);
  const key = driverKey(input);
  const currentDriver = input[key];
  const breakevenDriverRaw = solveBreakeven({
    min: 0,
    max: Math.max(1000000, currentDriver * 100 + 100),
    tolerance: 0.001,
    evaluate: (value) => calculateRetailProfileMonth(input, { [key]: value }).netProfit,
  });
  const breakevenDriverValue = breakevenDriverRaw == null ? null : breakevenDriverRaw;
  const breakevenResult = breakevenDriverValue == null ? null : calculateRetailProfileMonth(input, { [key]: breakevenDriverValue });
  const breakevenDailyCustomers = breakevenResult?.demand.dailyTransactions ?? null;
  const breakevenRevenue = breakevenResult?.grossRevenue ?? null;

  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: input.collectionDelayDays,
    supplierPaymentDelayDays: Math.min(30, current.supplierMetrics.paymentDelayDays),
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier) => calculateRetailProfileMonth(input, growthOverrides(input, growthMultiplier)),
  });
  cashFlow.rows = cashFlow.rows.map((row, index) => {
    const monthResult = calculateRetailProfileMonth(input, growthOverrides(input, Math.pow(1 + input.monthlyGrowthRate, index) * (index === 0 ? input.firstMonthSalesShare : 1)));
    return {
      ...row,
      dailyTransactions: monthResult.demand.dailyTransactions,
      grossRevenue: monthResult.grossRevenue,
      productCost: monthResult.productCost,
      stockCoverageDays: monthResult.stockCoverageDays,
    };
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildRetailWarnings({ current, cashFlow, breakevenDailyCustomers, input });

  return {
    ...current,
    breakevenDriverKey: key,
    breakevenDriverValue,
    breakevenDailyCustomers,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Brüt mağaza satışı",
        loss: "İade ve iskonto etkisi",
        commission: "POS / ödeme kesintisi",
        variable: "Ürün, stok ve mağaza değişkeni",
        fixed: "Mağaza sabit giderleri",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: `${current.profile.label} satış sürücüsü`,
      lossSubtext: "İadeler ve fiyat iskonto etkisi",
      commissionSubtext: "Kartlı satışların ödeme kesintisi",
      variableSubtext: "Ürün, sayım kaybı, bozulma, ambalaj ve diğer değişkenler",
      fixedSubtext: "Kira, personel, mağaza, pazarlama ve amortisman",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateRetailScenarioComparison(baseOrScenarioInputs) {
  const scenarioMap = baseOrScenarioInputs && Object.keys(RETAIL_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(RETAIL_SCENARIOS).map(([id, preset]) => {
    const inputs = scenarioMap ? normalizeRetailInputs(baseOrScenarioInputs[id]) : applyRetailScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateRetailModel(inputs) };
  });
}

export function buildRetailWarnings({ current, cashFlow, breakevenDailyCustomers, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda mağaza aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "İlk stok ve mağaza kurulumu ilk üç ayda nakit açığı oluşturuyor.");
  if (current.salesCapacityLoad > 1) add("capacity", "hard", "Talep, günlük mağaza / kasa işlem kapasitesini aşıyor.");
  if (current.productGrossMargin < 0.20) add("margin_hard", "hard", "Ürün brüt marjı %20'nin altında.");
  else if (current.productGrossMargin < 0.30) add("margin_soft", "soft", "Ürün brüt marjı mağaza giderlerine göre düşük olabilir.");
  if (current.input.returnRate > 0.12 || current.productMetrics.returnRate > 0.12) add("returns", "hard", "İade oranı %12'nin üzerinde.");
  if (current.input.inventoryLossRate + current.productMetrics.spoilageRate > 0.06) add("inventory_loss", "hard", "Sayım kaybı ve bozulma toplamı %6'nın üzerinde.");
  if (current.inventoryPlanningEnabled && current.workingCapitalGap > 0) add("working_capital", "soft", "Hedef stok kapsamı için ek işletme sermayesi gerekiyor.");
  if (current.stockCoverageDays != null && current.stockCoverageDays < current.supplierMetrics.leadTimeDays + input.safetyStockDays) add("reorder_risk", "hard", "Stok kapsamı tedarik süresi ve güvenlik stoğunun altında.");
  if (current.annualStockTurnover != null && current.annualStockTurnover < 2) add("turnover_hard", "hard", "Stok yılda iki kereden az dönüyor.");
  else if (current.annualStockTurnover != null && current.annualStockTurnover < 4) add("turnover_soft", "soft", "Stok devir hızı yavaş.");
  if (current.supplierMinimumOrderAmount > current.productCost * 1.5) add("minimum_order", "soft", "Tedarikçi asgari sipariş toplamı aylık ürün maliyetine göre yüksek.");
  if (breakevenDailyCustomers == null) add("breakeven_impossible", "hard", "Mevcut marj ve giderlerle başabaş işlem sayısı bulunamadı.");
  else if (breakevenDailyCustomers > current.demand.dailyTransactions * 1.40) add("breakeven_high", "soft", "Başabaş için mevcut günlük işlemin en az %40 üzerine çıkmak gerekiyor.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir fiziksel perakende uyarısı oluşmadı.");
  return warnings;
}
