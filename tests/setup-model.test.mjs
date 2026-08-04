import test from "node:test";
import assert from "node:assert/strict";
import {
  LEGAL_STRUCTURES,
  SETUP_COST_TYPES,
  SETUP_ITEM_STATUSES,
  VAT_RECOVERABILITY,
  buildSetupPaymentSchedule,
  buildStartupCashBridge,
  createDefaultSetupProfile,
  normalizeSetupCostItem,
  normalizeSetupProfile,
  summarizeSetupCosts,
} from "../src/setup/setup-model.js";

test("kuruluş profili bozuk değerleri güvenli varsayılanlara çevirir", () => {
  const profile = normalizeSetupProfile({
    projectId: " proje/1 ",
    sectorId: "cafe_restaurant",
    legalStructure: "not-valid",
    premisesType: "rented",
    employeeCount: "3.9",
    hasEmployees: false,
    salesChannels: ["physical", "physical", " marketplace "],
    handlesFood: "yes",
    openingTargetDate: "2026-02-30",
  });

  assert.equal(profile.projectId, "proje_1");
  assert.equal(profile.legalStructure, LEGAL_STRUCTURES.UNDECIDED);
  assert.equal(profile.hasPhysicalPremises, true);
  assert.equal(profile.hasEmployees, true);
  assert.equal(profile.employeeCount, 3);
  assert.deepEqual(profile.salesChannels, ["physical", "marketplace"]);
  assert.equal(profile.handlesFood, false);
  assert.equal(profile.openingTargetDate, "");
});

test("varsayılan kuruluş profili açıkça kararsız ve boş başlar", () => {
  const profile = createDefaultSetupProfile();
  assert.equal(profile.legalStructure, LEGAL_STRUCTURES.UNDECIDED);
  assert.equal(profile.taxpayerType, "unknown");
  assert.equal(profile.hasPhysicalPremises, false);
  assert.equal(profile.employeeCount, 0);
});

test("KDV dahil ve hariç fiyatlar aynı nakit tutarına doğru ayrıştırılır", () => {
  const included = normalizeSetupCostItem({
    label: "Masa",
    quantity: 1,
    unitCost: 120,
    vatRate: 0.2,
    vatIncluded: true,
    vatRecoverability: VAT_RECOVERABILITY.RECOVERABLE,
  });
  const excluded = normalizeSetupCostItem({
    label: "Masa",
    quantity: 1,
    unitCost: 100,
    vatRate: 0.2,
    vatIncluded: false,
    vatRecoverability: VAT_RECOVERABILITY.RECOVERABLE,
  });

  assert.equal(included.netAmount, 100);
  assert.equal(included.vatAmount, 20);
  assert.equal(included.cashAmount, 120);
  assert.equal(included.recoverableVat, 20);
  assert.deepEqual(
    [included.netAmount, included.vatAmount, included.cashAmount],
    [excluded.netAmount, excluded.vatAmount, excluded.cashAmount],
  );
});

test("negatif ve geçersiz kuruluş kalemleri güvenli biçimde normalize edilir", () => {
  const item = normalizeSetupCostItem({
    id: "bad/id",
    costType: "not-valid",
    status: "not-valid",
    quantity: -4,
    unitCost: Number.NaN,
    vatRate: 5,
    installmentCount: 0,
    paymentMonth: -2,
  });

  assert.equal(item.id, "bad_id");
  assert.equal(item.costType, SETUP_COST_TYPES.SETUP_EXPENSE);
  assert.equal(item.status, SETUP_ITEM_STATUSES.INCLUDED);
  assert.equal(item.quantity, 0);
  assert.equal(item.unitCost, 0);
  assert.equal(item.vatRate, 1);
  assert.equal(item.installmentCount, 1);
  assert.equal(item.paymentMonth, 0);
});

