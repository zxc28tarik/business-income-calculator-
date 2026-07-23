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

test("Basit ve Gelişmiş görünüm aynı finans sonucunu kullanır", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/");

  await expect(page.locator("#viewModeNote")).toHaveText("Yalnız temel varsayımlar gösteriliyor.");
  await expect(page.locator(".table-field").first()).toHaveClass(/view-mode-hidden/);
  const simpleKpis = await page.locator("#kpiGrid").textContent();
  const simpleVisibleFields = await page.locator(".field:not(.view-mode-hidden):not(.conditional-hidden)").count();
  expect(simpleVisibleFields).toBeGreaterThanOrEqual(8);
  expect(simpleVisibleFields).toBeLessThanOrEqual(16);

  await page.locator('[data-view-mode="advanced"]').click();
  await expect(page.locator("#viewModeNote")).toHaveText("Bütün sektör ayrıntıları gösteriliyor.");
  await expect(page.locator(".table-field").first()).not.toHaveClass(/view-mode-hidden/);
  const advancedKpis = await page.locator("#kpiGrid").textContent();
  const advancedVisibleFields = await page.locator(".field:not(.view-mode-hidden):not(.conditional-hidden)").count();

  expect(advancedVisibleFields).toBeGreaterThan(simpleVisibleFields);
  expect(advancedKpis).toBe(simpleKpis);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("business-income-calculator:ui:view-mode:v0.24"))).toBe("advanced");
  expect(errors).toEqual([]);
});

test("karar özeti, dört ana gösterge ve ikincil gösterge açılımı çalışır", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/");

  await expect(page.locator("#decisionSummary .decision-card")).toBeVisible();
  await expect(page.locator("#decisionSummary")).toContainText("Mevcut varsayımlara göre");
  await expect(page.locator("#kpiGrid .kpi-card")).toHaveCount(4);
  await expect(page.locator("#kpiGrid .kpi-card").nth(0)).toContainText("Aylık net");
  await expect(page.locator("#kpiGrid .kpi-card").nth(2)).toContainText("başabaş", { ignoreCase: true });
  await expect(page.locator("#kpiGrid .kpi-card").nth(3)).toContainText("12 ay sonu nakit");

  const initialVisible = await page.locator("#secondaryKpiGrid .kpi-card:visible").count();
  const total = await page.locator("#secondaryKpiGrid .kpi-card").count();
  expect(initialVisible).toBeLessThanOrEqual(6);
  expect(total).toBeGreaterThan(initialVisible);
  await page.locator("#secondaryKpiToggle").click();
  await expect(page.locator("#secondaryKpiToggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#secondaryKpiGrid .kpi-card:visible")).toHaveCount(total);

  const order = await page.evaluate(() => {
    const results = document.querySelector(".results-panel");
    return [...results.children]
      .map((node) => node.classList.contains("decision-section") ? "decision"
        : node.classList.contains("kpi-section") ? "primary"
          : node.classList.contains("warning-section") ? "warning"
            : null)
      .filter(Boolean);
  });
  expect(order).toEqual(["decision", "primary", "warning"]);
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

  await page.locator("#recordMenuButton").click();
  await page.locator("#projectDuplicateButton").click();
  await expect(page.locator("#projectSelect option")).toHaveCount(3);
  await page.locator("#portfolioButton").click();
  await expect(page.locator("#portfolioTable tbody tr")).toHaveCount(3);
  await expect(page.locator("#portfolioTable")).toContainText("İkinci Kafe");
});

test("tam JSON yedeği tarayıcıdan indirilebilir", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "İndirme akışı masaüstü projesinde bir kez çalışır.");
  await page.goto("/");
  await page.locator("#dataMenuButton").click();
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

test("üst eylem menüleri klavye ve dışarı tıklamayla güvenli kapanır", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".primary-actions > button")).toHaveCount(4);

  await page.locator("#recordMenuButton").click();
  await expect(page.locator("#recordMenuButton")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#recordMenu")).toBeVisible();
  await expect(page.locator("#projectRenameButton")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.locator("#recordMenu")).toBeHidden();
  await expect(page.locator("#recordMenuButton")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#recordMenuButton")).toBeFocused();

  await page.locator("#exportMenuButton").click();
  await expect(page.locator("#exportMenu")).toBeVisible();
  await page.locator("#pageTitle").click();
  await expect(page.locator("#exportMenu")).toBeHidden();
});

test("sektör sıfırlama ancak açıklamalı onaydan sonra uygulanır", async ({ page }) => {
  await page.goto("/");
  await page.locator("#sectorSelect").selectOption("ecommerce_marketplace");
  const price = page.locator("#productPrice");
  await price.fill("950");
  await expect(page.locator("#autosaveStatus")).toContainText("Kaydedildi");

  await page.locator("#moreMenuButton").click();
  await page.locator("#resetButton").click();
  await expect(page.locator("#resetDialog")).toBeVisible();
  await expect(page.locator("#resetSectorName")).toHaveText("E-Ticaret / Pazaryeri");
  await expect(page.locator("#resetScenarioName")).toHaveText("Beklenen");
  await expect(page.locator("#resetCancelButton")).toBeFocused();

  await page.locator("#resetCancelButton").click();
  await expect(page.locator("#resetDialog")).toBeHidden();
  await expect(price).toHaveValue("950");

  await page.locator("#moreMenuButton").click();
  await page.locator("#resetButton").click();
  await page.locator("#resetConfirmButton").click();
  await expect(page.locator("#resetDialog")).toBeHidden();
  await expect(price).not.toHaveValue("950");
  await expect(page.locator("#autosaveStatus")).toContainText("Kaydedildi");
});

test("bağımsız tek HTML gerçek Chromium içinde açılır", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/standalone/cafe-restaurant-calculator.html");
  await expect(page.locator("#pageTitle")).toContainText("Kafe / Restoran");
  await expect(page.locator("#kpiGrid .kpi-card").first()).toBeVisible();
  await expect(page.locator("#projectSelect")).toBeVisible();
  await page.locator("#moreMenuButton").click();
  await expect(page.locator("#moreMenu")).toBeVisible();
  await page.locator("#resetButton").click();
  await expect(page.locator("#resetDialog")).toBeVisible();
  await expect(page.locator("#resetSectorName")).toHaveText("Kafe / Restoran");
  await page.locator("#resetCancelButton").click();
  await expect(page.locator("#resetDialog")).toBeHidden();
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
