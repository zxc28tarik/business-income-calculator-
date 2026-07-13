import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  SAAS_BUSINESS_TYPES, SAAS_DEFAULT_INPUTS, SAAS_FORM_SECTIONS, SAAS_SCENARIOS,
  applySaasScenario, normalizeSaasInputs,
} from "./saas-config.js";
import {
  buildSaasWarnings, calculateSaasModel, calculateSaasMonth, calculateSaasScenarioComparison,
} from "./saas-core.js";
import { buildSaasPresentation } from "./saas-presentation.js";

export {
  SAAS_BUSINESS_TYPES, SAAS_DEFAULT_INPUTS, SAAS_FORM_SECTIONS, SAAS_SCENARIOS,
  applySaasScenario, normalizeSaasInputs,
};
export { buildSaasWarnings, calculateSaasModel, calculateSaasMonth, calculateSaasScenarioComparison };
export { buildSaasPresentation };

export const SAAS_SECTOR = assertSectorDefinition({
  id: "saas_subscription",
  name: "SaaS / Abonelik",
  family: "Dijital Ürün ve Abonelik",
  version: "v0.1",
  status: "simulation",
  description: "Abone büyümesi, churn, MRR/ARR, CAC, LTV, altyapı maliyeti ve 12 aylık nakit akışından SaaS birim ekonomisini hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: SAAS_BUSINESS_TYPES,
  defaultInputs: SAAS_DEFAULT_INPUTS,
  scenarios: SAAS_SCENARIOS,
  formSections: SAAS_FORM_SECTIONS,
  normalizeInputs: normalizeSaasInputs,
  applyScenario: applySaasScenario,
  calculateModel: calculateSaasModel,
  calculateScenarioComparison: calculateSaasScenarioComparison,
  buildPresentation: buildSaasPresentation,
});
