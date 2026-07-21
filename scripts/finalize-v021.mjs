import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(ROOT, file), "utf8");
const write = (file, content) => writeFile(path.join(ROOT, file), content, "utf8");

function replaceRequired(content, from, to, file) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) throw new Error(`${file} içinde beklenen geçiş işareti bulunamadı: ${from.slice(0, 100)}`);
  return content.replace(from, to);
}

const TRACKING_ELEMENTS = `      toggleButton: elements.trackingButton,
      panel: elements.trackingPanel,
      summary: elements.trackingSummary,
      table: elements.trackingTable,
      trends: elements.trackingTrends,
      closeButton: elements.trackingCloseButton,
      csvButton: elements.trackingCsvButton,
      reportButton: elements.trackingReportButton,`;

const TRACKING_PANEL = `<section id="trackingPanel" class="panel-card tracking-panel" hidden><div class="section-heading"><div><p class="eyebrow">BÜTÇE · GERÇEKLEŞEN</p><h2>Tahmin–Gerçekleşen Takibi</h2></div><div class="tracking-actions"><button id="trackingCsvButton" class="secondary-button" type="button">Takip CSV</button><button id="trackingReportButton" class="secondary-button" type="button">Takip Raporu</button><button id="trackingCloseButton" class="secondary-button" type="button">Kapat</button></div></div><p class="subtitle">Aylık gerçekleşen tahsilat, gider, nakit ve sapma nedenlerini sektör ve iş türü bazında kaydedin.</p><div id="trackingSummary" class="tracking-summary"></div><div class="table-scroll tracking-table-scroll"><table id="trackingTable" class="tracking-table"></table></div><div id="trackingTrends" class="tracking-trends"></div></section>`;

async function patchApp() {
  const file = "src/app.js";
  let content = await read(file);
  content = replaceRequired(content,
    `import { exportFinancialReport } from "./report/report-controller.js";\n`,
    `import { exportFinancialReport } from "./report/report-controller.js";\nimport { createTrackingController } from "./tracking/tracking-controller.js";\n`, file);
  content = replaceRequired(content,
    `  reportButton: document.querySelector("#reportButton"),\n  printButton: document.querySelector("#printButton"),`,
    `  reportButton: document.querySelector("#reportButton"),\n  trackingButton: document.querySelector("#trackingButton"),\n  trackingPanel: document.querySelector("#trackingPanel"),\n  trackingSummary: document.querySelector("#trackingSummary"),\n  trackingTable: document.querySelector("#trackingTable"),\n  trackingTrends: document.querySelector("#trackingTrends"),\n  trackingCloseButton: document.querySelector("#trackingCloseButton"),\n  trackingCsvButton: document.querySelector("#trackingCsvButton"),\n  trackingReportButton: document.querySelector("#trackingReportButton"),\n  printButton: document.querySelector("#printButton"),`, file);
  content = replaceRequired(content,
    `let state = loadState();\nlet lastRendered = null;\n`,
    `let state = loadState();\nlet lastRendered = null;\nconst trackingController = createTrackingController({\n  elements: {\n${TRACKING_ELEMENTS.replaceAll("      ", "    ")}\n  },\n  getContext: () => lastRendered,\n});\n`, file);
  content = replaceRequired(content,
    `  lastRendered = { sector, scenarioId: sectorState.activeScenario, inputs, result, presentation, scenarios };\n}`,
    `  lastRendered = { sector, scenarioId: sectorState.activeScenario, inputs, result, presentation, scenarios };\n  trackingController.render();\n}`, file);
  await write(file, content);
}

