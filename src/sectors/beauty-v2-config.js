import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import {
  BEAUTY_BUSINESS_TYPES,
  BEAUTY_DEFAULT_INPUTS as LEGACY_DEFAULT_INPUTS,
  BEAUTY_SCENARIOS,
  normalizeBeautyInputs as normalizeLegacyBeautyInputs,
} from "./beauty-config.js";
import {
  BEAUTY_BUSINESS_PROFILES,
  BEAUTY_PROFILE_INPUT_DEFAULTS,
  applyBeautyProfileDemandScenario,
  getBeautyBusinessProfile,
} from "./beauty-business-profile-engine.js";
import { BEAUTY_PROFILE_FORM_SECTIONS } from "./beauty-profile-form.js";
import { BEAUTY_FINANCE_FORM_SECTIONS } from "./beauty-finance-form.js";

const clone = (value) => structuredClone(value);

export { BEAUTY_BUSINESS_TYPES, BEAUTY_SCENARIOS, BEAUTY_BUSINESS_PROFILES };

export const BEAUTY_DEFAULT_INPUTS = {
  ...clone(LEGACY_DEFAULT_INPUTS),
  profileTypeApplied: LEGACY_DEFAULT_INPUTS.businessType,
  ...clone(BEAUTY_PROFILE_INPUT_DEFAULTS),
  monthlyOperatingGrantIncome: 0,
};

export const BEAUTY_FORM_SECTIONS = [
  ...BEAUTY_PROFILE_FORM_SECTIONS,
  ...BEAUTY_FINANCE_FORM_SECTIONS,
];

function normalizeService(item = {}) {
  return {
    name: String(item.name || "Hizmet"),
    sessionShareRate: clampRate(item.sessionShareRate),
    price: nonNegative(item.price),
    durationMinutes: Math.max(5, nonNegative(item.durationMinutes)),
    consumableCost: nonNegative(item.consumableCost),
    employeeCommissionRate: clampRate(item.employeeCommissionRate),
  };
}

function normalizeStaff(item = {}) {
  return {
    role: String(item.role || "Uzman"),
    count: clampInteger(item.count, 0, 100, 0),
    monthlyCostPerPerson: nonNegative(item.monthlyCostPerPerson),
    productiveHoursPerDay: Math.min(24, nonNegative(item.productiveHoursPerDay)),
    revenueCommissionRate: clampRate(item.revenueCommissionRate),
  };
}

function profileSwitchSource(raw) {
  const requestedType = BEAUTY_BUSINESS_TYPES.some(([id]) => id === raw.businessType)
    ? raw.businessType
    : BEAUTY_DEFAULT_INPUTS.businessType;
  if (!raw.profileTypeApplied) return { ...raw, profileTypeApplied: requestedType };
  if (raw.profileTypeApplied === requestedType) return raw;

  const profile = getBeautyBusinessProfile(requestedType);
  const preservedKeys = [
    "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
    "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays", "firstMonthSalesShare", "monthlyGrowthRate",
  ];
  const preserved = Object.fromEntries(
    preservedKeys.map((key) => [key, raw[key] ?? BEAUTY_DEFAULT_INPUTS[key]]),
  );
  return {
    ...clone(BEAUTY_DEFAULT_INPUTS),
    ...clone(profile.defaults),
    ...preserved,
    businessType: requestedType,
    profileTypeApplied: requestedType,
  };
}

export function normalizeBeautyInputs(raw = {}) {
  const source = profileSwitchSource(clone(raw));
  const input = normalizeLegacyBeautyInputs({ ...clone(BEAUTY_DEFAULT_INPUTS), ...source });
  const rateKeys = ["noShowRecoveryRate", "repeatVisitRate", "retailProductCostRate"];
  for (const key of rateKeys) input[key] = clampRate(input[key]);
  const numberKeys = [
    "chairCount", "tableCount", "roomCount", "deviceCount", "specialistCount",
    "activeCustomerBase", "monthlyNewCustomers", "visitsPerReturningCustomer", "demandScale",
    "monthlyRetailRevenue", "monthlyOperatingGrantIncome",
  ];
  for (const key of numberKeys) input[key] = nonNegative(input[key]);
  for (const key of ["chairCount", "tableCount", "roomCount", "deviceCount", "specialistCount"]) {
    input[key] = clampInteger(input[key], 1, 100, 1);
  }
  input.demandScale = input.demandScale > 0 ? input.demandScale : 1;
  input.advancedServiceMixEnabled = Boolean(input.advancedServiceMixEnabled);
  input.advancedStaffMixEnabled = Boolean(input.advancedStaffMixEnabled);
  input.customerBaseDemandEnabled = Boolean(input.customerBaseDemandEnabled);
  input.retailSalesEnabled = Boolean(input.retailSalesEnabled);
  input.profileTypeApplied = input.profileTypeApplied || input.businessType;
  input.serviceMix = (Array.isArray(source.serviceMix) ? source.serviceMix : BEAUTY_DEFAULT_INPUTS.serviceMix)
    .map(normalizeService);
  input.staffRoles = (Array.isArray(source.staffRoles) ? source.staffRoles : BEAUTY_DEFAULT_INPUTS.staffRoles)
    .map(normalizeStaff);
  return input;
}

export function applyBeautyBusinessType(currentInputs, businessType) {
  const profile = getBeautyBusinessProfile(businessType);
  const preservedKeys = [
    "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
    "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays", "firstMonthSalesShare", "monthlyGrowthRate",
  ];
  const preserved = Object.fromEntries(
    preservedKeys.map((key) => [key, currentInputs?.[key] ?? BEAUTY_DEFAULT_INPUTS[key]]),
  );
  return normalizeBeautyInputs({
    ...clone(BEAUTY_DEFAULT_INPUTS),
    ...clone(profile.defaults),
    ...preserved,
    businessType,
    profileTypeApplied: businessType,
  });
}

export function applyBeautyScenario(baseInputs, scenarioId) {
  const normalized = normalizeBeautyInputs(baseInputs);
  const preset = BEAUTY_SCENARIOS[scenarioId] ?? BEAUTY_SCENARIOS.expected;
  let next = applyBeautyProfileDemandScenario(normalized, scenarioId);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) {
    if (key !== "occupancyRate") next[key] = normalized[key] * multiplier;
  }
  if (next.advancedServiceMixEnabled && scenarioId !== "expected") {
    const priceMultiplier = preset.multipliers.servicePrice ?? 1;
    const consumableMultiplier = preset.multipliers.consumableCostPerSession ?? 1;
    const commissionMultiplier = preset.multipliers.employeeCommissionRate ?? 1;
    next.serviceMix = next.serviceMix.map((row) => ({
      ...row,
      price: row.price * priceMultiplier,
      consumableCost: row.consumableCost * consumableMultiplier,
      employeeCommissionRate: row.employeeCommissionRate * commissionMultiplier,
    }));
  }
  return normalizeBeautyInputs(next);
}
