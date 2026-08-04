import test from "node:test";
import assert from "node:assert/strict";
import {
  SETUP_COST_TYPES,
  SETUP_ITEM_STATUSES,
} from "../src/setup/setup-model.js";
import {
  addCustomSetupItem,
  addSetupFunding,
  buildSetupWorkspaceResult,
  createDefaultSetupWorkspace,
  normalizeSetupWorkspace,
  removeSetupFunding,
  removeSetupItem,
  updateSetupFunding,
  updateSetupItem,
  updateSetupProfile,
} from "../src/setup/setup-workspace.js";

const cafeContext = { sectorId: "cafe_restaurant", businessType: "cafe" };

test("kafe kuruluş çalışma alanı güvenli varsayımlar ve sıfır finans etkisiyle oluşur", () => {
  const workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.equal(workspace.version, 2);
  assert.equal(workspace.profile.sectorId, "cafe_restaurant");
  assert.equal(workspace.profile.hasPhysicalPremises, true);
  assert.equal(workspace.profile.handlesFood, true);
  assert.ok(workspace.items.length >= 10);
  assert.ok(workspace.items.every((item) => [SETUP_ITEM_STATUSES.QUOTE, SETUP_ITEM_STATUSES.VERIFY].includes(item.status)));
  assert.equal(result.cashBridge.grossStartupCashNeed, 0);
  assert.equal(result.cashBridge.requiredOwnCash, 0);
  assert.equal(result.fundingSummary.readyAmount, 0);
  assert.equal(result.debtService.activeDebtAmount, 0);
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
    funding: [{ status: "unknown", amount: -5 }],
  }, { sectorId: "physical_retail", businessType: "shop" });

  assert.equal(workspace.version, 2);
  assert.equal(workspace.profile.sectorId, "physical_retail");
  assert.equal(workspace.profile.businessType, "shop");
  assert.equal(workspace.profile.employeeCount, 2);
  assert.equal(workspace.reserveRate, 1);
  assert.deepEqual(workspace.items, []);
  assert.equal(workspace.funding[0].status, "planned");
  assert.equal(workspace.funding[0].amount, 0);
});

test("öneri ve doğrulama sayıları ayrı raporlanır", () => {
  const workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.ok(result.quoteCount > 0);
  assert.ok(result.verifyCount > 0);
  assert.equal(result.unresolvedCount, result.quoteCount + result.verifyCount);
  assert.ok(result.requirements.summary.total > 0);
});

test("planlanan finansman özkaynağı azaltmaz, kullanılabilir ve kullanılmış kaynak azaltır", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  workspace = addCustomSetupItem(workspace, {
    id: "opening-package",
    label: "Açılış paketi",
    status: SETUP_ITEM_STATUSES.INCLUDED,
    costType: SETUP_COST_TYPES.CAPEX,
    unitCost: 100_000,
  }, cafeContext, { asOf: "2026-08-03" });
  workspace = addSetupFunding(workspace, {
    id: "bank-loan",
    label: "Banka kredisi",
    type: "loan",
    status: "planned",
    amount: 20_000,
    availableMonth: 0,
  }, cafeContext, { asOf: "2026-08-03" });

  let result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });
  assert.equal(result.cashBridge.grossStartupCashNeed, 110_000);
  assert.equal(result.cashBridge.availableFunding, 0);
  assert.equal(result.cashBridge.requiredOwnCash, 110_000);
  assert.equal(result.fundingSummary.plannedAmount, 20_000);
  assert.equal(result.debtService.activeDebtAmount, 0);

  workspace = updateSetupFunding(workspace, "bank-loan", { status: "available" }, cafeContext, { asOf: "2026-08-03" });
  workspace = addSetupFunding(workspace, {
    id: "partner-cash",
    label: "Ortak sermayesi",
    type: "equity",
    status: "used",
    amount: 10_000,
    availableMonth: 4,
  }, cafeContext, { asOf: "2026-08-03" });
  result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.equal(result.cashBridge.availableFunding, 30_000);
  assert.equal(result.cashBridge.requiredOwnCash, 80_000);
  assert.equal(result.fundingSummary.availableAmount, 20_000);
  assert.equal(result.fundingSummary.usedAmount, 10_000);
  assert.equal(result.fundingSummary.readyAmount, 30_000);
  assert.equal(result.debtService.activeDebtAmount, 20_000);
});

