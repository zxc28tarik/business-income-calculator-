import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  RETAIL_BUSINESS_PROFILES,
  RETAIL_DEFAULT_INPUTS,
  RETAIL_FORM_SECTIONS,
  RETAIL_SCENARIOS,
  RETAIL_V2_BUSINESS_TYPES,
  applyRetailBusinessType,
  applyRetailScenario,
  normalizeRetailInputs,
} from "./retail-v2-config.js";
import {
  buildRetailWarnings,
  calculateRetailModel,
  calculateRetailMonth,
  calculateRetailScenarioComparison,
} from "./retail-v2-core.js";
import { buildRetailPresentation, RETAIL_CASH_FLOW_COLUMNS } from "./retail-v2-presentation.js";

export {
  RETAIL_BUSINESS_PROFILES,
  RETAIL_DEFAULT_INPUTS,
  RETAIL_FORM_SECTIONS,
  RETAIL_SCENARIOS,
  RETAIL_V2_BUSINESS_TYPES,
  RETAIL_CASH_FLOW_COLUMNS,
  applyRetailBusinessType,
  applyRetailScenario,
  normalizeRetailInputs,
};
export { buildRetailWarnings, calculateRetailModel, calculateRetailMonth, calculateRetailScenarioComparison };
export { buildRetailPresentation };

export const RETAIL_SECTOR = assertSectorDefinition({
  id: "physical_retail",
  name: "Fiziksel Perakende",
  family: "Perakende ve Mağazacılık",
  version: "0.17.0",
  status: "simulation",
  description: "Butik, pet shop, aksesuar, kırtasiye, oyuncak, çiçekçi ve küçük market için talep, ürün karması, tedarikçi, stok ve işletme sermayesi modeli.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: RETAIL_V2_BUSINESS_TYPES,
  businessProfiles: RETAIL_BUSINESS_PROFILES,
  defaultInputs: RETAIL_DEFAULT_INPUTS,
  scenarios: RETAIL_SCENARIOS,
  formSections: RETAIL_FORM_SECTIONS,
  cashFlowColumns: RETAIL_CASH_FLOW_COLUMNS,
  normalizeInputs: normalizeRetailInputs,
  applyBusinessType: applyRetailBusinessType,
  applyScenario: applyRetailScenario,
  calculateModel: calculateRetailModel,
  calculateScenarioComparison: calculateRetailScenarioComparison,
  buildPresentation: buildRetailPresentation,
});
