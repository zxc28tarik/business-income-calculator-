import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(ROOT, file), "utf8");
const write = (file, content) => writeFile(path.join(ROOT, file), content, "utf8");

function replaceRequired(content, from, to, file) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) throw new Error(`${file} içinde beklenen v0.22 geçiş işareti bulunamadı: ${from.slice(0, 120)}`);
  return content.replace(from, to);
}

const PORTFOLIO_PANEL = `<section id="portfolioPanel" class="panel-card portfolio-panel" hidden><div class="section-heading"><div><p class="eyebrow">KAYITLAR · PORTFÖY</p><h2>İşletme ve proje karşılaştırması</h2></div><div class="portfolio-actions"><button id="portfolioDeleteButton" class="secondary-button" type="button">Aktif kaydı sil</button><button id="portfolioCloseButton" class="secondary-button" type="button">Kapat</button></div></div><p class="subtitle">Her kayıt kendi sektör, senaryo, varsayım ve gerçek takip verilerini taşır. Portföy tablosu mevcut finans motorlarının sonuçlarını karşılaştırır.</p><div class="table-scroll"><table id="portfolioTable" class="portfolio-table"></table></div></section>`;

const APP_PORTFOLIO_ELEMENTS = `  projectSelect: document.querySelector("#projectSelect"),
  projectNewButton: document.querySelector("#projectNewButton"),
  projectRenameButton: document.querySelector("#projectRenameButton"),
  projectDuplicateButton: document.querySelector("#projectDuplicateButton"),
  portfolioButton: document.querySelector("#portfolioButton"),
  portfolioPanel: document.querySelector("#portfolioPanel"),
  portfolioTable: document.querySelector("#portfolioTable"),
  portfolioDeleteButton: document.querySelector("#portfolioDeleteButton"),
  portfolioCloseButton: document.querySelector("#portfolioCloseButton"),
  backupExportButton: document.querySelector("#backupExportButton"),
  backupImportButton: document.querySelector("#backupImportButton"),
  backupImportInput: document.querySelector("#backupImportInput"),
`;

const STANDALONE_PORTFOLIO_ELEMENTS = APP_PORTFOLIO_ELEMENTS.replaceAll("  ", "    ");

function controllerElements(indent = "    ") {
  return `${indent}projectSelect: elements.projectSelect,
${indent}newButton: elements.projectNewButton,
${indent}renameButton: elements.projectRenameButton,
${indent}duplicateButton: elements.projectDuplicateButton,
${indent}deleteButton: elements.portfolioDeleteButton,
${indent}toggleButton: elements.portfolioButton,
${indent}panel: elements.portfolioPanel,
${indent}table: elements.portfolioTable,
${indent}closeButton: elements.portfolioCloseButton,
${indent}exportButton: elements.backupExportButton,
${indent}importButton: elements.backupImportButton,
${indent}importInput: elements.backupImportInput,`;
}

async function patchTrackingController() {
  const file = "src/tracking/tracking-controller.js";
  let content = await read(file);
  content = replaceRequired(content,
    `export function createTrackingController({ elements, getContext, storagePrefix = "business-income-calculator:tracking:v0.1" }) {`,
    `export function createTrackingController({ elements, getContext, getProjectId = () => "legacy", storagePrefix = "business-income-calculator:tracking:v0.1" }) {`, file);
  content = replaceRequired(content,
    `  function storageKey(ctx) {
    return \`${"${storagePrefix}:${ctx.sector.id}:${resolveTrackingScope(ctx.inputs)}"}\`;
  }

  function loadRecords(ctx) {
    const key = storageKey(ctx);
    currentStorageKey = key;
    try {
      return normalizeTrackingRecords(JSON.parse(safeGet(key) || "[]"));
    } catch {
      return [];
    }
  }`,
    `  function projectId() {
    return String(getProjectId?.() || "legacy").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) || "legacy";
  }

  function legacyStorageKey(ctx) {
    return \`${"${storagePrefix}:${ctx.sector.id}:${resolveTrackingScope(ctx.inputs)}"}\`;
  }

  function storageKey(ctx) {
    return \`${"${storagePrefix}:${projectId()}:${ctx.sector.id}:${resolveTrackingScope(ctx.inputs)}"}\`;
  }

  function loadRecords(ctx) {
    const key = storageKey(ctx);
    currentStorageKey = key;
    let raw = safeGet(key);
    if (!raw) {
      const legacy = safeGet(legacyStorageKey(ctx));
      if (legacy) {
        raw = legacy;
        safeSet(key, legacy);
      }
    }
    try {
      return normalizeTrackingRecords(JSON.parse(raw || "[]"));
    } catch {
      return [];
    }
  }`, file);
  await write(file, content);
}

