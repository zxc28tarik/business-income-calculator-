import { cloneInputValue } from "./sector-schema.js";

export const USER_INPUT_SCENARIO_ID = "expected";
export const USER_INPUT_SCENARIO_LABEL = "Kullanıcı girdileri";

export function asSingleInputSector(definition) {
  return {
    ...definition,
    scenarioPresets: definition.scenarios,
    scenarios: {
      [USER_INPUT_SCENARIO_ID]: { label: USER_INPUT_SCENARIO_LABEL },
    },
    applyScenario(baseInputs) {
      return definition.normalizeInputs(cloneInputValue(baseInputs ?? definition.defaultInputs));
    },
    calculateScenarioComparison(baseOrScenarioInputs) {
      const source = baseOrScenarioInputs?.[USER_INPUT_SCENARIO_ID]
        ?? baseOrScenarioInputs
        ?? definition.defaultInputs;
      const inputs = definition.normalizeInputs(cloneInputValue(source));
      return [{
        id: USER_INPUT_SCENARIO_ID,
        label: USER_INPUT_SCENARIO_LABEL,
        inputs,
        result: definition.calculateModel(inputs),
      }];
    },
  };
}
