import { test, expect } from "@playwright/test";

async function pageOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function assertCoreWorkspace(page) {
  await expect(page.locator("#projectSelect")).toBeVisible();
  await expect(page.locator("#pageTitle")).toBeVisible();
  await expect(page.locator("#decisionSummary")).toBeVisible();
  await expect(page.locator("#kpiGrid .kpi-card")).toHaveCount(4);
  await expect(page.locator("#cashFlowTable")).toBeVisible();
  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
}

test("%200 yakınlaştırma eşdeğerinde ana platform ve tek HTML taşma üretmez", async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto("/");
  await assertCoreWorkspace(page);
  await expect(page.locator("#sectorSelect")).toBeVisible();

  await page.goto("/standalone/cafe-restaurant-calculator.html");
  await assertCoreWorkspace(page);
  await expect(page.locator("#portfolioButton")).toBeVisible();
});

test("320 piksel dar görünümde ana kontroller kesilmez", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await assertCoreWorkspace(page);

  const primaryActions = page.locator(".primary-actions > button");
  await expect(primaryActions).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    const box = await primaryActions.nth(index).boundingBox();
    expect(box).toBeTruthy();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320.5);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }

  await page.locator("#portfolioButton").click();
  const panel = page.locator("#portfolioPanel");
  await expect(panel).toBeVisible();
  const panelBox = await panel.boundingBox();
  expect(Math.abs(panelBox.width - 320)).toBeLessThanOrEqual(1);
  expect(await pageOverflow(page)).toBeLessThanOrEqual(1);
});

test("azaltılmış hareket tercihi animasyonları etkisizleştirir", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const motion = await page.locator("#portfolioButton").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  expect(["0s", "0.00001s"]).toContain(motion.transitionDuration);
  expect(["0s", "0.00001s"]).toContain(motion.animationDuration);
  expect(motion.scrollBehavior).toBe("auto");
});
