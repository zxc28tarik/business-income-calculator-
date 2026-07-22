import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import {
  SAAS_DEFAULT_INPUTS as LEGACY_DEFAULTS,
  SAAS_FORM_SECTIONS as LEGACY_SECTIONS,
  SAAS_SCENARIOS,
  normalizeSaasInputs as normalizeLegacy,
} from "./saas-config.js";
import {
  SAAS_BUSINESS_PROFILES,
  SAAS_PROFILE_DEFAULT_INPUTS,
  SAAS_V2_BUSINESS_TYPES,
  getSaasBusinessProfile,
} from "./saas-business-profiles.js";
import { SAAS_PROFILE_CORE_SECTIONS } from "./saas-profile-form-core.js";
import { SAAS_PROFILE_GROWTH_SECTIONS } from "./saas-profile-form-growth.js";

const clone = (value) => structuredClone(value);

export { SAAS_BUSINESS_PROFILES, SAAS_SCENARIOS, SAAS_V2_BUSINESS_TYPES };

export const SAAS_DEFAULT_INPUTS = {
  ...clone(LEGACY_DEFAULTS),
  ...clone(SAAS_PROFILE_DEFAULT_INPUTS),
};

export const SAAS_FORM_SECTIONS = [
  ...SAAS_PROFILE_CORE_SECTIONS,
  ...SAAS_PROFILE_GROWTH_SECTIONS,
  ...LEGACY_SECTIONS.slice(1),
];

const preservedKeys = [
  "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
  "setupPaymentMonth", "collectionDelayDays", "firstMonthSalesShare", "loanPayment",
];

function switchProfile(raw) {
  const requested = SAAS_V2_BUSINESS_TYPES.some(([id]) => id === raw.businessType)
    ? raw.businessType
    : "b2b_saas";
  if (!raw.profileTypeApplied) {
    if (requested === "b2b_saas") return { ...raw, businessType: requested, profileTypeApplied: requested };
    return {
      ...clone(SAAS_DEFAULT_INPUTS),
      ...clone(getSaasBusinessProfile(requested).defaults),
      ...raw,
      businessType: requested,
      profileTypeApplied: requested,
    };
  }
  if (raw.profileTypeApplied === requested) return raw;
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, raw[key] ?? SAAS_DEFAULT_INPUTS[key]]));
  return {
    ...clone(SAAS_DEFAULT_INPUTS),
    ...clone(getSaasBusinessProfile(requested).defaults),
    ...preserved,
    businessType: requested,
    profileTypeApplied: requested,
  };
}

function normalizePlan(row = {}) {
  return {
    name: String(row.name || "Plan"),
    subscriberShareRate: clampRate(row.subscriberShareRate),
    monthlyPrice: nonNegative(row.monthlyPrice),
    annualBillingShareRate: clampRate(row.annualBillingShareRate),
    annualDiscountRate: clampRate(row.annualDiscountRate),
  };
}

export function normalizeSaasInputs(raw = {}) {
  const source = switchProfile(clone(raw));
  const requested = source.businessType;
  const legacy = normalizeLegacy({ ...clone(SAAS_DEFAULT_INPUTS), ...source, businessType: "b2b_saas" });
  const input = { ...legacy, businessType: requested, profileTypeApplied: source.profileTypeApplied || requested };

  for (const key of [
    "trialConversionRate", "freeToPaidConversionRate", "apiMonthlyChurnRate", "enterpriseMonthlyChurnRate",
    "expansionMrrRate", "contractionMrrRate", "annualBillingShareRate", "annualDiscountRate",
  ]) input[key] = clampRate(input[key]);

  for (const key of [
    "trialUsers", "reactivatedSubscribers", "freeUsers", "monthlyNewFreeUsers", "freeUserCostPerMonth",
    "apiCustomers", "apiNewCustomers", "usageUnitsPerCustomer", "pricePerUsageUnit", "costPerUsageUnit",
    "enterpriseCustomers", "enterpriseNewCustomers", "annualContractValue", "onboardingRevenuePerNewCustomer",
    "contentProductionCost", "communityManagementCost", "supportCapacityPerStaff", "monthlyOperatingGrantIncome",
    "seatsPerAccount",
  ]) input[key] = nonNegative(input[key]);

  input.supportStaffCount = clampInteger(input.supportStaffCount, 0, 10000, 0);
  input.advancedPlanMixEnabled = Boolean(input.advancedPlanMixEnabled);
  input.plans = (Array.isArray(input.plans) ? input.plans : SAAS_DEFAULT_INPUTS.plans).map(normalizePlan);
  return input;
}

export function applySaasBusinessType(currentInputs, businessType) {
  const type = SAAS_V2_BUSINESS_TYPES.some(([id]) => id === businessType) ? businessType : "b2b_saas";
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, currentInputs?.[key] ?? SAAS_DEFAULT_INPUTS[key]]));
  return normalizeSaasInputs({
    ...clone(SAAS_DEFAULT_INPUTS),
    ...clone(getSaasBusinessProfile(type).defaults),
    ...preserved,
    businessType: type,
    profileTypeApplied: type,
  });
}

export function applySaasScenario(baseInputs, scenarioId) {
  const input = normalizeSaasInputs(baseInputs);
  const preset = SAAS_SCENARIOS[scenarioId] ?? SAAS_SCENARIOS.expected;
  const next = clone(input);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = input[key] * multiplier;
  const growth = scenarioId === "pessimistic" ? 0.70 : scenarioId === "optimistic" ? 1.35 : 1;
  const retention = scenarioId === "pessimistic" ? 1.35 : scenarioId === "optimistic" ? 0.70 : 1;
  for (const key of ["apiNewCustomers", "enterpriseNewCustomers", "trialUsers", "monthlyNewFreeUsers", "reactivatedSubscribers"]) next[key] = input[key] * growth;
  for (const key of ["apiMonthlyChurnRate", "enterpriseMonthlyChurnRate"]) next[key] = input[key] * retention;
  next.trialConversionRate = input.trialConversionRate * growth;
  next.freeToPaidConversionRate = input.freeToPaidConversionRate * growth;
  next.expansionMrrRate = input.expansionMrrRate * growth;
  next.contractionMrrRate = input.contractionMrrRate * retention;
  return normalizeSaasInputs(next);
}
