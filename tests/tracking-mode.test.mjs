import test from "node:test";
import assert from "node:assert/strict";
import { SECTORS } from "../src/sectors/registry.js";
import {
  buildTrackingModel,
  normalizeTrackingRecord,
  normalizeTrackingRecords,
  resolveTrackingScope,
} from "../src/tracking/tracking-model.js";
import { buildTrackingReportHtml } from "../src/tracking/tracking-report.js";

function modelFor(sector, records) {
  const inputs = sector.normalizeInputs(sector.applyScenario(structuredClone(sector.defaultInputs), "expected"));
  const result = sector.calculateModel(inputs);
  return { inputs, result, model: buildTrackingModel({ sector, scenarioId: "expected", result, records }) };
}

test("gerçekleşen kayıtları güvenli biçimde normalleştirir", () => {
  const record = normalizeTrackingRecord({ month: 0, collections: "1200", fixedCosts: -5, cashEnd: -200, reason: "unknown", note: " x " });
  assert.equal(record.month, 1);
  assert.equal(record.collections, 1200);
  assert.equal(record.fixedCosts, 0);
  assert.equal(record.cashEnd, -200);
  assert.equal(record.reason, "");
  assert.equal(record.note, "x");

  const records = normalizeTrackingRecords([{ month: 2, collections: 10 }, { month: 1 }, { month: 2, collections: 20 }]);
  assert.deepEqual(records.map((item) => item.month), [1, 2]);
  assert.equal(records[1].collections, 20);
});

test("takip kapsamı alt iş türünü sektör içinde ayırır", () => {
  assert.equal(resolveTrackingScope({ businessType: "coffee_shop" }), "coffee_shop");
  assert.equal(resolveTrackingScope({ profileType: "a/b c" }), "a_b_c");
  assert.equal(resolveTrackingScope({}), "default");
});

test("sapma işaretleri gelirde ve giderde doğru yöndedir", () => {
  const sector = SECTORS[0];
  const { result } = modelFor(sector, []);
  const plan = result.cashFlow.rows[0];
  const records = [{
    month: 1,
    collections: plan.collections + 100,
    variableCosts: plan.variableCostsPaid - 50,
    fixedCosts: plan.fixedCosts - 25,
    stakeholderPayouts: plan.stakeholderPayouts,
    estimatedTax: plan.estimatedTax,
    financing: 10000,
    support: 0,
    setupCosts: plan.setupCosts,
    loanPayment: plan.loanPayment,
    cashEnd: plan.cashEnd + 300,
  }];
  const model = buildTrackingModel({ sector, scenarioId: "expected", result, records });
  const row = model.rows[0];
  assert.equal(row.variance.collections, 100);
  assert.equal(row.variance.variableCosts, 50);
  assert.equal(row.variance.fixedCosts, 25);
  assert.equal(row.actual.netCashMovement, row.actual.operatingResult + row.actual.financing + row.actual.support - row.actual.setupCosts - row.actual.loanPayment);
  assert.equal(row.actual.operatingResult, row.actual.collections - row.actual.variableCosts - row.actual.fixedCosts - row.actual.stakeholderPayouts - row.actual.estimatedTax, "finansman faaliyet sonucuna girmemeli");
});

test("sekiz sektör bütçe-gerçekleşen modeli üretir", () => {
  assert.equal(SECTORS.length, 8);
  for (const sector of SECTORS) {
    const inputs = sector.normalizeInputs(sector.applyScenario(structuredClone(sector.defaultInputs), "expected"));
    const result = sector.calculateModel(inputs);
    const first = result.cashFlow.rows?.[0] ?? result.cashFlow.months?.[0];
    const collections = first.collections ?? first.receiptTry ?? 0;
    const variableCosts = first.variableCostsPaid ?? first.variableCostsAccrued ?? 0;
    const fixedCosts = first.fixedCosts ?? first.publisherCostTry ?? 0;
    const stakeholderPayouts = first.stakeholderPayouts ?? first.developerOutflowTry ?? 0;
    const cashEnd = first.cashEnd ?? first.cashTry ?? 0;
    const model = buildTrackingModel({
      sector,
      scenarioId: "expected",
      result,
      records: [{
        month: 1,
        collections,
        variableCosts,
        fixedCosts,
        stakeholderPayouts,
        estimatedTax: first.estimatedTax ?? 0,
        financing: first.financing ?? 0,
        support: first.support ?? 0,
        setupCosts: first.setupCosts ?? 0,
        loanPayment: first.loanPayment ?? 0,
        cashEnd,
        volume: 100,
        reason: "volume",
      }],
    });
    assert.equal(model.rows.length, 12, sector.id);
    assert.equal(model.completedMonths, 1, sector.id);
    assert.equal(model.completeFinancialMonths, 1, sector.id);
    assert.ok(["on_track", "watch", "off_track"].includes(model.overallStatus), sector.id);
    assert.ok(Math.abs(model.totals.collectionsVariance) < 0.001, sector.id);
  }
});

test("iki ve daha fazla dönem trend üretir", () => {
  const sector = SECTORS[0];
  const { result } = modelFor(sector, []);
  const rows = result.cashFlow.rows;
  const records = [0, 1, 2].map((index) => ({
    month: index + 1,
    collections: 100 + index * 25,
    variableCosts: 40,
    fixedCosts: 30,
    cashEnd: 50 + index * 10,
    volume: 10 + index,
  }));
  const model = buildTrackingModel({ sector, scenarioId: "expected", result, records });
  assert.equal(model.trends.collections.direction, "up");
  assert.equal(model.trends.cashEnd.direction, "up");
  assert.equal(model.trends.volume.direction, "up");
  assert.equal(model.completedMonths, 3);
  assert.equal(rows.length, 12);
});

test("takip raporu çevrimdışıdır ve kullanıcı notunu kaçışlar", () => {
  const sector = SECTORS[0];
  const { result } = modelFor(sector, []);
  const first = result.cashFlow.rows[0];
  const model = buildTrackingModel({
    sector,
    scenarioId: "expected",
    result,
    records: [{
      month: 1,
      collections: first.collections,
      variableCosts: first.variableCostsPaid,
      fixedCosts: first.fixedCosts,
      note: '<img src=x onerror="alert(1)">',
    }],
  });
  const html = buildTrackingReportHtml({ sector, scenarioLabel: "Beklenen", model, generatedAt: new Date("2026-07-21T00:00:00Z") });
  assert.match(html, /GERÇEK TAKİP RAPORU/);
  assert.match(html, /Dönem karşılaştırması/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.ok(Buffer.byteLength(html) < 2_000_000);
});
