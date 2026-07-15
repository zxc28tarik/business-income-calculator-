import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const root = new URL("../", import.meta.url);
const archive = new URL("../reference/source-archive/", import.meta.url);
const targetDir = new URL("../reference/", import.meta.url);
const target = new URL("../reference/01_oyun_yayincisi_master_model_v2.html", import.meta.url);

const partNames = Array.from({ length: 6 }, (_, index) =>
  `01_oyun_yayincisi_master_model_v2.html.gz.b64.part${String(index + 1).padStart(2, "0")}`,
);
const base64 = (await Promise.all(partNames.map((name) => readFile(new URL(name, archive), "utf8")))).join("");
const html = gunzipSync(Buffer.from(base64, "base64"));
await mkdir(targetDir, { recursive: true });
await writeFile(target, html);
console.log(`Master kaynak üretildi: ${target.pathname}`);
