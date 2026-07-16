import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatePublisherModel,
  calculateTieredPlatformCut,
  splitTransactionTax,
} from "../src/core/master-finance-engine-v2.js";
import {
  STEAM_PUBLISHER_BUSINESS_TYPES,
  STEAM_PUBLISHER_DEFAULT_INPUTS,
  applySteamPublisherScenario,
  calculateSteamPublisherReferenceModel,
  calculateSteamPublisherScenarioComparison,
  normalizeSteamPublisherInputs,
} from "../src/sectors/steam-publisher.js";

const closeTo = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≈ ${expected} olmalıydı`);
};

const scenario = (id) => applySteamPublisherScenario(STEAM_PUBLISHER_DEFAULT_INPUTS, id);

test("oyun/dijital yayıncılık kaynak backlogundaki 6 iş türünü taşır", () => {
  assert.equal(STEAM_PUBLISHER_BUSINESS_TYPES.length, 6);
  assert.equal(STEAM_PUBLISHER_BUSINESS_TYPES[0][0], "steam_publisher");
});

test("master beklenen senaryo golden sonuçları birebir üretir", () => {
  const result = calculateSteamPublisherReferenceModel(scenario("expected"));
  closeTo(result.platform.customerPayment, 849574.9999999999);
  closeTo(result.platform.transactionTax, 104333.77192982455);
  closeTo(result.platform.refundAndChargeback, 63345.5043859649);
  closeTo(result.platform.platformCommission, 204568.7171052631);
  closeTo(result.platform.usWithholdingUsd, 16706.44523026315);
  closeTo(result.platform.valvePaymentUsd, 460620.5613486841);
  closeTo(result.receipt.receiptTry, 19116222.30282748);
  closeTo(result.recoup.recoupableTotalTry, 1030000);
  closeTo(result.settlement.developerTotalPaymentTry, 10851733.381696489);
  closeTo(result.pnl.earningsBeforeTaxTry, 5399488.9211309925);
  closeTo(result.tax.turkeyTaxTry, 648201.5306116958);
  closeTo(result.tax.publisherNetProfitTry, 4751287.390519297);
  closeTo(result.cashFlow.endingCashTry, 8054971.343614756);
});

test("master kötümser senaryo golden zarar sonucunu korur", () => {
  const result = calculateSteamPublisherReferenceModel(scenario("pessimistic"));
  closeTo(result.receipt.receiptTry, 5266876.960657465);
  closeTo(result.pnl.earningsBeforeTaxTry, -80249.21573701361);
  closeTo(result.tax.publisherNetProfitTry, -80249.21573701361);
  assert.ok(result.warnings.some((warning) => warning.id === "publisher_loss"));
});

test("master iyimser senaryo golden net kâr sonucunu korur", () => {
  const result = calculateSteamPublisherReferenceModel(scenario("optimistic"));
  closeTo(result.receipt.receiptTry, 48043751.78251595);
  closeTo(result.settlement.developerRoyaltyPaymentTry, 26828251.06950957);
  closeTo(result.tax.publisherNetProfitTry, 14430374.896860048);
  closeTo(result.cashFlow.endingCashTry, 19108291.58320603);
});

test("dahil ve fiyat üstü vergi master formülünü kullanır", () => {
  assert.deepEqual(splitTransactionTax(120, 0.20, "inclusive"), {
    customerPayment: 120,
    taxAmount: 20,
    netBase: 100,
  });
  assert.deepEqual(splitTransactionTax(100, 0.20, "additive"), {
    customerPayment: 120,
    taxAmount: 20,
    netBase: 100,
  });
});

test("kademeli platform kesintisi üç kademeyi doğru toplar", () => {
  const input = normalizeSteamPublisherInputs({ tier1Cap: 100, tier2Cap: 200, tier1Rate: 0.30, tier2Rate: 0.25, tier3Rate: 0.20 });
  closeTo(calculateTieredPlatformCut(300, input), 30 + 25 + 20);
});

test("yatırım P&L gelirine girmez, yalnız başlangıç nakdini artırır", () => {
  const base = scenario("expected");
  const withInvestment = structuredClone(base);
  withInvestment.additionalIncomeItems.find((item) => item.category === "investment").grossAmount = 1_000_000;
  const plain = calculatePublisherModel(base);
  const funded = calculatePublisherModel(normalizeSteamPublisherInputs(withInvestment));
  closeTo(funded.pnl.earningsBeforeTaxTry, plain.pnl.earningsBeforeTaxTry);
  closeTo(funded.cashFlow.startCashTry - plain.cashFlow.startCashTry, 1_000_000);
});

test("hibe P&L'de ayrı gelir olarak çalışır", () => {
  const base = scenario("expected");
  const withGrant = structuredClone(base);
  withGrant.additionalIncomeItems.find((item) => item.category === "grant").grossAmount = 500_000;
  const plain = calculatePublisherModel(base);
  const granted = calculatePublisherModel(normalizeSteamPublisherInputs(withGrant));
  closeTo(granted.platform.grantIncomeTry, 500_000);
  closeTo(granted.pnl.earningsBeforeTaxTry - plain.pnl.earningsBeforeTaxTry, 500_000);
});

test("recoup üst limiti aşan bölüm non-recoupable gider olur", () => {
  const input = scenario("expected");
  input.recoupCapTry = 500_000;
  const result = calculatePublisherModel(input);
  closeTo(result.recoup.recoupableTotalTry, 500_000);
  closeTo(result.recoup.directGameCostsTry, 1_115_000);
  assert.ok(result.recoup.nonRecoupableTry > 500_000);
});

test("Teknopark ve yüzde 80 indirim aynı anda uygulanmaz", () => {
  const normalized = normalizeSteamPublisherInputs({ technoparkExemption: true, softwareExportDeduction80: true });
  assert.equal(normalized.technoparkExemption, true);
  assert.equal(normalized.softwareExportDeduction80, false);
  const result = calculatePublisherModel({ ...scenario("expected"), technoparkExemption: true, softwareExportDeduction80: true });
  assert.equal(result.tax.taxRegime, "technopark");
  closeTo(result.tax.taxBaseTry, 0);
});

test("senaryolar bağımsızdır ve iyimser sonuç kötümserden yüksektir", () => {
  const base = structuredClone(STEAM_PUBLISHER_DEFAULT_INPUTS);
  const comparison = calculateSteamPublisherScenarioComparison(base);
  const byId = Object.fromEntries(comparison.map((item) => [item.id, item.result]));
  assert.ok(byId.optimistic.tax.publisherNetProfitTry > byId.pessimistic.tax.publisherNetProfitTry);
  assert.ok(byId.optimistic.platform.adjustedGross > byId.pessimistic.platform.adjustedGross);
  assert.deepEqual(base, STEAM_PUBLISHER_DEFAULT_INPUTS);
});

test("normalizasyon negatif tutarları sınırlar ve kaynak dizilerini mutasyondan korur", () => {
  const raw = {
    listPriceUsd: -1,
    refundRate: 5,
    regions: [{ ...STEAM_PUBLISHER_DEFAULT_INPUTS.regions[0], localPrice: -10 }],
  };
  const normalized = normalizeSteamPublisherInputs(raw);
  assert.equal(normalized.listPriceUsd, 0);
  assert.equal(normalized.refundRate, 1);
  assert.equal(normalized.regions[0].localPrice, 0);
  normalized.recoupItems[0].amount = 1;
  assert.equal(STEAM_PUBLISHER_DEFAULT_INPUTS.recoupItems[0].amount, 400000);
});
