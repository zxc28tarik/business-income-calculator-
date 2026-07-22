import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("ana uygulama gerçek Chromium içinde hesaplama yapar", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/");

  await expect(page.locator("#pageTitle")).toContainText("Kafe / Restoran");
  await expect(page.locator("#kpiGrid .kpi-card").first()).toBeVisible();

  await page.locator("#sectorSelect").selectOption("ecommerce_marketplace");
  await expect(page.locator("#pageTitle")).toContainText("E-Ticaret / Pazaryeri");
  await expect(page.locator("#productPrice")).toBeVisible();

  const before = await page.locator("#kpiGrid").textContent();
  await page.locator("#productPrice").fill("950");
  await expect.poll(async () => page.locator("#kpiGrid").textContent()).not.toBe(before);
  expect(errors).toEqual([]);
});

test("çoklu kayıt ve proje bazlı gerçek takip tarayıcıda ayrışır", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Yoğun portföy akışı masaüstü projesinde bir kez çalışır.");
  await page.goto("/");

  const initialId = await page.locator("#projectSelect").inputValue();
  page.once("dialog", (dialog) => dialog.accept("İkinci Kafe"));
  await page.locator("#projectNewButton").click();
  await expect(page.locator("#projectSelect option")).toHaveCount(2);
  const secondId = await page.locator("#projectSelect").inputValue();
  expect(secondId).not.toBe(initialId);

  await page.locator("#trackingButton").click();
  const actualCollection = page.locator('[data-tracking-key="collections"]').first();
  await actualCollection.fill("123456");
  await expect(actualCollection).toHaveValue("123456");

  await page.locator("#projectSelect").selectOption(initialId);
  await expect(page.locator('[data-tracking-key="collections"]').first()).toHaveValue("");
  await page.locator("#projectSelect").selectOption(secondId);
  await expect(page.locator('[data-tracking-key="collections"]').first()).toHaveValue("123456");

  await page.locator("#projectDuplicateButton").click();
  await expect(page.locator("#projectSelect option")).toHaveCount(3);
  await page.locator("#portfolioButton").click();
  await expect(page.locator("#portfolioTable tbody tr")).toHaveCount(3);
  await expect(page.locator("#portfolioTable")).toContainText("İkinci Kafe");
});

test("tam JSON yedeği tarayıcıdan indirilebilir", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "İndirme akışı masaüstü projesinde bir kez çalışır.");
  await page.goto("/");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#backupExportButton").click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const backup = JSON.parse(await readFile(path, "utf8"));
  expect(backup.schema).toBe("business-income-calculator-backup-v1");
  expect(backup.scope).toBe("platform");
  expect(backup.portfolio.projects.length).toBeGreaterThanOrEqual(1);
});

test("bağımsız tek HTML gerçek Chromium içinde açılır", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/standalone/cafe-restaurant-calculator.html");
  await expect(page.locator("#pageTitle")).toContainText("Kafe / Restoran");
  await expect(page.locator("#kpiGrid .kpi-card").first()).toBeVisible();
  await expect(page.locator("#projectSelect")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobil görünüm sayfa düzeyinde yatay taşma üretmez", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobil görünüm mobil projede çalışır.");
  await page.goto("/");
  await expect(page.locator("#projectSelect")).toBeVisible();
  await expect(page.locator("#sectorSelect")).toBeVisible();
  await page.locator("#portfolioButton").click();
  await expect(page.locator("#portfolioPanel")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("ciddi veya kritik erişilebilirlik ihlali bulunmaz", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Axe denetimi masaüstünde bir kez çalışır.");
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter((item) => ["serious", "critical"].includes(item.impact));
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
