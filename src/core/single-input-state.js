import { cloneInputValue } from "./sector-schema.js";
import {
  createDefaultSetupWorkspace,
  synchronizeSetupWorkspace,
} from "../setup/setup-workspace.js";

function normalize(sector, value) {
  return sector.normalizeInputs(cloneInputValue(value ?? sector.defaultInputs));
}

function setupContext(sector, inputs) {
  return {
    sectorId: String(sector?.id ?? ""),
    businessType: String(inputs?.businessType ?? inputs?.businessTypeId ?? ""),
  };
}

export function pickLegacyInputs(raw, sector, fallbackInputs = sector.defaultInputs) {
  if (raw?.inputs && typeof raw.inputs === "object") return normalize(sector, raw.inputs);

  const legacyScenarios = raw?.scenarioInputs;
  if (legacyScenarios && typeof legacyScenarios === "object") {
    const preferredId = raw?.activeScenario && legacyScenarios[raw.activeScenario]
      ? raw.activeScenario
      : legacyScenarios.expected
        ? "expected"
        : Object.keys(legacyScenarios)[0];
    if (preferredId) return normalize(sector, legacyScenarios[preferredId]);
  }

  if (raw?.baseInputs && typeof raw.baseInputs === "object") return normalize(sector, raw.baseInputs);
  return normalize(sector, fallbackInputs);
}

export function createSingleInputSectorState(sector, baseInputs = sector.defaultInputs) {
  const inputs = normalize(sector, baseInputs);
  const state = { inputs };
  if (sector?.id) state.setup = createDefaultSetupWorkspace(setupContext(sector, inputs));
  return state;
}

export function normalizeSingleInputSectorState(raw, sector, fallbackInputs = sector.defaultInputs) {
  const inputs = pickLegacyInputs(raw, sector, fallbackInputs);
  const state = { inputs };
  if (sector?.id) state.setup = synchronizeSetupWorkspace(raw?.setup, setupContext(sector, inputs));
  return state;
}

export function isSingleInputSectorState(value) {
  return Boolean(value?.inputs && typeof value.inputs === "object" && !value.scenarioInputs);
}
