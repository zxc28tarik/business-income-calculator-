import { evaluateVisibility } from "../core/sector-schema.js";
import { round } from "./formatters.js";

export const VIEW_MODE_STORAGE_KEY = "business-income-calculator:ui:view-mode:v0.24";
export const DEFAULT_VIEW_MODE = "simple";

const BASIC_FIELDS = {
  cafe_restaurant: [
    "businessType",
    "dailyCustomers", "seats", "tableTurnsPerDay", "occupancyRate",
    "ordersPerHour", "serviceHoursPerDay",
    "dailyDeliveryOrders", "dailyKitchenCapacity",
    "serviceEventsPerMonth", "customersPerEvent",
    "averageTicket", "openDays", "serviceCapacity",
    "materialCostRate", "taxType", "vatRate",
    "rent", "staffCost", "startingCash", "financingAmount",
  ],
  ecommerce_marketplace: [
    "businessType",
    "unitsSold", "monthlyVisitors", "conversionRate", "itemsPerOrder",
    "monthlyLeads", "leadConversionRate",
    "productionUnitsPerDay", "productionDaysPerMonth", "productionUtilizationRate",
    "activeSubscribers", "monthlySubscriberAcquisition", "monthlyChurnRate",
    "monthlyOrderCapacity", "productPrice", "unitProductCost", "refundRate",
    "shippingCostPerOrder", "monthlyAdSpend", "taxType", "vatRate",
    "rent", "staffCost", "startingCash", "financingAmount",
  ],
  beauty_personal_care: [
    "businessType",
    "stations", "chairCount", "tableCount", "roomCount", "deviceCount", "specialistCount",
    "workingHoursPerDay", "openDays", "occupancyRate",
    "servicePrice", "sessionDurationMinutes", "consumableCostPerSession",
    "staffCount", "staffCost", "taxType", "vatRate",
    "rent", "startingCash", "financingAmount",
  ],
  agency_freelance_consulting: [
    "businessType",
    "averageProjectFee", "monthlyProjectCount", "averageProjectHours",
    "retainerClientCount", "averageMonthlyRetainer", "retainerHoursPerClient",
    "monthlyBillableHours", "hourlySalesPrice",
    "consultingDaysPerMonth", "dailyConsultingFee", "hoursPerConsultingDay",
    "monthlyCampaignCount", "averageCampaignFee", "campaignHours",
    "managedAdSpend", "managementFeeRate", "performanceBonusRevenue",
    "teamSize", "targetUtilizationRate", "hourlyCost", "freelancerPayments",
    "taxType", "vatRate", "adminStaffCost", "officeRent",
    "startingCash", "financingAmount",
  ],
  saas_subscription: [
    "businessType",
    "openingSubscribers", "monthlyNewSubscribers", "monthlyPrice", "monthlyChurnRate",
    "apiCustomers", "apiNewCustomers", "apiMonthlyChurnRate",
    "usageUnitsPerCustomer", "pricePerUsageUnit", "costPerUsageUnit",
    "enterpriseCustomers", "enterpriseNewCustomers", "enterpriseMonthlyChurnRate",
    "annualContractValue", "onboardingRevenuePerNewCustomer",
    "cacPerSubscriber", "fixedMarketingSpend",
    "serverBaseCost", "supportCostPerSubscriber", "developmentCost",
    "taxType", "vatRate", "startingCash", "financingAmount",
  ],
  physical_retail: [
    "businessType",
    "dailyCustomers", "dailyFootTraffic", "conversionRate",
    "activeCustomerBase", "monthlyPurchaseFrequency",
    "dailyOrders", "eventOrdersPerMonth", "eventOrderValue",
    "transactionsPerHour", "openHoursPerDay", "openDays",
    "averageBasket", "averageUnitSalePrice", "averageUnitCost",
    "taxType", "vatRate", "rent", "staffCost",
    "startingCash", "financingAmount",
  ],
  auto_services: [
    "businessType",
    "dailyVehicles", "dailyDemandRequests", "bookingConversionRate",
    "scheduledJobsPerDay", "monthlyJobs", "mobileTechnicians", "routesPerTechnicianPerDay",
    "openDays", "serviceStations", "workingHoursPerDay",
    "averageServicePrice", "consumableCostPerVehicle", "staffCost",
    "taxType", "vatRate", "rent", "baseUtilities",
    "startingCash", "financingAmount",
  ],
  game_digital_publishing: [
    "businessType",
    "listPriceUsd", "units", "discountRate", "refundRate",
    "mobileMonthlyActiveUsers", "mobilePeriodMonths", "mobilePayerConversionRate",
    "mobileAverageIapRevenuePerPayerUsd", "mobileAdRevenuePerActiveUserUsd",
    "dlcEligibleOwners", "dlcAttachRate", "dlcPriceUsd",
    "assetMonthlyUnits", "assetAveragePriceUsd", "assetPeriodMonths",
    "usdTry", "flatCommissionRate", "mobileStoreCommissionRate", "assetMarketplaceCommissionRate",
    "publisherShareRate", "developerShareRate", "shareBasis",
    "entityType", "corporateTaxRate",
    "cashOnHandTry", "preLaunchMonthlyBurnTry", "launchMarketingTry",
  ],
};

