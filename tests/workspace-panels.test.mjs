import test from "node:test";
import assert from "node:assert/strict";
import { buildPortfolioViewModel } from "../src/portfolio/portfolio-controller.js";
import { selectTrackingRows } from "../src/tracking/tracking-controller.js";

test("portföy görünümü aktif kaydı, durum sayılarını ve toplamları üretir", () => {
  const portfolio = {
    activeProjectId: "project-2",
    projects: [
      { id: "project-1", name: "Kafe", updatedAt: "2026-07-20T10:00:00Z", workspace: { key: "cafe" } },
      { id: "project-2", name: "SaaS", updatedAt: "2026-07-21T10:00:00Z", workspace: { key: "saas" } },
      { id: "project-3", name: "Oyun", updatedAt: "2026-07-22T10:00:00Z", workspace: { key: "game" } },
    ],
  };
  const summaries = {
    cafe: { sectorName: "Kafe", scenarioLabel: "Beklenen", netProfit: 100_000, endingCash: 800_000, status: "dengeli" },
    saas: { sectorName: "SaaS", scenarioLabel: "Beklenen", netProfit: -20_000, endingCash: 400_000, status: "dikkat" },
    game: { sectorName: "Oyun", scenarioLabel: "Kötümser", netProfit: -300_000, endingCash: -50_000, status: "riskli" },
  };

  const view = buildPortfolioViewModel(portfolio, (workspace) => summaries[workspace.key]);
  assert.equal(view.totalRecords, 3);
  assert.equal(view.activeRecord.name, "SaaS");
  assert.deepEqual(view.statusCounts, { dengeli: 1, dikkat: 1, riskli: 1 });
  assert.equal(view.totalNetProfit, -220_000);
  assert.equal(view.totalEndingCash, 1_150_000);
  assert.equal(view.records.filter((record) => record.active).length, 1);
});

test("gerçek takip varsayılan olarak ilk altı ayı, açıldığında bütün ayları gösterir", () => {
  const model = { rows: Array.from({ length: 12 }, (_, index) => ({ month: index + 1 })) };
  assert.deepEqual(selectTrackingRows(model).map((row) => row.month), [1, 2, 3, 4, 5, 6]);
  assert.equal(selectTrackingRows(model, true).length, 12);
  assert.equal(selectTrackingRows({ rows: [] }).length, 0);
});
