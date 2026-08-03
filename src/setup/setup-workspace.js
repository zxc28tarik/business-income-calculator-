import {
  SETUP_ITEM_STATUSES,
  createDefaultSetupProfile,
  normalizeSetupCostItem,
  normalizeSetupCostItems,
  normalizeSetupProfile,
  buildSetupPaymentSchedule,
  buildStartupCashBridge,
} from "./setup-model.js";
import {
  instantiateRequirementItems,
  resolveSetupRequirements,
} from "./requirement-engine.js";
import { SETUP_REQUIREMENT_RULES } from "./requirement-rules.js";

export const SETUP_WORKSPACE_VERSION = 1;

const FUNDING_TYPES = new Set(["equity", "loan", "grant", "support", "supplier_credit", "other"]);
const FUNDING_STATUSES = new Set(["planned", "available", "used", "excluded"]);

function text(value, fallback = "") {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function nonNegative(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function nonNegativeInteger(value, fallback = 0) {
  return Math.floor(nonNegative(value, fallback));
}

function boundedRate(value, fallback = 0.1) {
  return Math.min(1, nonNegative(value, fallback));
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function safeId(value, fallback) {
  const normalized = text(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120);
  return normalized || fallback;
}

function enumValue(value, allowed, fallback) {
  return allowed.has(value) ? value : fallback;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => text(item)).filter(Boolean))];
}

function contextValue(context, key, fallback = "") {
  const value = text(context?.[key]);
  return value || fallback;
}

function defaultProfileForContext(context = {}) {
  const sectorId = contextValue(context, "sectorId");
  const businessType = contextValue(context, "businessType");
  const common = { sectorId, businessType };

  if (sectorId === "cafe_restaurant") {
    return createDefaultSetupProfile({
      ...common,
      premisesType: "rented",
      hasPhysicalPremises: true,
      handlesFood: true,
      acceptsCardPayments: true,
      salesChannels: ["physical"],
    });
  }

  return createDefaultSetupProfile(common);
}

function normalizeProfile(rawProfile, context = {}) {
  const defaults = defaultProfileForContext(context);
  const sectorId = contextValue(context, "sectorId", rawProfile?.sectorId ?? defaults.sectorId);
  const businessType = contextValue(context, "businessType", rawProfile?.businessType ?? defaults.businessType);
  return normalizeSetupProfile({
    ...defaults,
    ...(rawProfile && typeof rawProfile === "object" ? rawProfile : {}),
    sectorId,
    businessType,
  });
}

function itemTemplateIdentity(item) {
  const requirementId = safeId(item?.requirementId, "");
  const templateKey = safeId(item?.templateKey, "");
  return requirementId && templateKey ? `${requirementId}::${templateKey}` : "";
}

export function normalizeWorkspaceFunding(raw = {}, index = 0) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    id: safeId(source.id, `setup-funding-${index + 1}`),
    label: text(source.label, `Finansman ${index + 1}`),
    type: enumValue(source.type, FUNDING_TYPES, "other"),
    status: enumValue(source.status, FUNDING_STATUSES, "planned"),
    amount: roundMoney(nonNegative(source.amount)),
    availableMonth: Math.min(120, nonNegativeInteger(source.availableMonth)),
    note: text(source.note),
  };
}

export function normalizeSetupWorkspace(raw = {}, context = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    version: SETUP_WORKSPACE_VERSION,
    profile: normalizeProfile(source.profile, context),
    items: normalizeSetupCostItems(source.items),
    funding: Array.isArray(source.funding) ? source.funding.map(normalizeWorkspaceFunding) : [],
    reserveRate: boundedRate(source.reserveRate, 0.1),
    openingMonth: Math.min(120, Math.floor(nonNegative(source.openingMonth))),
    dismissedTemplates: uniqueStrings(source.dismissedTemplates),
    lastRuleSync: text(source.lastRuleSync),
  };
}

export function synchronizeSetupWorkspace(raw = {}, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const resolved = resolveSetupRequirements({
    profile: workspace.profile,
    rules: options.rules ?? SETUP_REQUIREMENT_RULES,
    asOf: options.asOf,
  });
  const dismissed = new Set(workspace.dismissedTemplates);
  const generated = instantiateRequirementItems(resolved.requirements, workspace.items)
    .filter((item) => !dismissed.has(itemTemplateIdentity(item)));

  return {
    ...workspace,
    items: normalizeSetupCostItems([...workspace.items, ...generated]),
    lastRuleSync: resolved.asOf,
  };
}

export function createDefaultSetupWorkspace(context = {}, options = {}) {
  return synchronizeSetupWorkspace({
    profile: defaultProfileForContext(context),
    reserveRate: options.reserveRate ?? 0.1,
  }, context, options);
}

function fundingForCashBridge(workspace) {
  return workspace.funding.map((item) => item.status === "used"
    ? {
      ...item,
      status: "available",
      availableMonth: Math.min(item.availableMonth, workspace.openingMonth),
    }
    : item);
}

