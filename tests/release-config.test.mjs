import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("v0.24 sürüm, production ve Pages sözleşmesi eşleşir", async () => {
  const [packageText, lockText, indexHtml, standaloneBuilder, productionBuilder, testWorkflow, deployWorkflow] = await Promise.all([
    read("package.json"),
    read("package-lock.json"),
    read("index.html"),
    read("scripts/build-standalone.mjs"),
    read("scripts/build-production.mjs"),
    read(".github/workflows/test.yml"),
    read(".github/workflows/deploy-pages.yml"),
  ]);

  const pkg = JSON.parse(packageText);
  const lock = JSON.parse(lockText);
  assert.equal(pkg.version, "0.24.0");
  assert.equal(lock.version, "0.24.0");
  assert.equal(lock.packages[""].version, "0.24.0");
  assert.match(indexHtml, /BUSINESS INCOME CALCULATOR · v0\.24\.0/);
  assert.doesNotMatch(indexHtml, /BUSINESS INCOME CALCULATOR · v0\.23\.0/);
  assert.match(standaloneBuilder, /const APP_VERSION = "0\.24\.0"/);
  assert.match(productionBuilder, /version: "0\.24\.0"/);

  assert.equal(pkg.devDependencies["@playwright/test"], "1.61.1");
  assert.equal(pkg.devDependencies["@axe-core/playwright"], "4.12.1");
  assert.match(testWorkflow, /npm ci --no-audit --no-fund/);
  assert.match(testWorkflow, /BIC_E2E_ROOT: dist/);
  assert.match(testWorkflow, /Upload production site/);
  assert.doesNotMatch(testWorkflow, /git push/);

  assert.match(deployWorkflow, /branches: \[main\]/);
  assert.match(deployWorkflow, /workflow_dispatch:/);
  assert.match(deployWorkflow, /actions\/configure-pages@v5/);
  assert.match(deployWorkflow, /actions\/upload-pages-artifact@v4/);
  assert.match(deployWorkflow, /actions\/deploy-pages@v4/);
  assert.match(deployWorkflow, /BIC_E2E_ROOT: dist/);
});
