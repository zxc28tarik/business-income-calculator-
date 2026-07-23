import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

class MockElement {
  constructor(tagName = "DIV") {
    this.innerHTML = "";
    this.value = "";
    this.textContent = "";
    this.dataset = {};
    this.tagName = tagName;
    this.type = "";
    this.checked = false;
    this.hidden = false;
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = { toggle() {} };
    this.open = false;
  }

  addEventListener(type, handler) { this.listeners.set(type, handler); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  dispatch(type, target = this, detail = {}) { this.listeners.get(type)?.({ target, ...detail }); }
  querySelectorAll() { return []; }
  click() { this.dispatch("click"); }
  focus() { if (globalThis.document) globalThis.document.activeElement = this; }
  showModal() { this.open = true; }
  close() { this.open = false; this.dispatch("close"); }
}

function extractElementsFromHtml(html) {
  const elements = new Map();
  const pattern = /<([a-z][a-z0-9-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const element = new MockElement(match[1].toUpperCase());
    element.hidden = /\shidden(?:\s|\/?>)/i.test(match[0]);
    elements.set(`#${match[2]}`, element);
  }
  return elements;
}

async function readApplicationHtml() {
  return readFile(new URL("../index.html", import.meta.url), "utf8");
}

test("index.html temiz UTF-8, eksiksiz kabuk ve muhasebe uyarısı içerir", async () => {
  const html = await readApplicationHtml();
  assert.match(html, /<meta charset="UTF-8"\s*\/>/);
  assert.match(html, /BUSINESS INCOME CALCULATOR · v0\.23\.0/);
  assert.match(html, /Sektör Bazlı Finansal Fizibilite/);
  assert.match(html, /Brüt cirodan net kâra/);
  assert.match(html, /mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir/);
  assert.match(html, /<script type="module" src="\.\/src\/app\.js"><\/script>/);
  assert.match(html, /<\/body>\s*<\/html>\s*$/);

  for (const marker of ["Ã", "Å", "Ä", "Â", "�"]) {
    assert.equal(html.includes(marker), false, `index.html bozuk kodlama işareti içeriyor: ${marker}`);
  }

  const requiredIds = [
    "projectSelect", "projectNewButton", "projectRenameButton", "projectDuplicateButton", "portfolioButton", "portfolioPanel", "portfolioTable", "portfolioDeleteButton", "portfolioCloseButton", "backupExportButton", "backupImportButton", "backupImportInput", "recordMenuButton", "recordMenu", "exportMenuButton", "exportMenu", "exportMenuReportButton", "dataMenuButton", "dataMenu", "moreMenuButton", "moreMenu", "sectorSelect", "pageTitle", "pageSubtitle", "sectorSummary", "scenarioSwitcher", "viewModeSwitcher", "viewModeNote", "autosaveStatus",
    "formSections", "resetButton", "resetDialog", "resetSectorName", "resetScenarioName", "resetCancelButton", "resetConfirmButton", "exportCsvButton", "reportButton", "trackingButton", "trackingPanel", "trackingSummary", "trackingTable", "trackingTrends", "trackingCloseButton", "trackingCsvButton", "trackingReportButton", "printButton", "decisionSummary", "warnings",
    "kpiGrid", "secondaryKpiGrid", "secondaryKpiToggle", "keySplit", "waterfall", "scenarioTable", "cashFlowTable", "breakdown",
  ];
  for (const id of requiredIds) {
    const matches = html.match(new RegExp(`\\bid="${id}"`, "g")) ?? [];
    assert.equal(matches.length, 1, `${id} gerçek index.html içinde bir kez bulunmalıdır`);
  }
});

test("gerçek uygulama kabuğu açılır ve tüm sektörler render olur", async () => {
  const html = await readApplicationHtml();
  const elements = extractElementsFromHtml(html);
  const requiredSelectors = [
    "#projectSelect", "#projectNewButton", "#projectRenameButton", "#projectDuplicateButton", "#portfolioButton", "#portfolioPanel", "#portfolioTable", "#portfolioDeleteButton", "#portfolioCloseButton", "#backupExportButton", "#backupImportButton", "#backupImportInput", "#recordMenuButton", "#recordMenu", "#exportMenuButton", "#exportMenu", "#exportMenuReportButton", "#dataMenuButton", "#dataMenu", "#moreMenuButton", "#moreMenu", "#sectorSelect", "#pageTitle", "#pageSubtitle", "#sectorSummary", "#scenarioSwitcher", "#viewModeSwitcher", "#viewModeNote", "#autosaveStatus",
    "#formSections", "#resetButton", "#resetDialog", "#resetSectorName", "#resetScenarioName", "#resetCancelButton", "#resetConfirmButton", "#exportCsvButton", "#reportButton", "#trackingButton", "#trackingPanel", "#trackingSummary", "#trackingTable", "#trackingTrends", "#trackingCloseButton", "#trackingCsvButton", "#trackingReportButton", "#printButton", "#decisionSummary", "#warnings",
    "#kpiGrid", "#secondaryKpiGrid", "#secondaryKpiToggle", "#keySplit", "#waterfall", "#scenarioTable", "#cashFlowTable", "#breakdown",
  ];
  for (const selector of requiredSelectors) assert.ok(elements.has(selector), `${selector} gerçek index.html içinde bulunamadı`);

  const documentListeners = new Map();
  globalThis.document = {
    title: "",
    activeElement: null,
    querySelector(selector) { return elements.get(selector) ?? null; },
    querySelectorAll() { return []; },
    createElement(tagName) { return new MockElement(String(tagName).toUpperCase()); },
    addEventListener(type, handler) { documentListeners.set(type, handler); },
    dispatch(type, event) { documentListeners.get(type)?.(event); },
  };
  globalThis.window = { print() {} };
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) { return store.get(key) ?? null; },
    setItem(key, value) { store.set(key, value); },
    removeItem(key) { store.delete(key); },
    key(index) { return [...store.keys()][index] ?? null; },
    get length() { return store.size; },
  };

  await import(`../src/app.js?smoke=${Date.now()}`);
  const allKpis = () => elements.get("#kpiGrid").innerHTML + elements.get("#secondaryKpiGrid").innerHTML;

  assert.match(elements.get("#pageTitle").textContent, /Kafe \/ Restoran/);
  assert.match(html, /Gerçek Takip/);
  assert.match(html, /Tahmin–Gerçekleşen Takibi/);
  assert.match(html, /İşletme ve proje karşılaştırması/);
  assert.match(elements.get("#projectSelect").innerHTML, /İlk işletmem/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Aylık net k.r/);
  assert.equal((elements.get("#kpiGrid").innerHTML.match(/class="kpi-card/g) ?? []).length, 4);
  assert.match(elements.get("#decisionSummary").innerHTML, /Mevcut varsayımlara göre/);
  assert.match(elements.get("#decisionSummary").innerHTML, /Kritik risk/);
  assert.match(elements.get("#secondaryKpiGrid").innerHTML, /Kurulum maliyeti/);
  assert.equal(elements.get("#secondaryKpiToggle").attributes.get("aria-expanded"), "false");
  assert.match(elements.get("#formSections").innerHTML, /Gelişmiş satış kanalı karmasını kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Ürün \/ kategori karması/);
  assert.match(elements.get("#formSections").innerHTML, /data-field-importance="advanced"/);
  assert.match(elements.get("#formSections").innerHTML, /view-mode-hidden/);
  assert.equal(elements.get("#viewModeNote").textContent, "Yalnız temel varsayımlar gösteriliyor.");
  assert.match(elements.get("#sectorSelect").innerHTML, /E-Ticaret \/ Pazaryeri/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Güzellik \/ Kuaför \/ Bakım/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Ajans \/ Freelancer \/ Danışmanlık/);
  assert.match(elements.get("#sectorSelect").innerHTML, /SaaS \/ Abonelik/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Fiziksel Perakende/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Oto Hizmetleri/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Oyun \/ Dijital Yayıncılık/);

  const sectorSelect = elements.get("#sectorSelect");

  sectorSelect.value = "ecommerce_marketplace";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /E-Ticaret \/ Pazaryeri/);
  assert.match(elements.get("#formSections").innerHTML, /Aylık mağaza ziyaretçisi/);
  assert.match(elements.get("#formSections").innerHTML, /Satış kanalları/);
  assert.match(elements.get("#formSections").innerHTML, /Ürün \/ kategori karması/);
  assert.match(elements.get("#formSections").innerHTML, /Reklam kanalları/);
  assert.match(elements.get("#formSections").innerHTML, /Gelişmiş stok yeterliliğini izle/);
  assert.match(allKpis(), /Ürün başı net kâr/);
  assert.match(allKpis(), /Kapasite kullanımı/);
  assert.match(elements.get("#breakdown").innerHTML, /Stok ve işletme sermayesi/);

  sectorSelect.value = "beauty_personal_care";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Güzellik \/ Kuaför \/ Bakım/);
  assert.match(elements.get("#formSections").innerHTML, /Müşteri tabanı ve tekrar ziyaret talebini kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Hizmet \/ seans karması/);
  assert.match(elements.get("#formSections").innerHTML, /Personel rolleri/);
  assert.match(elements.get("#formSections").innerHTML, /Bakım \/ kozmetik ürün satışı ekle/);
  assert.match(allKpis(), /Seans başı net kâr/);
  assert.match(allKpis(), /Kapasite kullanımı/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · Tekrar ziyaret ve no-show/);

  sectorSelect.value = "agency_freelance_consulting";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Ajans \/ Freelancer \/ Danışmanlık/);
  assert.match(elements.get("#formSections").innerHTML, /İş türüne özel gelir sürücüsünü kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Kapsam taşması/);
  assert.match(elements.get("#formSections").innerHTML, /Taşeron kalemlerini tabloyla izle/);
  assert.match(elements.get("#formSections").innerHTML, /Sözleşme başlangıcında alınan peşinat payı/);
  assert.match(allKpis(), /Proje başı net kâr/);
  assert.match(allKpis(), /İç ekip kapasite yükü/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · Gelir sürücüsü ve sözleşme/);

  sectorSelect.value = "saas_subscription";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /SaaS \/ Abonelik/);
  assert.match(elements.get("#formSections").innerHTML, /Gelişmiş paket \/ plan karmasını kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Upgrade \/ expansion MRR oranı/);
  assert.match(elements.get("#formSections").innerHTML, /Destek \/ müşteri başarı personeli/);
  assert.match(allKpis(), /LTV \/ CAC/);
  assert.match(allKpis(), /Net gelir tutma \(NRR\)/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Ay başı müşteri/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Yıllık peşin/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · İş modeli ve gelir sürücüsü/);

