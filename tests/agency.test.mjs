import test from "node:test";
import assert from "node:assert/strict";
import {
  AGENCY_DEFAULT_INPUTS,
  AGENCY_SECTOR,
  calculateAgencyModel,
  calculateAgencyMonth,
  calculateAgencyScenarioComparison,
  normalizeAgencyInputs,
} from "../src/sectors/agency.js";

test("sektör tanımı geçerlidir ve 10 iş türü içerir", () => {
  assert.equal(AGENCY_SECTOR.id, "agency_freelance_consulting");
  assert.equal(AGENCY_SECTOR.businessTypes.length, 10);
});

test("proje bedeli × proje sayısı brüt geliri verir", () => {
  const result = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, monthlyProjectCount: 3, averageProjectFee: 125000, taxType: "none" });
  assert.equal(result.grossRevenue, 375000);
});

test("baz üretim ve revizyon saatleri ayrı maliyetlenir", () => {
  const result = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, monthlyProjectCount: 2, averageProjectHours: 100, revisionHoursPerProject: 20, hourlyCost: 500 });
  assert.equal(result.baseProjectHours, 200);
  assert.equal(result.revisionHours, 40);
  assert.equal(result.baseTeamCost, 100000);
  assert.equal(result.revisionCost, 20000);
});

test("freelancer ödemesi değişken maliyete tam eklenir", () => {
  const without = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, freelancerPayments: 0 });
  const withFreelancer = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, freelancerPayments: 123456 });
  assert.equal(withFreelancer.totalVariableCosts - without.totalVariableCosts, 123456);
  assert.equal(without.netProfit - withFreelancer.netProfit, 123456 * (1 - AGENCY_DEFAULT_INPUTS.estimatedTaxRate));
});

test("kapasite kullanımı toplam teslimat saatinden hesaplanır", () => {
  const result = calculateAgencyMonth({
    ...AGENCY_DEFAULT_INPUTS,
    monthlyProjectCount: 4,
    averageProjectHours: 80,
    revisionHoursPerProject: 8,
    teamSize: 2,
    monthlyHoursPerPerson: 176,
  });
  assert.equal(result.totalDeliveryHours, 352);
  assert.equal(result.theoreticalCapacityHours, 352);
  assert.equal(result.capacityUtilization, 1);
});

test("tahsilat gecikmesi kârı değiştirmez ancak ilk ay nakdi düşürür", () => {
  const immediate = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, collectionDelayDays: 0, startingCash: 1000000, financingAmount: 0, supportAmount: 0 });
  const delayed = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, collectionDelayDays: 30, startingCash: 1000000, financingAmount: 0, supportAmount: 0 });
  assert.equal(delayed.netProfit, immediate.netProfit);
  assert.ok(delayed.cashFlow.rows[0].collections < immediate.cashFlow.rows[0].collections);
  assert.ok(delayed.cashFlow.rows[0].cashEnd < immediate.cashFlow.rows[0].cashEnd);
});

test("revizyon saati arttıkça revizyon maliyeti artar ve net kâr düşer", () => {
  const low = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, revisionHoursPerProject: 2 });
  const high = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, revisionHoursPerProject: 30 });
  assert.ok(high.revisionCost > low.revisionCost);
  assert.ok(high.netProfit < low.netProfit);
});

test("başabaş proje sayısı pozitif ve hesaplanabilir", () => {
  const result = calculateAgencyModel(AGENCY_DEFAULT_INPUTS);
  assert.ok(result.breakevenProjectCount > 0);
  const aroundBreakeven = calculateAgencyMonth({ ...AGENCY_DEFAULT_INPUTS, monthlyProjectCount: result.breakevenProjectCount });
  assert.ok(Math.abs(aroundBreakeven.netProfit) < 100);
});

test("yüksek müşteri yoğunlaşması ve uzun tahsilat uyarı üretir", () => {
  const result = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, largestClientRevenueShare: 0.65, collectionDelayDays: 60 });
  const ids = new Set(result.warnings.map((warning) => warning.id));
  assert.ok(ids.has("client_concentration_hard"));
  assert.ok(ids.has("collection_delay_hard"));
});

test("üç senaryo birbirinden farklı sonuç üretir", () => {
  const scenarios = calculateAgencyScenarioComparison(AGENCY_DEFAULT_INPUTS);
  assert.equal(scenarios.length, 3);
  const profits = scenarios.map((scenario) => scenario.result.netProfit);
  assert.ok(new Set(profits.map((value) => Math.round(value))).size >= 2);
  assert.ok(scenarios.find((scenario) => scenario.id === "optimistic").result.grossRevenue > scenarios.find((scenario) => scenario.id === "pessimistic").result.grossRevenue);
});

test("normalize negatif girdileri sıfırlar ve oranları sınırlar", () => {
  const input = normalizeAgencyInputs({ monthlyProjectCount: -4, hourlyCost: -100, targetUtilizationRate: 8, monthlyGrowthRate: -2 });
  assert.equal(input.monthlyProjectCount, 0);
  assert.equal(input.hourlyCost, 0);
  assert.equal(input.targetUtilizationRate, 1);
  assert.equal(input.monthlyGrowthRate, -0.95);
});
