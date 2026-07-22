import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  ECOMMERCE_BUSINESS_PROFILES,
  ECOMMERCE_BUSINESS_TYPES,
  ECOMMERCE_DEFAULT_INPUTS,
  ECOMMERCE_FORM_SECTIONS,
  ECOMMERCE_SCENARIOS,
  applyEcommerceBusinessType,
  applyEcommerceScenario,
  normalizeEcommerceInputs,
} from "./ecommerce-config.js";
import {
  calculateEcommerceModel,
  calculateEcommerceMonth,
  calculateEcommerceScenarioComparison,
  buildEcommerceWarnings,
} from "./ecommerce-core.js";
import { buildEcommercePresentation } from "./ecommerce-presentation.js";

export {
  ECOMMERCE_BUSINESS_PROFILES,
  ECOMMERCE_BUSINESS_TYPES,
  ECOMMERCE_DEFAULT_INPUTS,
  ECOMMERCE_FORM_SECTIONS,
  ECOMMERCE_SCENARIOS,
  applyEcommerceBusinessType,
  applyEcommerceScenario,
  normalizeEcommerceInputs,
};
export { calculateEcommerceModel, calculateEcommerceMonth, calculateEcommerceScenarioComparison, buildEcommerceWarnings };
export { buildEcommercePresentation };

export const ECOMMERCE_SECTOR = assertSectorDefinition({
  id: "ecommerce_marketplace",
  name: "E-Ticaret / Pazaryeri",
  family: "Dijital ve Fiziksel Ticaret",
  version: "0.13.0",
  status: "simulation",
  description: "Pazaryeri, doğrudan mağaza, sosyal satış, üretim ve abonelik modellerinde talep, kanal, ürün, iade, reklam, stok ve nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: ECOMMERCE_BUSINESS_TYPES,
  businessProfiles: ECOMMERCE_BUSINESS_PROFILES,
  defaultInputs: ECOMMERCE_DEFAULT_INPUTS,
  scenarios: ECOMMERCE_SCENARIOS,
  formSections: ECOMMERCE_FORM_SECTIONS,
  normalizeInputs: normalizeEcommerceInputs,
  applyScenario: applyEcommerceScenario,
  calculateModel: calculateEcommerceModel,
  calculateScenarioComparison: calculateEcommerceScenarioComparison,
  buildPresentation: buildEcommercePresentation,
});
