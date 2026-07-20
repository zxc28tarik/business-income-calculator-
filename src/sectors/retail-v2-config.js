import { clampInteger, clampRate, nonNegative } from "../core/finance-engine.js";
import {
  RETAIL_DEFAULT_INPUTS as LEGACY_DEFAULTS,
  RETAIL_FORM_SECTIONS as LEGACY_SECTIONS,
  RETAIL_SCENARIOS,
  normalizeRetailInputs as normalizeLegacy,
} from "./retail-config.js";
import {
  RETAIL_BUSINESS_PROFILES,
  RETAIL_PROFILE_DEFAULT_INPUTS,
  RETAIL_V2_BUSINESS_TYPES,
  getRetailBusinessProfile,
} from "./retail-business-profiles.js";
import { RETAIL_PROFILE_SALES_SECTIONS } from "./retail-profile-form-sales.js";
import { RETAIL_PROFILE_INVENTORY_SECTIONS } from "./retail-profile-form-inventory.js";

const clone = (value) => structuredClone(value);

export { RETAIL_BUSINESS_PROFILES, RETAIL_SCENARIOS, RETAIL_V2_BUSINESS_TYPES };

export const RETAIL_DEFAULT_INPUTS = {
  ...clone(LEGACY_DEFAULTS),
  ...clone(RETAIL_PROFILE_DEFAULT_INPUTS),
};

const legacyTail = clone(LEGACY_SECTIONS.slice(3));
for (const section of legacyTail) {
  section.fields = section.fields.filter((field) => field.key !== "supplierPaymentDelayDays");
}

export const RETAIL_FORM_SECTIONS = [
  ...RETAIL_PROFILE_SALES_SECTIONS,
  ...RETAIL_PROFILE_INVENTORY_SECTIONS,
  ...legacyTail,
];

const preservedKeys = [
  "taxType", "vatRate", "estimatedTaxRate", "startingCash", "financingAmount", "supportAmount",
  "setupPaymentMonth", "collectionDelayDays", "supplierPaymentDelayDays", "firstMonthSalesShare",
  "monthlyGrowthRate", "loanPayment", "partnerProfitShareRate",
];

function switchProfile(raw) {
  const requested = RETAIL_V2_BUSINESS_TYPES.some(([id]) => id === raw.businessType) ? raw.businessType : "boutique";
  if (!raw.profileTypeApplied) return { ...raw, businessType: requested, profileTypeApplied: requested };
  if (raw.profileTypeApplied === requested) return raw;
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, raw[key] ?? RETAIL_DEFAULT_INPUTS[key]]));
  return {
    ...clone(RETAIL_DEFAULT_INPUTS),
    ...clone(getRetailBusinessProfile(requested).defaults),
    ...preserved,
    businessType: requested,
    profileTypeApplied: requested,
  };
}

function normalizeProduct(row = {}) {
  return {
    name: String(row.name || "Kategori"),
    salesShareRate: clampRate(row.salesShareRate),
    salePrice: nonNegative(row.salePrice),
    unitCost: nonNegative(row.unitCost),
    returnRate: clampRate(row.returnRate),
    markdownShareRate: clampRate(row.markdownShareRate),
    markdownDiscountRate: clampRate(row.markdownDiscountRate),
    spoilageRate: clampRate(row.spoilageRate),
  };
}

function normalizeSupplier(row = {}) {
  return {
    name: String(row.name || "Tedarikçi"),
    purchaseShareRate: clampRate(row.purchaseShareRate),
    paymentDelayDays: Math.min(120, nonNegative(row.paymentDelayDays)),
    leadTimeDays: Math.min(365, nonNegative(row.leadTimeDays)),
    discountRate: clampRate(row.discountRate),
    minimumOrderAmount: nonNegative(row.minimumOrderAmount),
  };
}

