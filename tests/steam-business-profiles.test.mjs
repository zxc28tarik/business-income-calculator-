import test from "node:test";
import assert from "node:assert/strict";
import { validateSectorDefinition } from "../src/core/sector-schema.js";
import {
  STEAM_BUSINESS_PROFILES,
  STEAM_PUBLISHER_SECTOR,
} from "../src/sectors/steam-publisher.js";

const defaults = STEAM_PUBLISHER_SECTOR.defaultInputs;

function calculateFor(businessType, patch = {}) {
  return STEAM_PUBLISHER_SECTOR.calculateModel({ ...defaults, businessType, ...patch });
}

test("altı oyun ve dijital yayıncılık profili tanımlıdır", () => {
  assert.deepEqual(Object.keys(STEAM_BUSINESS_PROFILES), [
    "steam_publisher",
    "indie_self_publish",
    "mobile_game",
    "dlc_supporter_pack",
    "game_asset_digital_product",
    "publisher_developer_split",
  ]);
});

test("profil alanları gelişmiş sektör şemasından geçer", () => {
  const validation = validateSectorDefinition(STEAM_PUBLISHER_SECTOR);
  assert.equal(validation.valid, true, validation.errors.join("\n"));
  const fields = STEAM_PUBLISHER_SECTOR.formSections.flatMap((section) => section.fields);
  assert.equal(fields.find((field) => field.key === "mobileMonthlyActiveUsers").visibleWhen.equals, "mobile_game");
  assert.equal(fields.find((field) => field.key === "dlcAttachRate").visibleWhen.equals, "dlc_supporter_pack");
  assert.equal(fields.find((field) => field.key === "assetMonthlyUnits").visibleWhen.equals, "game_asset_digital_product");
});

test("Steam master golden sonucu profil sistemi sonrasında korunur", () => {
  const inputs = STEAM_PUBLISHER_SECTOR.applyScenario(defaults, "expected");
  const result = STEAM_PUBLISHER_SECTOR.calculateModel(inputs);
  assert.equal(result.profile.id, "steam_publisher");
  assert.ok(Math.abs(result.tax.publisherNetProfitTry - 4_751_287) < 2);
});

test("kendi yayınlama profilinde harici geliştirici payı oluşmaz", () => {
  const result = calculateFor("indie_self_publish");
  assert.equal(result.input.publisherShareRate, 1);
  assert.equal(result.input.developerShareRate, 0);
  assert.equal(result.input.recoupEnabled, false);
  assert.equal(result.settlement.developerTotalPaymentTry, 0);
});

test("mobil oyun profili MAU, ödeme dönüşümü, IAP ve reklamdan gelir üretir", () => {
  const result = calculateFor("mobile_game");
  assert.equal(result.profile.id, "mobile_game");
  assert.equal(result.profileMetrics.monthlyActiveUsers, 100000);
  assert.equal(result.profileMetrics.payerCountMonthly, 2500);
  assert.equal(result.profileMetrics.monthlyIapRevenueUsd, 45000);
  assert.equal(result.profileMetrics.monthlyAdRevenueUsd, 8000);
  assert.equal(result.profileMetrics.monthlyGrossRevenueUsd, 53000);
  assert.equal(result.input.units, 1_200_000);
  assert.ok(Math.abs(result.input.listPriceUsd - 0.53) < 1e-9);
  assert.equal(result.input.flatCommissionRate, 0.30);
  assert.equal(result.settlement.developerTotalPaymentTry, 0);
});

test("DLC profili sahip tabanı ve satın alma oranından satış adedi üretir", () => {
  const result = calculateFor("dlc_supporter_pack");
  assert.equal(result.profileMetrics.eligibleOwners, 50000);
  assert.equal(result.profileMetrics.attachRate, 0.12);
  assert.equal(result.profileMetrics.projectedUnits, 6000);
  assert.equal(result.input.units, 6000);
  assert.equal(result.input.listPriceUsd, 7.99);
});

test("dijital ürün profili aylık satış ve dönem uzunluğundan toplam adedi üretir", () => {
  const result = calculateFor("game_asset_digital_product");
  assert.equal(result.profileMetrics.monthlyUnits, 350);
  assert.equal(result.profileMetrics.periodMonths, 12);
  assert.equal(result.profileMetrics.projectedUnits, 4200);
  assert.equal(result.input.units, 4200);
  assert.equal(result.input.listPriceUsd, 29);
  assert.equal(result.settlement.developerTotalPaymentTry, 0);
});

test("publisher–developer profili sözleşme paylaşımını korur", () => {
  const result = calculateFor("publisher_developer_split");
  assert.equal(result.input.publisherShareRate, defaults.publisherShareRate);
  assert.equal(result.input.developerShareRate, defaults.developerShareRate);
  assert.ok(result.settlement.developerEarnedTry > 0);
});

test("mobil senaryolar profil sürücülerini birbirinden bağımsız değiştirir", () => {
  const base = { ...defaults, businessType: "mobile_game" };
  const pessimistic = STEAM_PUBLISHER_SECTOR.applyScenario(base, "pessimistic");
  const expected = STEAM_PUBLISHER_SECTOR.applyScenario(base, "expected");
  const optimistic = STEAM_PUBLISHER_SECTOR.applyScenario(base, "optimistic");
  assert.ok(pessimistic.mobileMonthlyActiveUsers < expected.mobileMonthlyActiveUsers);
  assert.ok(optimistic.mobileMonthlyActiveUsers > expected.mobileMonthlyActiveUsers);
  assert.ok(
    STEAM_PUBLISHER_SECTOR.calculateModel(pessimistic).platform.customerPayment
      < STEAM_PUBLISHER_SECTOR.calculateModel(optimistic).platform.customerPayment,
  );
});

test("profil sunumu iş türüne özel KPI ve döküm üretir", () => {
  const result = calculateFor("mobile_game");
  const presentation = STEAM_PUBLISHER_SECTOR.buildPresentation(result);
  assert.ok(presentation.kpis.some((item) => item.label === "Aylık aktif kullanıcı"));
  assert.ok(presentation.kpis.some((item) => item.label === "Kullanıcı başı aylık gelir"));
  assert.equal(presentation.breakdown[0].title, "Profil · İş modeli sürücüleri");
});

test("iş türüne özel eşik uyarıları üretilir", () => {
  const mobile = calculateFor("mobile_game", { mobilePayerConversionRate: 0.005 });
  const dlc = calculateFor("dlc_supporter_pack", { dlcAttachRate: 0.03 });
  const asset = calculateFor("game_asset_digital_product", { assetMonthlyUnits: 25 });
  assert.ok(mobile.warnings.some((warning) => warning.id === "mobile_low_payer_conversion"));
  assert.ok(dlc.warnings.some((warning) => warning.id === "dlc_low_attach"));
  assert.ok(asset.warnings.some((warning) => warning.id === "asset_low_volume"));
});
