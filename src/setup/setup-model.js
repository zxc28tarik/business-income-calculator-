export const SETUP_COST_TYPES = Object.freeze({
  SETUP_EXPENSE: "SETUP_EXPENSE",
  CAPEX: "CAPEX",
  FIT_OUT: "FIT_OUT",
  DEPOSIT: "DEPOSIT",
  OPENING_INVENTORY: "OPENING_INVENTORY",
  CONSUMABLES: "CONSUMABLES",
  PREPAID: "PREPAID",
  WORKING_CAPITAL: "WORKING_CAPITAL",
  REFUNDABLE: "REFUNDABLE",
  TAX_CREDIT: "TAX_CREDIT",
  NON_RECOVERABLE_TAX: "NON_RECOVERABLE_TAX",
  RECURRING_COMPLIANCE: "RECURRING_COMPLIANCE",
});

export const SETUP_ITEM_STATUSES = Object.freeze({
  INCLUDED: "included",
  EXCLUDED: "excluded",
  VERIFY: "verify",
  QUOTE: "quote",
});

export const VAT_RECOVERABILITY = Object.freeze({
  RECOVERABLE: "recoverable",
  NON_RECOVERABLE: "non_recoverable",
  UNKNOWN: "unknown",
});

export const SETUP_SOURCE_TYPES = Object.freeze({
  SYSTEM_DEFAULT: "system_default",
  USER_ESTIMATE: "user_estimate",
  QUOTE: "quote",
  CONTRACT: "contract",
  OFFICIAL: "official",
  EXPERT_VERIFIED: "expert_verified",
});

export const SETUP_VERIFICATION_STATUSES = Object.freeze({
  UNVERIFIED: "unverified",
  VERIFY: "verify",
  VERIFIED: "verified",
  EXPIRED: "expired",
});

export const LEGAL_STRUCTURES = Object.freeze({
  UNDECIDED: "undecided",
  SOLE_PROPRIETORSHIP: "sole_proprietorship",
  LIMITED_COMPANY: "limited_company",
  JOINT_STOCK_COMPANY: "joint_stock_company",
  OTHER: "other",
});

const COST_TYPE_VALUES = new Set(Object.values(SETUP_COST_TYPES));
const ITEM_STATUS_VALUES = new Set(Object.values(SETUP_ITEM_STATUSES));
const VAT_RECOVERABILITY_VALUES = new Set(Object.values(VAT_RECOVERABILITY));
const SOURCE_TYPE_VALUES = new Set(Object.values(SETUP_SOURCE_TYPES));
const VERIFICATION_STATUS_VALUES = new Set(Object.values(SETUP_VERIFICATION_STATUSES));
const LEGAL_STRUCTURE_VALUES = new Set(Object.values(LEGAL_STRUCTURES));

const PREMISES_TYPES = new Set(["unknown", "none", "home_office", "rented", "owned", "shared", "other"]);
const TAXPAYER_TYPES = new Set(["unknown", "individual", "corporate", "other"]);
const FUNDING_TYPES = new Set(["equity", "loan", "grant", "support", "supplier_credit", "other"]);
const FUNDING_STATUSES = new Set(["available", "planned", "excluded"]);

const EXPENSE_TYPES = new Set([
  SETUP_COST_TYPES.SETUP_EXPENSE,
  SETUP_COST_TYPES.CONSUMABLES,
  SETUP_COST_TYPES.NON_RECOVERABLE_TAX,
  SETUP_COST_TYPES.RECURRING_COMPLIANCE,
]);
const ASSET_TYPES = new Set([SETUP_COST_TYPES.CAPEX, SETUP_COST_TYPES.FIT_OUT]);
const TIED_CASH_TYPES = new Set([SETUP_COST_TYPES.DEPOSIT, SETUP_COST_TYPES.REFUNDABLE]);
const RESERVE_ELIGIBLE_TYPES = new Set([
  SETUP_COST_TYPES.SETUP_EXPENSE,
  SETUP_COST_TYPES.CAPEX,
  SETUP_COST_TYPES.FIT_OUT,
  SETUP_COST_TYPES.OPENING_INVENTORY,
  SETUP_COST_TYPES.CONSUMABLES,
  SETUP_COST_TYPES.PREPAID,
  SETUP_COST_TYPES.NON_RECOVERABLE_TAX,
  SETUP_COST_TYPES.RECURRING_COMPLIANCE,
]);

