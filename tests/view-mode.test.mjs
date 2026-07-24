import test from "node:test";
import assert from "node:assert/strict";
import { initializeScenarioInputs } from "../src/core/sector-schema.js";
import { SECTORS } from "../src/sectors/registry.js";
import { countVisibleFields, isFieldAvailableInMode, normalizeViewMode } from "../src/ui/view-mode.js";

test("form görünümü her zaman bütün alanları gösterir", () => {
  assert.equal(normalizeViewMode(), "advanced");
  assert.equal(normalizeViewMode("simple"), "advanced");
  assert.equal(normalizeViewMode("advanced"), "advanced");
  for (const sector of SECTORS) {
    const inputs = sector.normalizeInputs(structuredClone(sector.defaultInputs));
    const visible = countVisibleFields(sector, inputs, "advanced");
    const simpleAlias = countVisibleFields(sector, inputs, "simple");
    assert.equal(simpleAlias, visible, sector.id + ": Basit adı tam görünümden farklı sonuç üretmemelidir");
    for (const section of sector.formSections) {
      for (const field of section.fields) assert.equal(isFieldAvailableInMode(sector, field, "simple"), true);
    }
  }
});

test("kullanıcı arayüzü yalnız tek kullanıcı girdisi seti üretir", () => {
  for (const sector of SECTORS) {
    assert.deepEqual(Object.keys(sector.scenarios), ["expected"]);
    assert.equal(sector.scenarios.expected.label, "Kullanıcı girdileri");
    const state = initializeScenarioInputs(sector);
    assert.deepEqual(Object.keys(state), ["expected"]);
  }
});
