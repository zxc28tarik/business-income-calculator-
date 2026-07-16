import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  RETAIL_BUSINESS_TYPES, RETAIL_DEFAULT_INPUTS, RETAIL_FORM_SECTIONS, RETAIL_SCENARIOS,
  applyRetailScenario, normalizeRetailInputs,
} from "./retail-config.js";
import {
  calculateRetailModel, calculateRetailMonth, calculateRetailScenarioComparison, buildRetailWarnings,
} from "./retail-core.js";
import { buildRetailPresentation } from "./retail-presentation.js";

export {
  RETAIL_BUSINESS_TYPES, RETAIL_DEFAULT_INPUTS, RETAIL_FORM_SECTIONS, RETAIL_SCENARIOS,
  applyRetailScenario, normalizeRetailInputs,
};
export { calculateRetailModel, calculateRetailMonth, calculateRetailScenarioComparison, buildRetailWarnings };
export { buildRetailPresentation };

export const RETAIL_SECTOR = assertSectorDefinition({
  id: "physical_retail",
  name: "Fiziksel Perakende",
  family: "Perakende ve Mağazacılık",
  version: "v0.1",
  status: "simulation",
  description: "Günlük müşteri, ortalama sepet, ürün maliyeti, iade, fire/kayıp ve stok yatırımından mağaza kârlılığı ile nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: RETAIL_BUSINESS_TYPES,
  defaultInputs: RETAIL_DEFAULT_INPUTS,
  scenarios: RETAIL_SCENARIOS,
  formSections: RETAIL_FORM_SECTIONS,
  normalizeInputs: normalizeRetailInputs,
  applyScenario: applyRetailScenario,
  calculateModel: calculateRetailModel,
  calculateScenarioComparison: calculateRetailScenarioComparison,
  buildPresentation: buildRetailPresentation,
});