function summarizeFunding(workspace, availableFunding) {
  const totals = {
    totalAmount: 0,
    plannedAmount: 0,
    availableAmount: 0,
    usedAmount: 0,
    excludedAmount: 0,
    readyAmount: roundMoney(availableFunding),
  };
  for (const item of workspace.funding) {
    totals.totalAmount += item.amount;
    if (item.status === "planned") totals.plannedAmount += item.amount;
    if (item.status === "available") totals.availableAmount += item.amount;
    if (item.status === "used") totals.usedAmount += item.amount;
    if (item.status === "excluded") totals.excludedAmount += item.amount;
  }
  for (const key of Object.keys(totals)) totals[key] = roundMoney(totals[key]);
  return totals;
}

export function buildSetupWorkspaceResult(raw = {}, context = {}, options = {}) {
  const workspace = synchronizeSetupWorkspace(raw, context, options);
  const requirements = resolveSetupRequirements({
    profile: workspace.profile,
    rules: options.rules ?? SETUP_REQUIREMENT_RULES,
    asOf: options.asOf ?? workspace.lastRuleSync,
  });
  const cashBridge = buildStartupCashBridge({
    items: workspace.items,
    funding: fundingForCashBridge(workspace),
    reserveRate: workspace.reserveRate,
    openingMonth: workspace.openingMonth,
  });
  cashBridge.funding = workspace.funding;
  const paymentSchedule = buildSetupPaymentSchedule(workspace.items, options.scheduleMonths ?? 12);
  const fundingSummary = summarizeFunding(workspace, cashBridge.availableFunding);
  const quoteCount = workspace.items.filter((item) => item.status === SETUP_ITEM_STATUSES.QUOTE).length;
  const verifyCount = workspace.items.filter((item) => item.status === SETUP_ITEM_STATUSES.VERIFY).length;

  return {
    workspace,
    requirements,
    cashBridge,
    paymentSchedule,
    fundingSummary,
    quoteCount,
    verifyCount,
    unresolvedCount: quoteCount + verifyCount,
  };
}

export function updateSetupProfile(raw, patch, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  return synchronizeSetupWorkspace({
    ...workspace,
    profile: { ...workspace.profile, ...(patch && typeof patch === "object" ? patch : {}) },
  }, context, options);
}

export function updateSetupReserveRate(raw, reserveRate, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  return synchronizeSetupWorkspace({ ...workspace, reserveRate }, context, options);
}

export function updateSetupItem(raw, itemId, patch, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const id = safeId(itemId, "");
  if (!id) return synchronizeSetupWorkspace(workspace, context, options);
  const items = workspace.items.map((item, index) => item.id === id
    ? normalizeSetupCostItem({ ...item, ...(patch && typeof patch === "object" ? patch : {}), id }, index)
    : item);
  return synchronizeSetupWorkspace({ ...workspace, items }, context, options);
}

export function addCustomSetupItem(raw, seed = {}, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const existingIds = new Set(workspace.items.map((item) => item.id));
  const requestedId = safeId(seed.id, `custom-${Date.now().toString(36)}`);
  let id = requestedId;
  let suffix = 2;
  while (existingIds.has(id)) id = `${requestedId}-${suffix++}`;
  const item = normalizeSetupCostItem({
    label: "Yeni kuruluş kalemi",
    status: SETUP_ITEM_STATUSES.INCLUDED,
    ...seed,
    id,
    requirementId: "",
    templateKey: "",
  }, workspace.items.length);
  return synchronizeSetupWorkspace({ ...workspace, items: [...workspace.items, item] }, context, options);
}

export function removeSetupItem(raw, itemId, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const id = safeId(itemId, "");
  const removed = workspace.items.find((item) => item.id === id);
  if (!removed) return synchronizeSetupWorkspace(workspace, context, options);
  const identity = itemTemplateIdentity(removed);
  const dismissedTemplates = identity
    ? uniqueStrings([...workspace.dismissedTemplates, identity])
    : workspace.dismissedTemplates;
  return synchronizeSetupWorkspace({
    ...workspace,
    items: workspace.items.filter((item) => item.id !== id),
    dismissedTemplates,
  }, context, options);
}

export function addSetupFunding(raw, seed = {}, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const existingIds = new Set(workspace.funding.map((item) => item.id));
  const requestedId = safeId(seed.id, `funding-${Date.now().toString(36)}`);
  let id = requestedId;
  let suffix = 2;
  while (existingIds.has(id)) id = `${requestedId}-${suffix++}`;
  const funding = normalizeWorkspaceFunding({
    label: "Yeni finansman kaynağı",
    type: "equity",
    status: "planned",
    ...seed,
    id,
  }, workspace.funding.length);
  return synchronizeSetupWorkspace({ ...workspace, funding: [...workspace.funding, funding] }, context, options);
}

export function updateSetupFunding(raw, fundingId, patch, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const id = safeId(fundingId, "");
  if (!id) return synchronizeSetupWorkspace(workspace, context, options);
  const funding = workspace.funding.map((item, index) => item.id === id
    ? normalizeWorkspaceFunding({ ...item, ...(patch && typeof patch === "object" ? patch : {}), id }, index)
    : item);
  return synchronizeSetupWorkspace({ ...workspace, funding }, context, options);
}

export function removeSetupFunding(raw, fundingId, context = {}, options = {}) {
  const workspace = normalizeSetupWorkspace(raw, context);
  const id = safeId(fundingId, "");
  return synchronizeSetupWorkspace({
    ...workspace,
    funding: workspace.funding.filter((item) => item.id !== id),
  }, context, options);
}
