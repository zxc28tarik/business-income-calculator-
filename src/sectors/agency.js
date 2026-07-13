import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  AGENCY_BUSINESS_TYPES, AGENCY_DEFAULT_INPUTS, AGENCY_FORM_SECTIONS, AGENCY_SCENARIOS,
  applyAgencyScenario, normalizeAgencyInputs,
} from "./agency-config.js";
import {
  calculateAgencyModel, calculateAgencyMonth, calculateAgencyScenarioComparison, buildAgencyWarnings,
} from "./agency-core.js";
import { buildAgencyPresentation } from "./agency-presentation.js";

export {
  AGENCY_BUSINESS_TYPES, AGENCY_DEFAULT_INPUTS, AGENCY_FORM_SECTIONS, AGENCY_SCENARIOS,
  applyAgencyScenario, normalizeAgencyInputs,
};
export { calculateAgencyModel, calculateAgencyMonth, calculateAgencyScenarioComparison, buildAgencyWarnings };
export { buildAgencyPresentation };

export const AGENCY_SECTOR = assertSectorDefinition({
  id: "agency_freelance_consulting",
  name: "Ajans / Freelancer / Danışmanlık",
  family: "Profesyonel Hizmetler",
  version: "v0.1",
  status: "simulation",
  description: "Proje bedeli, ekip saati, revizyon, taşeron, kapasite ve tahsilat vadesinden hizmet işletmesi kârlılığı ile nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: AGENCY_BUSINESS_TYPES,
  defaultInputs: AGENCY_DEFAULT_INPUTS,
  scenarios: AGENCY_SCENARIOS,
  formSections: AGENCY_FORM_SECTIONS,
  normalizeInputs: normalizeAgencyInputs,
  applyScenario: applyAgencyScenario,
  calculateModel: calculateAgencyModel,
  calculateScenarioComparison: calculateAgencyScenarioComparison,
  buildPresentation: buildAgencyPresentation,
});
