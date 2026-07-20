import { buildWaterfall, calculateCashFlow, percent, solveBreakeven } from "../core/finance-engine.js";
import { SAAS_SCENARIOS, applySaasScenario, normalizeSaasInputs } from "./saas-v2-config.js";
import { calculateSaasProfileMonth, deriveSaasProfileInputs } from "./saas-profile-engine.js";

function driverKeys(type) {
  if (type === "api_service") return ["apiCustomers", "apiNewCustomers"];
  if (type === "enterprise_license") return ["enterpriseCustomers", "enterpriseNewCustomers"];
  return ["openingSubscribers", "monthlyNewSubscribers"];
}

function buildSchedule(input, months = 12) {
  const derived = deriveSaasProfileInputs(input);
  const [openingKey, newKey] = driverKeys(input.businessType);
  let opening = derived.legacyInputs.openingSubscribers;
  const monthlyNew = derived.legacyInputs.monthlyNewSubscribers;
  const churnRate = derived.legacyInputs.monthlyChurnRate;
  const rows = [];
  for (let month = 1; month <= months; month += 1) {
    const churned = opening * churnRate;
    const ending = Math.max(0, opening - churned + monthlyNew);
    rows.push({ month, openingSubscribers: opening, churnedSubscribers: churned, newSubscribers: monthlyNew, endingSubscribers: ending, openingKey, newKey });
    opening = ending;
  }
  return rows;
}

function monthOverrides(input, row) {
  if (input.businessType === "api_service") return { apiCustomers: row.openingSubscribers, apiNewCustomers: row.newSubscribers };
  if (input.businessType === "enterprise_license") return { enterpriseCustomers: row.openingSubscribers, enterpriseNewCustomers: row.newSubscribers };
  return { openingSubscribers: row.openingSubscribers, monthlyNewSubscribers: row.newSubscribers };
}

function addAnnualPrepayment(cashFlow, increment) {
  if (!(increment > 0)) return cashFlow;
  const rows = cashFlow.rows.map((row, index) => ({
    ...row,
    cashStart: row.cashStart + (index > 0 ? increment : 0),
    annualPrepayment: index === 0 ? increment : 0,
    cashEnd: row.cashEnd + increment,
  }));
  return {
    ...cashFlow,
    rows,
    endingCash: rows.at(-1)?.cashEnd ?? cashFlow.endingCash,
    minimumCash: Math.min(...rows.map((row) => row.cashEnd)),
    cashGapFirstThreeMonths: Math.min(...rows.slice(0, 3).map((row) => row.cashEnd)),
    firstNegativeMonth: rows.find((row) => row.cashEnd < 0)?.month ?? null,
  };
}

export function calculateSaasMonth(rawInputs, overrides = {}) {
  return calculateSaasProfileMonth(rawInputs, overrides);
}

