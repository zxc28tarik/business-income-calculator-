import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import {
  AUTO_SERVICE_DEFAULT_INPUTS as LEGACY_DEFAULTS,
  AUTO_SERVICE_FORM_SECTIONS as LEGACY_SECTIONS,
  AUTO_SERVICE_PACKAGE_TYPES,
  AUTO_SERVICE_SCENARIOS,
  normalizeAutoServiceInputs as normalizeLegacy,
} from "./auto-config.js";
import {
  AUTO_BUSINESS_PROFILES,
  AUTO_PROFILE_DEFAULT_INPUTS,
  AUTO_V2_BUSINESS_TYPES,
  getAutoBusinessProfile,
} from "./auto-business-profiles.js";
import { AUTO_PROFILE_OPERATION_SECTIONS } from "./auto-profile-form-operations.js";
import { AUTO_PROFILE_STAFF_SECTIONS } from "./auto-profile-form-staff.js";
import { AUTO_PROFILE_SUPPLY_SECTIONS } from "./auto-profile-form-supply.js";

const clone = (value) => structuredClone(value);

export { AUTO_BUSINESS_PROFILES, AUTO_SERVICE_PACKAGE_TYPES, AUTO_SERVICE_SCENARIOS, AUTO_V2_BUSINESS_TYPES };

export const AUTO_SERVICE_DEFAULT_INPUTS = {
  ...clone(LEGACY_DEFAULTS),
  ...clone(AUTO_PROFILE_DEFAULT_INPUTS),
};

const legacyTail = clone(LEGACY_SECTIONS.slice(3));
legacyTail[0].title = "6 · Sabit giderler";
legacyTail[0].fields = legacyTail[0].fields.filter((field) => field.key !== "staffCost");
legacyTail[1].title = "7 · Ekipman, amortisman ve kurulum";
legacyTail[2].title = "8 · Paydaş ve vergi varsayımı";
legacyTail[3].title = "9 · Nakit akışı";
legacyTail[3].fields = legacyTail[3].fields.filter((field) => field.key !== "supplierPaymentDelayDays");

export const AUTO_SERVICE_FORM_SECTIONS = [
  ...AUTO_PROFILE_OPERATION_SECTIONS,
  AUTO_PROFILE_STAFF_SECTIONS[0],
  ...AUTO_PROFILE_SUPPLY_SECTIONS,
  AUTO_PROFILE_STAFF_SECTIONS[1],
  ...legacyTail,
];

const preservedKeys = [
  "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
  "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays", "firstMonthSalesShare",
  "monthlyGrowthRate", "loanPayment", "partnerProfitShareRate",
];

function switchProfile(raw) {
  const requested = AUTO_V2_BUSINESS_TYPES.some(([id]) => id === raw.businessType) ? raw.businessType : "car_wash";
  if (!raw.profileTypeApplied) return { ...raw, businessType: requested, profileTypeApplied: requested };
  if (raw.profileTypeApplied === requested) return raw;
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, raw[key] ?? AUTO_SERVICE_DEFAULT_INPUTS[key]]));
  return {
    ...clone(AUTO_SERVICE_DEFAULT_INPUTS),
    ...clone(getAutoBusinessProfile(requested).defaults),
    ...preserved,
    businessType: requested,
    profileTypeApplied: requested,
  };
}

function normalizeService(row = {}) {
  return {
    name: String(row.name || "Hizmet"),
    serviceShareRate: clampRate(row.serviceShareRate),
    servicePrice: nonNegative(row.servicePrice),
    durationMinutes: Math.max(5, nonNegative(row.durationMinutes, 60)),
    consumableCost: nonNegative(row.consumableCost),
    energyCost: nonNegative(row.energyCost),
    partsRevenue: nonNegative(row.partsRevenue),
    partsCostRate: clampRate(row.partsCostRate),
    reworkRate: clampRate(row.reworkRate),
  };
}

function normalizeStaff(row = {}) {
  return {
    name: String(row.name || "Rol"),
    count: clampInteger(row.count, 0, 1000, 0),
    monthlyCostPerPerson: nonNegative(row.monthlyCostPerPerson),
    productiveHoursPerMonth: nonNegative(row.productiveHoursPerMonth),
  };
}

function normalizeSupplier(row = {}) {
  return {
    name: String(row.name || "Tedarikçi"),
    purchaseShareRate: clampRate(row.purchaseShareRate),
    paymentDelayDays: Math.min(120, nonNegative(row.paymentDelayDays)),
    leadTimeDays: Math.min(365, nonNegative(row.leadTimeDays)),
    discountRate: clampRate(row.discountRate),
  };
}

