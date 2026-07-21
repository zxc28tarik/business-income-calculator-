import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(ROOT, file), "utf8");
const write = (file, content) => writeFile(path.join(ROOT, file), content, "utf8");

function replaceRequired(content, from, to, file) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) throw new Error(`${file} içinde beklenen geçiş işareti bulunamadı: ${from.slice(0, 80)}`);
  return content.replace(from, to);
}

async function patchApp() {
  const file = "src/app.js";
  let content = await read(file);
  content = replaceRequired(content,
    `} from "./ui/results-view.js";\n`,
    `} from "./ui/results-view.js";\nimport { exportFinancialReport } from "./report/report-controller.js";\n`, file);
  content = replaceRequired(content,
    `  exportCsvButton: document.querySelector("#exportCsvButton"),\n  printButton: document.querySelector("#printButton"),`,
    `  exportCsvButton: document.querySelector("#exportCsvButton"),\n  reportButton: document.querySelector("#reportButton"),\n  printButton: document.querySelector("#printButton"),`, file);
  content = replaceRequired(content,
    `  elements.exportCsvButton.addEventListener("click", exportCsv);\n  elements.printButton.addEventListener("click", () => window.print());`,
    `  elements.exportCsvButton.addEventListener("click", exportCsv);\n  elements.reportButton.addEventListener("click", exportReport);\n  elements.printButton.addEventListener("click", () => window.print());`, file);
  content = replaceRequired(content,
    `  lastRendered = { sector, result, presentation };`,
    `  lastRendered = { sector, scenarioId: sectorState.activeScenario, inputs, result, presentation, scenarios };`, file);
  content = replaceRequired(content,
    `function exportCsv() {\n`,
    `function exportReport() {\n  if (!lastRendered) return;\n  exportFinancialReport(lastRendered);\n}\n\nfunction exportCsv() {\n`, file);
  await write(file, content);
}

async function patchStandaloneRuntime() {
  const file = "src/standalone-runtime.js";
  let content = await read(file);
  content = replaceRequired(content,
    `} from "./ui/results-view.js";\n`,
    `} from "./ui/results-view.js";\nimport { exportFinancialReport } from "./report/report-controller.js";\n`, file);
  content = replaceRequired(content,
    `    exportCsvButton: document.querySelector("#exportCsvButton"),\n    printButton: document.querySelector("#printButton"),`,
    `    exportCsvButton: document.querySelector("#exportCsvButton"),\n    reportButton: document.querySelector("#reportButton"),\n    printButton: document.querySelector("#printButton"),`, file);
  content = replaceRequired(content,
    `    elements.exportCsvButton.addEventListener("click", exportCsv);\n    elements.printButton.addEventListener("click", () => window.print());`,
    `    elements.exportCsvButton.addEventListener("click", exportCsv);\n    elements.reportButton.addEventListener("click", exportReport);\n    elements.printButton.addEventListener("click", () => window.print());`, file);
  content = replaceRequired(content,
    `    lastRendered = { result, presentation };`,
    `    lastRendered = { sector, scenarioId: state.activeScenario, inputs, result, presentation, scenarios };`, file);
  content = replaceRequired(content,
    `  function exportCsv() {\n`,
    `  function exportReport() {\n    if (!lastRendered) return;\n    exportFinancialReport(lastRendered);\n  }\n\n  function exportCsv() {\n`, file);
  await write(file, content);
}

async function patchIndex() {
  const file = "index.html";
  let content = await read(file);
  content = content.replace("BUSINESS INCOME CALCULATOR · v0.19.0", "BUSINESS INCOME CALCULATOR · v0.20.0");
  content = replaceRequired(content,
    `<button id="exportCsvButton" class="secondary-button" type="button">CSV / Excel</button><button id="printButton"`,
    `<button id="exportCsvButton" class="secondary-button" type="button">CSV / Excel</button><button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="printButton"`, file);
  await write(file, content);
}

async function patchStandaloneBuilder() {
  const file = "scripts/build-standalone.mjs";
  let content = await read(file);
  content = content.replace("TEK DOSYA · v0.19.0", "TEK DOSYA · v0.20.0");
  content = replaceRequired(content,
    `<button id="exportCsvButton" class="secondary-button" type="button">CSV / Excel</button><button id="printButton"`,
    `<button id="exportCsvButton" class="secondary-button" type="button">CSV / Excel</button><button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="printButton"`, file);
  await write(file, content);
}

async function patchTests() {
  const smokeFile = "tests/app-smoke.test.mjs";
  let smoke = await read(smokeFile);
  smoke = smoke.replace(/v0\\\.19\\\.0/g, "v0\\.20\\.0");
  smoke = replaceRequired(smoke,
    `"formSections", "resetButton", "exportCsvButton", "printButton", "warnings",`,
    `"formSections", "resetButton", "exportCsvButton", "reportButton", "printButton", "warnings",`, smokeFile);
  smoke = replaceRequired(smoke,
    `"#formSections", "#resetButton", "#exportCsvButton", "#printButton", "#warnings",`,
    `"#formSections", "#resetButton", "#exportCsvButton", "#reportButton", "#printButton", "#warnings",`, smokeFile);
  await write(smokeFile, smoke);

  const standaloneFile = "tests/standalone-build.test.mjs";
  let standalone = await read(standaloneFile);
  standalone = replaceRequired(standalone,
    `      assert.match(html, /CSV \\/ Excel/);\n      assert.match(html, /12 aylık nakit akışı/);`,
    `      assert.match(html, /CSV \\/ Excel/);\n      assert.match(html, /Rapor \\/ HTML/);\n      assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);\n      assert.match(html, /12 aylık nakit akışı/);`, standaloneFile);
  await write(standaloneFile, standalone);
}

async function patchPackage() {
  const file = "package.json";
  const content = (await read(file)).replace('"version":"0.19.0"', '"version":"0.20.0"');
  await write(file, content);
}

await patchApp();
await patchStandaloneRuntime();
await patchIndex();
await patchStandaloneBuilder();
await patchTests();
await patchPackage();
console.log("v0.20 rapor katmanı ana ve bağımsız uygulamalara bağlandı.");
