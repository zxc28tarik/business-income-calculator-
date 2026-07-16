import test from "node:test";
import assert from "node:assert/strict";
import { validateSectorDefinition } from "../src/core/sector-schema.js";
import { STEAM_PUBLISHER_SECTOR, STEAM_PUBLISHER_DEFAULT_INPUTS } from "../src/sectors/steam-publisher.js";

test("Steam yayıncısı gelişmiş sektör şemasını geçer", () => {
  const validation = validateSectorDefinition(STEAM_PUBLISHER_SECTOR);
  assert.equal(validation.valid, true, validation.errors.join("\n"));
});

test("Steam yayıncısı master tablolarını ve koşullu alanları tanımlar", () => {
  const fields = STEAM_PUBLISHER_SECTOR.formSections.flatMap((section) => section.fields);
  assert.equal(fields.find((field) => field.key === "regions").type, "table");
  assert.equal(fields.find((field) => field.key === "recoupItems").type, "table");
  assert.equal(fields.find((field) => field.key === "additionalIncomeItems").type, "table");
});

test("beklenen senaryo master golden net kârını korur", () => {
  const inputs = STEAM_PUBLISHER_SECTOR.applyScenario(STEAM_PUBLISHER_DEFAULT_INPUTS, "expected");
  const result = STEAM_PUBLISHER_SECTOR.calculateModel(inputs);
  assert.ok(Math.abs(result.tax.publisherNetProfitTry - 4_751_287) < 2);
  assert.equal(result.cashFlow.rows.length, 12);
});

test("operasyon alt kalemleri yayıncı operasyon toplamına dönüşür", () => {
  const normalized = STEAM_PUBLISHER_SECTOR.normalizeInputs({ ...STEAM_PUBLISHER_DEFAULT_INPUTS, operationsReleaseTry: 100, operationsCommunityTry: 200, operationsToolsTry: 300 });
  assert.equal(normalized.publisherOperationsTry, 600);
});

test("yatırım P&L geliri olmaz, nakdi artırır", () => {
  const base = STEAM_PUBLISHER_SECTOR.calculateModel(STEAM_PUBLISHER_DEFAULT_INPUTS);
  const funded = STEAM_PUBLISHER_SECTOR.calculateModel({
    ...STEAM_PUBLISHER_DEFAULT_INPUTS,
    additionalIncomeItems: [...STEAM_PUBLISHER_DEFAULT_INPUTS.additionalIncomeItems, { name: "Yatırım", grossAmount: 1_000_000, currency: "TL", deductionRate: 0, applyWithholding: false, vatRate: 0, category: "investment", taxable: false }],
  });
  assert.equal(funded.pnl.earningsBeforeTaxTry, base.pnl.earningsBeforeTaxTry);
  assert.equal(funded.cashFlow.startCashTry - base.cashFlow.startCashTry, 1_000_000);
});