const PRIMARY_FIELDS = new Set([
  "businessType",
  "dailyCustomers", "seats", "ordersPerHour", "dailyDeliveryOrders", "serviceEventsPerMonth",
  "averageTicket", "unitsSold", "monthlyVisitors", "conversionRate", "monthlyLeads",
  "productionUnitsPerDay", "activeSubscribers", "productPrice",
  "stations", "chairCount", "tableCount", "roomCount", "deviceCount", "specialistCount",
  "occupancyRate", "servicePrice",
  "averageProjectFee", "monthlyProjectCount", "retainerClientCount", "averageMonthlyRetainer",
  "monthlyBillableHours", "hourlySalesPrice", "consultingDaysPerMonth", "dailyConsultingFee",
  "monthlyCampaignCount", "averageCampaignFee", "managedAdSpend", "managementFeeRate",
  "openingSubscribers", "monthlyNewSubscribers", "monthlyPrice", "monthlyChurnRate",
  "apiCustomers", "usageUnitsPerCustomer", "pricePerUsageUnit",
  "enterpriseCustomers", "annualContractValue",
  "dailyFootTraffic", "activeCustomerBase", "dailyOrders", "transactionsPerHour", "averageBasket",
  "dailyVehicles", "dailyDemandRequests", "scheduledJobsPerDay", "monthlyJobs", "mobileTechnicians",
  "averageServicePrice",
  "listPriceUsd", "units", "mobileMonthlyActiveUsers", "mobilePayerConversionRate",
  "dlcEligibleOwners", "dlcAttachRate", "assetMonthlyUnits", "assetAveragePriceUsd",
]);

const FIELD_MICROCOPY = {
  businessType: "Gelir ve kapasite alanlarını seçtiğiniz iş modeline göre düzenler.",
  startingCash: "Hesap dönemi başındaki kullanılabilir nakit.",
  cashOnHandTry: "Lansman ve işletme giderleri öncesindeki kullanılabilir nakit.",
  rent: "Aylık kira gideri.",
  officeRent: "Aylık ofis veya çalışma alanı gideri.",
  staffCost: "Maaş ve işveren maliyetlerinin aylık toplamı.",
  adminStaffCost: "İdari ve satış ekibinin aylık toplam maliyeti.",
  financingAmount: "Faaliyet geliri değildir; nakit akışına finansman olarak girer.",
};

function basicFieldSet(sectorId) {
  return new Set(BASIC_FIELDS[sectorId] ?? []);
}

export function normalizeViewMode(value) {
  return value === "advanced" ? "advanced" : DEFAULT_VIEW_MODE;
}

export function getFieldImportance(sector, field) {
  if (PRIMARY_FIELDS.has(field.key)) return "primary";
  if (basicFieldSet(sector.id).has(field.key)) return "basic";
  return "advanced";
}

export function isFieldAvailableInMode(sector, field, viewMode) {
  return normalizeViewMode(viewMode) === "advanced"
    || getFieldImportance(sector, field) !== "advanced";
}

export function isFieldVisible(sector, field, inputs, viewMode) {
  return isFieldAvailableInMode(sector, field, viewMode)
    && evaluateVisibility(field.visibleWhen, inputs);
}

export function isSectionAvailableInMode(sector, section, viewMode) {
  return normalizeViewMode(viewMode) === "advanced"
    || section.fields.some((field) => isFieldAvailableInMode(sector, field, viewMode));
}

export function getFieldMicrocopy(field) {
  if (field.hint) return field.hint;
  if (FIELD_MICROCOPY[field.key]) return FIELD_MICROCOPY[field.key];
  if (field.type === "rate") return "Yüzde olarak girin (ör. 25 = %25).";
  return "";
}

function selectedOptionLabel(field, value) {
  return field.options?.find(([optionValue]) => optionValue === value)?.[1] ?? value;
}

function formatSummaryValue(field, value) {
  if (field.type === "select") return selectedOptionLabel(field, value);
  if (field.type === "boolean") return value ? "Açık" : "Kapalı";
  if (field.type === "table") return `${Array.isArray(value) ? value.length : 0} satır`;
  if (field.type === "rate") return `%${round(Number(value) * 100, 1).toLocaleString("tr-TR")}`;
  if (field.type === "number") return round(Number(value), 1).toLocaleString("tr-TR");
  return String(value ?? "");
}

export function getSectionSummary(sector, section, inputs, viewMode) {
  const visibleFields = section.fields
    .filter((field) => isFieldVisible(sector, field, inputs, viewMode))
    .filter((field) => field.type !== "boolean")
    .slice(0, 2);

  if (!visibleFields.length) return "";
  return visibleFields
    .map((field) => `${field.label}: ${formatSummaryValue(field, inputs[field.key])}`)
    .join(" · ");
}

export function countVisibleFields(sector, inputs, viewMode = DEFAULT_VIEW_MODE) {
  return sector.formSections.reduce((total, section) => total + section.fields
    .filter((field) => isFieldVisible(sector, field, inputs, viewMode)).length, 0);
}
