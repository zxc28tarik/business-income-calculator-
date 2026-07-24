import { readFile, writeFile, rm } from "node:fs/promises";

async function edit(path, transform) {
  const before = await readFile(path, "utf8");
  const after = transform(before);
  if (after === before) throw new Error(`${path}: beklenen değişiklik uygulanmadı`);
  await writeFile(path, after, "utf8");
}

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) throw new Error(`${label}: kaynak parça bulunamadı`);
  return source.replace(search, replacement);
}

await writeFile("src/core/single-input-sector.js", `import { cloneInputValue } from "./sector-schema.js";

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
`, "utf8");

await edit("src/sectors/registry.js", (source) => {
  let next = `import { asSingleInputSector } from "../core/single-input-sector.js";\n${source}`;
  next = replaceRequired(next,
`export const SECTORS = [
  CAFE_SECTOR,
  ECOMMERCE_SECTOR,
  BEAUTY_SECTOR,
  AGENCY_SECTOR,
  SAAS_SECTOR,
  RETAIL_SECTOR,
  AUTO_SERVICE_SECTOR,
  STEAM_PUBLISHER_SECTOR,
];`,
`export const SECTORS = [
  CAFE_SECTOR,
  ECOMMERCE_SECTOR,
  BEAUTY_SECTOR,
  AGENCY_SECTOR,
  SAAS_SECTOR,
  RETAIL_SECTOR,
  AUTO_SERVICE_SECTOR,
  STEAM_PUBLISHER_SECTOR,
].map(asSingleInputSector);`, "registry");
  return next;
});

await edit("src/standalone-runtime.js", (source) => {
  let next = source.replace(
    `import { buildProjectFinancialSummary } from "./portfolio/portfolio-summary.js";`,
    `import { buildProjectFinancialSummary } from "./portfolio/portfolio-summary.js";\nimport { asSingleInputSector } from "./core/single-input-sector.js";`,
  );
  next = replaceRequired(next,
    `export function mountStandaloneCalculator(sector) {`,
    `export function mountStandaloneCalculator(sourceSector) {\n  const sector = asSingleInputSector(sourceSector);`,
    "standalone sector wrapper",
  );
  next = next.replaceAll(`appVersion: "0.23.0"`, `appVersion: "0.24.1"`);
  next = next.replace(
    `["Senaryo", sector.scenarios[state.activeScenario].label],`,
    `["Girdi modeli", "Kullanıcı tarafından girilen değerler"],`,
  );
  next = next.replace(
    `anchor.download = \`${"${sector.id}-${state.activeScenario}.csv"}\`;`,
    `anchor.download = \`${"${sector.id}-hesap.csv"}\`;`,
  );
  next = next.replaceAll("tüm senaryo verileri", "kayıtlı girdileri");
  return next;
});

await edit("src/ui/view-mode.js", (source) => {
  let next = source.replace(`export const DEFAULT_VIEW_MODE = "simple";`, `export const DEFAULT_VIEW_MODE = "advanced";`);
  next = next.replace(
`export function normalizeViewMode(value) {
  return value === "advanced" ? "advanced" : DEFAULT_VIEW_MODE;
}`,
`export function normalizeViewMode() {
  return "advanced";
}`,
  );
  next += `

function applySingleInputInterface() {
  const scenarioSwitcher = document.querySelector("#scenarioSwitcher");
  if (scenarioSwitcher) {
    scenarioSwitcher.hidden = true;
    scenarioSwitcher.setAttribute("aria-hidden", "true");
  }
  const viewModeSwitcher = document.querySelector("#viewModeSwitcher");
  if (viewModeSwitcher) {
    viewModeSwitcher.hidden = true;
    viewModeSwitcher.setAttribute("aria-hidden", "true");
  }
  const note = document.querySelector("#viewModeNote");
  if (note) note.textContent = "Tüm hesaplama alanları gösteriliyor.";
  const scenarioPanel = document.querySelector("#scenarioTable")?.closest(".panel-card");
  if (scenarioPanel) scenarioPanel.hidden = true;
  const resetDescription = document.querySelector("#resetDialogDescription");
  if (resetDescription) resetDescription.textContent = "Bu sektöre ait kayıtlı girdiler varsayılan değerlere döndürülecek.";
  const resetScenarioRow = document.querySelector("#resetScenarioName")?.closest("div");
  if (resetScenarioRow) resetScenarioRow.hidden = true;
  const portfolioDescription = document.querySelector("#portfolioPanel .section-description, #portfolioPanel .subtitle");
  if (portfolioDescription) portfolioDescription.textContent = "Her kayıt kendi sektör, kullanıcı girdileri ve gerçek takip verilerini taşır. Portföy tablosu mevcut finans motorlarının sonuçlarını karşılaştırır.";
}

if (typeof document !== "undefined") queueMicrotask(applySingleInputInterface);
`;
  return next;
});