export function normalizeRetailInputs(raw = {}) {
  const source = switchProfile(clone(raw));
  const requested = source.businessType;
  const legacy = normalizeLegacy({ ...clone(RETAIL_DEFAULT_INPUTS), ...source, businessType: "boutique" });
  const input = { ...legacy, ...source, businessType: requested, profileTypeApplied: source.profileTypeApplied || requested };

  for (const key of [
    "conversionRate", "monthlyPurchaseFrequency", "markdownShareRate", "markdownDiscountRate",
    "spoilageRate", "purchaseDiscountRate",
  ]) input[key] = clampRate(input[key]);

  for (const key of [
    "dailyFootTraffic", "activeCustomerBase", "dailyOrders", "eventOrdersPerMonth", "eventOrderValue",
    "transactionsPerHour", "openHoursPerDay", "seasonalityMultiplier", "storeDailyCapacity",
    "supplierLeadTimeDays", "currentInventoryCost", "targetStockCoverageDays", "safetyStockDays",
    "monthlyDepreciation", "monthlyOperatingGrantIncome",
  ]) input[key] = nonNegative(input[key]);

  input.openDays = clampInteger(input.openDays, 1, 31, 26);
  input.profileDriverEnabled = Boolean(input.profileDriverEnabled);
  input.advancedProductMixEnabled = Boolean(input.advancedProductMixEnabled);
  input.advancedSupplierMixEnabled = Boolean(input.advancedSupplierMixEnabled);
  input.inventoryPlanningEnabled = Boolean(input.inventoryPlanningEnabled);
  input.seasonalityMultiplier = Math.min(3, input.seasonalityMultiplier || 1);
  input.productMix = (Array.isArray(source.productMix) ? source.productMix : RETAIL_DEFAULT_INPUTS.productMix).map(normalizeProduct);
  input.suppliers = (Array.isArray(source.suppliers) ? source.suppliers : RETAIL_DEFAULT_INPUTS.suppliers).map(normalizeSupplier);
  return input;
}

export function applyRetailBusinessType(currentInputs, businessType) {
  const type = RETAIL_V2_BUSINESS_TYPES.some(([id]) => id === businessType) ? businessType : "boutique";
  const preserved = Object.fromEntries(preservedKeys.map((key) => [key, currentInputs?.[key] ?? RETAIL_DEFAULT_INPUTS[key]]));
  return normalizeRetailInputs({
    ...clone(RETAIL_DEFAULT_INPUTS),
    ...clone(getRetailBusinessProfile(type).defaults),
    ...preserved,
    businessType: type,
    profileTypeApplied: type,
  });
}

export function applyRetailScenario(baseInputs, scenarioId) {
  const input = normalizeRetailInputs(baseInputs);
  const preset = RETAIL_SCENARIOS[scenarioId] ?? RETAIL_SCENARIOS.expected;
  const next = clone(input);
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = input[key] * multiplier;
  const demand = scenarioId === "pessimistic" ? 0.78 : scenarioId === "optimistic" ? 1.22 : 1;
  const conversion = scenarioId === "pessimistic" ? 0.90 : scenarioId === "optimistic" ? 1.08 : 1;
  for (const key of ["dailyFootTraffic", "activeCustomerBase", "dailyOrders", "eventOrdersPerMonth", "transactionsPerHour"]) next[key] = input[key] * demand;
  next.conversionRate = input.conversionRate * conversion;
  next.monthlyPurchaseFrequency = input.monthlyPurchaseFrequency * conversion;
  next.seasonalityMultiplier = input.seasonalityMultiplier * (scenarioId === "pessimistic" ? 0.92 : scenarioId === "optimistic" ? 1.08 : 1);
  next.markdownShareRate = input.markdownShareRate * (scenarioId === "pessimistic" ? 1.30 : scenarioId === "optimistic" ? 0.85 : 1);
  next.spoilageRate = input.spoilageRate * (scenarioId === "pessimistic" ? 1.25 : scenarioId === "optimistic" ? 0.80 : 1);
  return normalizeRetailInputs(next);
}
