import { assertSectorDefinition } from "../core/sector-schema.js";
import {
  STEAM_PUBLISHER_BUSINESS_TYPES,
  STEAM_PUBLISHER_DEFAULT_INPUTS,
  STEAM_PUBLISHER_SCENARIOS,
  applySteamPublisherScenario,
  normalizeSteamPublisherInputs,
} from "./steam-publisher-config.js";
import { calculateSteamPublisherReferenceModel } from "./steam-publisher-core.js";
import {
  STEAM_PUBLISHER_CASH_FLOW_COLUMNS,
  STEAM_PUBLISHER_FORM_SECTIONS,
} from "./steam-publisher-form.js";
import {
  buildSteamPublisherPresentation,
  mapSteamPublisherCashFlow,
} from "./steam-publisher-presentation.js";

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

const STEAM_UI_DEFAULT_INPUTS = {
  ...STEAM_PUBLISHER_DEFAULT_INPUTS,
  operationsReleaseTry: 120000,
  operationsCommunityTry: 90000,
  operationsToolsTry: 40000,
};

function normalizeUiInputs(rawInputs = {}) {
  const merged = { ...STEAM_UI_DEFAULT_INPUTS, ...rawInputs };
  merged.publisherOperationsTry = Math.max(0,
    Number(merged.operationsReleaseTry || 0)
    + Number(merged.operationsCommunityTry || 0)
    + Number(merged.operationsToolsTry || 0));
  if (Array.isArray(merged.incomeTaxBrackets)) {
    merged.incomeTaxBrackets = merged.incomeTaxBrackets.map((item, index, rows) => ({
      ...item,
      upTo: item?.upTo == null && index === rows.length - 1 ? 999_999_999_999 : item?.upTo,
    }));
  }
  return normalizeSteamPublisherInputs(merged);
}

function applyUiScenario(baseInputs, scenarioId) {
  return normalizeUiInputs(applySteamPublisherScenario(normalizeUiInputs(baseInputs), scenarioId));
}

function calculateModel(rawInputs) {
  const result = calculateSteamPublisherReferenceModel(normalizeUiInputs(rawInputs));
  return { ...result, cashFlow: mapSteamPublisherCashFlow(result) };
}

function calculateScenarioComparison(scenarioInputs = {}) {
  return Object.entries(STEAM_PUBLISHER_SCENARIOS).map(([id, scenario]) => {
    const input = normalizeUiInputs(
      scenarioInputs[id] ?? applyUiScenario(STEAM_UI_DEFAULT_INPUTS, id),
    );
    return { id, label: scenario.label, input, result: calculateModel(input) };
  });
}

export const STEAM_PUBLISHER_SECTOR = assertSectorDefinition({
  id: "game_digital_publishing",
  name: "Oyun / Dijital Yayıncılık",
  family: "Dijital ürün ve yayıncılık",
  description: "Steam yayıncılığı için satış, platform kesintileri, recoup, geliştirici settlement, vergi ve nakit akışı modeli.",
  version: "0.10.0",
  status: "simulation",
  businessTypes: STEAM_PUBLISHER_BUSINESS_TYPES,
  defaultInputs: STEAM_UI_DEFAULT_INPUTS,
  scenarios: STEAM_PUBLISHER_SCENARIOS,
  formSections: STEAM_PUBLISHER_FORM_SECTIONS,
  cashFlowColumns: STEAM_PUBLISHER_CASH_FLOW_COLUMNS,
  normalizeInputs: normalizeUiInputs,
  applyScenario: applyUiScenario,
  calculateModel,
  calculateScenarioComparison,
  buildPresentation: buildSteamPublisherPresentation,
});

export const STEAM_PUBLISHER_REFERENCE_MODEL = STEAM_PUBLISHER_SECTOR;