export function calculateSaasModel(rawInputs) {
  const input = normalizeSaasInputs(rawInputs);
  const current = calculateSaasProfileMonth(input);
  const [openingKey] = driverKeys(input.businessType);
  const currentOpening = input[openingKey];
  const breakevenOpeningRaw = solveBreakeven({
    min: 0,
    max: Math.max(1000000, currentOpening * 100 + 100),
    tolerance: 0.01,
    evaluate: (value) => calculateSaasProfileMonth(input, { [openingKey]: value }).netProfit,
  });
  const breakevenOpeningSubscribers = breakevenOpeningRaw == null ? null : Math.ceil(breakevenOpeningRaw);
  const breakevenResult = breakevenOpeningSubscribers == null
    ? null
    : calculateSaasProfileMonth(input, { [openingKey]: breakevenOpeningSubscribers });
  const breakevenSubscribers = breakevenResult?.endingSubscribers ?? null;
  const breakevenRevenue = breakevenResult?.mrr ?? null;

  const subscriberSchedule = buildSchedule(input);
  let cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: input.collectionDelayDays,
    supplierPaymentDelayDays: 0,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: 0,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier, month) => {
      const row = subscriberSchedule[month - 1];
      const overrides = monthOverrides(input, row);
      if (month === 1 && input.businessType !== "api_service" && input.businessType !== "enterprise_license") {
        overrides.monthlyPrice = input.monthlyPrice * growthMultiplier;
      }
      return calculateSaasProfileMonth(input, overrides);
    },
  });
  cashFlow = addAnnualPrepayment(cashFlow, current.annualPrepaymentIncrement);
  cashFlow.rows = cashFlow.rows.map((row, index) => ({ ...row, ...subscriberSchedule[index] }));

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const grossRevenueRetention = Math.max(0, 1 - input.monthlyChurnRate - input.contractionMrrRate);
  const netRevenueRetention = grossRevenueRetention + input.expansionMrrRate;
  const warnings = buildSaasWarnings({ current, cashFlow, breakevenSubscribers, input, netRevenueRetention });

  return {
    ...current,
    breakevenOpeningSubscribers,
    breakevenSubscribers,
    breakevenRevenue,
    subscriberSchedule,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    grossRevenueRetention,
    netRevenueRetention,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Tekrarlayan gelir + onboarding",
        loss: "Churn ve contraction etkisi",
        commission: "Platform ve ödeme kesintisi",
        variable: "Altyapı, destek ve CAC",
        fixed: "Ürün ve işletme sabit giderleri",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: `${current.profile.label} gelir sürücüsü`,
      lossSubtext: "Müşteri kaybı ve paket küçülmesi",
      commissionSubtext: "Mağaza / platform ve ödeme sağlayıcı",
      variableSubtext: "Kullanım, ücretsiz kullanıcı, destek ve kazanım maliyeti",
      fixedSubtext: "Geliştirme, içerik, müşteri başarısı ve genel giderler",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateSaasScenarioComparison(baseOrScenarioInputs) {
  const scenarioMap = baseOrScenarioInputs && Object.keys(SAAS_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(SAAS_SCENARIOS).map(([id, preset]) => {
    const inputs = scenarioMap ? normalizeSaasInputs(baseOrScenarioInputs[id]) : applySaasScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateSaasModel(inputs) };
  });
}

export function buildSaasWarnings({ current, cashFlow, breakevenSubscribers, input, netRevenueRetention }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda SaaS / abonelik işletmesi aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Kurulum ve büyüme ilk üç ayda nakit açığı oluşturuyor.");
  if (current.netSubscriberChange < 0) add("subscriber_decline", "hard", "Yeni ve yeniden aktive edilen müşteriler kaybı karşılamıyor.");
  if (netRevenueRetention < 0.90) add("nrr_hard", "hard", "Net gelir tutma oranı %90'ın altında.");
  else if (netRevenueRetention < 1) add("nrr_soft", "soft", "Net gelir tutma oranı %100'ün altında; mevcut müşteri geliri daralıyor.");
  if (current.supportCapacityLoad > 1) add("support_capacity", "hard", "Aktif müşteri sayısı destek / müşteri başarı kapasitesini aşıyor.");
  if (current.ltvCacRatio != null && current.ltvCacRatio < 1) add("ltv_cac_hard", "hard", "LTV/CAC 1'in altında.");
  else if (current.ltvCacRatio != null && current.ltvCacRatio < 3) add("ltv_cac_soft", "soft", "LTV/CAC 3'ün altında.");
  if (input.businessType === "freemium_saas" && input.freeToPaidConversionRate < 0.01) add("freemium_conversion", "soft", "Ücretsizden ücretliye dönüşüm %1'in altında.");
  if (input.businessType === "api_service" && current.apiUsageCost > current.revenueAfterCommission * 0.35) add("api_cost", "hard", "API kullanım maliyeti net gelirin %35'ini aşıyor.");
  if (breakevenSubscribers == null) add("breakeven_impossible", "hard", "Başabaş müşteri sayısı bulunamıyor.");
  else if (breakevenSubscribers > current.endingSubscribers * 2) add("breakeven_high", "soft", "Başabaş müşteri sayısı mevcut tabanın iki katından fazla.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.08) add("low_margin", "soft", "Net kâr marjı %8'in altında.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir SaaS / abonelik uyarısı oluşmadı.");
  return warnings;
}