async function patchApp() {
  const file = "src/app.js";
  let content = await read(file);
  content = replaceRequired(content,
    `import { createTrackingController } from "./tracking/tracking-controller.js";\n`,
    `import { createTrackingController } from "./tracking/tracking-controller.js";\nimport { createPortfolioController } from "./portfolio/portfolio-controller.js";\nimport { buildProjectFinancialSummary } from "./portfolio/portfolio-summary.js";\n`, file);
  content = replaceRequired(content,
    `const STORAGE_KEY = "business-income-calculator:platform:v0.2";`,
    `const STORAGE_KEY = "business-income-calculator:platform:v0.2";\nconst PORTFOLIO_STORAGE_KEY = "business-income-calculator:portfolio:v0.1";\nconst TRACKING_STORAGE_PREFIX = "business-income-calculator:tracking:v0.1";`, file);
  content = replaceRequired(content,
    `const elements = {\n  sectorSelect: document.querySelector("#sectorSelect"),`,
    `const elements = {\n${APP_PORTFOLIO_ELEMENTS}  sectorSelect: document.querySelector("#sectorSelect"),`, file);
  content = replaceRequired(content,
    `let state = loadState();
let lastRendered = null;
const trackingController = createTrackingController({`,
    `let state = loadState();
let lastRendered = null;
let portfolioController = null;
portfolioController = createPortfolioController({
  elements: {
${controllerElements("    ")}
  },
  storageKey: PORTFOLIO_STORAGE_KEY,
  trackingPrefix: TRACKING_STORAGE_PREFIX,
  appVersion: "0.22.0",
  initialWorkspace: state,
  createWorkspace: createDefaultState,
  normalizeWorkspace: normalizeState,
  getWorkspace: () => state,
  setWorkspace: (workspace) => {
    state = normalizeState(workspace);
    persistLegacyState();
    renderSectorShell();
    render();
  },
  summarizeWorkspace,
});
state = portfolioController.getActiveWorkspace();
persistLegacyState();
const trackingController = createTrackingController({`, file);
  content = replaceRequired(content,
    `  getContext: () => lastRendered,
});`,
    `  getContext: () => lastRendered,
  getProjectId: () => portfolioController.getActiveProjectId(),
  storagePrefix: TRACKING_STORAGE_PREFIX,
});`, file);
  content = replaceRequired(content,
    `function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}`,
    `function persistLegacyState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveState() {
  persistLegacyState();
  portfolioController?.syncActiveWorkspace();
}`, file);
  content = replaceRequired(content,
    `function renderSectorOptions() {`,
    `function summarizeWorkspace(workspace) {
  const normalized = normalizeState(workspace);
  const sector = getSector(normalized.activeSectorId);
  const sectorState = normalized.sectors[sector.id];
  return buildProjectFinancialSummary({
    sector,
    scenarioId: sectorState.activeScenario,
    inputs: sectorState.scenarioInputs[sectorState.activeScenario],
  });
}

function renderSectorOptions() {`, file);
  await write(file, content);
}

