import test from "node:test";
import assert from "node:assert/strict";
import {
  REQUIREMENT_LEVELS,
  evaluateRequirementCondition,
  instantiateRequirementItems,
  resolveSetupRequirements,
} from "../src/setup/requirement-engine.js";
import {
  CAFE_RESTAURANT_SETUP_RULES,
  COMMON_SETUP_REQUIREMENT_RULES,
  SETUP_REQUIREMENT_RULES,
} from "../src/setup/requirement-rules.js";
import { SETUP_COST_TYPES } from "../src/setup/setup-model.js";

test("koşul motoru all, any, not, in ve sayısal eşikleri değerlendirir", () => {
  const profile = { hasEmployees: true, employeeCount: 3, sectorId: "cafe_restaurant" };
  assert.equal(evaluateRequirementCondition({ all: [
    { key: "hasEmployees", truthy: true },
    { key: "employeeCount", gte: 2 },
  ] }, profile), true);
  assert.equal(evaluateRequirementCondition({ any: [
    { key: "employeeCount", lte: 1 },
    { key: "sectorId", in: ["cafe_restaurant"] },
  ] }, profile), true);
  assert.equal(evaluateRequirementCondition({ not: { key: "hasEmployees", truthy: false } }, profile), true);
  assert.equal(evaluateRequirementCondition({ key: "missing", truthy: true }, profile), false);
});

test("kafe profili ortak ve sektörel kuruluş gereksinimlerini birlikte üretir", () => {
  const result = resolveSetupRequirements({
    profile: {
      sectorId: "cafe_restaurant",
      businessType: "cafe",
      legalStructure: "undecided",
      premisesType: "rented",
      hasEmployees: true,
      employeeCount: 4,
      handlesFood: true,
      acceptsCardPayments: true,
      usesMarketplace: false,
    },
    rules: SETUP_REQUIREMENT_RULES,
    asOf: "2026-08-03",
  });

  const ids = result.requirements.map((item) => item.id);
  assert.ok(ids.includes("legal-structure-decision"));
  assert.ok(ids.includes("physical-premises-package"));
  assert.ok(ids.includes("employee-onboarding-package"));
  assert.ok(ids.includes("card-payment-package"));
  assert.ok(ids.includes("cafe-seating-package"));
  assert.ok(ids.includes("cafe-food-operation-checks"));
  assert.ok(ids.includes("cafe-kitchen-package"));
  assert.ok(ids.includes("cafe-opening-inventory"));
  assert.ok(!ids.includes("marketplace-package"));
  assert.equal(result.summary.total, 8);
  assert.ok(result.summary.suggestedItemCount >= 15);
});

test("hukuki yapı kararı verildiğinde kararsızlık gereksinimi kalkar", () => {
  const result = resolveSetupRequirements({
    profile: { legalStructure: "limited_company" },
    rules: COMMON_SETUP_REQUIREMENT_RULES,
    asOf: "2026-08-03",
  });
  assert.ok(!result.requirements.some((item) => item.id === "legal-structure-decision"));
});

test("sektör kapsamı kafe kurallarının başka sektöre sızmasını engeller", () => {
  const result = resolveSetupRequirements({
    profile: { sectorId: "saas_subscription", premisesType: "rented", handlesFood: true },
    rules: CAFE_RESTAURANT_SETUP_RULES,
    asOf: "2026-08-03",
  });
  assert.equal(result.requirements.length, 0);
});

test("yürürlük tarihinin dışındaki kurallar uygulanmaz", () => {
  const result = resolveSetupRequirements({
    profile: {},
    asOf: "2026-08-03",
    rules: [
      { id: "future", title: "Gelecek", effectiveFrom: "2027-01-01" },
      { id: "expired", title: "Eski", effectiveTo: "2025-12-31" },
      { id: "active", title: "Güncel", effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31" },
    ],
  });
  assert.deepEqual(result.requirements.map((item) => item.id), ["active"]);
});

test("aynı kural kimliği bir kez uygulanır ve seviye sırası korunur", () => {
  const result = resolveSetupRequirements({
    profile: {},
    rules: [
      { id: "same", title: "İlk", level: REQUIREMENT_LEVELS.OPTIONAL },
      { id: "same", title: "İkinci", level: REQUIREMENT_LEVELS.REQUIRED },
      { id: "required", title: "Zorunlu", level: REQUIREMENT_LEVELS.REQUIRED },
    ],
    asOf: "2026-08-03",
  });
  assert.equal(result.requirements.filter((item) => item.id === "same").length, 1);
  assert.equal(result.requirements[0].id, "required");
});

test("gereksinim şablonları maliyet kalemlerine kaynak bağlantısıyla dönüşür", () => {
  const resolved = resolveSetupRequirements({
    profile: { sectorId: "cafe_restaurant", premisesType: "rented", handlesFood: true },
    rules: CAFE_RESTAURANT_SETUP_RULES,
    asOf: "2026-08-03",
  });
  const generated = instantiateRequirementItems(resolved.requirements);
  const table = generated.find((item) => item.templateKey === "tables");
  const stock = generated.find((item) => item.templateKey === "food-stock");

  assert.equal(table.requirementId, "cafe-seating-package");
  assert.equal(table.costType, SETUP_COST_TYPES.CAPEX);
  assert.equal(stock.costType, SETUP_COST_TYPES.OPENING_INVENTORY);
  assert.equal(generated.every((item) => item.cashAmount === 0), true);
});

test("mevcut gereksinim kalemi tekrar üretilmez", () => {
  const requirements = [{
    id: "sample",
    title: "Örnek",
    suggestedItems: [{ key: "cost", label: "Maliyet", costType: SETUP_COST_TYPES.SETUP_EXPENSE }],
  }];
  const generated = instantiateRequirementItems(requirements, [{ requirementId: "sample", templateKey: "cost" }]);
  assert.deepEqual(generated, []);
});
