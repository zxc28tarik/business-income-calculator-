import test from "node:test";
import assert from "node:assert/strict";

class MockElement {
  constructor() {
    this.innerHTML = "";
    this.value = "";
    this.textContent = "";
    this.dataset = {};
    this.tagName = "DIV";
    this.listeners = new Map();
  }

  addEventListener(type, handler) {
    this.listeners.set(type, handler);
  }

  dispatch(type, target = this) {
    this.listeners.get(type)?.({ target });
  }

  click() {}
}

test("uygulama ilk yüklemede render olur ve sektör değiştirir", async () => {
  const selectors = [
    "#sectorSelect", "#pageTitle", "#pageSubtitle", "#sectorSummary", "#scenarioSwitcher",
    "#formSections", "#resetButton", "#exportCsvButton", "#printButton", "#warnings",
    "#kpiGrid", "#keySplit", "#waterfall", "#scenarioTable", "#cashFlowTable", "#breakdown",
  ];
  const elements = new Map(selectors.map((selector) => [selector, new MockElement()]));
  elements.get("#sectorSelect").tagName = "SELECT";

  globalThis.document = {
    title: "",
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new MockElement());
      return elements.get(selector);
    },
    querySelectorAll() { return []; },
    createElement() { return new MockElement(); },
  };
  globalThis.window = { print() {} };
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) { return store.get(key) ?? null; },
    setItem(key, value) { store.set(key, value); },
  };

  await import(`../src/app.js?smoke=${Date.now()}`);

  assert.match(elements.get("#pageTitle").textContent, /Kafe \/ Restoran/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Aylık net kâr/);
  assert.match(elements.get("#sectorSelect").innerHTML, /E-Ticaret \/ Pazaryeri/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Güzellik \/ Kuaför \/ Bakım/);
  assert.match(elements.get("#sectorSelect").innerHTML, /Ajans \/ Freelancer \/ Danışmanlık/);

  const sectorSelect = elements.get("#sectorSelect");
  sectorSelect.value = "ecommerce_marketplace";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /E-Ticaret \/ Pazaryeri/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Ürün başı net kâr/);

  sectorSelect.value = "beauty_personal_care";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Güzellik \/ Kuaför \/ Bakım/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Seans başı net kâr/);

  sectorSelect.value = "agency_freelance_consulting";
  sectorSelect.dispatch("change", sectorSelect);
  assert.match(elements.get("#pageTitle").textContent, /Ajans \/ Freelancer \/ Danışmanlık/);
  assert.match(elements.get("#kpiGrid").innerHTML, /Proje başı net kâr/);
});
