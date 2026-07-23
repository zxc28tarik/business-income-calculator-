import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { SECTORS } from "../src/sectors/registry.js";

const baseline = JSON.parse(await readFile(
  new URL("./fixtures/v0.23-default-finance-baseline.json", import.meta.url),
  "utf8",
));

function canonicalize(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return String(value);
    return Number(value.toPrecision(15));
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => !["warnings", "waterfall"].includes(key))
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function resultHash(result) {
  const canonical = JSON.stringify(canonicalize(result));
  return createHash("sha256").update(canonical).digest("hex");
}

function cashRows(result) {
  return result.cashFlow?.rows ?? result.cashFlow?.months ?? [];
}

function netResult(sectorId, result) {
  return sectorId === "game_digital_publishing"
    ? result.tax.pubNet
    : result.netProfit;
}

test("v0.24 arayüz çalışmaları sekiz sektörün v0.23 varsayılan finans sonucunu değiştirmez", () => {
  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.sourceVersion, "0.23.0");
  assert.equal(Object.keys(baseline.sectors).length, SECTORS.length);

  for (const sector of SECTORS) {
    const expected = baseline.sectors[sector.id];
    assert.ok(expected, `${sector.id} için finans tabanı bulunamadı`);

    const input = sector.normalizeInputs(structuredClone(sector.defaultInputs));
    const result = sector.calculateModel(input);
    const rows = cashRows(result);
    const endCash = rows.at(-1)?.cashEnd ?? null;
    const minimumCash = rows.length
      ? Math.min(...rows.map((row) => row.cashEnd))
      : null;

    assert.equal(sector.name, expected.name, `${sector.id} adı değişti`);
    assert.equal(sector.version, expected.sectorVersion, `${sector.id} motor sürümü değişti`);
    assert.equal(resultHash(result), expected.resultHash, `${sector.id} finans sonucu değişti`);
    assert.equal(Number(netResult(sector.id, result).toPrecision(15)), expected.netResult, `${sector.id} net sonucu değişti`);
    assert.equal(Number(endCash.toPrecision(15)), expected.cashEnd, `${sector.id} 12 ay sonu nakdi değişti`);
    assert.equal(Number(minimumCash.toPrecision(15)), expected.cashMinimum, `${sector.id} minimum nakdi değişti`);
  }
});
