import { assertSectorDefinition } from "../core/sector-schema.js";
import { BUSINESS_TYPES, CAFE_FORM_SECTIONS, DEFAULT_INPUTS, SCENARIO_PRESETS, applyScenario, normalizeCafeInputs } from "./cafe-config.js";
import { calculateCafeModel, calculateCafeMonth, calculateScenarioComparison, buildCafeWarnings } from "./cafe-core.js";
import { buildCafePresentation } from "./cafe-presentation.js";

export { BUSINESS_TYPES, CAFE_FORM_SECTIONS, DEFAULT_INPUTS, SCENARIO_PRESETS, applyScenario, normalizeCafeInputs };
export { calculateCafeModel, calculateCafeMonth, calculateScenarioComparison, buildCafeWarnings };
export { buildCafePresentation };

export const CAFE_SECTOR = assertSectorDefinition({
  id: "cafe_restaurant",
  name: "Kafe / Restoran",
  family: "Yiyecek-İçecek",
  version: "v0.2",
  status: "simulation",
  description: "Günlük müşteri, ortalama fiş, malzeme, fire, paket servis ve sabit giderlerden net kâr ile nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: BUSINESS_TYPES,
  defaultInputs: DEFAULT_INPUTS,
  scenarios: SCENARIO_PRESETS,
  formSections: CAFE_FORM_SECTIONS,
  normalizeInputs: normalizeCafeInputs,
  applyScenario,
  calculateModel: calculateCafeModel,
  calculateScenarioComparison,
  buildPresentation: buildCafePresentation,
});
