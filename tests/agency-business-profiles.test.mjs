import test from "node:test";
import assert from "node:assert/strict";
import { calculateAgencyModel as calculateLegacyModel, AGENCY_DEFAULT_INPUTS as LEGACY_DEFAULTS } from "../src/sectors/agency.js";
import {
  AGENCY_BUSINESS_PROFILES,
  AGENCY_BUSINESS_TYPES,
  AGENCY_DEFAULT_INPUTS,
  AGENCY_SECTOR,
  applyAgencyBusinessType,
  calculateAgencyModel,
} from "../src/sectors/agency-v2.js";

const close = (actual, expected, tolerance = 1e-8) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

test("ajans sektörü on gerçek iş türü profili içerir", () => {
  assert.equal(AGENCY_BUSINESS_TYPES.length, 10);
  assert.equal(Object.keys(AGENCY_BUSINESS_PROFILES).length, 10);
  assert.equal(AGENCY_SECTOR.version, "0.15.0");
  assert.equal(AGENCY_SECTOR.businessProfiles, AGENCY_BUSINESS_PROFILES);
});

test("eski Yazılım Ajansı varsayılan finans sonucu korunur", () => {
  const legacy = calculateLegacyModel(LEGACY_DEFAULTS);
  const current = calculateAgencyModel(AGENCY_DEFAULT_INPUTS);
  for (const key of ["grossRevenue", "totalDeliveryHours", "baseTeamCost", "revisionCost", "netProfit", "breakevenProjectCount"]) {
    close(current[key], legacy[key]);
  }
  close(current.cashFlow.endingCash, legacy.cashFlow.endingCash);
});

test("iş türü değişiminde profile özgü varsayımlar uygulanır", () => {
  const social = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "social_media_agency");
  assert.equal(social.businessType, "social_media_agency");
  assert.equal(social.profileTypeApplied, "social_media_agency");
  assert.equal(social.advancedProfileDriverEnabled, true);
  assert.equal(social.advancedStaffMixEnabled, true);
  assert.equal(social.retainerClientCount, 8);
});

test("on ajans profili sonlu finans sonucu üretir", () => {
  for (const [businessType] of AGENCY_BUSINESS_TYPES) {
    const result = calculateAgencyModel(applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, businessType));
    assert.ok(Number.isFinite(result.grossRevenue), businessType);
    assert.ok(Number.isFinite(result.netProfit), businessType);
    assert.ok(Number.isFinite(result.cashFlow.endingCash), businessType);
  }
});

test("retainer, saatlik, danışmanlık ve kampanya sürücüleri ayrı çalışır", () => {
  const socialInput = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "social_media_agency");
  const social = calculateAgencyModel({ ...socialInput, revisionHoursPerProject: 0 });
  close(social.profileMetrics.coreRevenue, socialInput.retainerClientCount * socialInput.averageMonthlyRetainer);
  assert.equal(social.profileMetrics.driverLabel, "Retainer müşteri");

  const freelanceInput = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "freelance_developer");
  const freelance = calculateAgencyModel({ ...freelanceInput, revisionHoursPerProject: 0 });
  close(freelance.profileMetrics.coreRevenue, freelanceInput.monthlyBillableHours * freelanceInput.hourlySalesPrice);
  assert.equal(freelance.profileMetrics.driverLabel, "Faturalandırılan saat");

  const consultingInput = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "consulting_company");
  const consulting = calculateAgencyModel({ ...consultingInput, revisionHoursPerProject: 0 });
  close(consulting.profileMetrics.coreRevenue, consultingInput.consultingDaysPerMonth * consultingInput.dailyConsultingFee);

  const campaignInput = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "advertising_agency");
  const campaign = calculateAgencyModel({ ...campaignInput, revisionHoursPerProject: 0 });
  close(campaign.profileMetrics.coreRevenue, campaignInput.monthlyCampaignCount * campaignInput.averageCampaignFee);
});

test("performans ajansı yönetilen bütçe ve başarı priminden gelir üretir", () => {
  const input = applyAgencyBusinessType(AGENCY_DEFAULT_INPUTS, "performance_marketing");
  const result = calculateAgencyModel({ ...input, revisionHoursPerProject: 0 });
  close(result.profileMetrics.coreRevenue, input.managedAdSpend * input.managementFeeRate + input.performanceBonusRevenue);
  assert.equal(result.profileMetrics.driverLabel, "Yönetilen reklam bütçesi");
});
