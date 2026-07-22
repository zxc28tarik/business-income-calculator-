import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  AGENCY_BUSINESS_PROFILES,
  AGENCY_BUSINESS_TYPES,
  AGENCY_DEFAULT_INPUTS,
  AGENCY_FORM_SECTIONS,
  AGENCY_SCENARIOS,
  applyAgencyBusinessType,
  applyAgencyScenario,
  normalizeAgencyInputs,
} from "./agency-v2-config.js";
import { calculateAgencyModel, calculateAgencyMonth, calculateAgencyScenarioComparison } from "./agency-v2-core.js";
import { buildAgencyPresentation } from "./agency-v2-presentation.js";

export {
  AGENCY_BUSINESS_PROFILES,
  AGENCY_BUSINESS_TYPES,
  AGENCY_DEFAULT_INPUTS,
  AGENCY_FORM_SECTIONS,
  AGENCY_SCENARIOS,
  applyAgencyBusinessType,
  applyAgencyScenario,
  normalizeAgencyInputs,
};
export { calculateAgencyModel, calculateAgencyMonth, calculateAgencyScenarioComparison };
export { buildAgencyPresentation };

export const AGENCY_SECTOR = assertSectorDefinition({
  id: "agency_freelance_consulting",
  name: "Ajans / Freelancer / Danışmanlık",
  family: "Profesyonel Hizmet",
  version: "0.15.0",
  status: "simulation",
  description: "Proje, retainer, saatlik hizmet, danışmanlık günü, kampanya ve performans geliri için ekip kapasitesi, revizyon, taşeron, tahsilat, P&L ve nakit modeli.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: AGENCY_BUSINESS_TYPES,
  businessProfiles: AGENCY_BUSINESS_PROFILES,
  defaultInputs: AGENCY_DEFAULT_INPUTS,
  scenarios: AGENCY_SCENARIOS,
  formSections: AGENCY_FORM_SECTIONS,
  normalizeInputs: normalizeAgencyInputs,
  applyBusinessType: applyAgencyBusinessType,
  applyScenario: applyAgencyScenario,
  calculateModel: calculateAgencyModel,
  calculateScenarioComparison: calculateAgencyScenarioComparison,
  buildPresentation: buildAgencyPresentation,
});
