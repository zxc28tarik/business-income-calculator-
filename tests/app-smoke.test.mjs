import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SECTORS } from "../src/sectors/registry.js";
import { renderFormHtml } from "../src/ui/form-view.js";

async function readApplicationHtml() {
  return readFile(new URL("../index.html", import.meta.url), "utf8");
}

test("index.html temiz UTF-8, eksiksiz kabuk ve muhasebe uyarısı içerir", async () => {
  const html = await readApplicationHtml();
  assert.match(html, /<meta charset="UTF-8"\s*\/>/);
  assert.match(html, /BUSINESS INCOME CALCULATOR · v0\.24\.2/);
  assert.match(html, /Sektör Bazlı Finansal Fizibilite/);
  assert.match(html, /Brüt cirodan net kâra/);
  assert.match(html, /mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir/);
  assert.match(html, /<script type="module" src="\.\/src\/app\.js"><\/script>/);
  assert.match(html, /<\/body>\s*<\/html>\s*$/);

  for (const marker of ["Ã", "Å", "Ä", "Â", "�"]) {
    assert.equal(html.includes(marker), false, `index.html bozuk kodlama işareti içeriyor: ${marker}`);
  }

  const requiredIds = [
    "projectSelect", "projectNewButton", "projectRenameButton", "projectDuplicateButton",
    "portfolioButton", "portfolioPanel", "portfolioTable", "portfolioDeleteButton", "portfolioCloseButton",
    "backupExportButton", "backupImportButton", "backupImportInput", "recordMenuButton", "recordMenu",
    "exportMenuButton", "exportMenu", "exportMenuReportButton", "dataMenuButton", "dataMenu",
    "moreMenuButton", "moreMenu", "sectorSelect", "pageTitle", "pageSubtitle", "sectorSummary",
    "autosaveStatus", "formSections", "resetButton", "resetDialog", "resetSectorName",
    "resetCancelButton", "resetConfirmButton", "exportCsvButton", "reportButton", "trackingButton",
    "trackingPanel", "trackingSummary", "trackingTable", "trackingTrends", "trackingCloseButton",
    "trackingCsvButton", "trackingReportButton", "setupButton", "setupPanel", "setupCloseButton",
    "setupSyncButton", "setupAddItemButton", "setupProfile", "setupRequirements", "setupItemsTable",
    "setupCashHeading", "setupCashSummary", "printButton", "decisionSummary", "warnings",
    "kpiGrid", "secondaryKpiGrid", "secondaryKpiToggle", "keySplit", "waterfall", "cashFlowTable", "breakdown",
  ];
  for (const id of requiredIds) {
    const matches = html.match(new RegExp(`\\bid="${id}"`, "g")) ?? [];
    assert.equal(matches.length, 1, `${id} gerçek index.html içinde bir kez bulunmalıdır`);
  }
});

test("sekiz sektör tek kullanıcı girdisiyle form ve finans sonucu üretir", () => {
  assert.equal(SECTORS.length, 8);
  for (const sector of SECTORS) {
    const inputs = sector.normalizeInputs(sector.defaultInputs);
    const form = renderFormHtml(sector, inputs);
    const result = sector.calculateModel(inputs);
    const presentation = sector.buildPresentation(result);

    assert.match(form, /class="form-section/);
    assert.match(form, /data-field-wrapper=/);
    assert.doesNotMatch(form, /view-mode-hidden/);
    assert.ok(Array.isArray(result.cashFlow?.rows ?? result.cashFlow?.months));
    assert.ok(Array.isArray(presentation.kpis));
    assert.ok(presentation.kpis.length >= 4, `${sector.id} en az dört gösterge üretmelidir`);
  }
});

test("ana uygulama kaynak kodu gerçek tek girdi ve kuruluş durumunu kullanır", async () => {
  const source = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
  assert.match(source, /createSingleInputSectorState/);
  assert.match(source, /normalizeSingleInputSectorState/);
  assert.match(source, /currentSectorState\(\)\.inputs/);
  assert.match(source, /currentSectorState\(\)\.setup/);
  assert.match(source, /createSetupController/);
  assert.doesNotMatch(source, /state\.activeScenario/);
  assert.doesNotMatch(source, /state\.scenarioInputs/);
  assert.doesNotMatch(source, /renderScenarioTable/);
  assert.doesNotMatch(source, /VIEW_MODE_STORAGE_KEY/);
});
