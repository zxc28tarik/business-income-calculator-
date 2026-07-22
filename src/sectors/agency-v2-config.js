import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import {
  AGENCY_BUSINESS_TYPES,
  AGENCY_DEFAULT_INPUTS as LEGACY_DEFAULT_INPUTS,
  AGENCY_FORM_SECTIONS as LEGACY_FORM_SECTIONS,
  AGENCY_SCENARIOS,
  normalizeAgencyInputs as normalizeLegacyAgencyInputs,
} from "./agency-config.js";
import {
  AGENCY_BUSINESS_PROFILES,
  AGENCY_PROFILE_INPUT_DEFAULTS,
  getAgencyBusinessProfile,
} from "./agency-business-profiles.js";
import { applyAgencyProfileDemandScenario } from "./agency-profile-engine.js";
import { AGENCY_PROFILE_FORM_SECTIONS } from "./agency-profile-form.js";

const clone = (value) => structuredClone(value);

export { AGENCY_BUSINESS_TYPES, AGENCY_SCENARIOS, AGENCY_BUSINESS_PROFILES };

export const AGENCY_DEFAULT_INPUTS = {
  ...clone(LEGACY_DEFAULT_INPUTS),
  ...clone(AGENCY_PROFILE_INPUT_DEFAULTS),
};

export const AGENCY_FORM_SECTIONS = [
  ...AGENCY_PROFILE_FORM_SECTIONS,
  LEGACY_FORM_SECTIONS[1],
  ...LEGACY_FORM_SECTIONS.slice(3),
];

function normalizeStaff(row = {}) {
  return {
    role: String(row.role || "Uzman"),
    count: clampInteger(row.count, 0, 100, 0),
    monthlyHoursPerPerson: Math.min(744, nonNegative(row.monthlyHoursPerPerson)),
    billableRate: clampRate(row.billableRate),
    hourlyCost: nonNegative(row.hourlyCost),
  };
}

function normalizeSubcontractor(row = {}) {
  return {
    name: String(row.name || "Taşeron"),
    monthlyCost: nonNegative(row.monthlyCost),
    hoursSupplied: nonNegative(row.hoursSupplied),
  };
}

function profileSwitchSource(raw) {
  const requestedType = AGENCY_BUSINESS_TYPES.some(([id]) => id === raw.businessType)
    ? raw.businessType
    : AGENCY_DEFAULT_INPUTS.businessType;
  if (!raw.profileTypeApplied) return { ...raw, profileTypeApplied: requestedType };
  if (raw.profileTypeApplied === requestedType) return raw;

  const profile = getAgencyBusinessProfile(requestedType);
  const preservedKeys = [
    "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
    "setupPaymentMonth", "collectionDelayDays", "firstMonthSalesShare", "monthlyGrowthRate",
    "partnerProfitShareRate", "cardPaymentShare", "paymentCommissionRate",
  ];
  const preserved = Object.fromEntries(
    preservedKeys.map((key) => [key, raw[key] ?? AGENCY_DEFAULT_INPUTS[key]]),
  );
  return {
    ...clone(AGENCY_DEFAULT_INPUTS),
    ...clone(profile.defaults),
    ...preserved,
    businessType: requestedType,
    profileTypeApplied: requestedType,
  };
}

export function normalizeAgencyInputs(raw = {}) {
  const source = profileSwitchSource(clone(raw));
  const input = normalizeLegacyAgencyInputs({ ...clone(AGENCY_DEFAULT_INPUTS), ...source });
  const rateKeys = [
    "managementFeeRate", "scopeCreepRate", "revisionRecoveryRate", "advanceCollectionRate",
  ];
  for (const key of rateKeys) input[key] = clampRate(input[key]);
  const numberKeys = [
    "retainerClientCount", "averageMonthlyRetainer", "retainerHoursPerClient", "monthlyBillableHours",
    "consultingDaysPerMonth", "dailyConsultingFee", "hoursPerConsultingDay", "monthlyCampaignCount",
    "averageCampaignFee", "campaignHours", "managedAdSpend", "performanceBonusRevenue",
    "monthlyOperatingGrantIncome",
  ];
  for (const key of numberKeys) input[key] = nonNegative(input[key]);
  input.advancedProfileDriverEnabled = Boolean(input.advancedProfileDriverEnabled);
  input.advancedStaffMixEnabled = Boolean(input.advancedStaffMixEnabled);
  input.advancedSubcontractorMixEnabled = Boolean(input.advancedSubcontractorMixEnabled);
  input.profileTypeApplied = input.profileTypeApplied || input.businessType;
  input.staffRoles = (Array.isArray(source.staffRoles) ? source.staffRoles : AGENCY_DEFAULT_INPUTS.staffRoles).map(normalizeStaff);
  input.subcontractors = (Array.isArray(source.subcontractors) ? source.subcontractors : AGENCY_DEFAULT_INPUTS.subcontractors).map(normalizeSubcontractor);
  return input;
}

export function applyAgencyBusinessType(currentInputs, businessType) {
  const profile = getAgencyBusinessProfile(businessType);
  const preservedKeys = [
    "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
    "setupPaymentMonth", "collectionDelayDays", "firstMonthSalesShare", "monthlyGrowthRate",
    "partnerProfitShareRate", "cardPaymentShare", "paymentCommissionRate",
  ];
  const preserved = Object.fromEntries(
    preservedKeys.map((key) => [key, currentInputs?.[key] ?? AGENCY_DEFAULT_INPUTS[key]]),
  );
  return normalizeAgencyInputs({
    ...clone(AGENCY_DEFAULT_INPUTS),
    ...clone(profile.defaults),
    ...preserved,
    businessType,
    profileTypeApplied: businessType,
  });
}

function applyProfilePriceScenario(next, normalized, multiplier) {
  const driver = getAgencyBusinessProfile(normalized.businessType).driver;
  if (!normalized.advancedProfileDriverEnabled || driver === "project") next.averageProjectFee = normalized.averageProjectFee * multiplier;
  else if (driver === "retainer") next.averageMonthlyRetainer = normalized.averageMonthlyRetainer * multiplier;
  else if (driver === "billable_hours") next.hourlySalesPrice = normalized.hourlySalesPrice * multiplier;
  else if (driver === "consulting_days") next.dailyConsultingFee = normalized.dailyConsultingFee * multiplier;
  else if (driver === "campaign") next.averageCampaignFee = normalized.averageCampaignFee * multiplier;
  else if (driver === "managed_spend") next.managementFeeRate = normalized.managementFeeRate * multiplier;
}

export function applyAgencyScenario(baseInputs, scenarioId) {
  const normalized = normalizeAgencyInputs(baseInputs);
  const preset = AGENCY_SCENARIOS[scenarioId] ?? AGENCY_SCENARIOS.expected;
  const next = applyAgencyProfileDemandScenario(normalized, scenarioId);
  applyProfilePriceScenario(next, normalized, preset.multipliers.averageProjectFee ?? 1);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) {
    if (!["averageProjectFee", "monthlyProjectCount"].includes(key)) next[key] = normalized[key] * multiplier;
  }
  return normalizeAgencyInputs(next);
}
