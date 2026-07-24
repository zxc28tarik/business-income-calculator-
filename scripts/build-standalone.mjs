import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "standalone");
const APP_VERSION = "0.24.1";

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
<meta name="theme-color" content="#174a35" />
<title>Business Income Calculator · ${sector.name}</title>
<style>${css}</style>
</head>
<body>
<a class="skip-link" href="#mainContent">Ana içeriğe geç</a>
<header class="topbar">
  <div class="topbar-inner">
    <div class="topbar-brand">
      <p class="eyebrow">BUSINESS INCOME CALCULATOR · TEK DOSYA · v${APP_VERSION}</p>
      <h1 id="pageTitle">${sector.name} Finansal Fizibilite</h1>
      <p id="pageSubtitle" class="subtitle">Çevrimdışı tek dosyalık sektör hesaplayıcısı.</p>
    </div>
    <div class="workspace-context" aria-label="Çalışma alanı">
      <div class="workspace-pickers single-picker">
        <label class="project-picker control-picker" for="projectSelect"><span>İşletme kaydı</span><select id="projectSelect"></select></label>
      </div>
      <div class="primary-actions" aria-label="Ana işlemler">
        <button id="projectNewButton" class="primary-button" type="button">Yeni kayıt</button>
        <button id="trackingButton" class="secondary-button" type="button" aria-expanded="false">Gerçek Takip</button>
        <button id="portfolioButton" class="secondary-button" type="button" aria-expanded="false">Portföy</button>
        <button id="reportButton" class="secondary-button" type="button">Rapor al</button>
      </div>
      <div class="action-menus" aria-label="Diğer işlemler">
        <div class="action-menu">
          <button id="recordMenuButton" class="utility-button menu-button" type="button" aria-expanded="false" aria-controls="recordMenu">Kayıt <span aria-hidden="true">⌄</span></button>
          <div id="recordMenu" class="menu-panel" role="menu" aria-labelledby="recordMenuButton" hidden>
            <button id="projectRenameButton" type="button" role="menuitem" data-menu-action>Adlandır</button>
            <button id="projectDuplicateButton" type="button" role="menuitem" data-menu-action>Kopyala</button>
            <button id="portfolioDeleteButton" class="danger-menu-item" type="button" role="menuitem" data-menu-action>Aktif kaydı sil</button>
          </div>
        </div>
        <div class="action-menu">
          <button id="exportMenuButton" class="utility-button menu-button" type="button" aria-expanded="false" aria-controls="exportMenu">Dışa aktar <span aria-hidden="true">⌄</span></button>
          <div id="exportMenu" class="menu-panel" role="menu" aria-labelledby="exportMenuButton" hidden>
            <button id="exportMenuReportButton" type="button" role="menuitem" data-menu-action>Rapor / HTML</button>
            <button id="exportCsvButton" type="button" role="menuitem" data-menu-action>CSV / Excel</button>
            <button id="printButton" type="button" role="menuitem" data-menu-action>Yazdır / PDF</button>
          </div>
        </div>
        <div class="action-menu">
          <button id="dataMenuButton" class="utility-button menu-button" type="button" aria-expanded="false" aria-controls="dataMenu">Veri <span aria-hidden="true">⌄</span></button>
          <div id="dataMenu" class="menu-panel" role="menu" aria-labelledby="dataMenuButton" hidden>
            <button id="backupExportButton" type="button" role="menuitem" data-menu-action>Tam yedek indir</button>
            <button id="backupImportButton" type="button" role="menuitem" data-menu-action>Yedek içe aktar</button>
          </div>
        </div>
        <div class="action-menu">
          <button id="moreMenuButton" class="utility-button menu-button" type="button" aria-expanded="false" aria-controls="moreMenu">Diğer <span aria-hidden="true">⌄</span></button>
          <div id="moreMenu" class="menu-panel" role="menu" aria-labelledby="moreMenuButton" hidden>
            <button id="resetButton" class="danger-menu-item" type="button" role="menuitem" data-menu-action>Sektör verisini sıfırla</button>
            <a href="#usageDisclaimer" role="menuitem" data-menu-action>Yardım / kullanım sınırı</a>
          </div>
        </div>
      </div>
      <input id="backupImportInput" type="file" accept="application/json,.json" aria-label="Yedek dosyası seç" hidden />
    </div>
  </div>
