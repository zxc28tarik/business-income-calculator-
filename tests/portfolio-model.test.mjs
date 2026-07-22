import test from "node:test";
import assert from "node:assert/strict";
import { initializeScenarioInputs } from "../src/core/sector-schema.js";
import { SECTORS } from "../src/sectors/registry.js";
import {
  addProject,
  buildPortfolioBackup,
  createPortfolioState,
  duplicateProject,
  getActiveProject,
  normalizePortfolioState,
  parsePortfolioBackup,
  removeProject,
  renameProject,
  selectProject,
  updateProjectWorkspace,
} from "../src/portfolio/portfolio-model.js";
import { buildProjectFinancialSummary } from "../src/portfolio/portfolio-summary.js";

function createMainWorkspace() {
  return {
    activeSectorId: SECTORS[0].id,
    sectors: Object.fromEntries(SECTORS.map((sector) => [sector.id, {
      activeScenario: "expected",
      scenarioInputs: initializeScenarioInputs(sector),
    }])),
  };
}

function normalizeWorkspace(raw) {
  const fresh = createMainWorkspace();
  if (!raw || typeof raw !== "object") return fresh;
  if (SECTORS.some((sector) => sector.id === raw.activeSectorId)) fresh.activeSectorId = raw.activeSectorId;
  for (const sector of SECTORS) {
    const saved = raw.sectors?.[sector.id];
    if (!saved) continue;
    fresh.sectors[sector.id].activeScenario = sector.scenarios[saved.activeScenario] ? saved.activeScenario : "expected";
    for (const scenarioId of Object.keys(sector.scenarios)) {
      const source = saved.scenarioInputs?.[scenarioId] ?? fresh.sectors[sector.id].scenarioInputs[scenarioId];
      fresh.sectors[sector.id].scenarioInputs[scenarioId] = sector.normalizeInputs(source);
    }
  }
  return fresh;
}

const options = {
  createWorkspace: createMainWorkspace,
  normalizeWorkspace,
  initialWorkspace: createMainWorkspace(),
  initialName: "İlk işletmem",
  trackingPrefix: "business-income-calculator:tracking:v0.1",
  now: "2026-07-22T12:00:00.000Z",
};

test("eski tek çalışma alanı ilk portföy kaydına taşınır", () => {
  const workspace = createMainWorkspace();
  workspace.activeSectorId = "saas_subscription";
  const portfolio = normalizePortfolioState(null, { ...options, initialWorkspace: workspace });
  assert.equal(portfolio.projects.length, 1);
  assert.equal(getActiveProject(portfolio).workspace.activeSectorId, "saas_subscription");
  assert.equal(getActiveProject(portfolio).name, "İlk işletmem");
});

test("kayıt oluşturma, seçme, adlandırma ve çalışma alanı güncelleme çalışır", () => {
  let portfolio = createPortfolioState(createMainWorkspace(), { id: "one", name: "Birinci", now: options.now });
  portfolio = addProject(portfolio, createMainWorkspace(), { id: "two", name: "İkinci", now: options.now });
  assert.equal(portfolio.activeProjectId, "two");
  portfolio = renameProject(portfolio, "two", "  İkinci   İşletme  ", options.now);
  assert.equal(getActiveProject(portfolio).name, "İkinci İşletme");
  portfolio = selectProject(portfolio, "one");
  const workspace = createMainWorkspace();
  workspace.activeSectorId = "physical_retail";
  portfolio = updateProjectWorkspace(portfolio, "one", workspace, options.now);
  assert.equal(getActiveProject(portfolio).workspace.activeSectorId, "physical_retail");
});

test("kopyalama bağımsız çalışma alanı üretir ve son kayıt silinebilir", () => {
  let portfolio = createPortfolioState(createMainWorkspace(), { id: "one", name: "Kaynak", now: options.now });
  portfolio = duplicateProject(portfolio, "one", { id: "copy", now: options.now });
  assert.equal(portfolio.projects.length, 2);
  assert.equal(getActiveProject(portfolio).name, "Kaynak kopyası");
  getActiveProject(portfolio).workspace.activeSectorId = "auto_services";
  assert.notEqual(portfolio.projects[0].workspace.activeSectorId, "auto_services");
  portfolio = removeProject(portfolio, "one");
  assert.equal(portfolio.projects.length, 1);
  assert.throws(() => removeProject(portfolio, "copy"), /En az bir/);
});

test("portföy kayıt sınırı uygulanır", () => {
  let portfolio = createPortfolioState(createMainWorkspace(), { id: "project-0", now: options.now });
  for (let index = 1; index < 50; index += 1) {
    portfolio = addProject(portfolio, createMainWorkspace(), { id: `project-${index}`, now: options.now });
  }
  assert.equal(portfolio.projects.length, 50);
  assert.throws(() => addProject(portfolio, createMainWorkspace()), /En fazla 50/);
});

test("tam yedek portföy ve yalnız güvenli takip anahtarlarını taşır", () => {
  const portfolio = createPortfolioState(createMainWorkspace(), { id: "one", now: options.now });
  const validKey = `${options.trackingPrefix}:one:cafe_restaurant:cafe`;
  const backup = buildPortfolioBackup({
    portfolio,
    appVersion: "0.22.0",
    generatedAt: options.now,
    trackingEntries: {
      [validKey]: JSON.stringify([{ month: 1, collections: 100 }]),
      "unrelated:key": JSON.stringify([1]),
    },
  });
  const parsed = parsePortfolioBackup(JSON.stringify(backup), options);
  assert.equal(parsed.portfolio.projects.length, 1);
  assert.equal(parsed.trackingEntries[validKey], JSON.stringify([{ month: 1, collections: 100 }]));
  assert.equal(parsed.trackingEntries["unrelated:key"], undefined);
});

test("bozuk veya desteklenmeyen yedek reddedilir", () => {
  assert.throws(() => parsePortfolioBackup("not-json", options), /geçerli JSON/);
  assert.throws(() => parsePortfolioBackup(JSON.stringify({ schema: "other", version: 1 }), options), /desteklenen biçim/);
  assert.throws(() => parsePortfolioBackup("x".repeat(5_000_001), options), /boyuttan büyük/);
});

test("içe aktarmada yinelenen kimlikler güvenli biçimde ayrıştırılır", () => {
  const workspace = createMainWorkspace();
  const raw = {
    schema: "business-income-calculator-portfolio-v1",
    activeProjectId: "same",
    projects: [
      { id: "same", name: "A", workspace },
      { id: "same", name: "B", workspace },
    ],
  };
  const portfolio = normalizePortfolioState(raw, options);
  assert.equal(portfolio.projects.length, 2);
  assert.notEqual(portfolio.projects[0].id, portfolio.projects[1].id);
});

test("sekiz sektör portföy karşılaştırmasında sonlu finans özeti üretir", () => {
  for (const sector of SECTORS) {
    const scenarioInputs = initializeScenarioInputs(sector);
    const summary = buildProjectFinancialSummary({
      sector,
      scenarioId: "expected",
      inputs: scenarioInputs.expected,
    });
    assert.equal(summary.sectorId, sector.id);
    assert.ok(Number.isFinite(summary.grossRevenue), sector.id);
    assert.ok(Number.isFinite(summary.netProfit), sector.id);
    assert.ok(Number.isFinite(summary.endingCash), sector.id);
    assert.ok(["dengeli", "dikkat", "riskli"].includes(summary.status), sector.id);
  }
});
