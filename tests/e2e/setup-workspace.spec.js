import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("kuruluş kalemi düzenlenir, başlangıç nakdine bağlanır ve kaydedilir", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await expect(page.locator("#pageTitle")).toContainText("Kafe / Restoran");
  await expect(page.locator("#setupCashSummary")).toContainText("Henüz hesaba dahil edilen tutarlı kalem yok");

  await page.locator("#setupButton").click();
  await expect(page.locator("#setupPanel")).toBeVisible();
  await expect(page.locator("#setupRequirements")).not.toBeEmpty();
  await expect(page.locator("#setupItemsTable tbody tr")).not.toHaveCount(0);

  const capexRowId = await page.locator("#setupItemsTable tbody tr").evaluateAll((rows) => {
    const row = rows.find((item) => item.querySelector('[data-setup-item-field="costType"]')?.value === "CAPEX");
    return row?.dataset.setupRow ?? "";
  });
  expect(capexRowId).not.toBe("");

  const row = () => page.locator(`[data-setup-row="${capexRowId}"]`);
  await row().locator('[data-setup-item-field="quantity"]').fill("2");
  await row().locator('[data-setup-item-field="quantity"]').dispatchEvent("change");
  await row().locator('[data-setup-item-field="unitCost"]').fill("10000");
  await row().locator('[data-setup-item-field="unitCost"]').dispatchEvent("change");
  await row().locator('[data-setup-item-field="vatRate"]').fill("20");
  await row().locator('[data-setup-item-field="vatRate"]').dispatchEvent("change");
  await row().locator('[data-setup-item-field="status"]').selectOption("included");

  await expect(page.locator("#setupCashSummary")).toContainText("26.400");
  await expect(page.locator("#setupCashSummary")).toContainText("20.000");
  await expect(page.locator("#setupCashSummary")).toContainText("4.000");

  await page.reload();
  await page.locator("#setupButton").click();
  await expect(page.locator("#setupCashSummary")).toContainText("26.400");
  await expect(row().locator('[data-setup-item-field="status"]')).toHaveValue("included");
  await expect(row().locator('[data-setup-item-field="quantity"]')).toHaveValue("2");
  await expect(row().locator('[data-setup-item-field="unitCost"]')).toHaveValue("10000");

  expect(pageErrors).toEqual([]);
});

test("profil koşulu yeni gereksinimi üretir ve yinelenen kalem oluşturmaz", async ({ page }) => {
  await page.locator("#setupButton").click();
  const employeeToggle = page.locator('[data-setup-profile="hasEmployees"]');
  const initialRows = await page.locator("#setupItemsTable tbody tr").count();

  await employeeToggle.check();
  await expect(page.locator("#setupRequirements")).toContainText("Çalışan ve işveren yükleri");
  const afterFirstSync = await page.locator("#setupItemsTable tbody tr").count();
  expect(afterFirstSync).toBeGreaterThan(initialRows);

  await page.locator("#setupSyncButton").click();
  await expect(page.locator("#setupItemsTable tbody tr")).toHaveCount(afterFirstSync);
});