await edit("src/app.js", (source) => {
  let next = source.replaceAll(`appVersion: "0.23.0"`, `appVersion: "0.24.1"`);
  next = next.replace(
    `["Senaryo", sector.scenarios[currentSectorState().activeScenario].label],`,
    `["Girdi modeli", "Kullanıcı tarafından girilen değerler"],`,
  );
  next = next.replace(
    `anchor.download = \`${"${sector.id}-${currentSectorState().activeScenario}.csv"}\`;`,
    `anchor.download = \`${"${sector.id}-hesap.csv"}\`;`,
  );
  next = next.replaceAll("tüm senaryo verileri", "kayıtlı girdileri");
  return next;
});

await edit("src/report/report-model.js", (source) => {
  let next = source.replace(
    `\`${"${sector.name} için ${scenarioLabel} senaryosu ${decision.label.toLocaleLowerCase(\"tr-TR\")} üretiyor."}\``,
    `\`${"${sector.name} için kullanıcı girdileri ${decision.label.toLocaleLowerCase(\"tr-TR\")} sonucu üretiyor."}\``,
  );
  next = next.replace(
    `scenario: { id: scenarioId, label: scenarioLabel },`,
    `scenario: { id: "user-input", label: "Kullanıcı girdileri" },`,
  );
  return next;
});

await edit("src/report/report-document.js", (source) => {
  let next = source.replace(
    `function renderScenarioTable(report) {\n  return`,
    `function renderScenarioTable(report) {\n  if ((report.scenarios?.scenarios?.length ?? 0) <= 1) return "";\n  return`,
  );
  next = next.replace(
    `const subtitle = [report.businessType, report.scenario.label].filter(Boolean).join(" · ");`,
    `const subtitle = [report.businessType, "Kullanıcı girdileri"].filter(Boolean).join(" · ");`,
  );
  next = next.replace(
    `anchor.download = \`${"${safeFilename(report.sector.id)}-${safeFilename(report.scenario.id)}-rapor.html"}\`;`,
    `anchor.download = \`${"${safeFilename(report.sector.id)}-rapor.html"}\`;`,
  );
  return next;
});

await edit("src/portfolio/portfolio-controller.js", (source) => {
  let next = source.replace(`        scenarioLabel: summary?.scenarioLabel ?? "—",\n`, "");
  next = next.replace(`      <td>${"${escapeHtml(record.summary.scenarioLabel)}"}</td>\n`, "");
  next = next.replace(
    `<th>Kayıt</th><th>Sektör</th><th>Senaryo</th><th>Net sonuç</th>`,
    `<th>Kayıt</th><th>Sektör</th><th>Net sonuç</th>`,
  );
  return next;
});

await edit("src/portfolio/portfolio-summary.js", (source) => source.replace(
  `scenarioLabel: sector.scenarios?.[scenarioId]?.label ?? scenarioId,`,
  `scenarioLabel: "Kullanıcı girdileri",`,
));

await edit("src/tracking/tracking-controller.js", (source) => {
  let next = source.replaceAll(
    `ctx.sector.scenarios?.[ctx.scenarioId]?.label ?? ctx.scenarioId`,
    `"Kullanıcı girdileri"`,
  );
  next = next.replace(
    `anchor.download = \`${"${ctx.sector.id}-${ctx.scenarioId}-gercek-takip.csv"}\`;`,
    `anchor.download = \`${"${ctx.sector.id}-gercek-takip.csv"}\`;`,
  );
  return next;
});

await edit("src/tracking/tracking-report.js", (source) => {
  let next = source.replace(
    `${"${escapeHtml(scenarioLabel)}"} bütçesi`,
    `Kullanıcı girdilerine göre bütçe`,
  );
  next = next.replace(
    `anchor.download = \`${"${context.sector.id}-${context.model.scenarioId}-gercek-takip.html"}\`;`,
    `anchor.download = \`${"${context.sector.id}-gercek-takip.html"}\`;`,
  );
  return next;
});