async function patchStandaloneRuntime() {
  const file = "src/standalone-runtime.js";
  let content = await read(file);
  content = replaceRequired(content,
    `import { exportFinancialReport } from "./report/report-controller.js";\n`,
    `import { exportFinancialReport } from "./report/report-controller.js";\nimport { createTrackingController } from "./tracking/tracking-controller.js";\n`, file);
  content = replaceRequired(content,
    `    reportButton: document.querySelector("#reportButton"),\n    printButton: document.querySelector("#printButton"),`,
    `    reportButton: document.querySelector("#reportButton"),\n    trackingButton: document.querySelector("#trackingButton"),\n    trackingPanel: document.querySelector("#trackingPanel"),\n    trackingSummary: document.querySelector("#trackingSummary"),\n    trackingTable: document.querySelector("#trackingTable"),\n    trackingTrends: document.querySelector("#trackingTrends"),\n    trackingCloseButton: document.querySelector("#trackingCloseButton"),\n    trackingCsvButton: document.querySelector("#trackingCsvButton"),\n    trackingReportButton: document.querySelector("#trackingReportButton"),\n    printButton: document.querySelector("#printButton"),`, file);
  content = replaceRequired(content,
    `  let state = loadState();\n  let lastRendered = null;\n`,
    `  let state = loadState();\n  let lastRendered = null;\n  const trackingController = createTrackingController({\n    elements: {\n${TRACKING_ELEMENTS}\n    },\n    getContext: () => lastRendered,\n  });\n`, file);
  content = replaceRequired(content,
    `    lastRendered = { sector, scenarioId: state.activeScenario, inputs, result, presentation, scenarios };\n  }`,
    `    lastRendered = { sector, scenarioId: state.activeScenario, inputs, result, presentation, scenarios };\n    trackingController.render();\n  }`, file);
  await write(file, content);
}

async function patchIndex() {
  const file = "index.html";
  let content = await read(file);
  content = content.replace("BUSINESS INCOME CALCULATOR · v0.20.0", "BUSINESS INCOME CALCULATOR · v0.21.0");
  content = replaceRequired(content,
    `<button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="printButton"`,
    `<button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="trackingButton" class="secondary-button" type="button" aria-expanded="false">Gerçek Takip</button><button id="printButton"`, file);
  content = replaceRequired(content,
    `<section><div class="section-heading"><div><p class="eyebrow">RİSK KONTROLÜ</p>`,
    `${TRACKING_PANEL}<section><div class="section-heading"><div><p class="eyebrow">RİSK KONTROLÜ</p>`, file);
  await write(file, content);
}

async function patchStandaloneBuilder() {
  const file = "scripts/build-standalone.mjs";
  let content = await read(file);
  content = content.replace("TEK DOSYA · v0.20.0", "TEK DOSYA · v0.21.0");
  content = replaceRequired(content,
    `<button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="printButton"`,
    `<button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="trackingButton" class="secondary-button" type="button" aria-expanded="false">Gerçek Takip</button><button id="printButton"`, file);
  content = replaceRequired(content,
    `<section><div class="section-heading"><div><p class="eyebrow">RİSK KONTROLÜ</p>`,
    `${TRACKING_PANEL}<section><div class="section-heading"><div><p class="eyebrow">RİSK KONTROLÜ</p>`, file);
  await write(file, content);
}

async function patchStyles() {
  const addition = `\n\n/* v0.21 gerçek takip modu */\n.tracking-panel[hidden]{display:none}.tracking-actions{display:flex;gap:8px;flex-wrap:wrap}.tracking-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:16px 0}.tracking-summary-card{border:1px solid #dbe3de;border-radius:10px;padding:14px;background:#f9fbf9}.tracking-summary-card span,.tracking-summary-card small{display:block;color:#66746e;font-size:12px}.tracking-summary-card strong{display:block;margin:7px 0;font-size:18px}.tracking-status{font-size:14px!important}.tracking-status.on_track{color:#17603b}.tracking-status.watch{color:#795b08}.tracking-status.off_track{color:#9b3029}.tracking-table-scroll{max-height:560px}.tracking-table{min-width:2200px}.tracking-table th{position:sticky;top:0;z-index:2;background:#f2f6f3}.tracking-table input,.tracking-table select{min-width:118px;padding:7px;border:1px solid #cfd9d3;border-radius:6px;background:white}.tracking-table input[type=month]{min-width:145px;display:block;margin-top:5px}.tracking-table input[type=text]{min-width:200px}.tracking-variance.positive{color:#17603b}.tracking-variance.negative{color:#a1322b}.tracking-trends{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}.tracking-trend-item{border:1px solid #dbe3de;border-radius:10px;padding:12px}.tracking-trend-item span,.tracking-trend-item small{display:block;color:#66746e;font-size:12px}.tracking-trend-item strong{display:block;margin:5px 0}@media(max-width:900px){.tracking-summary,.tracking-trends{grid-template-columns:1fr 1fr}}@media(max-width:560px){.tracking-summary,.tracking-trends{grid-template-columns:1fr}}\n`;
  for (const file of ["styles.css", "styles-advanced.css"]) {
    let content = await read(file);
    if (file === "styles-advanced.css" && !content.includes("/* v0.21 gerçek takip modu */")) content += addition;
    await write(file, content);
  }
}

