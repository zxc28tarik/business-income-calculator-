import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  SAAS_BUSINESS_PROFILES,
  SAAS_DEFAULT_INPUTS,
  SAAS_FORM_SECTIONS,
  SAAS_SCENARIOS,
  SAAS_V2_BUSINESS_TYPES,
  applySaasBusinessType,
  applySaasScenario,
  normalizeSaasInputs,
} from "./saas-v2-config.js";
import {
  buildSaasWarnings,
  calculateSaasModel,
  calculateSaasMonth,
  calculateSaasScenarioComparison,
} from "./saas-v2-core.js";
import { buildSaasPresentation } from "./saas-v2-presentation.js";

export {
  SAAS_BUSINESS_PROFILES,
  SAAS_DEFAULT_INPUTS,
  SAAS_FORM_SECTIONS,
  SAAS_SCENARIOS,
  SAAS_V2_BUSINESS_TYPES,
  applySaasBusinessType,
  applySaasScenario,
  normalizeSaasInputs,
  buildSaasWarnings,
  calculateSaasModel,
  calculateSaasMonth,
  calculateSaasScenarioComparison,
  buildSaasPresentation,
};

export const SAAS_SECTOR = assertSectorDefinition({
  id: "saas_subscription",
  name: "SaaS / Abonelik",
  family: "Dijital Ürün ve Abonelik",
  version: "0.16.0",
  status: "simulation",
  description: "B2B, B2C, mikro SaaS, API, mobil, üyelik, freemium ve kurumsal lisans için plan karması, churn, expansion, altyapı, destek ve nakit modeli.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: SAAS_V2_BUSINESS_TYPES,
  businessProfiles: SAAS_BUSINESS_PROFILES,
  defaultInputs: SAAS_DEFAULT_INPUTS,
  scenarios: SAAS_SCENARIOS,
  formSections: SAAS_FORM_SECTIONS,
  normalizeInputs: normalizeSaasInputs,
  applyBusinessType: applySaasBusinessType,
  applyScenario: applySaasScenario,
  calculateModel: calculateSaasModel,
  calculateScenarioComparison: calculateSaasScenarioComparison,
  buildPresentation: buildSaasPresentation,
  cashFlowColumns: [
    { key: "month", label: "Ay", format: "number" },
    { key: "openingSubscribers", label: "Ay başı müşteri", format: "number" },
    { key: "newSubscribers", label: "Yeni müşteri", format: "number" },
    { key: "churnedSubscribers", label: "Kaybedilen", format: "number" },
    { key: "endingSubscribers", label: "Ay sonu müşteri", format: "number" },
    { key: "collections", label: "Tahsilat", format: "money" },
    { key: "annualPrepayment", label: "Yıllık peşin", format: "money" },
    { key: "cashEnd", label: "Ay sonu nakit", format: "money" },
  ],
});
