import {
  SETUP_COST_TYPES,
  SETUP_ITEM_STATUSES,
  normalizeSetupCostItem,
  normalizeSetupProfile,
} from "./setup-model.js";

export const REQUIREMENT_LEVELS = Object.freeze({
  REQUIRED: "required",
  CONDITIONAL: "conditional",
  VERIFY: "verify",
  OPTIONAL: "optional",
});

export const REQUIREMENT_USER_STATUSES = Object.freeze({
  PENDING: "pending",
  INCLUDED: "included",
  NOT_APPLICABLE: "not_applicable",
  VERIFYING: "verifying",
  QUOTE: "quote",
});

const LEVEL_VALUES = new Set(Object.values(REQUIREMENT_LEVELS));
const USER_STATUS_VALUES = new Set(Object.values(REQUIREMENT_USER_STATUSES));
const COST_TYPE_VALUES = new Set(Object.values(SETUP_COST_TYPES));
const LEVEL_ORDER = new Map([
  [REQUIREMENT_LEVELS.REQUIRED, 0],
  [REQUIREMENT_LEVELS.CONDITIONAL, 1],
  [REQUIREMENT_LEVELS.VERIFY, 2],
  [REQUIREMENT_LEVELS.OPTIONAL, 3],
]);

function text(value, fallback = "") {
  const normalized = String(value ?? "").replace(/\s+/g, " ").trim();
  return normalized || fallback;
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

function stringScope(value) {
  if (!Array.isArray(value) || value.length === 0) return ["*"];
  const normalized = [...new Set(value.map((item) => text(item)).filter(Boolean))];
  return normalized.length ? normalized : ["*"];
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

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scopeMatches(scope, value) {
  return scope.includes("*") || scope.includes(value);
}

function activeOn(rule, asOf) {
  if (rule.effectiveFrom && asOf < rule.effectiveFrom) return false;
  if (rule.effectiveTo && asOf > rule.effectiveTo) return false;
  return true;
}

function normalizeSuggestedItem(raw = {}, index = 0) {
  return {
    key: safeId(raw.key, `item-${index + 1}`),
    label: text(raw.label, `Kuruluş kalemi ${index + 1}`),
    costType: enumValue(raw.costType, COST_TYPE_VALUES, SETUP_COST_TYPES.SETUP_EXPENSE),
    status: raw.status === SETUP_ITEM_STATUSES.INCLUDED
      ? SETUP_ITEM_STATUSES.INCLUDED
      : raw.status === SETUP_ITEM_STATUSES.VERIFY
        ? SETUP_ITEM_STATUSES.VERIFY
        : SETUP_ITEM_STATUSES.QUOTE,
    quantity: Math.max(0, Number(raw.quantity) || 1),
    unitCost: Math.max(0, Number(raw.unitCost) || 0),
    vatRate: Math.min(1, Math.max(0, Number(raw.vatRate) || 0)),
    vatIncluded: typeof raw.vatIncluded === "boolean" ? raw.vatIncluded : false,
    vatRecoverability: raw.vatRecoverability,
    note: text(raw.note),
  };
}

export function evaluateRequirementCondition(condition, profile = {}) {
  if (condition == null) return true;
  if (typeof condition === "boolean") return condition;
  if (!condition || typeof condition !== "object" || Array.isArray(condition)) return false;
  if (Array.isArray(condition.all)) {
    return condition.all.every((item) => evaluateRequirementCondition(item, profile));
  }
  if (Array.isArray(condition.any)) {
    return condition.any.some((item) => evaluateRequirementCondition(item, profile));
  }
  if (condition.not != null) return !evaluateRequirementCondition(condition.not, profile);
  if (typeof condition.key !== "string" || !Object.prototype.hasOwnProperty.call(profile, condition.key)) {
    return false;
  }

  const value = profile[condition.key];
  if (Object.prototype.hasOwnProperty.call(condition, "equals")) return Object.is(value, condition.equals);
  if (Object.prototype.hasOwnProperty.call(condition, "notEquals")) return !Object.is(value, condition.notEquals);
  if (Array.isArray(condition.in)) return condition.in.includes(value);
  if (Object.prototype.hasOwnProperty.call(condition, "truthy")) {
    return Boolean(value) === Boolean(condition.truthy);
  }
  if (Object.prototype.hasOwnProperty.call(condition, "exists")) {
    return (value !== undefined && value !== null && value !== "") === Boolean(condition.exists);
  }

  const numericValue = number(value);
  if (Object.prototype.hasOwnProperty.call(condition, "gte")) {
    const threshold = number(condition.gte);
    return numericValue != null && threshold != null && numericValue >= threshold;
  }
  if (Object.prototype.hasOwnProperty.call(condition, "lte")) {
    const threshold = number(condition.lte);
    return numericValue != null && threshold != null && numericValue <= threshold;
  }
  return Boolean(value);
}

export function normalizeRequirementRule(raw = {}, index = 0) {
  return {
    id: safeId(raw.id, `setup-requirement-${index + 1}`),
    title: text(raw.title, `Kuruluş gereksinimi ${index + 1}`),
    description: text(raw.description),
    condition: raw.condition ?? true,
    sectorScope: stringScope(raw.sectorScope),
    businessTypeScope: stringScope(raw.businessTypeScope),
    legalStructureScope: stringScope(raw.legalStructureScope),
    provinceScope: stringScope(raw.provinceScope),
    districtScope: stringScope(raw.districtScope),
    level: enumValue(raw.level, LEVEL_VALUES, REQUIREMENT_LEVELS.VERIFY),
    defaultUserStatus: enumValue(
      raw.defaultUserStatus,
      USER_STATUS_VALUES,
      REQUIREMENT_USER_STATUSES.PENDING,
    ),
    authority: text(raw.authority),
    sourceId: text(raw.sourceId),
    effectiveFrom: isoDate(raw.effectiveFrom),
    effectiveTo: isoDate(raw.effectiveTo),
    verificationOwner: text(raw.verificationOwner),
    suggestedItems: Array.isArray(raw.suggestedItems)
      ? raw.suggestedItems.map(normalizeSuggestedItem)
      : [],
    priority: Number.isFinite(Number(raw.priority)) ? Number(raw.priority) : 100,
    note: text(raw.note),
  };
}

export function resolveSetupRequirements({ profile: rawProfile = {}, rules = [], asOf = new Date().toISOString().slice(0, 10) } = {}) {
  const profile = normalizeSetupProfile(rawProfile);
  const date = isoDate(asOf) || new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const requirements = [];

  for (const [index, rawRule] of (Array.isArray(rules) ? rules : []).entries()) {
    const rule = normalizeRequirementRule(rawRule, index);
    if (seen.has(rule.id)) continue;
    seen.add(rule.id);
    if (!activeOn(rule, date)) continue;
    if (!scopeMatches(rule.sectorScope, profile.sectorId)) continue;
    if (!scopeMatches(rule.businessTypeScope, profile.businessType)) continue;
    if (!scopeMatches(rule.legalStructureScope, profile.legalStructure)) continue;
    if (!scopeMatches(rule.provinceScope, profile.province)) continue;
    if (!scopeMatches(rule.districtScope, profile.district)) continue;
    if (!evaluateRequirementCondition(rule.condition, profile)) continue;
    requirements.push({ ...rule, userStatus: rule.defaultUserStatus });
  }

  requirements.sort((left, right) => (
    (LEVEL_ORDER.get(left.level) ?? 9) - (LEVEL_ORDER.get(right.level) ?? 9)
    || left.priority - right.priority
    || left.title.localeCompare(right.title, "tr")
  ));

  const counts = Object.fromEntries(Object.values(REQUIREMENT_LEVELS).map((level) => [level, 0]));
  for (const item of requirements) counts[item.level] += 1;

  return {
    profile,
    asOf: date,
    requirements,
    summary: {
      total: requirements.length,
      counts,
      suggestedItemCount: requirements.reduce((sum, item) => sum + item.suggestedItems.length, 0),
      verificationCount: requirements.filter((item) => (
        item.level === REQUIREMENT_LEVELS.VERIFY
        || item.defaultUserStatus === REQUIREMENT_USER_STATUSES.VERIFYING
      )).length,
    },
  };
}

export function instantiateRequirementItems(requirements, existingItems = []) {
  const existingKeys = new Set((Array.isArray(existingItems) ? existingItems : []).map((item) => (
    `${safeId(item.requirementId, "")}::${safeId(item.templateKey, "")}`
  )));
  const generated = [];

  for (const requirement of Array.isArray(requirements) ? requirements : []) {
    const normalizedRequirement = normalizeRequirementRule(requirement);
    for (const [index, template] of normalizedRequirement.suggestedItems.entries()) {
      const uniqueKey = `${normalizedRequirement.id}::${template.key}`;
      if (existingKeys.has(uniqueKey)) continue;
      existingKeys.add(uniqueKey);
      generated.push(normalizeSetupCostItem({
        ...template,
        id: `${normalizedRequirement.id}-${template.key}`,
        requirementId: normalizedRequirement.id,
        templateKey: template.key,
        sourceId: normalizedRequirement.sourceId,
        note: template.note || normalizedRequirement.description,
      }, index));
    }
  }

  return generated;
}
