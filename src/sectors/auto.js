import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  AUTO_SERVICE_BUSINESS_TYPES, AUTO_SERVICE_DEFAULT_INPUTS, AUTO_SERVICE_FORM_SECTIONS,
  AUTO_SERVICE_PACKAGE_TYPES, AUTO_SERVICE_SCENARIOS, applyAutoServiceScenario, normalizeAutoServiceInputs,
} from "./auto-config.js";
import {
  calculateAutoServiceModel, calculateAutoServiceMonth, calculateAutoServiceScenarioComparison,
  buildAutoServiceWarnings,
} from "./auto-core.js";
import { buildAutoServicePresentation } from "./auto-presentation.js";

export {
  AUTO_SERVICE_BUSINESS_TYPES, AUTO_SERVICE_DEFAULT_INPUTS, AUTO_SERVICE_FORM_SECTIONS,
  AUTO_SERVICE_PACKAGE_TYPES, AUTO_SERVICE_SCENARIOS, applyAutoServiceScenario, normalizeAutoServiceInputs,
};
export {
  calculateAutoServiceModel, calculateAutoServiceMonth, calculateAutoServiceScenarioComparison,
  buildAutoServiceWarnings,
};
export { buildAutoServicePresentation };

export const AUTO_SERVICE_SECTOR = assertSectorDefinition({
  id: "auto_services",
  name: "Oto Hizmetleri",
  family: "Araç Bakım ve Hizmet",
  version: "v0.1",
  status: "simulation",
  description: "Günlük araç, hizmet ve parça geliri, kapasite, sarf, su/elektrik, ekipman yatırımı ve amortismandan oto hizmet işletmesi kârlılığı ile nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: AUTO_SERVICE_BUSINESS_TYPES,
  defaultInputs: AUTO_SERVICE_DEFAULT_INPUTS,
  scenarios: AUTO_SERVICE_SCENARIOS,
  formSections: AUTO_SERVICE_FORM_SECTIONS,
  normalizeInputs: normalizeAutoServiceInputs,
  applyScenario: applyAutoServiceScenario,
  calculateModel: calculateAutoServiceModel,
  calculateScenarioComparison: calculateAutoServiceScenarioComparison,
  buildPresentation: buildAutoServicePresentation,
});
