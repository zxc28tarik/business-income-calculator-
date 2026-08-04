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

test("planlanan finansman özkaynağı azaltmaz, hazır finansman azaltır ve taksit planı korunur", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.locator("#setupButton").click();

  const capexRowId = await page.locator("#setupItemsTable tbody tr").evaluateAll((rows) => {
    const row = rows.find((item) => item.querySelector('[data-setup-item-field="costType"]')?.value === "CAPEX");
    return row?.dataset.setupRow ?? "";
  });
  const itemRow = page.locator(`[data-setup-row="${capexRowId}"]`);
  await itemRow.locator('[data-setup-item-field="unitCost"]').fill("12000");
  await itemRow.locator('[data-setup-item-field="unitCost"]').dispatchEvent("change");
  await itemRow.locator('[data-setup-item-field="paymentMonth"]').fill("2");
  await itemRow.locator('[data-setup-item-field="paymentMonth"]').dispatchEvent("change");
  await itemRow.locator('[data-setup-item-field="installmentCount"]').fill("3");
  await itemRow.locator('[data-setup-item-field="installmentCount"]').dispatchEvent("change");
  await itemRow.locator('[data-setup-item-field="status"]').selectOption("included");

  const month2 = page.getByRole("row", { name: /^Ay 2 / });
  const month3 = page.getByRole("row", { name: /^Ay 3 / });
  const month4 = page.getByRole("row", { name: /^Ay 4 / });
  await expect(month2).toContainText("4.000");
  await expect(month3).toContainText("4.000");
  await expect(month4).toContainText("4.000");

  await page.locator("#setupAddFundingButton").click();
  const fundingRow = page.locator("#setupFundingTable tbody tr").first();
  await fundingRow.locator('[data-setup-funding-field="label"]').fill("Banka kredisi");
  await fundingRow.locator('[data-setup-funding-field="label"]').dispatchEvent("change");
  await fundingRow.locator('[data-setup-funding-field="type"]').selectOption("loan");
  await fundingRow.locator('[data-setup-funding-field="amount"]').fill("5000");
  await fundingRow.locator('[data-setup-funding-field="amount"]').dispatchEvent("change");

  const ownCashCard = page.locator("#setupCashSummary .setup-summary-card").filter({ hasText: "Gerekli özkaynak" });
  const plannedCard = page.locator("#setupCashSummary .setup-summary-card").filter({ hasText: "Planlanan finansman" });
  await expect(plannedCard).toContainText("5.000");
  await expect(ownCashCard).toContainText("13.200");

  await fundingRow.locator('[data-setup-funding-field="status"]').selectOption("available");
  await expect(ownCashCard).toContainText("8.200");

  await page.reload();
  await page.locator("#setupButton").click();
  await expect(page.locator('#setupFundingTable [data-setup-funding-field="label"]')).toHaveValue("Banka kredisi");
  await expect(page.locator('#setupFundingTable [data-setup-funding-field="status"]')).toHaveValue("available");
  await expect(page.getByRole("row", { name: /^Ay 2 / })).toContainText("4.000");
  await expect(page.locator("#setupCashSummary .setup-summary-card").filter({ hasText: "Gerekli özkaynak" })).toContainText("8.200");
  expect(pageErrors).toEqual([]);
});

test("kredi koşulları borç servisine, birleşik nakde ve kuruluş CSV çıktısına bağlanır", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.locator("#setupButton").click();
  await page.locator("#setupAddFundingButton").click();

  const fundingRow = page.locator("#setupFundingTable tbody tr").first();
  await fundingRow.locator('[data-setup-funding-field="label"]').fill("Yatırım kredisi");
  await fundingRow.locator('[data-setup-funding-field="label"]').dispatchEvent("change");
  await fundingRow.locator('[data-setup-funding-field="type"]').selectOption("loan");
  await fundingRow.locator('[data-setup-funding-field="status"]').selectOption("available");
  await fundingRow.locator('[data-setup-funding-field="amount"]').fill("120000");
  await fundingRow.locator('[data-setup-funding-field="amount"]').dispatchEvent("change");
  await fundingRow.locator('[data-setup-funding-field="annualInterestRate"]').fill("12");
  await fundingRow.locator('[data-setup-funding-field="annualInterestRate"]').dispatchEvent("change");
  await fundingRow.locator('[data-setup-funding-field="termMonths"]').fill("12");
  await fundingRow.locator('[data-setup-funding-field="termMonths"]').dispatchEvent("change");
  await fundingRow.locator('[data-setup-funding-field="graceMonths"]').fill("1");
  await fundingRow.locator('[data-setup-funding-field="graceMonths"]').dispatchEvent("change");
  await fundingRow.locator('[data-setup-funding-field="upfrontFeeRate"]').fill("1");
  await fundingRow.locator('[data-setup-funding-field="upfrontFeeRate"]').dispatchEvent("change");

  const openingRow = page.getByRole("row", { name: /^Açılış \/ Ay 0 / });
  const month1 = page.getByRole("row", { name: /^Ay 1 / });
  const month2 = page.getByRole("row", { name: /^Ay 2 / });
  await expect(openingRow).toContainText("120.000");
  await expect(openingRow).toContainText("1.200");
  await expect(month1).toContainText("₺0");
  await expect(month2).toContainText("1.200");

  for (const label of [
    "Kuruluş finansmanı",
    "Kuruluş ödemesi",
    "Borç anapara",
    "Borç faizi",
    "Faaliyet sonu",
    "Birleşik dönem sonu",
  ]) {
    await expect(page.locator("#cashFlowTable thead th").filter({ hasText: label })).toHaveCount(1);
  }
  await expect(page.locator("#cashFlowTable tbody tr").first()).toContainText("120.000");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#setupExportCsvButton").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/cafe_restaurant-kurulus-acilis\.csv$/);

  await page.reload();
  await page.locator("#setupButton").click();
  await expect(page.locator('[data-setup-funding-field="annualInterestRate"]')).toHaveValue("12.00");
  await expect(page.locator('[data-setup-funding-field="termMonths"]')).toHaveValue("12");
  await expect(page.locator('[data-setup-funding-field="graceMonths"]')).toHaveValue("1");
  await expect(page.locator('[data-setup-funding-field="upfrontFeeRate"]')).toHaveValue("1.00");
  expect(pageErrors).toEqual([]);
});
