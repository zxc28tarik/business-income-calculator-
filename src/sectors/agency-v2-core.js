import { buildWaterfall, calculateCashFlow, percent, solveBreakeven } from "../core/finance-engine.js";
import { buildAgencyWarnings as buildLegacyAgencyWarnings } from "./agency-core.js";
import { AGENCY_SCENARIOS, applyAgencyScenario, normalizeAgencyInputs } from "./agency-v2-config.js";
import { getAgencyBusinessProfile } from "./agency-business-profiles.js";
import { buildAgencyProfileWarnings } from "./agency-profile-presentation.js";
import { calculateAgencyMonth } from "./agency-v2-month.js";

function driverPatch(input, value) {
  const driver = getAgencyBusinessProfile(input.businessType).driver;
  if (!input.advancedProfileDriverEnabled || driver === "project") return { monthlyProjectCount: value };
  if (driver === "retainer") return { retainerClientCount: value };
  if (driver === "billable_hours") return { monthlyBillableHours: value };
  if (driver === "consulting_days") return { consultingDaysPerMonth: value };
  if (driver === "campaign") return { monthlyCampaignCount: value };
  if (driver === "managed_spend") return { managedAdSpend: value };
  return { monthlyProjectCount: value };
}

function driverValue(input) {
  const driver = getAgencyBusinessProfile(input.businessType).driver;
  if (!input.advancedProfileDriverEnabled || driver === "project") return input.monthlyProjectCount;
  if (driver === "retainer") return input.retainerClientCount;
  if (driver === "billable_hours") return input.monthlyBillableHours;
  if (driver === "consulting_days") return input.consultingDaysPerMonth;
  if (driver === "campaign") return input.monthlyCampaignCount;
  if (driver === "managed_spend") return input.managedAdSpend;
  return input.monthlyProjectCount;
}

function driverBounds(input) {
  const current = Math.max(1, Number(driverValue(input)) || 0);
  return { min: 0, max: Math.max(1000, current * 30 + 10) };
}

function scaleDriver(input, multiplier) {
  return driverPatch(input, driverValue(input) * multiplier);
}

export function calculateAgencyModel(rawInputs) {
  const input = normalizeAgencyInputs(rawInputs);
  const current = calculateAgencyMonth(input);
  const breakevenDriverValue = solveBreakeven({
    ...driverBounds(input),
    tolerance: 0.0001,
    evaluate: (value) => calculateAgencyMonth(input, driverPatch(input, value)).netProfit,
  });
  const breakevenResult = breakevenDriverValue == null
    ? null
    : calculateAgencyMonth(input, driverPatch(input, breakevenDriverValue));
  const breakevenRevenue = breakevenResult?.grossRevenue ?? null;
  const breakevenCapacityUtilization = breakevenResult?.capacityUtilization ?? null;
  const effectiveCollectionDelayDays = input.collectionDelayDays * (1 - input.advanceCollectionRate);

  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: effectiveCollectionDelayDays,
    supplierPaymentDelayDays: 0,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier) => calculateAgencyMonth(input, scaleDriver(input, growthMultiplier)),
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const result = {
    ...current,
    breakevenDriverValue,
    breakevenDriverLabel: current.profileMetrics.driverLabel,
    breakevenProjectCount: breakevenDriverValue,
    breakevenRevenue,
    breakevenCapacityUtilization,
    effectiveCollectionDelayDays,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
  };

  const legacyWarnings = buildLegacyAgencyWarnings({
    current: result,
    cashFlow,
    breakevenProjectCount: breakevenDriverValue,
    breakevenCapacityUtilization,
    input,
  });
  const profileWarnings = buildAgencyProfileWarnings(result);
  result.warnings = profileWarnings.length
    ? [...legacyWarnings.filter((warning) => warning.id !== "healthy"), ...profileWarnings]
    : legacyWarnings;
  result.waterfall = buildWaterfall(result, {
    labels: {
      gross: "Hizmet geliri",
      loss: "Gelir kaybı",
      commission: "Platform ve ödeme kesintisi",
      variable: "Üretim, revizyon ve taşeron",
      fixed: "Sabit giderler",
      stakeholder: "Ortak / yatırımcı payı",
    },
    grossSubtext: `${current.profileMetrics.driverLabel} üzerinden hesaplanan hizmet geliri`,
    lossSubtext: "Bu modelde ayrıca gelir kaybı tanımlanmadı",
    commissionSubtext: "Aracı platform ve ödeme kesintileri",
    variableSubtext: "İç ekip saati, kapsam taşması ve taşeron",
    fixedSubtext: "İdari ekip, ofis, yazılım ve satış giderleri",
    stakeholderSubtext: "Pozitif vergi öncesi kârdan",
  });
  return result;
}

export function calculateAgencyScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs
    && Object.keys(AGENCY_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(AGENCY_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap
      ? normalizeAgencyInputs(baseOrScenarioInputs[id])
      : applyAgencyScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateAgencyModel(inputs) };
  });
}

export { calculateAgencyMonth };
