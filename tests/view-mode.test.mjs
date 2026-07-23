import test from "node:test";
import assert from "node:assert/strict";
import { initializeScenarioInputs } from "../src/core/sector-schema.js";
import { SECTORS } from "../src/sectors/registry.js";
import {
  countVisibleFields,
  getFieldImportance,
  getSectionSummary,
  isFieldAvailableInMode,
  normalizeViewMode,
} from "../src/ui/view-mode.js";

test("Basit görünüm sektör ve iş türü başına yaklaşık 8–16 temel alan gösterir", () => {
  for (const sector of SECTORS) {
    const businessType = sector.formSections
      .flatMap((section) => section.fields)
      .find((field) => field.key === "businessType");
    assert.ok(businessType, `${sector.id}: iş türü alanı bulunmalıdır`);

    for (const [businessTypeId, businessTypeLabel] of businessType.options) {
      const inputs = sector.normalizeInputs({
        ...structuredClone(sector.defaultInputs),
        businessType: businessTypeId,
      });
      const count = countVisibleFields(sector, inputs, "simple");
      assert.ok(
        count >= 8 && count <= 16,
        `${sector.id} / ${businessTypeLabel}: Basit görünüm ${count} alan gösteriyor`,
      );
    }
  }
});

test("Basit görünüm gelişmiş tabloları gizler; Gelişmiş görünüm bütün alanları açar", () => {
  for (const sector of SECTORS) {
    for (const section of sector.formSections) {
      for (const field of section.fields) {
        assert.equal(isFieldAvailableInMode(sector, field, "advanced"), true);
        if (field.type === "table") {
          assert.equal(
            getFieldImportance(sector, field),
            "advanced",
            `${sector.id}.${field.key} tablosu gelişmiş olmalıdır`,
          );
          assert.equal(isFieldAvailableInMode(sector, field, "simple"), false);
        }
      }
    }
  }
});

test("Görünüm tercihi finans verisinden bağımsız ve varsayılan olarak Basit kalır", () => {
  assert.equal(normalizeViewMode(), "simple");
  assert.equal(normalizeViewMode("simple"), "simple");
  assert.equal(normalizeViewMode("advanced"), "advanced");
  assert.equal(normalizeViewMode("bilinmeyen"), "simple");

  for (const sector of SECTORS) {
    const state = initializeScenarioInputs(sector);
    assert.equal("viewMode" in state, false, `${sector.id}: görünüm tercihi senaryo verisine eklenmemelidir`);
  }
});

test("Bölüm özetleri görünür alanların güncel değerlerinden üretilir", () => {
  for (const sector of SECTORS) {
    const inputs = sector.normalizeInputs(structuredClone(sector.defaultInputs));
    const firstSection = sector.formSections[0];
    const summary = getSectionSummary(sector, firstSection, inputs, "simple");
    assert.ok(summary.length > 0, `${sector.id}: ilk bölüm özeti boş olmamalıdır`);
    assert.match(summary, /:/, `${sector.id}: bölüm özeti etiket ve değer içermelidir`);
  }
});
