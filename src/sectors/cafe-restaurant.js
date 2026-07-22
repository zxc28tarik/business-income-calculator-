import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  BUSINESS_TYPES,
  CAFE_BUSINESS_PROFILES,
  CAFE_FORM_SECTIONS,
  DEFAULT_INPUTS,
  SCENARIO_PRESETS,
  applyCafeBusinessType,
  applyScenario,
  normalizeCafeInputs,
} from "./cafe-config.js";
import { calculateCafeModel, calculateCafeMonth, calculateScenarioComparison, buildCafeWarnings } from "./cafe-core.js";
import { buildCafePresentation } from "./cafe-presentation.js";

export {
  BUSINESS_TYPES, CAFE_BUSINESS_PROFILES, CAFE_FORM_SECTIONS, DEFAULT_INPUTS, SCENARIO_PRESETS,
  applyCafeBusinessType, applyScenario, normalizeCafeInputs,
};
export { calculateCafeModel, calculateCafeMonth, calculateScenarioComparison, buildCafeWarnings };
export { buildCafePresentation };

export const CAFE_SECTOR = assertSectorDefinition({
  id: "cafe_restaurant",
  name: "Kafe / Restoran",
  family: "Yiyecek-İçecek",
  version: "0.12.0",
  status: "simulation",
  description: "Kafe, restoran, kiosk, dark kitchen ve food truck için iş türüne özgü talep, kanal, ürün karması, amortisman ve nakit akışı modeli.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: BUSINESS_TYPES,
  businessProfiles: CAFE_BUSINESS_PROFILES,
  defaultInputs: DEFAULT_INPUTS,
  scenarios: SCENARIO_PRESETS,
  formSections: CAFE_FORM_SECTIONS,
  normalizeInputs: normalizeCafeInputs,
  applyBusinessType: applyCafeBusinessType,
  applyScenario,
  calculateModel: calculateCafeModel,
  calculateScenarioComparison,
  buildPresentation: buildCafePresentation,
});