function text(value, fallback = "") {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function enumValue(value, allowed, fallback) {
  return allowed.has(value) ? value : fallback;
}

function nonNegative(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function nonNegativeInteger(value, fallback = 0) {
  return Math.floor(nonNegative(value, fallback));
}

function boundedRate(value, fallback = 0) {
  return Math.min(1, nonNegative(value, fallback));
}

function boolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => text(item)).filter(Boolean))];
}

function isoDate(value) {
  const candidate = text(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(candidate);
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    ? candidate
    : "";
}

function safeId(value, fallback) {
  const normalized = text(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 100);
  return normalized || fallback;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function createDefaultSetupProfile(overrides = {}) {
  return normalizeSetupProfile({
    legalStructure: LEGAL_STRUCTURES.UNDECIDED,
    taxpayerType: "unknown",
    premisesType: "unknown",
    ...overrides,
  });
}

export function normalizeSetupProfile(raw = {}) {
  const employeeCount = nonNegativeInteger(raw.employeeCount);
  const premisesType = enumValue(raw.premisesType, PREMISES_TYPES, "unknown");
  const hasPhysicalPremises = boolean(raw.hasPhysicalPremises)
    || ["rented", "owned", "shared", "other"].includes(premisesType);

  return {
    projectId: safeId(raw.projectId, ""),
    sectorId: safeId(raw.sectorId, ""),
    businessType: safeId(raw.businessType, ""),
    legalStructure: enumValue(raw.legalStructure, LEGAL_STRUCTURE_VALUES, LEGAL_STRUCTURES.UNDECIDED),
    taxpayerType: enumValue(raw.taxpayerType, TAXPAYER_TYPES, "unknown"),
    province: text(raw.province),
    district: text(raw.district),
    premisesType,
    hasPhysicalPremises,
    hasEmployees: boolean(raw.hasEmployees) || employeeCount > 0,
    employeeCount,
    salesChannels: uniqueStrings(raw.salesChannels),
    handlesFood: boolean(raw.handlesFood),
    manufacturesProducts: boolean(raw.manufacturesProducts),
    importsOrExports: boolean(raw.importsOrExports),
    usesRegulatedEquipment: boolean(raw.usesRegulatedEquipment),
    requiresProfessionalQualification: boolean(raw.requiresProfessionalQualification),
    isFranchise: boolean(raw.isFranchise),
    usesCompanyVehicle: boolean(raw.usesCompanyVehicle),
    storesPersonalData: boolean(raw.storesPersonalData),
    acceptsCardPayments: boolean(raw.acceptsCardPayments),
    usesMarketplace: boolean(raw.usesMarketplace),
    openingTargetDate: isoDate(raw.openingTargetDate),
  };
}

export function normalizeSetupCostItem(raw = {}, index = 0) {
  const quantity = nonNegative(raw.quantity, 1);
  const unitCost = nonNegative(raw.unitCost);
  const vatRate = boundedRate(raw.vatRate);
  const vatIncluded = boolean(raw.vatIncluded);
  const grossInput = quantity * unitCost;
  const netAmount = vatIncluded && vatRate > 0 ? grossInput / (1 + vatRate) : grossInput;
  const vatAmount = vatIncluded ? grossInput - netAmount : netAmount * vatRate;
  const cashAmount = netAmount + vatAmount;
  const vatRecoverability = enumValue(
    raw.vatRecoverability,
    VAT_RECOVERABILITY_VALUES,
    VAT_RECOVERABILITY.UNKNOWN,
  );
  const recoverableVat = vatRecoverability === VAT_RECOVERABILITY.RECOVERABLE ? vatAmount : 0;
  const nonRecoverableVat = vatRecoverability === VAT_RECOVERABILITY.NON_RECOVERABLE ? vatAmount : 0;
  const unverifiedVat = vatRecoverability === VAT_RECOVERABILITY.UNKNOWN ? vatAmount : 0;

  return {
    id: safeId(raw.id, `setup-item-${index + 1}`),
    label: text(raw.label, `Kuruluş kalemi ${index + 1}`),
    costType: enumValue(raw.costType, COST_TYPE_VALUES, SETUP_COST_TYPES.SETUP_EXPENSE),
    status: enumValue(raw.status, ITEM_STATUS_VALUES, SETUP_ITEM_STATUSES.INCLUDED),
    quantity,
    unitCost,
    vatRate,
    vatIncluded,
    vatRecoverability,
    paymentMonth: Math.min(120, nonNegativeInteger(raw.paymentMonth)),
    installmentCount: Math.min(120, Math.max(1, nonNegativeInteger(raw.installmentCount, 1))),
    sourceType: enumValue(raw.sourceType, SOURCE_TYPE_VALUES, SETUP_SOURCE_TYPES.USER_ESTIMATE),
    sourceId: text(raw.sourceId),
    verificationStatus: enumValue(
      raw.verificationStatus,
      VERIFICATION_STATUS_VALUES,
      SETUP_VERIFICATION_STATUSES.UNVERIFIED,
    ),
    note: text(raw.note),
    netAmount: roundMoney(netAmount),
    vatAmount: roundMoney(vatAmount),
    cashAmount: roundMoney(cashAmount),
    recoverableVat: roundMoney(recoverableVat),
    nonRecoverableVat: roundMoney(nonRecoverableVat),
    unverifiedVat: roundMoney(unverifiedVat),
    financialBasis: roundMoney(netAmount + nonRecoverableVat),
  };
}

export function normalizeSetupCostItems(items) {
  return Array.isArray(items) ? items.map(normalizeSetupCostItem) : [];
}

export function summarizeSetupCosts(items) {
  const normalizedItems = normalizeSetupCostItems(items);
  const includedItems = normalizedItems.filter((item) => item.status === SETUP_ITEM_STATUSES.INCLUDED);
  const byType = Object.fromEntries(Object.values(SETUP_COST_TYPES).map((type) => [type, {
    itemCount: 0,
    cashAmount: 0,
    financialBasis: 0,
  }]));

  const totals = {
    itemCount: normalizedItems.length,
    includedCount: includedItems.length,
    cashRequirement: 0,
    expenseBasis: 0,
    assetBasis: 0,
    inventoryBasis: 0,
    tiedCash: 0,
    prepaidBasis: 0,
    workingCapital: 0,
    taxCreditBasis: 0,
    recoverableVat: 0,
    nonRecoverableVat: 0,
    unverifiedVat: 0,
    reserveEligibleCash: 0,
  };

  for (const item of includedItems) {
    const type = byType[item.costType];
    type.itemCount += 1;
    type.cashAmount += item.cashAmount;
    type.financialBasis += item.financialBasis;

    totals.cashRequirement += item.cashAmount;
    totals.recoverableVat += item.recoverableVat;
    totals.nonRecoverableVat += item.nonRecoverableVat;
    totals.unverifiedVat += item.unverifiedVat;
    if (EXPENSE_TYPES.has(item.costType)) totals.expenseBasis += item.financialBasis;
    if (ASSET_TYPES.has(item.costType)) totals.assetBasis += item.financialBasis;
    if (item.costType === SETUP_COST_TYPES.OPENING_INVENTORY) totals.inventoryBasis += item.financialBasis;
    if (TIED_CASH_TYPES.has(item.costType)) totals.tiedCash += item.cashAmount;
    if (item.costType === SETUP_COST_TYPES.PREPAID) totals.prepaidBasis += item.financialBasis;
    if (item.costType === SETUP_COST_TYPES.WORKING_CAPITAL) totals.workingCapital += item.cashAmount;
    if (item.costType === SETUP_COST_TYPES.TAX_CREDIT) totals.taxCreditBasis += item.cashAmount;
    if (RESERVE_ELIGIBLE_TYPES.has(item.costType)) totals.reserveEligibleCash += item.cashAmount;
  }

  for (const value of Object.values(byType)) {
    value.cashAmount = roundMoney(value.cashAmount);
    value.financialBasis = roundMoney(value.financialBasis);
  }
  for (const key of Object.keys(totals)) {
    if (typeof totals[key] === "number") totals[key] = roundMoney(totals[key]);
  }

  return { items: normalizedItems, includedItems, byType, totals };
}

export function normalizeSetupFunding(raw = {}, index = 0) {
  return {
    id: safeId(raw.id, `setup-funding-${index + 1}`),
    label: text(raw.label, `Finansman ${index + 1}`),
    type: enumValue(raw.type, FUNDING_TYPES, "other"),
    status: enumValue(raw.status, FUNDING_STATUSES, "planned"),
    amount: roundMoney(nonNegative(raw.amount)),
    availableMonth: Math.min(120, nonNegativeInteger(raw.availableMonth)),
  };
}

export function buildSetupPaymentSchedule(items, maxMonth = 12) {
  const monthLimit = Math.min(120, nonNegativeInteger(maxMonth, 12));
  const rows = Array.from({ length: monthLimit + 1 }, (_, month) => ({ month, cashOutflow: 0 }));
  let afterHorizon = 0;

  for (const item of normalizeSetupCostItems(items)) {
    if (item.status !== SETUP_ITEM_STATUSES.INCLUDED || item.cashAmount <= 0) continue;
    const installment = item.cashAmount / item.installmentCount;
    for (let offset = 0; offset < item.installmentCount; offset += 1) {
      const month = item.paymentMonth + offset;
      if (month <= monthLimit) rows[month].cashOutflow += installment;
      else afterHorizon += installment;
    }
  }

  for (const row of rows) row.cashOutflow = roundMoney(row.cashOutflow);
  return { rows, afterHorizon: roundMoney(afterHorizon) };
}

export function buildStartupCashBridge({
  items = [],
  funding = [],
  reserveRate = 0,
  openingMonth = 0,
} = {}) {
  const summary = summarizeSetupCosts(items);
  const normalizedFunding = Array.isArray(funding) ? funding.map(normalizeSetupFunding) : [];
  const opening = Math.min(120, nonNegativeInteger(openingMonth));
  const availableFunding = normalizedFunding
    .filter((item) => item.status === "available" && item.availableMonth <= opening)
    .reduce((sum, item) => sum + item.amount, 0);
  const contingencyReserve = summary.totals.reserveEligibleCash * boundedRate(reserveRate);
  const grossStartupCashNeed = summary.totals.cashRequirement + contingencyReserve;
  const requiredOwnCash = Math.max(0, grossStartupCashNeed - availableFunding);
  const fundingSurplus = Math.max(0, availableFunding - grossStartupCashNeed);

  return {
    summary,
    funding: normalizedFunding,
    openingMonth: opening,
    reserveRate: boundedRate(reserveRate),
    contingencyReserve: roundMoney(contingencyReserve),
    grossStartupCashNeed: roundMoney(grossStartupCashNeed),
    availableFunding: roundMoney(availableFunding),
    requiredOwnCash: roundMoney(requiredOwnCash),
    fundingSurplus: roundMoney(fundingSurplus),
  };
}
