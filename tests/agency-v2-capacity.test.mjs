import test from "node:test";
import assert from "node:assert/strict";
import { AGENCY_DEFAULT_INPUTS, calculateAgencyModel } from "../src/sectors/agency-v2.js";

const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("rol bazlı ekip tablosu faturalandırılabilir kapasiteyi hesaplar", () => {
  const result = calculateAgencyModel({
    ...AGENCY_DEFAULT_INPUTS,
    advancedStaffMixEnabled: true,
    staffRoles: [
      { role: "Kıdemli", count: 2, monthlyHoursPerPerson: 160, billableRate: 0.75, hourlyCost: 1000 },
      { role: "Uzman", count: 1, monthlyHoursPerPerson: 160, billableRate: 0.50, hourlyCost: 600 },
    ],
  });
  close(result.theoreticalCapacityHours, 480);
  close(result.targetBillableCapacityHours, 320);
  assert.equal(result.staffRows.length, 2);
});

test("taşeron saatleri iç ekip yükünü azaltırken maliyeti ayrı kalır", () => {
  const without = calculateAgencyModel({
    ...AGENCY_DEFAULT_INPUTS,
    advancedSubcontractorMixEnabled: true,
    subcontractors: [{ name: "Dış ekip", monthlyCost: 0, hoursSupplied: 0 }],
  });
  const withHours = calculateAgencyModel({
    ...AGENCY_DEFAULT_INPUTS,
    advancedSubcontractorMixEnabled: true,
    subcontractors: [{ name: "Dış ekip", monthlyCost: 150000, hoursSupplied: 200 }],
  });
  assert.ok(withHours.internalDeliveryHours < without.internalDeliveryHours);
  assert.equal(withHours.freelancerPayments, 150000);
  assert.equal(withHours.subcontractorHours, 200);
});

test("revizyon tahsilatı geliri ve net sonucu artırır", () => {
  const base = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, scopeCreepRate: 0.20, revisionRecoveryRate: 0 });
  const recovered = calculateAgencyModel({ ...AGENCY_DEFAULT_INPUTS, scopeCreepRate: 0.20, revisionRecoveryRate: 1 });
  assert.ok(recovered.profileMetrics.revisionRevenue > 0);
  assert.ok(recovered.grossRevenue > base.grossRevenue);
  assert.ok(recovered.netProfit > base.netProfit);
});
