import {
  SETUP_ITEM_STATUSES,
  createDefaultSetupProfile,
  normalizeSetupCostItem,
  normalizeSetupCostItems,
  normalizeSetupFunding,
  normalizeSetupProfile,
  buildStartupCashBridge,
} from "./setup-model.js";
import {
  instantiateRequirementItems,
  resolveSetupRequirements,
} from "./requirement-engine.js";
import { SETUP_REQUIREMENT_RULES } from "./requirement-rules.js";

export const SETUP_WORKSPACE_VERSION = 1;

function text(value, fallback = "") {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized || fallback;
}

function nonNegative(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function boundedRate(value, fallback = 0.1) {
  return Math.min(1, nonNegative(value, fallback));
}

function safeId(value, fallback) {
  const normalized = text(value)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 120);
  return normalized || fallback;
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

export function normalizeSetupWorkspace(raw = {}, context = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    version: SETUP_WORKSPACE_VERSION,
    profile: normalizeProfile(source.profile, context),
    items: normalizeSetupCostItems(source.items),
    funding: Array.isArray(source.funding) ? source.funding.map(normalizeSetupFunding) : [],
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

export function buildSetupWorkspaceResult(raw = {}, context = {}, options = {}) {
  const workspace = synchronizeSetupWorkspace(raw, context, options);
  const requirements = resolveSetupRequirements({
    profile: workspace.profile,
    rules: options.rules ?? SETUP_REQUIREMENT_RULES,
    asOf: options.asOf ?? workspace.lastRuleSync,
  });
  const cashBridge = buildStartupCashBridge({
    items: workspace.items,
    funding: workspace.funding,
    reserveRate: workspace.reserveRate,
    openingMonth: workspace.openingMonth,
  });
  const quoteCount = workspace.items.filter((item) => item.status === SETUP_ITEM_STATUSES.QUOTE).length;
  const verifyCount = workspace.items.filter((item) => item.status === SETUP_ITEM_STATUSES.VERIFY).length;

  return {
    workspace,
    requirements,
    cashBridge,
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
