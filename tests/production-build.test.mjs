import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { buildProduction } from "../scripts/build-production.mjs";

async function exists(file) {
  try { await stat(file); return true; } catch { return false; }
}

test("production paketi yalnız yayınlanabilir statik dosyaları içerir", async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), "bic-production-"));
  try {
    await buildProduction(output);
    for (const relative of [
      "index.html",
      "404.html",
      "styles.css",
      "styles-advanced.css",
      "LICENSE",
      ".nojekyll",
      "build-info.json",
      "src/app.js",
      "standalone/cafe-restaurant-calculator.html",
      "standalone/game-digital-publishing-calculator.html",
    ]) {
      assert.equal(await exists(path.join(output, relative)), true, `${relative} production paketinde bulunmalıdır`);
    }
    for (const excluded of ["tests", "scripts", ".github", "node_modules", "package.json"]) {
      assert.equal(await exists(path.join(output, excluded)), false, `${excluded} yayın paketine girmemelidir`);
    }
    const info = JSON.parse(await readFile(path.join(output, "build-info.json"), "utf8"));
    assert.equal(info.version, "0.24.0");
    assert.equal(info.standaloneCalculators, 8);
    const html = await readFile(path.join(output, "index.html"), "utf8");
    assert.match(html, /BUSINESS INCOME CALCULATOR · v0\.24\.0/);
    assert.doesNotMatch(html, /BUSINESS INCOME CALCULATOR · v0\.23\.0/);
    assert.match(html, /class="skip-link"/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