async function patchStandaloneRuntime() {
  const file = "src/standalone-runtime.js";
  let content = await read(file);
  content = replaceRequired(content,
    `import { createTrackingController } from "./tracking/tracking-controller.js";\n`,
    `import { createTrackingController } from "./tracking/tracking-controller.js";\nimport { createPortfolioController } from "./portfolio/portfolio-controller.js";\nimport { buildProjectFinancialSummary } from "./portfolio/portfolio-summary.js";\n`, file);
  content = replaceRequired(content,
    `  const storageKey = \`business-income-calculator:standalone:${"${sector.id}:${sector.version}"}\`;\n  const elements = {`,
    `  const storageKey = \`business-income-calculator:standalone:${"${sector.id}:${sector.version}"}\`;\n  const portfolioStorageKey = \`business-income-calculator:standalone-portfolio:${"${sector.id}"}:v0.1\`;\n  const trackingStoragePrefix = "business-income-calculator:tracking:v0.1";\n  const elements = {\n${STANDALONE_PORTFOLIO_ELEMENTS}`, file);
  content = replaceRequired(content,
    `  let state = loadState();
  let lastRendered = null;
  const trackingController = createTrackingController({`,
    `  let state = loadState();
  let lastRendered = null;
  let portfolioController = null;
  portfolioController = createPortfolioController({
    elements: {
${controllerElements("      ")}
    },
    storageKey: portfolioStorageKey,
    trackingPrefix: trackingStoragePrefix,
    appVersion: "0.22.0",
    initialWorkspace: state,
    createWorkspace: createDefaultState,
    normalizeWorkspace: normalizeState,
    getWorkspace: () => state,
    setWorkspace: (workspace) => {
      state = normalizeState(workspace);
      persistLegacyState();
      renderShell();
      render();
    },
    summarizeWorkspace,
    initialName: sector.name,
  });
  state = portfolioController.getActiveWorkspace();
  persistLegacyState();
  const trackingController = createTrackingController({`, file);
  content = replaceRequired(content,
    `    getContext: () => lastRendered,
  });`,
    `    getContext: () => lastRendered,
    getProjectId: () => portfolioController.getActiveProjectId(),
    storagePrefix: trackingStoragePrefix,
  });`, file);
  content = replaceRequired(content,
    `  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // file:// veya gizli mod yerel depolamayı engellerse hesap çalışmaya devam eder.
    }
  }`,
    `  function persistLegacyState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // file:// veya gizli mod yerel depolamayı engellerse hesap çalışmaya devam eder.
    }
  }

  function saveState() {
    persistLegacyState();
    portfolioController?.syncActiveWorkspace();
  }`, file);
  content = replaceRequired(content,
    `  function renderShell() {`,
    `  function summarizeWorkspace(workspace) {
    const normalized = normalizeState(workspace);
    return buildProjectFinancialSummary({
      sector,
      scenarioId: normalized.activeScenario,
      inputs: normalized.scenarioInputs[normalized.activeScenario],
    });
  }

  function renderShell() {`, file);
  await write(file, content);
}

function topbarReplacement(content, file, standalone = false) {
  const prefix = standalone
    ? `<div class="topbar-actions"><button id="exportCsvButton"`
    : `<div class="topbar-actions"><label class="sector-picker" for="sectorSelect">`;
  const controls = `<div class="topbar-actions"><label class="project-picker" for="projectSelect"><span>Kayıt</span><select id="projectSelect"></select></label><button id="projectNewButton" class="secondary-button" type="button">Yeni</button><button id="projectRenameButton" class="secondary-button" type="button">Adlandır</button><button id="projectDuplicateButton" class="secondary-button" type="button">Kopyala</button><button id="portfolioButton" class="secondary-button" type="button" aria-expanded="false">Portföy</button><button id="backupExportButton" class="secondary-button" type="button">Yedek</button><button id="backupImportButton" class="secondary-button" type="button">İçe Aktar</button><input id="backupImportInput" type="file" accept="application/json,.json" hidden />${standalone ? `<button id="exportCsvButton"` : `<label class="sector-picker" for="sectorSelect">`}`;
  return replaceRequired(content, prefix, controls, file);
}

async function patchIndex() {
  const file = "index.html";
  let content = await read(file);
  content = content.replace("BUSINESS INCOME CALCULATOR · v0.21.0", "BUSINESS INCOME CALCULATOR · v0.22.0");
  content = topbarReplacement(content, file, false);
  content = replaceRequired(content,
    `<section id="trackingPanel"`,
    `${PORTFOLIO_PANEL}<section id="trackingPanel"`, file);
  await write(file, content);
}

