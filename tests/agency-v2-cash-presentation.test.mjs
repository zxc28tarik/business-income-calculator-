import test from "node:test";
import assert from "node:assert/strict";
import {
  AGENCY_DEFAULT_INPUTS,
  AGENCY_FORM_SECTIONS,
  applyAgencyBusinessType,
  applyAgencyScenario,
  buildAgencyPresentation,
  calculateAgencyModel,
} from "../src/sectors/agency-v2.js";

const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("peşinat kârı değiştirmez ancak erken nakdi iyileştirir", () => {
  const base = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, collectionDelayDays: 60, advanceCollectionRate: 0 });
  const advance = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, collectionDelayDays: 60, advanceCollectionRate: 0.75 });
  close(advance.netProfit, base.netProfit);
  assert.ok(advance.effectiveCollectionDelayDays < base.effectiveCollectionDelayDays);
  assert.ok(advance.cashFlow.rows[0].cashEnd > base.cashFlow.rows[0].cashEnd);
});

test("finansman P&L sonucunu değiştirmez, faaliyet hibesi değiştirir", () => {
  const base = calculateAgencyModel(AGENCY_DEFAULT_INPUTS);
  const financed = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, financingAmount: 500000 });
  const grant = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, monthlyOperatingGrantIncome: 50000 });
  close(financed.netProfit, base.netProfit);
  assert.ok(financed.cashFlow.endingCash > base.cashFlow.endingCash);
  assert.ok(grant.netProfit > base.netProfit);
});

test("senaryolar retainer sürücüsünü bağımsız değiştirir", () => {
  const input = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "seo_agency");
  const pessimistic = applyAgencyScenario(input, "pessimistic");
  const optimistic = applyAgencyScenario(input, "optimistic");
  assert.ok(pessimistic.retainerClientCount < input.retainerClientCount);
  assert.ok(optimistic.retainerClientCount > input.retainerClientCount);
  assert.equal(input.retainerClientCount, 10);
});

test("form ve sunum profil kapasitesi ile tahsilat denetim izini içerir", () => {
  const fieldKeys = AGENCY_FORM_SECTIONS.flatMap((section) => section.fields.map((field) => field.key));
  for (const key of ["retainerClientCount", "managedAdSpend", "staffRoles", "subcontractors", "advanceCollectionRate"]) {
    assert.ok(fieldKeys.includes(key), key);
  }
  const result = calculateAgencyModel(applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "performance_marketing"));
  const presentation = buildAgencyPresentation(result);
  assert.ok(presentation.kpis.some((item) => item.id === "profile_driver"));
  assert.ok(presentation.breakdown.some((section) => section.title.includes("Ekip ve taşeron")));
});
