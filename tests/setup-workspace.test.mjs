import test from "node:test";
import assert from "node:assert/strict";
import {
  SETUP_COST_TYPES,
  SETUP_ITEM_STATUSES,
} from "../src/setup/setup-model.js";
import {
  addCustomSetupItem,
  buildSetupWorkspaceResult,
  createDefaultSetupWorkspace,
  normalizeSetupWorkspace,
  removeSetupItem,
  updateSetupItem,
  updateSetupProfile,
} from "../src/setup/setup-workspace.js";

const cafeContext = { sectorId: "cafe_restaurant", businessType: "cafe" };

test("kafe kuruluş çalışma alanı güvenli varsayımlar ve sıfır finans etkisiyle oluşur", () => {
  const workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.equal(workspace.profile.sectorId, "cafe_restaurant");
  assert.equal(workspace.profile.hasPhysicalPremises, true);
  assert.equal(workspace.profile.handlesFood, true);
  assert.ok(workspace.items.length >= 10);
  assert.ok(workspace.items.every((item) => [SETUP_ITEM_STATUSES.QUOTE, SETUP_ITEM_STATUSES.VERIFY].includes(item.status)));
  assert.equal(result.cashBridge.grossStartupCashNeed, 0);
  assert.equal(result.cashBridge.requiredOwnCash, 0);
});

test("dahil edilen kafe kalemi gerçek başlangıç nakdine bağlanır", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  const target = workspace.items.find((item) => item.costType === SETUP_COST_TYPES.CAPEX);
  workspace = updateSetupItem(workspace, target.id, {
    status: SETUP_ITEM_STATUSES.INCLUDED,
    quantity: 2,
    unitCost: 10_000,
    vatRate: 0.2,
    vatIncluded: false,
  }, cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.equal(result.cashBridge.summary.totals.cashRequirement, 24_000);
  assert.equal(result.cashBridge.summary.totals.assetBasis, 20_000);
  assert.equal(result.cashBridge.summary.totals.unverifiedVat, 4_000);
  assert.equal(result.cashBridge.contingencyReserve, 2_400);
  assert.equal(result.cashBridge.requiredOwnCash, 26_400);
});

test("profil değişikliği yeni koşullu gereksinimleri tekrar üretmeden senkronlar", () => {
  let workspace = createDefaultSetupWorkspace({ sectorId: "agency_services" }, { asOf: "2026-08-03" });
  const initialCount = workspace.items.length;
  workspace = updateSetupProfile(workspace, {
    hasEmployees: true,
    employeeCount: 3,
  }, { sectorId: "agency_services" }, { asOf: "2026-08-03" });
  const afterFirstSync = workspace.items.length;
  workspace = updateSetupProfile(workspace, {
    hasEmployees: true,
    employeeCount: 3,
  }, { sectorId: "agency_services" }, { asOf: "2026-08-03" });

  assert.ok(afterFirstSync > initialCount);
  assert.equal(workspace.items.length, afterFirstSync);
});

test("kullanıcı tarafından eklenen özel kalem korunur ve hesaplanır", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  workspace = addCustomSetupItem(workspace, {
    id: "custom-signage",
    label: "Dış cephe tabela",
    costType: SETUP_COST_TYPES.FIT_OUT,
    status: SETUP_ITEM_STATUSES.INCLUDED,
    unitCost: 50_000,
  }, cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.ok(workspace.items.some((item) => item.id === "custom-signage"));
  assert.equal(result.cashBridge.summary.totals.cashRequirement, 50_000);
});

test("silinen öneri kalemi yeniden üretilmez", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  const target = workspace.items.find((item) => item.requirementId && item.templateKey);
  const identity = `${target.requirementId}::${target.templateKey}`;
  workspace = removeSetupItem(workspace, target.id, cafeContext, { asOf: "2026-08-03" });
  const normalized = normalizeSetupWorkspace(workspace, cafeContext);
  const result = buildSetupWorkspaceResult(normalized, cafeContext, { asOf: "2026-08-03" });

  assert.ok(workspace.dismissedTemplates.includes(identity));
  assert.ok(!result.workspace.items.some((item) => item.requirementId === target.requirementId && item.templateKey === target.templateKey));
});

test("eski veya bozuk çalışma alanı aktif sektör bağlamına güvenle taşınır", () => {
  const workspace = normalizeSetupWorkspace({
    profile: { sectorId: "wrong", employeeCount: "2.8" },
    reserveRate: 3,
    items: "not-an-array",
  }, { sectorId: "physical_retail", businessType: "shop" });

  assert.equal(workspace.version, 1);
  assert.equal(workspace.profile.sectorId, "physical_retail");
  assert.equal(workspace.profile.businessType, "shop");
  assert.equal(workspace.profile.employeeCount, 2);
  assert.equal(workspace.reserveRate, 1);
  assert.deepEqual(workspace.items, []);
});

test("öneri ve doğrulama sayıları ayrı raporlanır", () => {
  const workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.ok(result.quoteCount > 0);
  assert.ok(result.verifyCount > 0);
  assert.equal(result.unresolvedCount, result.quoteCount + result.verifyCount);
  assert.ok(result.requirements.summary.total > 0);
});
