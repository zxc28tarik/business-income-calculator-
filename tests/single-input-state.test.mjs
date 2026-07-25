import test from "node:test";
import assert from "node:assert/strict";
import {
  createSingleInputSectorState,
  isSingleInputSectorState,
  normalizeSingleInputSectorState,
  pickLegacyInputs,
} from "../src/core/single-input-state.js";

const sector = {
  defaultInputs: { units: 10, nested: [{ value: 1 }] },
  normalizeInputs(value) {
    return {
      units: Math.max(0, Number(value?.units) || 0),
      nested: Array.isArray(value?.nested) ? value.nested.map((row) => ({ value: Number(row?.value) || 0 })) : [],
    };
  },
};

test("yeni kayıt yalnız inputs alanı üretir", () => {
  const state = createSingleInputSectorState(sector);
  assert.deepEqual(state, { inputs: { units: 10, nested: [{ value: 1 }] } });
  assert.equal(isSingleInputSectorState(state), true);
  assert.equal("scenarioInputs" in state, false);
  assert.equal("activeScenario" in state, false);
});

test("eski kayıtta son aktif senaryo tek girdiye taşınır", () => {
  const migrated = normalizeSingleInputSectorState({
    activeScenario: "optimistic",
    scenarioInputs: {
      pessimistic: { units: 4 },
      expected: { units: 20 },
      optimistic: { units: 55 },
    },
  }, sector);
  assert.equal(migrated.inputs.units, 55);
  assert.equal("scenarioInputs" in migrated, false);
});

test("aktif bilgi yoksa eski Beklenen değerleri kullanılır", () => {
  const migrated = pickLegacyInputs({
    scenarioInputs: {
      pessimistic: { units: 2 },
      expected: { units: 31 },
      optimistic: { units: 90 },
    },
  }, sector);
  assert.equal(migrated.units, 31);
});

test("yeni inputs alanı eski senaryo alanlarından önceliklidir", () => {
  const migrated = normalizeSingleInputSectorState({
    inputs: { units: 77 },
    activeScenario: "expected",
    scenarioInputs: { expected: { units: 22 } },
  }, sector);
  assert.equal(migrated.inputs.units, 77);
});

test("migrasyon girdileri derin kopyalar", () => {
  const raw = { inputs: { units: 12, nested: [{ value: 8 }] } };
  const migrated = normalizeSingleInputSectorState(raw, sector);
  migrated.inputs.nested[0].value = 99;
  assert.equal(raw.inputs.nested[0].value, 8);
});
