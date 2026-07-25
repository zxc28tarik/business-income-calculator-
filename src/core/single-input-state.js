import { cloneInputValue } from "./sector-schema.js";

function normalize(sector, value) {
  return sector.normalizeInputs(cloneInputValue(value ?? sector.defaultInputs));
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
  return { inputs: normalize(sector, baseInputs) };
}

export function normalizeSingleInputSectorState(raw, sector, fallbackInputs = sector.defaultInputs) {
  return { inputs: pickLegacyInputs(raw, sector, fallbackInputs) };
}

export function isSingleInputSectorState(value) {
  return Boolean(value?.inputs && typeof value.inputs === "object" && !value.scenarioInputs);
}
