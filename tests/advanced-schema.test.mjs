import test from "node:test";
import assert from "node:assert/strict";
import {
  booleanField,
  cloneInputValue,
  createTableRow,
  evaluateVisibility,
  initializeScenarioInputs,
  normalizeTableRows,
  tableField,
  textField,
  updateTableCell,
  validateSectorDefinition,
} from "../src/core/sector-schema.js";

const noop = () => ({ cashFlow: { rows: [] }, warnings: [], waterfall: [] });
const noopScenarios = () => [];
const noopPresentation = () => ({ kpis: [], keySplit: [], scenarioMetrics: [], breakdown: [] });

function advancedDefinition(overrides = {}) {
  const columns = [
    { key: "name", label: "Kalem", type: "text", defaultValue: "" },
    { key: "amount", label: "Tutar", type: "number", defaultValue: 0 },
    { key: "currency", label: "PB", type: "select", options: [["TRY", "TL"], ["USD", "USD"]], defaultValue: "TRY" },
    { key: "recoupable", label: "Rec?", type: "boolean", defaultValue: false },
  ];
  const definition = {
    id: "advanced_fixture",
    name: "Gelişmiş şema",
    family: "Test",
    version: "v0",
    status: "simulation",
    businessTypes: [["fixture", "Fixture"]],
    defaultInputs: {
      businessType: "fixture",
      advancedMode: false,
      note: "",
      costs: [{ name: "Pazarlama", amount: 100, currency: "TRY", recoupable: true }],
    },
    scenarios: {
      pessimistic: { label: "Kötümser" },
      expected: { label: "Beklenen" },
      optimistic: { label: "İyimser" },
    },
    formSections: [
      {
        title: "Temel",
        fields: [
          booleanField("advancedMode", "Gelişmiş modu kullan"),
          textField("note", "Not", { visibleWhen: { key: "advancedMode", equals: true } }),
        ],
      },
      {
        title: "Satırlar",
        visibleWhen: { key: "advancedMode", truthy: true },
        fields: [
          tableField("costs", "Giderler", columns, {
            minRows: 1,
            maxRows: 10,
            newRow: { name: "Yeni kalem", currency: "TRY" },
          }),
        ],
      },
    ],
    cashFlowColumns: [
      { key: "month", label: "Ay", format: "number" },
      { key: "cashEnd", label: "Kapanış", format: "money" },
    ],
    normalizeInputs(raw = {}) {
      const input = { ...cloneInputValue(this.defaultInputs), ...cloneInputValue(raw) };
      input.advancedMode = Boolean(input.advancedMode);
      input.note = String(input.note ?? "");
      input.costs = normalizeTableRows(input.costs, columns, this.defaultInputs.costs);
      return input;
    },
    applyScenario(baseInputs) {
      return cloneInputValue(baseInputs);
    },
    calculateModel: noop,
    calculateScenarioComparison: noopScenarios,
    buildPresentation: noopPresentation,
    ...overrides,
  };
  return definition;
}

test("gelişmiş sektör şeması checkbox, tablo, koşul ve özel nakit kolonlarını kabul eder", () => {
  const result = validateSectorDefinition(advancedDefinition());
  assert.equal(result.valid, true, result.errors.join("\n"));
});

test("görünürlük koşulları equals, all, any ve not yapılarını değerlendirir", () => {
  const inputs = { enabled: true, entity: "company", region: "EU" };
  assert.equal(evaluateVisibility({ key: "enabled", truthy: true }, inputs), true);
  assert.equal(evaluateVisibility({ all: [{ key: "enabled", equals: true }, { key: "entity", in: ["company"] }] }, inputs), true);
  assert.equal(evaluateVisibility({ any: [{ key: "region", equals: "US" }, { key: "region", equals: "EU" }] }, inputs), true);
  assert.equal(evaluateVisibility({ not: { key: "enabled", equals: false } }, inputs), true);
});

test("tablo satırları sütun tiplerine göre normalize edilir", () => {
  const field = advancedDefinition().formSections[1].fields[0];
  const rows = normalizeTableRows([
    { name: 42, amount: -5, currency: "EUR", recoupable: 1 },
  ], field.columns);
  assert.deepEqual(rows, [{ name: "42", amount: 0, currency: "TRY", recoupable: true }]);
});

test("tablo hücresi güncellemesi kaynak satırları değiştirmez", () => {
  const field = advancedDefinition().formSections[1].fields[0];
  const original = [{ name: "Pazarlama", amount: 100, currency: "TRY", recoupable: true }];
  const updated = updateTableCell(original, field, 0, "amount", 250);
  assert.equal(original[0].amount, 100);
  assert.equal(updated[0].amount, 250);
});

test("yeni tablo satırı newRow ve sütun varsayılanlarını birleştirir", () => {
  const field = advancedDefinition().formSections[1].fields[0];
  assert.deepEqual(createTableRow(field), {
    name: "Yeni kalem",
    amount: 0,
    currency: "TRY",
    recoupable: false,
  });
});

test("senaryo başlangıcı iç içe tablo satırlarını birbirinden ayırır", () => {
  const definition = advancedDefinition();
  const scenarios = initializeScenarioInputs(definition);
  scenarios.pessimistic.costs[0].amount = 999;
  assert.equal(scenarios.expected.costs[0].amount, 100);
  assert.equal(scenarios.optimistic.costs[0].amount, 100);
});

test("şema tekrarlanan tablo sütununu reddeder", () => {
  const definition = advancedDefinition();
  definition.formSections[1].fields[0].columns.push({
    key: "amount", label: "Tekrar", type: "number",
  });
  const result = validateSectorDefinition(definition);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes("tablo sütunu birden fazla")));
});

test("boolean varsayılanı ve koşul anahtarı doğrulanır", () => {
  const definition = advancedDefinition();
  definition.defaultInputs.advancedMode = "evet";
  definition.formSections[0].fields[1].visibleWhen = { key: "missing", equals: true };
  const result = validateSectorDefinition(definition);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes("true/false")));
  assert.ok(result.errors.some((message) => message.includes("geçerli bir alan anahtarı")));
});

test("özel nakit kolonlarında tekrarlanan anahtar reddedilir", () => {
  const definition = advancedDefinition();
  definition.cashFlowColumns.push({ key: "cashEnd", label: "Tekrar" });
  const result = validateSectorDefinition(definition);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((message) => message.includes("nakit tablosu sütunu birden fazla")));
});
