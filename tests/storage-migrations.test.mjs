import test from "node:test";
import assert from "node:assert/strict";
import { migrateLegacyTrackingEntries } from "../src/migrations/storage-migrations.js";

class MemoryStorage {
  constructor(entries = {}) { this.data = new Map(Object.entries(entries)); }
  get length() { return this.data.size; }
  key(index) { return [...this.data.keys()][index] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
}

const prefix = "business-income-calculator:tracking:v0.1";

test("eski takip anahtarı aktif projeye bir kez taşınır", () => {
  const legacyKey = `${prefix}:cafe_restaurant:cafe`;
  const targetKey = `${prefix}:project-1:cafe_restaurant:cafe`;
  const storage = new MemoryStorage({ [legacyKey]: JSON.stringify([{ month: 1, collections: 100 }]) });
  const first = migrateLegacyTrackingEntries({
    storage,
    trackingPrefix: prefix,
    activeProjectId: "project-1",
    knownProjectIds: ["project-1"],
    scope: "platform",
  });
  assert.equal(first.migrated, 1);
  assert.equal(storage.getItem(targetKey), storage.getItem(legacyKey));
  const second = migrateLegacyTrackingEntries({
    storage,
    trackingPrefix: prefix,
    activeProjectId: "project-1",
    knownProjectIds: ["project-1"],
    scope: "platform",
  });
  assert.equal(second.alreadyApplied, true);
});

test("mevcut proje verisinin üzerine yazılmaz", () => {
  const legacyKey = `${prefix}:cafe_restaurant:cafe`;
  const targetKey = `${prefix}:project-1:cafe_restaurant:cafe`;
  const storage = new MemoryStorage({
    [legacyKey]: JSON.stringify([{ month: 1, collections: 100 }]),
    [targetKey]: JSON.stringify([{ month: 1, collections: 999 }]),
  });
  const report = migrateLegacyTrackingEntries({
    storage,
    trackingPrefix: prefix,
    activeProjectId: "project-1",
    knownProjectIds: ["project-1"],
    scope: "platform-existing",
  });
  assert.equal(report.skippedExisting, 1);
  assert.match(storage.getItem(targetKey), /999/);
});

test("bağımsız hesaplayıcı yabancı sektör ve bozuk veriyi taşımaz", () => {
  const storage = new MemoryStorage({
    [`${prefix}:cafe_restaurant:cafe`]: JSON.stringify([{ month: 1 }]),
    [`${prefix}:auto_services:auto`]: JSON.stringify([{ month: 1 }]),
    [`${prefix}:cafe_restaurant:broken`]: "not-json",
  });
  const report = migrateLegacyTrackingEntries({
    storage,
    trackingPrefix: prefix,
    activeProjectId: "project-cafe",
    knownProjectIds: ["project-cafe"],
    allowedSectorIds: ["cafe_restaurant"],
    scope: "standalone:cafe_restaurant",
  });
  assert.equal(report.migrated, 1);
  assert.equal(report.skippedForeign, 1);
  assert.equal(report.skippedInvalid, 1);
  assert.ok(storage.getItem(`${prefix}:project-cafe:cafe_restaurant:cafe`));
  assert.equal(storage.getItem(`${prefix}:project-cafe:auto_services:auto`), null);
});
