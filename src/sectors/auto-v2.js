import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  AUTO_BUSINESS_PROFILES,
  AUTO_SERVICE_DEFAULT_INPUTS,
  AUTO_SERVICE_FORM_SECTIONS,
  AUTO_SERVICE_PACKAGE_TYPES,
  AUTO_SERVICE_SCENARIOS,
  AUTO_V2_BUSINESS_TYPES,
  applyAutoBusinessType,
  applyAutoServiceScenario,
  normalizeAutoServiceInputs,
} from "./auto-v2-config.js";
import {
  buildAutoServiceWarnings,
  calculateAutoServiceModel as calculateCoreModel,
  calculateAutoServiceMonth as calculateCoreMonth,
  calculateAutoServiceScenarioComparison as calculateCoreScenarioComparison,
} from "./auto-v2-core.js";
import { buildAutoServicePresentation } from "./auto-v2-presentation.js";

function alignCompletedJobs(result) {
  return {
    ...result,
    input: { ...result.input, dailyVehicles: result.monthlyVehicles / Math.max(1, result.input.openDays) },
  };
}

export function calculateAutoServiceModel(rawInputs) {
  return alignCompletedJobs(calculateCoreModel(rawInputs));
}

export function calculateAutoServiceMonth(rawInputs, overrides = {}) {
  return alignCompletedJobs(calculateCoreMonth(rawInputs, overrides));
}

export function calculateAutoServiceScenarioComparison(baseOrScenarioInputs) {
  return calculateCoreScenarioComparison(baseOrScenarioInputs).map((item) => ({ ...item, result: alignCompletedJobs(item.result) }));
}

export {
  AUTO_BUSINESS_PROFILES,
  AUTO_SERVICE_DEFAULT_INPUTS,
  AUTO_SERVICE_FORM_SECTIONS,
  AUTO_SERVICE_PACKAGE_TYPES,
  AUTO_SERVICE_SCENARIOS,
  AUTO_V2_BUSINESS_TYPES,
  applyAutoBusinessType,
  applyAutoServiceScenario,
  normalizeAutoServiceInputs,
  buildAutoServiceWarnings,
  buildAutoServicePresentation,
};

export const AUTO_SERVICE_CASH_FLOW_COLUMNS = [
  { key: "month", label: "Ay", format: "number" },
  { key: "completedJobs", label: "Tamamlanan iş", format: "number" },
  { key: "unmetJobs", label: "Karşılanamayan iş", format: "number" },
  { key: "subcontractJobs", label: "Taşeron iş", format: "number" },
  { key: "collections", label: "Tahsilat", format: "money" },
  { key: "variableCostsPaid", label: "Parça / sarf / taşeron ödemesi", format: "money" },
  { key: "fixedCosts", label: "Nakit sabit gider", format: "money" },
  { key: "cashEnd", label: "Kümülatif nakit", format: "money" },
];

export const AUTO_SERVICE_SECTOR = assertSectorDefinition({
  id: "auto_services",
  name: "Oto Hizmetleri",
  family: "Araç Bakım ve Hizmet",
  version: "0.18.0",
  status: "simulation",
  description: "Oto yıkama, detailing, bakım-servis, lastik, kaplama, kaporta ve mobil servis için talep, randevu, istasyon/personel kapasitesi, parça-sarf, taşeron ve tekrar ziyaret modeli.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: AUTO_V2_BUSINESS_TYPES,
  businessProfiles: AUTO_BUSINESS_PROFILES,
  defaultInputs: AUTO_SERVICE_DEFAULT_INPUTS,
  scenarios: AUTO_SERVICE_SCENARIOS,
  formSections: AUTO_SERVICE_FORM_SECTIONS,
  cashFlowColumns: AUTO_SERVICE_CASH_FLOW_COLUMNS,
  normalizeInputs: normalizeAutoServiceInputs,
  applyBusinessType: applyAutoBusinessType,
  applyScenario: applyAutoServiceScenario,
  calculateModel: calculateAutoServiceModel,
  calculateScenarioComparison: calculateAutoServiceScenarioComparison,
  buildPresentation: buildAutoServicePresentation,
});
