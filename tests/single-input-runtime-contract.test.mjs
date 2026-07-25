import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("ana ve standalone çalışma kodu yalnız inputs durumunu kullanır", async () => {
  const [app, standalone] = await Promise.all([
    source("../src/app.js"),
    source("../src/standalone-runtime.js"),
  ]);

  for (const [name, code] of [["app", app], ["standalone", standalone]]) {
    assert.match(code, /\.inputs/);
    assert.doesNotMatch(code, /activeScenario/);
    assert.doesNotMatch(code, /renderScenarioTable/);
    assert.doesNotMatch(code, /renderScenarioButtons/);
    assert.doesNotMatch(code, /viewModeSwitcher/);
    assert.doesNotMatch(code, /VIEW_MODE_STORAGE_KEY/);
  }
});

test("eski senaryo alanları yalnız migrasyon sınırında okunur", async () => {
  const migration = await source("../src/core/single-input-state.js");
  assert.match(migration, /scenarioInputs/);
  assert.match(migration, /activeScenario/);
  assert.match(migration, /legacyScenarios\.expected/);
});

test("form görünüm katmanı hiçbir alanı moda göre gizlemez", async () => {
  const formView = await source("../src/ui/form-view.js");
  assert.doesNotMatch(formView, /view-mode-hidden/);
  assert.doesNotMatch(formView, /isFieldAvailableInMode/);
  assert.doesNotMatch(formView, /isSectionAvailableInMode/);
});