async function patchTests() {
  const smokeFile = "tests/app-smoke.test.mjs";
  let smoke = await read(smokeFile);
  smoke = smoke.replace(/v0\\\.20\\\.0/g, "v0\\.21\\.0");
  smoke = replaceRequired(smoke,
    `    this.checked = false;\n    this.listeners = new Map();`,
    `    this.checked = false;\n    this.hidden = false;\n    this.attributes = new Map();\n    this.listeners = new Map();`, smokeFile);
  smoke = replaceRequired(smoke,
    `  addEventListener(type, handler) { this.listeners.set(type, handler); }\n`,
    `  addEventListener(type, handler) { this.listeners.set(type, handler); }\n  setAttribute(name, value) { this.attributes.set(name, String(value)); }\n`, smokeFile);
  smoke = replaceRequired(smoke,
    `"formSections", "resetButton", "exportCsvButton", "reportButton", "printButton", "warnings",`,
    `"formSections", "resetButton", "exportCsvButton", "reportButton", "trackingButton", "trackingPanel", "trackingSummary", "trackingTable", "trackingTrends", "trackingCloseButton", "trackingCsvButton", "trackingReportButton", "printButton", "warnings",`, smokeFile);
  smoke = replaceRequired(smoke,
    `"#formSections", "#resetButton", "#exportCsvButton", "#reportButton", "#printButton", "#warnings",`,
    `"#formSections", "#resetButton", "#exportCsvButton", "#reportButton", "#trackingButton", "#trackingPanel", "#trackingSummary", "#trackingTable", "#trackingTrends", "#trackingCloseButton", "#trackingCsvButton", "#trackingReportButton", "#printButton", "#warnings",`, smokeFile);
  smoke = replaceRequired(smoke,
    `  assert.match(elements.get("#pageTitle").textContent, /Kafe \/ Restoran/);`,
    `  assert.match(elements.get("#pageTitle").textContent, /Kafe \/ Restoran/);\n  assert.match(html, /Gerçek Takip/);\n  assert.match(html, /Tahmin–Gerçekleşen Takibi/);`, smokeFile);
  await write(smokeFile, smoke);

  const standaloneFile = "tests/standalone-build.test.mjs";
  let standalone = await read(standaloneFile);
  standalone = replaceRequired(standalone,
    `      assert.match(html, /Rapor \\/ HTML/);\n      assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);`,
    `      assert.match(html, /Rapor \\/ HTML/);\n      assert.match(html, /Gerçek Takip/);\n      assert.match(html, /Tahmin–Gerçekleşen Takibi/);\n      assert.match(html, /GERÇEK TAKİP RAPORU/);\n      assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);`, standaloneFile);
  await write(standaloneFile, standalone);
}

async function patchPackage() {
  const file = "package.json";
  const content = (await read(file)).replace('"version":"0.20.0"', '"version":"0.21.0"');
  await write(file, content);
}

await patchApp();
await patchStandaloneRuntime();
await patchIndex();
await patchStandaloneBuilder();
await patchStyles();
await patchTests();
await patchPackage();
console.log("v0.21 gerçek takip modu ana ve bağımsız uygulamalara bağlandı.");
