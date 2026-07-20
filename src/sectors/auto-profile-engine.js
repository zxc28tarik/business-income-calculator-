import { percent } from "../core/finance-engine.js";
import { getAutoBusinessProfile } from "./auto-business-profiles.js";
import { normalizeAutoServiceInputs } from "./auto-v2-config.js";

function weightedServices(input) {
  if (!input.advancedServiceMixEnabled || !input.services.length) {
    return {
      servicePrice: input.averageServicePrice,
      durationMinutes: input.averageServiceDurationMinutes,
      consumableCost: input.consumableCostPerVehicle,
      energyCost: input.waterElectricityCostPerVehicle,
      partsRevenue: input.averagePartsRevenuePerVehicle,
      partsCostRate: input.partsCostRate,
      reworkRate: 0,
    };
  }
  const totalShare = input.services.reduce((sum, row) => sum + row.serviceShareRate, 0) || 1;
  return input.services.reduce((acc, row) => {
    const weight = row.serviceShareRate / totalShare;
    acc.servicePrice += row.servicePrice * weight;
    acc.durationMinutes += row.durationMinutes * weight;
    acc.consumableCost += row.consumableCost * weight;
    acc.energyCost += row.energyCost * weight;
    acc.partsRevenue += row.partsRevenue * weight;
    acc.partsCostRate += row.partsCostRate * weight;
    acc.reworkRate += row.reworkRate * weight;
    return acc;
  }, { servicePrice: 0, durationMinutes: 0, consumableCost: 0, energyCost: 0, partsRevenue: 0, partsCostRate: 0, reworkRate: 0 });
}

function deriveDemand(input, profile) {
  let requestedDaily;
  if (!input.profileDriverEnabled) requestedDaily = input.dailyVehicles;
  else if (input.customerBaseDemandEnabled) {
    requestedDaily = (input.activeCustomerBase * input.monthlyRepeatVisitRate + input.newCustomerJobsPerMonth) / input.openDays;
  } else if (profile.driver === "walk_in") requestedDaily = input.dailyDemandRequests * input.bookingConversionRate;
  else if (profile.driver === "appointment") requestedDaily = input.scheduledJobsPerDay;
  else if (profile.driver === "monthly_jobs") requestedDaily = input.monthlyJobs / input.openDays;
  else requestedDaily = input.mobileTechnicians * input.routesPerTechnicianPerDay;

  const noShowRate = profile.driver === "walk_in" ? 0 : input.appointmentNoShowRate;
  const showDaily = requestedDaily * (1 - noShowRate);
  const cancelledMonthly = requestedDaily * noShowRate * input.openDays;
  const recoveredCancellationRevenue = cancelledMonthly * input.cancellationRecoveryRate * input.cancellationFee;
  return { requestedDaily, showDaily, noShowRate, cancelledMonthly, recoveredCancellationRevenue };
}

function deriveStaff(input, durationMinutes) {
  if (!input.advancedStaffEnabled || !input.staffRoles.length) {
    return { monthlyCost: input.staffCost, productiveHours: null, dailyCapacity: Infinity };
  }
  const monthlyCost = input.staffRoles.reduce((sum, row) => sum + row.count * row.monthlyCostPerPerson, 0);
  const productiveHours = input.staffRoles.reduce((sum, row) => sum + row.count * row.productiveHoursPerMonth, 0);
  const dailyCapacity = productiveHours * 60 / Math.max(5, durationMinutes) / input.openDays;
  return { monthlyCost, productiveHours, dailyCapacity };
}

function deriveSupplier(input) {
  if (!input.partsInventoryEnabled || !input.advancedSupplierMixEnabled || !input.suppliers.length) {
    return { paymentDelayDays: input.supplierPaymentDelayDays, leadTimeDays: input.supplierLeadTimeDays, discountRate: 0 };
  }
  const totalShare = input.suppliers.reduce((sum, row) => sum + row.purchaseShareRate, 0) || 1;
  return input.suppliers.reduce((acc, row) => {
    const weight = row.purchaseShareRate / totalShare;
    acc.paymentDelayDays += row.paymentDelayDays * weight;
    acc.leadTimeDays += row.leadTimeDays * weight;
    acc.discountRate += row.discountRate * weight;
    return acc;
  }, { paymentDelayDays: 0, leadTimeDays: 0, discountRate: 0 });
}

function deriveSubcontract(input) {
  if (!input.subcontractEnabled) return { jobs: 0, grossRevenue: 0, cost: 0 };
  return input.subcontractItems.reduce((acc, row) => {
    acc.jobs += row.monthlyJobs;
    acc.grossRevenue += row.monthlyJobs * row.salePrice;
    acc.cost += row.monthlyJobs * row.costPerJob;
    return acc;
  }, { jobs: 0, grossRevenue: 0, cost: 0 });
}

export function deriveAutoProfileInputs(rawInputs) {
  const input = normalizeAutoServiceInputs(rawInputs);
  const profile = getAutoBusinessProfile(input.businessType);
  const service = weightedServices(input);
  const effectiveDurationMinutes = service.durationMinutes * (1 + service.reworkRate);
  const demand = deriveDemand(input, profile);
  const stationDailyCapacity = profile.driver === "mobile_routes"
    ? input.mobileTechnicians * input.routesPerTechnicianPerDay
    : input.serviceStations * input.workingHoursPerDay * 60 / Math.max(5, effectiveDurationMinutes);
  const staff = deriveStaff(input, effectiveDurationMinutes);
  const effectiveDailyCapacity = Math.min(stationDailyCapacity, staff.dailyCapacity);
  const completedDaily = Math.min(demand.showDaily, effectiveDailyCapacity);
  const supplier = deriveSupplier(input);
  const subcontract = deriveSubcontract(input);
  const unmetDaily = Math.max(0, demand.showDaily - completedDaily);

  return {
    input,
    profile,
    service,
    demand,
    staff,
    supplier,
    subcontract,
    effectiveDurationMinutes,
    stationDailyCapacity,
    staffDailyCapacity: staff.dailyCapacity,
    effectiveDailyCapacity,
    completedDaily,
    unmetDaily,
    capacityUtilization: percent(completedDaily, effectiveDailyCapacity),
    demandFulfillmentRate: percent(completedDaily, demand.showDaily),
    legacyInputs: {
      ...input,
      dailyVehicles: completedDaily,
      averageServicePrice: service.servicePrice,
      averagePartsRevenuePerVehicle: service.partsRevenue,
      averageServiceDurationMinutes: effectiveDurationMinutes,
      consumableCostPerVehicle: service.consumableCost,
      waterElectricityCostPerVehicle: service.energyCost + (input.businessType === "mobile_service" ? input.mobileTravelCostPerJob : 0),
      partsCostRate: service.partsCostRate * (1 - supplier.discountRate),
      staffCost: staff.monthlyCost,
      serviceStations: input.businessType === "mobile_service" ? Math.max(1, input.mobileTechnicians) : input.serviceStations,
    },
  };
}