</header>
<main id="mainContent" class="layout"><aside class="input-panel" aria-label="Hesaplama girdileri"><section class="sector-summary" id="sectorSummary"></section><div class="scenario-toolbar"><div class="scenario-control-row"><div class="scenario-switcher" id="scenarioSwitcher" aria-label="Senaryo seçimi" hidden aria-hidden="true"></div><div id="viewModeSwitcher" class="view-mode-switcher" role="group" aria-label="Form görünümü" hidden aria-hidden="true"><button type="button" data-view-mode="simple" aria-pressed="false">Basit</button><button type="button" data-view-mode="advanced" aria-pressed="true">Gelişmiş</button></div></div><div class="toolbar-status"><p id="viewModeNote" class="view-mode-note">Tüm hesaplama alanları gösteriliyor.</p><p id="autosaveStatus" class="autosave-status" data-state="saved" aria-live="polite">Kaydedildi</p></div></div><div id="formSections"></div></aside><section class="results-panel" aria-live="polite">
<p id="startupError" class="disclaimer" hidden></p>
<section id="portfolioPanel" class="panel-card portfolio-panel" aria-label="İşletme ve proje karşılaştırması" hidden><div class="section-heading"><div><p class="eyebrow">KAYITLAR · PORTFÖY</p><h2>İşletme ve proje karşılaştırması</h2></div><div class="portfolio-actions"><button id="portfolioCloseButton" class="secondary-button" type="button">Kapat</button></div></div><p class="subtitle">Her kayıt kendi sektör, kullanıcı girdileri ve gerçek takip verilerini taşır. Portföy tablosu mevcut finans motorlarının sonuçlarını karşılaştırır.</p><div class="table-scroll" role="region" aria-label="Portföy karşılaştırma tablosu" tabindex="0"><table id="portfolioTable" class="portfolio-table"></table></div></section><section id="trackingPanel" class="panel-card tracking-panel" aria-label="Tahmin ve gerçekleşen takibi" hidden><div class="section-heading"><div><p class="eyebrow">BÜTÇE · GERÇEKLEŞEN</p><h2>Tahmin–Gerçekleşen Takibi</h2></div><div class="tracking-actions"><button id="trackingCsvButton" class="secondary-button" type="button">Takip CSV</button><button id="trackingReportButton" class="secondary-button" type="button">Takip Raporu</button><button id="trackingCloseButton" class="secondary-button" type="button">Kapat</button></div></div><p class="subtitle">Aylık gerçekleşen tahsilat, gider, nakit ve sapma nedenlerini sektör ve iş türü bazında kaydedin.</p><div id="trackingSummary" class="tracking-summary"></div><div class="table-scroll tracking-table-scroll" role="region" aria-label="Aylık gerçekleşen veri tablosu" tabindex="0"><table id="trackingTable" class="tracking-table"></table></div><div id="trackingTrends" class="tracking-trends"></div></section>
<section class="result-section decision-section" aria-labelledby="decisionHeading"><div class="section-heading"><div><p class="eyebrow">KARAR ÖZETİ</p><h2 id="decisionHeading">Bu model ne söylüyor?</h2></div></div><div id="decisionSummary"></div></section>
<section class="result-section kpi-section"><div class="section-heading"><div><p class="eyebrow">ANA SONUÇLAR</p><h2>Dört ana gösterge</h2></div></div><div id="kpiGrid" class="kpi-grid"></div></section>
<section class="result-section warning-section"><div class="section-heading"><div><p class="eyebrow">RİSK KONTROLÜ</p><h2>Kritik uyarılar</h2></div></div><div id="warnings" class="warnings"></div></section>
<section class="result-section secondary-kpi-section"><div class="section-heading"><div><p class="eyebrow">AYRINTILI GÖSTERGELER</p><h2>İkincil göstergeler</h2></div><button id="secondaryKpiToggle" class="secondary-button disclosure-button" type="button" aria-expanded="false" aria-controls="secondaryKpiGrid">Tüm göstergeleri göster</button></div><div id="secondaryKpiGrid" class="kpi-grid secondary-kpi-grid" data-expanded="false"></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">DAĞILIM</p><h2>Kim ne alıyor?</h2></div></div><div id="keySplit" class="key-split"></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">ŞELALE</p><h2>Brüt cirodan net kâra</h2></div></div><div id="waterfall" class="waterfall"></div></section>
<section class="panel-card" hidden aria-hidden="true"><div class="section-heading"><div><p class="eyebrow">KARŞILAŞTIRMA</p><h2>Üç senaryo</h2></div></div><div class="table-scroll" role="region" aria-label="Senaryo karşılaştırma tablosu" tabindex="0"><table id="scenarioTable"></table></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">NAKİT</p><h2>12 aylık nakit akışı</h2></div></div><div class="table-scroll" role="region" aria-label="12 aylık nakit akışı tablosu" tabindex="0"><table id="cashFlowTable"></table></div></section>
<section class="panel-card"><div class="section-heading"><div><p class="eyebrow">DENETİM İZİ</p><h2>Ayrıntılı döküm</h2></div></div><div id="breakdown" class="breakdown"></div></section>
<p id="usageDisclaimer" class="disclaimer"><strong>Önemli:</strong> Bu araç ön fizibilite içindir; mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir.</p>
</section></main>
<dialog id="resetDialog" class="confirmation-dialog" aria-labelledby="resetDialogTitle" aria-describedby="resetDialogDescription">
  <form method="dialog">
    <div class="dialog-icon" aria-hidden="true">!</div>
    <div><p class="eyebrow">GERİ ALINAMAZ İŞLEM</p><h2 id="resetDialogTitle">Sektör verisini sıfırla</h2></div>
    <p id="resetDialogDescription">Bu sektöre ait kayıtlı girdiler varsayılan değerlere döndürülecek.</p>
    <dl class="reset-summary"><div><dt>Sektör</dt><dd id="resetSectorName">—</dd></div><div hidden><dt>Aktif senaryo</dt><dd id="resetScenarioName">—</dd></div></dl>
    <div class="dialog-actions"><button id="resetCancelButton" class="secondary-button" type="button" autofocus>İptal</button><button id="resetConfirmButton" class="danger-confirm-button" type="button">Evet, sektör verisini sıfırla</button></div>
  </form>
</dialog>
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
