import test from "node:test";
import assert from "node:assert/strict";
import { initializeScenarioInputs } from "../src/core/sector-schema.js";
import { SECTORS } from "../src/sectors/registry.js";
import {
  buildPortfolioBackup,
  createPortfolioState,
  parsePortfolioBackup,
} from "../src/portfolio/portfolio-model.js";

function createWorkspace() {
  const sector = SECTORS[0];
  return {
    activeSectorId: sector.id,
    sectors: {
      [sector.id]: {
        activeScenario: "expected",
        scenarioInputs: initializeScenarioInputs(sector),
      },
    },
  };
}

function normalizeWorkspace(value) {
  return value && typeof value === "object" ? value : createWorkspace();
}

const trackingPrefix = "business-income-calculator:tracking:v0.1";
const options = {
  createWorkspace,
  normalizeWorkspace,
  initialWorkspace: createWorkspace(),
  trackingPrefix,
  backupScope: "platform",
  now: "2026-07-22T12:00:00.000Z",
};

test("platform yedeği kendi kapsamı ve portföy takip anahtarlarıyla doğrulanır", () => {
  const portfolio = createPortfolioState(createWorkspace(), {
    id: "project-main",
    now: options.now,
  });
  const validKey = `${trackingPrefix}:project-main:cafe_restaurant:default`;
  const foreignKey = `${trackingPrefix}:project-other:cafe_restaurant:default`;
  const backup = buildPortfolioBackup({
    portfolio,
    scope: "platform",
    appVersion: "0.22.0",
    trackingEntries: {
      [validKey]: JSON.stringify([{ month: 1, collections: 10 }]),
      [foreignKey]: JSON.stringify([{ month: 1, collections: 20 }]),
    },
  });
  const parsed = parsePortfolioBackup(JSON.stringify(backup), options);
  assert.equal(parsed.scope, "platform");
  assert.ok(parsed.trackingEntries[validKey]);
  assert.equal(parsed.trackingEntries[foreignKey], undefined);
});

test("platform ve bağımsız sektör yedekleri birbirine aktarılamaz", () => {
  const portfolio = createPortfolioState(createWorkspace(), {
    id: "project-main",
    now: options.now,
  });
  const backup = buildPortfolioBackup({
    portfolio,
    scope: "standalone:cafe_restaurant",
    appVersion: "0.22.0",
  });
  assert.throws(
    () => parsePortfolioBackup(JSON.stringify(backup), options),
    /farklı bir hesaplayıcı kapsamına/,
  );
});
