import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { buildAllStandalone, STANDALONE_SECTORS } from "../scripts/build-standalone.mjs";

test("sekiz sektör için çevrimdışı tek HTML dosyası üretilir", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "bic-standalone-"));
  try {
    const results = await buildAllStandalone(outputDir);
    assert.equal(results.length, 8);
    assert.deepEqual(results.map((item) => item.id), STANDALONE_SECTORS.map((item) => item.id));

    for (const result of results) {
      const fileInfo = await stat(result.outputPath);
      const html = await readFile(result.outputPath, "utf8");
      assert.ok(fileInfo.size > 50_000, `${result.file} gerçek paket içermelidir`);
      assert.ok(fileInfo.size < 2_000_000, `${result.file} 2 MB sınırını aşmamalıdır`);
      assert.match(html, /<!doctype html>/i);
      assert.match(html, new RegExp(`data-sector-id="${result.id}"`));
      assert.match(html, /BUSINESS INCOME CALCULATOR · TEK DOSYA · v0\.23\.0/);
      assert.match(html, /class="skip-link"/);
      assert.match(html, /id="mainContent"/);
      assert.match(html, /const moduleSources =/);
      assert.match(html, /URL\.createObjectURL\(new Blob/);
      assert.match(html, /mountStandaloneCalculator/);
      assert.match(html, /CSV \/ Excel/);
      assert.match(html, /Rapor \/ HTML/);
      assert.match(html, /Gerçek Takip/);
      assert.match(html, /Portföy/);
      assert.match(html, /business-income-calculator-backup-v1/);
      assert.match(html, /İşletme ve proje karşılaştırması/);
      assert.match(html, /Tahmin–Gerçekleşen Takibi/);
      assert.match(html, /GERÇEK TAKİP RAPORU/);
      assert.match(html, /FİNANSAL FİZİBİLİTE RAPORU/);
      assert.match(html, /12 aylık nakit akışı/);
      assert.doesNotMatch(html, /<script[^>]+src=/i);
      assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
      assert.doesNotMatch(html, /src\/sectors\/registry\.js/);
      assert.ok(result.moduleCount >= 6);
    }
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});

test("tek HTML üretimi aynı kaynaklarda deterministiktir", async () => {
  const firstDir = await mkdtemp(path.join(os.tmpdir(), "bic-standalone-a-"));
  const secondDir = await mkdtemp(path.join(os.tmpdir(), "bic-standalone-b-"));
  try {
    await buildAllStandalone(firstDir);
    await buildAllStandalone(secondDir);
    for (const sector of STANDALONE_SECTORS) {
      const first = await readFile(path.join(firstDir, sector.file), "utf8");
      const second = await readFile(path.join(secondDir, sector.file), "utf8");
      assert.equal(first, second, `${sector.file} aynı kaynaklardan aynı çıktıyı üretmelidir`);
      assert.match(first, new RegExp(sector.exportName));
      assert.match(first, new RegExp(sector.module.replaceAll("/", "\\/")));
    }
  } finally {
    await rm(firstDir, { recursive: true, force: true });
    await rm(secondDir, { recursive: true, force: true });
  }
});