  sectorSelect.value = "physical_retail";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Fiziksel Perakende/);
  assert.match(elements.get("#formSections").innerHTML, /İş türüne özel satış sürücüsünü kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Ürün \/ kategori karması/);
  assert.match(elements.get("#formSections").innerHTML, /Tedarikçi karmasını tabloyla izle/);
  assert.match(elements.get("#formSections").innerHTML, /Stok kapsamı ve işletme sermayesini izle/);
  assert.match(allKpis(), /Mağaza kapasite yükü/);
  assert.match(allKpis(), /Stok işletme sermayesi açığı/);
  assert.match(allKpis(), /stok devir hızı/i);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Günlük işlem/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Ürün maliyeti/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · Tedarikçi ve işletme sermayesi/);

  sectorSelect.value = "auto_services";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Oto Hizmetleri/);
  assert.match(elements.get("#formSections").innerHTML, /İş türüne özel araç \/ iş sürücüsünü kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Hizmet \/ iş karması/);
  assert.match(elements.get("#formSections").innerHTML, /Personel rolleri/);
  assert.match(elements.get("#formSections").innerHTML, /Parça \/ sarf stok kapsamını izle/);
  assert.match(elements.get("#formSections").innerHTML, /Taşeron işler/);
  assert.match(allKpis(), /Araç başı net k.r/);
  assert.match(allKpis(), /Kapasite kullanımı/);
  assert.match(allKpis(), /Talep karşılama oranı/);
  assert.match(allKpis(), /Stok işletme sermayesi açığı/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Tamamlanan iş/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Karşılanamayan iş/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · Talep, randevu ve kapasite/);

  sectorSelect.value = "game_digital_publishing";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Oyun \/ Dijital Yayıncılık/);
  assert.match(elements.get("#formSections").innerHTML, /Bölgesel satış satırları/);
  assert.match(elements.get("#formSections").innerHTML, /Aylık aktif kullanıcı/);
  assert.match(elements.get("#formSections").innerHTML, /DLC satın alma oranı/);
  assert.match(elements.get("#formSections").innerHTML, /Recoup ve oyun giderleri/);
  assert.match(allKpis(), /Yayıncı net kârı/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Recoup bakiyesi/);
  assert.match(elements.get("#breakdown").innerHTML, /Geliştirici settlement/);

  elements.get("#viewModeSwitcher").dispatch("click", { dataset: { viewMode: "advanced" } });
  assert.equal(elements.get("#viewModeNote").textContent, "Bütün sektör ayrıntıları gösteriliyor.");
  assert.equal(store.get("business-income-calculator:ui:view-mode:v0.24"), "advanced");
  assert.doesNotMatch(elements.get("#formSections").innerHTML, /view-mode-hidden/);

  const recordMenuButton = elements.get("#recordMenuButton");
  const recordMenu = elements.get("#recordMenu");
  assert.equal(recordMenu.hidden, true);
  recordMenuButton.click();
  assert.equal(recordMenu.hidden, false);
  assert.equal(recordMenuButton.attributes.get("aria-expanded"), "true");
  globalThis.document.dispatch("keydown", { key: "Escape", preventDefault() {} });
  assert.equal(recordMenu.hidden, true);
  assert.equal(recordMenuButton.attributes.get("aria-expanded"), "false");
  assert.equal(globalThis.document.activeElement, recordMenuButton);

  elements.get("#scenarioSwitcher").dispatch("click", { dataset: { scenario: "pessimistic" } });
  assert.match(elements.get("#scenarioSwitcher").innerHTML, /active" data-scenario="pessimistic"/);
  elements.get("#resetButton").click();
  assert.equal(elements.get("#resetDialog").open, true);
  assert.equal(elements.get("#resetSectorName").textContent, "Oyun / Dijital Yayıncılık");
  assert.equal(elements.get("#resetScenarioName").textContent, "Kötümser");
  elements.get("#resetConfirmButton").click();
  assert.equal(elements.get("#resetDialog").open, false);
  assert.match(elements.get("#scenarioSwitcher").innerHTML, /active" data-scenario="expected"/);
});
