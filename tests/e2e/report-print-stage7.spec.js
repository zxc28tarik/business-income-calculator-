import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function downloadReport(page) {
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#reportButton").click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  return readFile(path, "utf8");
}

function expectV024Report(html, sectorId = "cafe_restaurant") {
  expect(html).toMatch(/<!doctype html>/i);
  expect(html).toContain(`data-report-sector="${sectorId}"`);
  expect(html).toContain("FİNANSAL FİZİBİLİTE RAPORU");
  expect(html).toContain("Dört ana gösterge");
  expect(html).toContain("Dikkat edilmesi gerekenler");
  expect(html).toContain("Senaryo karşılaştırması");
  expect(html).toContain("Ek finansman ihtiyacı");
  expect(html).toContain("Varsayımlar ve girdiler");
  expect(html).toContain("Yazdır / PDF");
  expect(html).toContain("@page{size:A4");
  expect(html).not.toMatch(/<script[^>]+src=/i);
  expect(html).not.toMatch(/<link[^>]+rel=["']stylesheet/i);
}

test("ana platform ve bağımsız HTML aynı v0.24 rapor sözleşmesini indirir", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "Rapor indirme masaüstü projesinde bir kez doğrulanır.");

  await page.goto("/");
  const platformHtml = await downloadReport(page);
  expectV024Report(platformHtml);

  await page.goto("/standalone/cafe-restaurant-calculator.html");
  const standaloneHtml = await downloadReport(page);
  expectV024Report(standaloneHtml);
  expect(standaloneHtml).toContain("Kafe / Restoran");
});

test("ana sayfanın Yazdır / PDF eylemi baskı görünümünü kullanır", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.print = () => { document.body.dataset.printInvoked = "true"; };
  });

  await page.locator("#exportMenuButton").click();
  await page.locator("#printButton").click();
  await expect(page.locator("body")).toHaveAttribute("data-print-invoked", "true");

  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".workspace-context")).toBeHidden();
  await expect(page.locator(".input-panel")).toBeHidden();
  await expect(page.locator("#decisionSummary")).toBeVisible();
  await expect(page.locator("#kpiGrid")).toBeVisible();
  await expect(page.locator("#cashFlowTable")).toBeVisible();
  await expect(page.locator("#secondaryKpiToggle")).toBeHidden();
});
