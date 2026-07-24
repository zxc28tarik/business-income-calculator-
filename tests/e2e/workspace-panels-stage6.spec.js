import { test, expect } from "@playwright/test";

function watchRuntimeErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("portföy odaklı panel aktif kaydı gösterir ve satırdan kayıt değiştirir", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/");
  const initialId = await page.locator("#projectSelect").inputValue();

  page.once("dialog", (dialog) => dialog.accept("İkinci İşletme"));
  await page.locator("#projectNewButton").click();
  const secondId = await page.locator("#projectSelect").inputValue();
  expect(secondId).not.toBe(initialId);

  await page.locator("#portfolioButton").click();
  const panel = page.locator("#portfolioPanel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(panel).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("body")).toHaveClass(/workspace-dialog-open/);
  await expect(page.locator("#portfolioSummary .portfolio-summary-card")).toHaveCount(4);
  await expect(page.locator('#portfolioTable tr[aria-current="true"]')).toContainText("İkinci İşletme");
  await expect(page.locator("#portfolioCloseButton")).toBeFocused();

  if (testInfo.project.name.includes("mobile")) {
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - viewport.height)).toBeLessThanOrEqual(1);
  }

  await page.locator(`[data-portfolio-open="${initialId}"]`).click();
  await expect(panel).toBeHidden();
  await expect(page.locator("#projectSelect")).toHaveValue(initialId);
  await expect(page.locator("body")).not.toHaveClass(/workspace-dialog-open/);
  expect(errors).toEqual([]);
});

test("gerçek takip ayrı çalışma panelinde altı ve on iki aylık görünümü yönetir", async ({ page }, testInfo) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/");
  await page.locator("#trackingButton").click();

  const panel = page.locator("#trackingPanel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("role", "dialog");
  await expect(page.locator("#trackingContext .tracking-context-item")).toHaveCount(3);
  await expect(page.locator("#trackingSummary .tracking-summary-primary")).toBeVisible();
  await expect(page.locator("#trackingTable tbody tr")).toHaveCount(6);
  await expect(page.locator("#trackingMonthsToggle")).toHaveAttribute("aria-expanded", "false");

  await page.locator("#trackingMonthsToggle").click();
  await expect(page.locator("#trackingMonthsToggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#trackingTable tbody tr")).toHaveCount(12);

  if (testInfo.project.name.includes("mobile")) {
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - viewport.height)).toBeLessThanOrEqual(1);
  }

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(page.locator("#trackingButton")).toBeFocused();
  expect(errors).toEqual([]);
});

test("odaklı portföy ve takip panelleri bağımsız HTML içinde de bulunur", async ({ page }) => {
  const errors = watchRuntimeErrors(page);
  await page.goto("/standalone/cafe-restaurant-calculator.html");

  await page.locator("#portfolioButton").click();
  await expect(page.locator("#portfolioPanel")).toBeVisible();
  await expect(page.locator("#portfolioSummary .portfolio-summary-card")).toHaveCount(4);
  await page.locator("#portfolioCloseButton").click();

  await page.locator("#trackingButton").click();
  await expect(page.locator("#trackingContext .tracking-context-item")).toHaveCount(3);
  await expect(page.locator("#trackingTable tbody tr")).toHaveCount(6);
  expect(errors).toEqual([]);
});
