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
    this.listeners = new Map();
    this.classList = { toggle() {} };
  }

  addEventListener(type, handler) { this.listeners.set(type, handler); }
  dispatch(type, target = this) { this.listeners.get(type)?.({ target }); }
  querySelectorAll() { return []; }
  click() {}
}

function extractElementsFromHtml(html) {
  const elements = new Map();
  const pattern = /<([a-z][a-z0-9-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi;
  for (const match of html.matchAll(pattern)) elements.set(`#${match[2]}`, new MockElement(match[1].toUpperCase()));
  return elements;
}

async function readApplicationHtml() {
  return readFile(new URL("../index.html", import.meta.url), "utf8");
}

test("index.html temiz UTF-8, eksiksiz kabuk ve muhasebe uyarısı içerir", async () => {
  const html = await readApplicationHtml();
  assert.match(html, /<meta charset="UTF-8"\s*\/>/);
  assert.match(html, /BUSINESS INCOME CALCULATOR · v0\.16\.0/);
  assert.match(html, /Sektör Bazlı Finansal Fizibilite/);
  assert.match(html, /Brüt cirodan net kâra/);
  assert.match(html, /mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir/);
  assert.match(html, /<script type="module" src="\.\/src\/app\.js"><\/script>/);
  assert.match(html, /<\/body>\s*<\/html>\s*$/);

  for (const marker of ["Ã", "Å", "Ä", "Â", "�"]) {
    assert.equal(html.includes(marker), false, `index.html bozuk kodlama işareti içeriyor: ${marker}`);
  }

  const requiredIds = [
    "sectorSelect", "pageTitle", "pageSubtitle", "sectorSummary", "scenarioSwitcher",
    "formSections", "resetButton", "exportCsvButton", "printButton", "warnings",
    "kpiGrid", "keySplit", "waterfall", "scenarioTable", "cashFlowTable", "breakdown",
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
    "#sectorSelect", "#pageTitle", "#pageSubtitle", "#sectorSummary", "#scenarioSwitcher",
    "#formSections", "#resetButton", "#exportCsvButton", "#printButton", "#warnings",
    "#kpiGrid", "#keySplit", "#waterfall", "#scenarioTable", "#cashFlowTable", "#breakdown",
  ];
  for (const selector of requiredSelectors) assert.ok(elements.has(selector), `${selector} gerçek index.html içinde bulunamadı`);

  globalThis.document = {
    title: "",
    querySelector(selector) { return elements.get(selector) ?? null; },
    querySelectorAll() { return []; },
    createElement(tagName) { return new MockElement(String(tagName).toUpperCase()); },
  };
  globalThis.window = { print() {} };
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) { return store.get(key) ?? null; },
    setItem(key, value) { store.set(key, value); },
  };

  await import(`../src/app.js?smoke=${Date.now()}`);

  assert.match(elements.get("#pageTitle").textContent, /Kafe \/ Restoran/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Aylık net k.r/);
  assert.match(elements.get("#formSections").innerHTML, /Gelişmiş satış kanalı karmasını kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Ürün \/ kategori karması/);
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
  assert.match(elements.get("#kpiGrid").innerHTML, /Ürün başı net kâr/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Kapasite kullanımı/);
  assert.match(elements.get("#breakdown").innerHTML, /Stok ve işletme sermayesi/);

  sectorSelect.value = "beauty_personal_care";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Güzellik \/ Kuaför \/ Bakım/);
  assert.match(elements.get("#formSections").innerHTML, /Müşteri tabanı ve tekrar ziyaret talebini kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Hizmet \/ seans karması/);
  assert.match(elements.get("#formSections").innerHTML, /Personel rolleri/);
  assert.match(elements.get("#formSections").innerHTML, /Bakım \/ kozmetik ürün satışı ekle/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Seans başı net kâr/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Kapasite kullanımı/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · Tekrar ziyaret ve no-show/);

  sectorSelect.value = "agency_freelance_consulting";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Ajans \/ Freelancer \/ Danışmanlık/);
  assert.match(elements.get("#formSections").innerHTML, /İş türüne özel gelir sürücüsünü kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Kapsam taşması/);
  assert.match(elements.get("#formSections").innerHTML, /Taşeron kalemlerini tabloyla izle/);
  assert.match(elements.get("#formSections").innerHTML, /Sözleşme başlangıcında alınan peşinat payı/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Proje başı net kâr/);
  assert.match(elements.get("#kpiGrid").innerHTML, /İç ekip kapasite yükü/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · Gelir sürücüsü ve sözleşme/);

  sectorSelect.value = "saas_subscription";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /SaaS \/ Abonelik/);
  assert.match(elements.get("#formSections").innerHTML, /Gelişmiş paket \/ plan karmasını kullan/);
  assert.match(elements.get("#formSections").innerHTML, /Upgrade \/ expansion MRR oranı/);
  assert.match(elements.get("#formSections").innerHTML, /Destek \/ müşteri başarı personeli/);
  assert.match(elements.get("#kpiGrid").innerHTML, /LTV \/ CAC/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Net gelir tutma \(NRR\)/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Ay başı müşteri/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Yıllık peşin/);
  assert.match(elements.get("#breakdown").innerHTML, /Profil · İş modeli ve gelir sürücüsü/);

  sectorSelect.value = "physical_retail";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Fiziksel Perakende/);
  assert.match(elements.get("#kpiGrid").innerHTML, /stok devir hızı/i);

  sectorSelect.value = "auto_services";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Oto Hizmetleri/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Araç başı net k.r/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Kapasite kullanımı/);

  sectorSelect.value = "game_digital_publishing";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Oyun \/ Dijital Yayıncılık/);
  assert.match(elements.get("#formSections").innerHTML, /Bölgesel satış satırları/);
  assert.match(elements.get("#formSections").innerHTML, /Aylık aktif kullanıcı/);
  assert.match(elements.get("#formSections").innerHTML, /DLC satın alma oranı/);
  assert.match(elements.get("#formSections").innerHTML, /Recoup ve oyun giderleri/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Yayıncı net kârı/);
  assert.match(elements.get("#cashFlowTable").innerHTML, /Recoup bakiyesi/);
  assert.match(elements.get("#breakdown").innerHTML, /Geliştirici settlement/);
});
