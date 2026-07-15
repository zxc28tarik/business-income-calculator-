export {
  STEAM_PUBLISHER_BUSINESS_TYPES,
  STEAM_DEFAULT_REGIONS,
  STEAM_DEFAULT_RECOUP_ITEMS,
  STEAM_DEFAULT_ADDITIONAL_INCOME_ITEMS,
  STEAM_PUBLISHER_DEFAULT_INPUTS,
  STEAM_PUBLISHER_SCENARIOS,
  normalizeSteamPublisherInputs,
  applySteamPublisherScenario,
} from "./steam-publisher-config.js";

export {
  buildSteamPublisherWarnings,
  buildSteamPublisherWaterfall,
  calculateSteamPublisherReferenceModel,
  calculateSteamPublisherScenarioComparison,
} from "./steam-publisher-core.js";

/**
 * Sektör şeması tablo/checkbox/koşullu panel desteği kazanana kadar registry'ye
 * eklenmeyen, kaynak uyumlu referans model metadatası.
 */
export const STEAM_PUBLISHER_REFERENCE_MODEL = {
  id: "game_digital_publishing",
  name: "Oyun / Dijital Yayıncılık",
  family: "Dijital ürün ve yayıncılık",
  version: "master-v2-extraction-01",
  status: "reference_engine",
};
