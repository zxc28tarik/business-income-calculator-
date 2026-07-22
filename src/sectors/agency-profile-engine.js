import { getAgencyBusinessProfile } from "./agency-business-profiles.js";

const clone = (value) => structuredClone(value);
const rate = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const nonNegative = (value) => Math.max(0, Number(value) || 0);

export function deriveAgencyRevenueAndHours(input) {
  const profile = getAgencyBusinessProfile(input.businessType);
  let grossRevenue = nonNegative(input.monthlyProjectCount) * nonNegative(input.averageProjectFee);
  let baseHours = nonNegative(input.monthlyProjectCount) * nonNegative(input.averageProjectHours);
  let driverValue = nonNegative(input.monthlyProjectCount);
  let driverLabel = "Aylık proje";
  let equivalentUnits = Math.max(0.0001, nonNegative(input.monthlyProjectCount));

  if (input.advancedProfileDriverEnabled) {
    if (profile.driver === "retainer") {
      equivalentUnits = Math.max(0.0001, nonNegative(input.retainerClientCount));
      grossRevenue = equivalentUnits * nonNegative(input.averageMonthlyRetainer);
      baseHours = equivalentUnits * nonNegative(input.retainerHoursPerClient);
      driverValue = equivalentUnits;
      driverLabel = "Retainer müşteri";
    } else if (profile.driver === "billable_hours") {
      equivalentUnits = 1;
      baseHours = nonNegative(input.monthlyBillableHours);
      grossRevenue = baseHours * nonNegative(input.hourlySalesPrice);
      driverValue = baseHours;
      driverLabel = "Faturalandırılan saat";
    } else if (profile.driver === "consulting_days") {
      equivalentUnits = Math.max(0.0001, nonNegative(input.consultingDaysPerMonth));
      grossRevenue = equivalentUnits * nonNegative(input.dailyConsultingFee);
      baseHours = equivalentUnits * nonNegative(input.hoursPerConsultingDay);
      driverValue = equivalentUnits;
      driverLabel = "Danışmanlık günü";
    } else if (profile.driver === "campaign") {
      equivalentUnits = Math.max(0.0001, nonNegative(input.monthlyCampaignCount));
      grossRevenue = equivalentUnits * nonNegative(input.averageCampaignFee);
      baseHours = equivalentUnits * nonNegative(input.campaignHours);
      driverValue = equivalentUnits;
      driverLabel = "Aylık kampanya";
    } else if (profile.driver === "managed_spend") {
      equivalentUnits = 1;
      grossRevenue = nonNegative(input.managedAdSpend) * rate(input.managementFeeRate) + nonNegative(input.performanceBonusRevenue);
      baseHours = nonNegative(input.monthlyBillableHours);
      driverValue = nonNegative(input.managedAdSpend);
      driverLabel = "Yönetilen reklam bütçesi";
    }
  }

  const contractedRevisionHours = nonNegative(input.revisionHoursPerProject) * equivalentUnits;
  const scopeCreepHours = baseHours * rate(input.scopeCreepRate);
  const revisionHours = contractedRevisionHours + scopeCreepHours;
  const revisionRevenue = revisionHours * nonNegative(input.hourlySalesPrice) * rate(input.revisionRecoveryRate);

  return {
    profile, grossRevenue: grossRevenue + revisionRevenue, coreRevenue: grossRevenue, revisionRevenue,
    baseHours, revisionHours, totalDeliveryHours: baseHours + revisionHours, equivalentUnits,
    driverValue, driverLabel,
  };
}

export function deriveAgencyCapacity(input) {
  if (!input.advancedStaffMixEnabled) {
    const theoreticalCapacityHours = nonNegative(input.teamSize) * nonNegative(input.monthlyHoursPerPerson);
    return {
      theoreticalCapacityHours,
      targetBillableCapacityHours: theoreticalCapacityHours * rate(input.targetUtilizationRate),
      weightedHourlyCost: nonNegative(input.hourlyCost),
      productionHeadcount: nonNegative(input.teamSize),
      staffRows: [],
    };
  }
  const staffRows = (input.staffRoles || []).map((row) => ({
    ...clone(row),
    capacityHours: nonNegative(row.count) * nonNegative(row.monthlyHoursPerPerson),
    billableHours: nonNegative(row.count) * nonNegative(row.monthlyHoursPerPerson) * rate(row.billableRate),
  }));
  const theoreticalCapacityHours = staffRows.reduce((sum, row) => sum + row.capacityHours, 0);
  const targetBillableCapacityHours = staffRows.reduce((sum, row) => sum + row.billableHours, 0);
  const hourlyCostNumerator = staffRows.reduce((sum, row) => sum + row.capacityHours * nonNegative(row.hourlyCost), 0);
  return {
    theoreticalCapacityHours,
    targetBillableCapacityHours,
    weightedHourlyCost: theoreticalCapacityHours > 0 ? hourlyCostNumerator / theoreticalCapacityHours : 0,
    productionHeadcount: staffRows.reduce((sum, row) => sum + nonNegative(row.count), 0),
    staffRows,
  };
}

export function deriveAgencySubcontractors(input) {
  if (!input.advancedSubcontractorMixEnabled) {
    return { monthlyCost: nonNegative(input.freelancerPayments), hoursSupplied: 0, subcontractorRows: [] };
  }
  const subcontractorRows = (input.subcontractors || []).map((row) => ({
    ...clone(row), monthlyCost: nonNegative(row.monthlyCost), hoursSupplied: nonNegative(row.hoursSupplied),
  }));
  return {
    monthlyCost: subcontractorRows.reduce((sum, row) => sum + row.monthlyCost, 0),
    hoursSupplied: subcontractorRows.reduce((sum, row) => sum + row.hoursSupplied, 0),
    subcontractorRows,
  };
}

export function applyAgencyProfileDemandScenario(input, scenarioId) {
  const factor = scenarioId === "pessimistic" ? 0.72 : scenarioId === "optimistic" ? 1.28 : 1;
  const next = clone(input);
  const profile = getAgencyBusinessProfile(next.businessType);
  if (!next.advancedProfileDriverEnabled || profile.driver === "project") next.monthlyProjectCount = nonNegative(next.monthlyProjectCount * factor);
  else if (profile.driver === "retainer") next.retainerClientCount = nonNegative(next.retainerClientCount * factor);
  else if (profile.driver === "billable_hours") next.monthlyBillableHours = nonNegative(next.monthlyBillableHours * factor);
  else if (profile.driver === "consulting_days") next.consultingDaysPerMonth = nonNegative(next.consultingDaysPerMonth * factor);
  else if (profile.driver === "campaign") next.monthlyCampaignCount = nonNegative(next.monthlyCampaignCount * factor);
  else if (profile.driver === "managed_spend") next.managedAdSpend = nonNegative(next.managedAdSpend * factor);
  return next;
}
