import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const ARCHIVE = new URL("../reference/source-archive/", import.meta.url);
const EXPECTED_SHA256 = "2eaf4cfb1667494f37c59d2c701f6a9898806e7ab4fadecd5c94d4709cf46424";
const partNames = Array.from({ length: 6 }, (_, index) =>
  `01_oyun_yayincisi_master_model_v2.html.gz.b64.part${String(index + 1).padStart(2, "0")}`,
);

async function readMaster() {
  const base64 = (await Promise.all(partNames.map((name) => readFile(new URL(name, ARCHIVE), "utf8")))).join("");
  return gunzipSync(Buffer.from(base64, "base64"));
}

test("master oyun yayıncısı prototipi byte düzeyinde korunur", async () => {
  const bytes = await readMaster();
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, EXPECTED_SHA256);
});

test("master prototip ana hesap zinciri ve ekran işaretlerini içerir", async () => {
  const html = (await readMaster()).toString("utf8");
  for (const marker of [
    "/* ==CALC-BEGIN== */",
    "function calcPlatform(",
    "function calcPublisherReceipt(",
    "function calcRecoup(",
    "function calcDeveloperSettlement(",
    "function calcPublisherPnL(",
    "function calcTax(",
    "function calcCashFlow(",
    "function breakevenUnits(",
    "Kilit Ayrım — Kim Ne Alıyor?",
    "Senaryo Karşılaştırması",
    "Ayrıntılı Döküm",
  ]) {
    assert.ok(html.includes(marker), `Eksik işaret: ${marker}`);
  }
});