await edit("index.html", (source) => source
  .replaceAll("v0.24.0", "v0.24.1")
  .replace("Yalnız temel varsayımlar gösteriliyor.", "Tüm hesaplama alanları gösteriliyor.")
  .replace("Her kayıt kendi sektör, senaryo, varsayım ve gerçek takip verilerini taşır.", "Her kayıt kendi sektör, kullanıcı girdileri ve gerçek takip verilerini taşır.")
  .replace("Bu sektöre ait tüm senaryoların kayıtlı varsayımları varsayılan değerlere döndürülecek.", "Bu sektöre ait kayıtlı girdiler varsayılan değerlere döndürülecek."));

await edit("scripts/build-standalone.mjs", (source) => source
  .replaceAll("0.24.0", "0.24.1")
  .replace("Yalnız temel varsayımlar gösteriliyor.", "Tüm hesaplama alanları gösteriliyor.")
  .replace("Her kayıt kendi sektör, senaryo, varsayım ve gerçek takip verilerini taşır.", "Her kayıt kendi sektör, kullanıcı girdileri ve gerçek takip verilerini taşır.")
  .replace("Bu sektöre ait tüm senaryoların kayıtlı varsayımları varsayılan değerlere döndürülecek.", "Bu sektöre ait kayıtlı girdiler varsayılan değerlere döndürülecek."));

await edit("scripts/build-production.mjs", (source) => source.replace(`version: "0.24.0"`, `version: "0.24.1"`));

for (const path of ["package.json", "package-lock.json"]) {
  const data = JSON.parse(await readFile(path, "utf8"));
  data.version = "0.24.1";
  if (data.packages?.[""]) data.packages[""].version = "0.24.1";
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

await writeFile("tests/view-mode.test.mjs", `import test from "node:test";
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
    assert.equal(simpleAlias, visible, `${sector.id}: Basit adı tam görünümden farklı sonuç üretmemelidir`);
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
`, "utf8");

await edit("tests/e2e/application.spec.js", (source) => {
  let next = source.replace(/test\("Basit ve Gelişmiş görünüm aynı finans sonucunu kullanır"[\s\S]*?\n\}\);\n\n(?=test\("karar özeti)/,
`test("form doğrudan tam görünümde açılır ve senaryo kontrolleri gösterilmez", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/");
  await expect(page.locator("#viewModeNote")).toHaveText(/Bütün sektör ayrıntıları|Tüm hesaplama alanları/);
  await expect(page.locator("#viewModeSwitcher")).toBeHidden();
  await expect(page.locator("#scenarioSwitcher")).toBeHidden();
  await expect(page.locator("#scenarioTable").locator("xpath=ancestor::section[1]")).toBeHidden();
  await expect(page.locator(".table-field").first()).not.toHaveClass(/view-mode-hidden/);
  await expect(page.locator("#scenarioSwitcher .scenario-button")).toHaveCount(1);
  await expect(page.locator("#scenarioSwitcher")).toContainText("Kullanıcı girdileri");
  expect(errors).toEqual([]);
});

`);
  next = next.replace(
    `await expect(page.locator("#resetScenarioName")).toHaveText("Beklenen");`,
    `await expect(page.locator("#resetScenarioName").locator("xpath=ancestor::div[1]")).toBeHidden();\n  await expect(page.locator("#resetDialogDescription")).toContainText("kayıtlı girdiler");`,
  );
  return next;
});

await writeFile("docs/V0241_RELEASE_NOTES.md", `# v0.24.1 — Tek kullanıcı girdisi modeli

- Basit/Gelişmiş görünüm ayrımı kaldırıldı; bütün sektör alanları doğrudan gösterilir.
- Kötümser/Beklenen/İyi senaryo seçimi ve üçlü karşılaştırma kullanıcı arayüzünden kaldırıldı.
- Hesaplama yalnız kullanıcının girdiği tek varsayım setiyle çalışır.
- Eski kayıtların Beklenen değerleri yeni tek girdi seti olarak korunur.
- Rapor, CSV, portföy, gerçek takip ve sekiz tek HTML hesaplayıcı aynı modele geçirildi.
- Finans motorları ve sektör formülleri değiştirilmedi.
`, "utf8");

await rm("scripts/apply-single-input-mode.mjs", { force: true });
await rm(".github/workflows/apply-single-input-mode.yml", { force: true });