async function patchStandaloneBuilder() {
  const file = "scripts/build-standalone.mjs";
  let content = await read(file);
  content = content.replace("TEK DOSYA · v0.21.0", "TEK DOSYA · v0.22.0");
  content = topbarReplacement(content, file, true);
  content = replaceRequired(content,
    `<section id="trackingPanel"`,
    `${PORTFOLIO_PANEL}<section id="trackingPanel"`, file);
  await write(file, content);
}

async function patchStyles() {
  const file = "styles-advanced.css";
  let content = await read(file);
  const addition = `\n\n/* v0.22 çoklu işletme ve portföy */\n.project-picker{display:flex;align-items:center;gap:7px}.project-picker span{font-size:12px;color:#66746e}.project-picker select{min-width:160px}.portfolio-panel[hidden]{display:none}.portfolio-actions{display:flex;gap:8px;flex-wrap:wrap}.portfolio-table{min-width:980px}.portfolio-table td:first-child small{display:block;color:#66746e;margin-top:4px}.portfolio-status{display:inline-block;padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700}.portfolio-status.dengeli{background:#e3f4e9;color:#17603b}.portfolio-status.dikkat{background:#fff3cf;color:#795b08}.portfolio-status.riskli{background:#fde6e3;color:#9b3029}@media(max-width:900px){.project-picker{width:100%}.project-picker select{flex:1}}\n`;
  if (!content.includes("/* v0.22 çoklu işletme ve portföy */")) content += addition;
  await write(file, content);
}

async function patchTests() {
  const smokeFile = "tests/app-smoke.test.mjs";
  let smoke = await read(smokeFile);
  smoke = smoke.replace(/v0\\\.21\\\.0/g, "v0\\.22\\.0");
  smoke = replaceRequired(smoke,
    `    "sectorSelect", "pageTitle",`,
    `    "projectSelect", "projectNewButton", "projectRenameButton", "projectDuplicateButton", "portfolioButton", "portfolioPanel", "portfolioTable", "portfolioDeleteButton", "portfolioCloseButton", "backupExportButton", "backupImportButton", "backupImportInput", "sectorSelect", "pageTitle",`, smokeFile);
  smoke = replaceRequired(smoke,
    `    "#sectorSelect", "#pageTitle",`,
    `    "#projectSelect", "#projectNewButton", "#projectRenameButton", "#projectDuplicateButton", "#portfolioButton", "#portfolioPanel", "#portfolioTable", "#portfolioDeleteButton", "#portfolioCloseButton", "#backupExportButton", "#backupImportButton", "#backupImportInput", "#sectorSelect", "#pageTitle",`, smokeFile);
  smoke = replaceRequired(smoke,
    `    setItem(key, value) { store.set(key, value); },\n  };`,
    `    setItem(key, value) { store.set(key, value); },\n    removeItem(key) { store.delete(key); },\n    key(index) { return [...store.keys()][index] ?? null; },\n    get length() { return store.size; },\n  };`, smokeFile);
  smoke = replaceRequired(smoke,
    `  assert.match(html, /Tahmin–Gerçekleşen Takibi/);`,
    `  assert.match(html, /Tahmin–Gerçekleşen Takibi/);\n  assert.match(html, /İşletme ve proje karşılaştırması/);\n  assert.match(elements.get("#projectSelect").innerHTML, /İlk işletmem/);`, smokeFile);
  await write(smokeFile, smoke);

  const standaloneFile = "tests/standalone-build.test.mjs";
  let standalone = await read(standaloneFile);
  standalone = replaceRequired(standalone,
    `      assert.match(html, /Gerçek Takip/);`,
    `      assert.match(html, /Gerçek Takip/);\n      assert.match(html, /Portföy/);\n      assert.match(html, /business-income-calculator-backup-v1/);\n      assert.match(html, /İşletme ve proje karşılaştırması/);`, standaloneFile);
  await write(standaloneFile, standalone);
}

async function patchPackage() {
  const file = "package.json";
  const content = (await read(file)).replace('"version":"0.21.0"', '"version":"0.22.0"');
  await write(file, content);
}

await patchTrackingController();
await patchApp();
await patchStandaloneRuntime();
await patchIndex();
await patchStandaloneBuilder();
await patchStyles();
await patchTests();
await patchPackage();
console.log("v0.22 çoklu işletme, yedekleme ve portföy karşılaştırması bağlandı.");