test("kuruluş özeti gider, varlık, stok, bağlı nakit ve işletme sermayesini ayırır", () => {
  const result = summarizeSetupCosts([
    { label: "Sicil", costType: SETUP_COST_TYPES.SETUP_EXPENSE, unitCost: 10_000 },
    { label: "Makine", costType: SETUP_COST_TYPES.CAPEX, unitCost: 100_000, vatRate: 0.2, vatRecoverability: VAT_RECOVERABILITY.RECOVERABLE },
    { label: "Stok", costType: SETUP_COST_TYPES.OPENING_INVENTORY, unitCost: 30_000 },
    { label: "Depozito", costType: SETUP_COST_TYPES.DEPOSIT, unitCost: 20_000 },
    { label: "İşletme sermayesi", costType: SETUP_COST_TYPES.WORKING_CAPITAL, unitCost: 50_000 },
    { label: "Hariç", costType: SETUP_COST_TYPES.CAPEX, unitCost: 999_000, status: SETUP_ITEM_STATUSES.EXCLUDED },
  ]);

  assert.equal(result.totals.itemCount, 6);
  assert.equal(result.totals.includedCount, 5);
  assert.equal(result.totals.cashRequirement, 230_000);
  assert.equal(result.totals.expenseBasis, 10_000);
  assert.equal(result.totals.assetBasis, 100_000);
  assert.equal(result.totals.inventoryBasis, 30_000);
  assert.equal(result.totals.tiedCash, 20_000);
  assert.equal(result.totals.workingCapital, 50_000);
  assert.equal(result.totals.recoverableVat, 20_000);
});

test("bilinmeyen KDV finansal tabana sessizce eklenmez", () => {
  const result = summarizeSetupCosts([
    {
      label: "Cihaz",
      costType: SETUP_COST_TYPES.CAPEX,
      unitCost: 100,
      vatRate: 0.2,
      vatRecoverability: VAT_RECOVERABILITY.UNKNOWN,
    },
  ]);

  assert.equal(result.totals.cashRequirement, 120);
  assert.equal(result.totals.assetBasis, 100);
  assert.equal(result.totals.unverifiedVat, 20);
});

test("ödeme takvimi taksitleri aylara böler ve ufuk sonrasını ayrı tutar", () => {
  const schedule = buildSetupPaymentSchedule([
    {
      label: "Cihaz",
      costType: SETUP_COST_TYPES.CAPEX,
      unitCost: 120_000,
      paymentMonth: 1,
      installmentCount: 3,
    },
  ], 2);

  assert.equal(schedule.rows[0].cashOutflow, 0);
  assert.equal(schedule.rows[1].cashOutflow, 40_000);
  assert.equal(schedule.rows[2].cashOutflow, 40_000);
  assert.equal(schedule.afterHorizon, 40_000);
});

test("başlangıç nakdi köprüsü yalnız hazır finansmanı düşer ve rezervi uygun tabana uygular", () => {
  const bridge = buildStartupCashBridge({
    items: [
      { label: "Kuruluş", costType: SETUP_COST_TYPES.SETUP_EXPENSE, unitCost: 100_000 },
      { label: "Depozito", costType: SETUP_COST_TYPES.DEPOSIT, unitCost: 50_000 },
      { label: "İşletme sermayesi", costType: SETUP_COST_TYPES.WORKING_CAPITAL, unitCost: 50_000 },
    ],
    funding: [
      { label: "Özkaynak", type: "equity", status: "available", amount: 80_000, availableMonth: 0 },
      { label: "Planlanan kredi", type: "loan", status: "planned", amount: 500_000, availableMonth: 0 },
      { label: "Geç destek", type: "grant", status: "available", amount: 20_000, availableMonth: 2 },
    ],
    reserveRate: 0.1,
    openingMonth: 0,
  });

  assert.equal(bridge.summary.totals.cashRequirement, 200_000);
  assert.equal(bridge.contingencyReserve, 10_000);
  assert.equal(bridge.grossStartupCashNeed, 210_000);
  assert.equal(bridge.availableFunding, 80_000);
  assert.equal(bridge.requiredOwnCash, 130_000);
  assert.equal(bridge.fundingSurplus, 0);
});
