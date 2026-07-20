import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  BEAUTY_BUSINESS_PROFILES,
  BEAUTY_BUSINESS_TYPES,
  BEAUTY_DEFAULT_INPUTS,
  BEAUTY_FORM_SECTIONS,
  BEAUTY_SCENARIOS,
  applyBeautyBusinessType,
  applyBeautyScenario,
  normalizeBeautyInputs,
} from "./beauty-v2-config.js";
import {
  calculateBeautyModel,
  calculateBeautyMonth,
  calculateBeautyScenarioComparison,
  buildBeautyWarnings,
} from "./beauty-v2-core.js";
import { buildBeautyPresentation } from "./beauty-v2-presentation.js";

export {
  BEAUTY_BUSINESS_PROFILES,
  BEAUTY_BUSINESS_TYPES,
  BEAUTY_DEFAULT_INPUTS,
  BEAUTY_FORM_SECTIONS,
  BEAUTY_SCENARIOS,
  applyBeautyBusinessType,
  applyBeautyScenario,
  normalizeBeautyInputs,
};
export { calculateBeautyModel, calculateBeautyMonth, calculateBeautyScenarioComparison, buildBeautyWarnings };
export { buildBeautyPresentation };

export const BEAUTY_SECTOR = assertSectorDefinition({
  id: "beauty_personal_care",
  name: "Güzellik / Kuaför / Bakım",
  family: "Kişisel Bakım ve Hizmet",
  version: "v2.0",
  status: "simulation",
  description: "İş türüne özel randevu, fiziksel kaynak, personel, hizmet karması, sarf, no-show, tekrar ziyaret ve cihaz ekonomisinden kârlılık ile nakit akışını hesaplar.",
  simulationMode: true,
  realTrackingMode: "planned",
  businessTypes: BEAUTY_BUSINESS_TYPES,
  businessProfiles: BEAUTY_BUSINESS_PROFILES,
  defaultInputs: BEAUTY_DEFAULT_INPUTS,
  scenarios: BEAUTY_SCENARIOS,
  formSections: BEAUTY_FORM_SECTIONS,
  normalizeInputs: normalizeBeautyInputs,
  applyBusinessType: applyBeautyBusinessType,
  applyScenario: applyBeautyScenario,
  calculateModel: calculateBeautyModel,
  calculateScenarioComparison: calculateBeautyScenarioComparison,
  buildPresentation: buildBeautyPresentation,
});
