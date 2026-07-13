import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  BEAUTY_BUSINESS_TYPES, BEAUTY_DEFAULT_INPUTS, BEAUTY_FORM_SECTIONS, BEAUTY_SCENARIOS,
  applyBeautyScenario, normalizeBeautyInputs,
} from "./beauty-config.js";
import {
  calculateBeautyModel, calculateBeautyMonth, calculateBeautyScenarioComparison, buildBeautyWarnings,
} from "./beauty-core.js";
import { buildBeautyPresentation } from "./beauty-presentation.js";

export {
  BEAUTY_BUSINESS_TYPES, BEAUTY_DEFAULT_INPUTS, BEAUTY_FORM_SECTIONS, BEAUTY_SCENARIOS,
  applyBeautyScenario, normalizeBeautyInputs,
};
export { calculateBeautyModel, calculateBeautyMonth, calculateBeautyScenarioComparison, buildBeautyWarnings };
export { buildBeautyPresentation };

export const BEAUTY_SECTOR = assertSectorDefinition({
  id: "beauty_personal_care",
  name: "Güzellik / Kuaför / Bakım",
  family: "Kişisel Bakım ve Hizmet",
  version: "v0.1",
  status: "simulation",
  description: "Randevu kapasitesi, doluluk, no-show, seans sarfı, çalışan primi ve cihaz amortismanından salon kârlılığı ile nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: BEAUTY_BUSINESS_TYPES,
  defaultInputs: BEAUTY_DEFAULT_INPUTS,
  scenarios: BEAUTY_SCENARIOS,
  formSections: BEAUTY_FORM_SECTIONS,
  normalizeInputs: normalizeBeautyInputs,
  applyScenario: applyBeautyScenario,
  calculateModel: calculateBeautyModel,
  calculateScenarioComparison: calculateBeautyScenarioComparison,
  buildPresentation: buildBeautyPresentation,
});
