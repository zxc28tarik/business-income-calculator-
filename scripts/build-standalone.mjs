import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "standalone");

export const STANDALONE_SECTORS = [
  { id: "cafe_restaurant", name: "Kafe / Restoran", file: "cafe-restaurant-calculator.html", module: "src/sectors/cafe-restaurant.js", exportName: "CAFE_SECTOR" },
  { id: "ecommerce_marketplace", name: "E-Ticaret / Pazaryeri", file: "ecommerce-marketplace-calculator.html", module: "src/sectors/ecommerce.js", exportName: "ECOMMERCE_SECTOR" },
  { id: "beauty_personal_care", name: "Güzellik / Kuaför / Bakım", file: "beauty-personal-care-calculator.html", module: "src/sectors/beauty-v2.js", exportName: "BEAUTY_SECTOR" },
  { id: "agency_freelance_consulting", name: "Ajans / Freelancer / Danışmanlık", file: "agency-freelance-consulting-calculator.html", module: "src/sectors/agency-v2.js", exportName: "AGENCY_SECTOR" },
  { id: "saas_subscription", name: "SaaS / Abonelik", file: "saas-subscription-calculator.html", module: "src/sectors/saas-v2.js", exportName: "SAAS_SECTOR" },
  { id: "physical_retail", name: "Fiziksel Perakende", file: "physical-retail-calculator.html", module: "src/sectors/retail-v2.js", exportName: "RETAIL_SECTOR" },
  { id: "auto_services", name: "Oto Hizmetleri", file: "auto-services-calculator.html", module: "src/sectors/auto-v2.js", exportName: "AUTO_SERVICE_SECTOR" },
  { id: "game_digital_publishing", name: "Oyun / Dijital Yayıncılık", file: "game-digital-publishing-calculator.html", module: "src/sectors/steam-publisher.js", exportName: "STEAM_PUBLISHER_SECTOR" },
];

const IMPORT_PATTERN = /(?:\bfrom\s*|\bimport\s*)["']([^"']+)["']/g;