function normalizeSubcontract(row = {}) {
  return {
    name: String(row.name || "Dış hizmet"),
    monthlyJobs: nonNegative(row.monthlyJobs),
    salePrice: nonNegative(row.salePrice),
    costPerJob: nonNegative(row.costPerJob),
  };
}

export function normalizeAutoServiceInputs(raw = {}) {
  const source = switchProfile(clone(raw));
  const requested = source.businessType;
  const legacy = normalizeLegacy({ ...clone(AUTO_SERVICE_DEFAULT_INPUTS), ...source, businessType: "car_wash" });
  const input = { ...legacy, ...source, businessType: requested, profileTypeApplied: source.profileTypeApplied || requested };

  for (const key of [
    "bookingConversionRate", "appointmentNoShowRate", "cancellationRecoveryRate", "monthlyRepeatVisitRate",
  ]) input[key] = clampRate(input[key]);

  for (const key of [
    "dailyDemandRequests", "scheduledJobsPerDay", "monthlyJobs", "routesPerTechnicianPerDay", "cancellationFee",
    "activeCustomerBase", "newCustomerJobsPerMonth", "currentPartsInventoryCost", "targetPartsCoverageDays",
    "safetyStockDays", "supplierLeadTimeDays", "mobileTravelCostPerJob", "monthlyOperatingGrantIncome",
  ]) input[key] = nonNegative(input[key]);

  input.mobileTechnicians = clampInteger(input.mobileTechnicians, 0, 1000, 0);
  input.profileDriverEnabled = Boolean(input.profileDriverEnabled);
  input.customerBaseDemandEnabled = Boolean(input.customerBaseDemandEnabled);
  input.advancedServiceMixEnabled = Boolean(input.advancedServiceMixEnabled);
  input.advancedStaffEnabled = Boolean(input.advancedStaffEnabled);
  input.partsInventoryEnabled = Boolean(input.partsInventoryEnabled);
  input.advancedSupplierMixEnabled = Boolean(input.advancedSupplierMixEnabled);
  input.subcontractEnabled = Boolean(input.subcontractEnabled);
  input.services = (Array.isArray(source.services) ? source.services : AUTO_SERVICE_DEFAULT_INPUTS.services).map(normalizeService);
  input.staffRoles = (Array.isArray(source.staffRoles) ? source.staffRoles : AUTO_SERVICE_DEFAULT_INPUTS.staffRoles).map(normalizeStaff);
  input.suppliers = (Array.isArray(source.suppliers) ? source.suppliers : AUTO_SERVICE_DEFAULT_INPUTS.suppliers).map(normalizeSupplier);
  input.subcontractItems = (Array.isArray(source.subcontractItems) ? source.subcontractItems : AUTO_SERVICE_DEFAULT_INPUTS.subcontractItems).map(normalizeSubcontract);
  return input;
}

export function applyAutoBusinessType(currentInputs, businessType) {
  const type = AUTO_V2_BUSINESS_TYPES.some(([id]) => id === businessType) ? businessType : "car_wash";
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, currentInputs?.[key] ?? AUTO_SERVICE_DEFAULT_INPUTS[key]]));
  return normalizeAutoServiceInputs({
    ...clone(AUTO_SERVICE_DEFAULT_INPUTS),
    ...clone(getAutoBusinessProfile(type).defaults),
    ...preserved,
    businessType: type,
    profileTypeApplied: type,
  });
}

export function applyAutoServiceScenario(baseInputs, scenarioId) {
  const input = normalizeAutoServiceInputs(baseInputs);
  const preset = AUTO_SERVICE_SCENARIOS[scenarioId] ?? AUTO_SERVICE_SCENARIOS.expected;
  const next = clone(input);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = input[key] * multiplier;
  const demand = scenarioId === "pessimistic" ? 0.72 : scenarioId === "optimistic" ? 1.22 : 1;
  const quality = scenarioId === "pessimistic" ? 1.30 : scenarioId === "optimistic" ? 0.75 : 1;
  for (const key of ["dailyDemandRequests", "scheduledJobsPerDay", "monthlyJobs", "routesPerTechnicianPerDay", "newCustomerJobsPerMonth"]) next[key] = input[key] * demand;
  next.bookingConversionRate = input.bookingConversionRate * demand;
  next.appointmentNoShowRate = input.appointmentNoShowRate * quality;
  next.monthlyRepeatVisitRate = input.monthlyRepeatVisitRate * demand;
  next.services = input.services.map((row) => ({ ...row, servicePrice: row.servicePrice * (scenarioId === "pessimistic" ? 0.94 : scenarioId === "optimistic" ? 1.06 : 1), consumableCost: row.consumableCost * quality, energyCost: row.energyCost * quality, reworkRate: row.reworkRate * quality }));
  return normalizeAutoServiceInputs(next);
}