test("finansman kaynağı ekleme güncelleme ve kaldırma kayıt içinde korunur", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  workspace = addSetupFunding(workspace, {
    id: "grant-1",
    label: "Kuruluş hibesi",
    type: "grant",
    status: "planned",
    amount: 75_000,
    availableMonth: 2,
  }, cafeContext, { asOf: "2026-08-03" });
  workspace = updateSetupFunding(workspace, "grant-1", {
    status: "available",
    amount: 80_000,
  }, cafeContext, { asOf: "2026-08-03" });

  assert.equal(workspace.funding.length, 1);
  assert.equal(workspace.funding[0].label, "Kuruluş hibesi");
  assert.equal(workspace.funding[0].status, "available");
  assert.equal(workspace.funding[0].amount, 80_000);
  assert.equal(workspace.funding[0].availableMonth, 2);
  assert.equal(workspace.funding[0].termMonths, 0);

  workspace = removeSetupFunding(workspace, "grant-1", cafeContext, { asOf: "2026-08-03" });
  assert.deepEqual(workspace.funding, []);
});

test("kredi koşulları kayıtta korunur ve borç servisine bağlanır", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  workspace = addSetupFunding(workspace, {
    id: "loan-terms",
    label: "Yatırım kredisi",
    type: "loan",
    status: "available",
    amount: 120_000,
    annualInterestRate: 0.18,
    termMonths: 24,
    graceMonths: 3,
    upfrontFeeRate: 0.015,
    repaymentMethod: "equal_principal",
  }, cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });
  const loan = result.workspace.funding[0];

  assert.equal(loan.annualInterestRate, 0.18);
  assert.equal(loan.termMonths, 24);
  assert.equal(loan.graceMonths, 3);
  assert.equal(loan.upfrontFeeRate, 0.015);
  assert.equal(loan.repaymentMethod, "equal_principal");
  assert.equal(result.debtService.activeDebtAmount, 120_000);
  assert.equal(result.debtService.rows[0].feePayment, 1_800);
  assert.equal(result.debtService.rows[1].debtPayment, 0);
  assert.ok(result.debtService.rows[4].debtPayment > 0);
});

test("kuruluş taksitleri ay 0–12 planına bölünür ve ufuk sonrası ayrı kalır", () => {
  let workspace = createDefaultSetupWorkspace(cafeContext, { asOf: "2026-08-03" });
  workspace = addCustomSetupItem(workspace, {
    id: "equipment-installments",
    label: "Ekipman taksitleri",
    status: SETUP_ITEM_STATUSES.INCLUDED,
    costType: SETUP_COST_TYPES.CAPEX,
    unitCost: 12_000,
    paymentMonth: 2,
    installmentCount: 3,
  }, cafeContext, { asOf: "2026-08-03" });
  workspace = addCustomSetupItem(workspace, {
    id: "late-installments",
    label: "Geç dönem ödeme",
    status: SETUP_ITEM_STATUSES.INCLUDED,
    costType: SETUP_COST_TYPES.FIT_OUT,
    unitCost: 6_000,
    paymentMonth: 12,
    installmentCount: 3,
  }, cafeContext, { asOf: "2026-08-03" });
  const result = buildSetupWorkspaceResult(workspace, cafeContext, { asOf: "2026-08-03" });

  assert.equal(result.paymentSchedule.rows.length, 13);
  assert.equal(result.paymentSchedule.rows[2].cashOutflow, 4_000);
  assert.equal(result.paymentSchedule.rows[3].cashOutflow, 4_000);
  assert.equal(result.paymentSchedule.rows[4].cashOutflow, 4_000);
  assert.equal(result.paymentSchedule.rows[12].cashOutflow, 2_000);
  assert.equal(result.paymentSchedule.afterHorizon, 4_000);
});
