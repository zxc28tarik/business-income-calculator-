import { test, expect } from "@playwright/test";

async function openAndFill(page, selector, value) {
  const field = page.locator(selector);
  const section = field.locator("xpath=ancestor::details[1]");
  if (await section.count()) {
    await section.evaluate((element) => { element.open = true; });
  }
  await expect(field).toBeVisible();
  await field.fill(value);
}

test("Aşama 5 uyarı, nakit özeti ve ayrıntı panelleri çalışır", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await page.locator('[data-view-mode="advanced"]').click();
  await openAndFill(page, "#rent", "2000000");
  await openAndFill(page, "#materialCostRate", "60");
  await openAndFill(page, "#startingCash", "0");

  await expect(page.locator("#warnings .warning").first()).toBeVisible();
  await expect(page.locator("#warnings .warning-level").first()).toContainText(/Kritik|Dikkat|Bilgi|Olumlu/);
  const warningToggle = page.locator("#warnings [data-warning-disclosure]");
  if (await warningToggle.count()) {
    const before = await page.locator("#warnings .warning").count();
    await warningToggle.click();
    await expect(warningToggle).toHaveAttribute("aria-expanded", "true");
    expect(await page.locator("#warnings .warning").count()).toBeGreaterThan(before);
  }

  await expect(page.locator("#cashFlowTable .cash-summary-card")).toHaveCount(4);
  await expect(page.locator("#cashFlowTable .cash-summary-card").first()).toContainText("Minimum nakit");
  await expect(page.locator("#cashFlowTable .negative-cash").first()).toBeVisible();

  const breakdownGroups = page.locator("#breakdown details.breakdown-group");
  expect(await breakdownGroups.count()).toBeGreaterThan(1);
  await expect(breakdownGroups.first()).not.toHaveAttribute("open", "");
  await page.locator("#breakdown [data-breakdown-disclosure]").click();
  await expect(page.locator("#breakdown [data-breakdown-disclosure]")).toHaveAttribute("aria-expanded", "true");
  await expect(breakdownGroups.first()).toHaveAttribute("open", "");

  await expect(page.locator("#scenarioTable .expected-column").first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("Aşama 5 ortak sonuç sözleşmesi bağımsız HTML içinde de çalışır", async ({ page }) => {
  await page.goto("/standalone/cafe-restaurant-calculator.html");
  await expect(page.locator("#cashFlowTable .cash-summary-card")).toHaveCount(4);
  await expect(page.locator("#breakdown details.breakdown-group").first()).toBeVisible();
  await expect(page.locator("#warnings .warning-heading").first()).toBeVisible();
});