function normalizeModulePath(value) {
  return path.posix.normalize(value.replaceAll("\\", "/")).replace(/^\.\//, "");
}

function resolveDependency(fromModule, specifier) {
  if (!specifier.startsWith(".")) {
    throw new Error(`Standalone paketi harici modül içeremez: ${fromModule} -> ${specifier}`);
  }
  return normalizeModulePath(path.posix.join(path.posix.dirname(fromModule), specifier));
}

async function collectModule(moduleId, modules, visiting) {
  const normalizedId = normalizeModulePath(moduleId);
  if (modules.has(normalizedId)) return;
  if (visiting.has(normalizedId)) throw new Error(`Döngüsel modül bağı bulundu: ${normalizedId}`);
  visiting.add(normalizedId);

  const absolutePath = path.join(ROOT, normalizedId);
  let source = await readFile(absolutePath, "utf8");
  const dependencies = [];
  source = source.replace(IMPORT_PATTERN, (fullMatch, specifier) => {
    if (!specifier.startsWith(".")) {
      throw new Error(`Standalone paketi harici modül içeremez: ${normalizedId} -> ${specifier}`);
    }
    const target = resolveDependency(normalizedId, specifier);
    dependencies.push(target);
    return fullMatch.replace(specifier, `__BIC_MODULE__${target}`);
  });

  modules.set(normalizedId, { source, dependencies: [...new Set(dependencies)] });
  for (const dependency of dependencies) await collectModule(dependency, modules, visiting);
  visiting.delete(normalizedId);
}

function safeJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function buildEntrySource(sector) {
  return `import { ${sector.exportName} as sector } from "./${sector.module}";\nimport { mountStandaloneCalculator } from "./src/standalone-runtime.js";\nmountStandaloneCalculator(sector);\n`;
}

function buildBootstrap(modules, entryId) {
  const sourceMap = Object.fromEntries([...modules.entries()].map(([id, record]) => [id, record.source]));
  const dependencyMap = Object.fromEntries([...modules.entries()].map(([id, record]) => [id, record.dependencies]));
  return `
const moduleSources = ${safeJson(sourceMap)};
const moduleDependencies = ${safeJson(dependencyMap)};
const moduleUrls = Object.create(null);
const building = new Set();
function buildModuleUrl(moduleId) {
  if (moduleUrls[moduleId]) return moduleUrls[moduleId];
  if (building.has(moduleId)) throw new Error("Döngüsel modül: " + moduleId);
  const original = moduleSources[moduleId];
  if (typeof original !== "string") throw new Error("Eksik modül: " + moduleId);
  building.add(moduleId);
  let source = original;
  for (const dependency of moduleDependencies[moduleId] || []) {
    const dependencyUrl = buildModuleUrl(dependency);
    source = source.split("__BIC_MODULE__" + dependency).join(dependencyUrl);
  }
  const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  moduleUrls[moduleId] = url;
  building.delete(moduleId);
  return url;
}
import(buildModuleUrl(${safeJson(entryId)})).catch((error) => {
  console.error(error);
  const target = document.querySelector("#startupError");
  if (target) {
    target.hidden = false;
    target.textContent = "Hesaplayıcı başlatılamadı: " + (error?.message || error);
  }
});
`;
}

function buildHtml({ sector, css, bootstrap, moduleCount }) {
  return `<!doctype html>
<html lang="tr" data-sector-id="${sector.id}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="${sector.name} için çevrimdışı çalışan tek dosyalık finansal fizibilite hesaplayıcısı." />
<title>Business Income Calculator · ${sector.name}</title>
<style>${css}</style>
</head>
<body>
<header class="topbar"><div><p class="eyebrow">BUSINESS INCOME CALCULATOR · TEK DOSYA · v0.21.0</p><h1 id="pageTitle">${sector.name} Finansal Fizibilite</h1><p id="pageSubtitle" class="subtitle">Çevrimdışı tek dosyalık sektör hesaplayıcısı.</p></div><div class="topbar-actions"><button id="exportCsvButton" class="secondary-button" type="button">CSV / Excel</button><button id="reportButton" class="secondary-button" type="button">Rapor / HTML</button><button id="trackingButton" class="secondary-button" type="button" aria-expanded="false">Gerçek Takip</button><button id="printButton" class="secondary-button" type="button">Yazdır / PDF</button><button id="resetButton" class="secondary-button" type="button">Varsayılanlara dön</button></div></header>
<main class="layout"><aside class="input-panel" aria-label="Hesaplama girdileri"><section class="sector-summary" id="sectorSummary"></section><div class="scenario-switcher" id="scenarioSwitcher" aria-label="Senaryo seçimi"></div><div id="formSections"></div></aside><section class="results-panel" aria-live="polite">
<p id="startupError" class="disclaimer" hidden></p>
<section id="trackingPanel" class="panel-card tracking-panel" hidden><div class="section-heading"><div><p class="eyebrow">BÜTÇE · GERÇEKLEŞEN</p><h2>Tahmin–Gerçekleşen Takibi</h2></div><div class="tracking-actions"><button id="trackingCsvButton" class="secondary-button" type="button">Takip CSV</button><button id="trackingReportButton" class="secondary-button" type="button">Takip Raporu</button><button id="trackingCloseButton" class="secondary-button" type="button">Kapat</button></div></div><p class="subtitle">Aylık gerçekleşen tahsilat, gider, nakit ve sapma nedenlerini sektör ve iş türü bazında kaydedin.</p><div id="trackingSummary" class="tracking-summary"></div><div class="table-scroll tracking-table-scroll"><table id="trackingTable" class="tracking-table"></table></div><div id="trackingTrends" class="tracking-trends"></div></section><section><div class="section-heading"><div><p class="eyebrow">RİSK KONTROLÜ</p><h2>Uyarılar</h2></div></div><div id="warnings" class="warnings"></div></section>
<section><div class="section-heading"><div><p class="eyebrow">ANA SONUÇLAR</p><h2>KPI özeti</h2></div></div><div id="kpiGrid" class="kpi-grid"></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">DAĞILIM</p><h2>Kim ne alıyor?</h2></div></div><div id="keySplit" class="key-split"></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">ŞELALE</p><h2>Brüt cirodan net kâra</h2></div></div><div id="waterfall" class="waterfall"></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">KARŞILAŞTIRMA</p><h2>Üç senaryo</h2></div></div><div class="table-scroll"><table id="scenarioTable"></table></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">NAKİT</p><h2>12 aylık nakit akışı</h2></div></div><div class="table-scroll"><table id="cashFlowTable"></table></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">DENETİM İZİ</p><h2>Ayrıntılı döküm</h2></div></div><div id="breakdown" class="breakdown"></div></section>
<p class="disclaimer"><strong>Önemli:</strong> Bu araç ön fizibilite içindir; mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir.</p>
</section></main>
<!-- ${moduleCount} ortak/sektörel JavaScript modülü bu dosyanın içine gömülmüştür. -->
<script type="module">${bootstrap}</script>
</body>
</html>`;
}

export async function buildStandaloneSector(sector, outputDir = DEFAULT_OUTPUT_DIR) {
  const modules = new Map();
  const entryId = `standalone-entry-${sector.id}.js`;
  modules.set(entryId, {
    source: buildEntrySource(sector).replace(IMPORT_PATTERN, (fullMatch, specifier) => {
      const target = resolveDependency(entryId, specifier);
      return fullMatch.replace(specifier, `__BIC_MODULE__${target}`);
    }),
    dependencies: [sector.module, "src/standalone-runtime.js"],
  });
  await collectModule(sector.module, modules, new Set());
  await collectModule("src/standalone-runtime.js", modules, new Set());
  const css = `${await readFile(path.join(ROOT, "styles.css"), "utf8")}\n${await readFile(path.join(ROOT, "styles-advanced.css"), "utf8")}`;
  const html = buildHtml({ sector, css, bootstrap: buildBootstrap(modules, entryId), moduleCount: modules.size });
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, sector.file);
  await writeFile(outputPath, html, "utf8");
  return { ...sector, outputPath, bytes: Buffer.byteLength(html), moduleCount: modules.size };
}

export async function buildAllStandalone(outputDir = DEFAULT_OUTPUT_DIR) {
  const results = [];
  for (const sector of STANDALONE_SECTORS) results.push(await buildStandaloneSector(sector, outputDir));
  return results;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const results = await buildAllStandalone();
  for (const result of results) console.log(`${result.file}: ${result.moduleCount} modül, ${result.bytes} bayt`);
}
