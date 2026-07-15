import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const archive = new URL("../reference/source-archive/", import.meta.url);
const targetDir = new URL("../reference/", import.meta.url);
const target = new URL("../reference/01_oyun_yayincisi_master_model_v2.html", import.meta.url);
const partNames = [
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part01",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part02",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part03",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part04",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part05.0",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part05.1",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part05.2",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part05.3",
  "01_oyun_yayincisi_master_model_v2.html.gz.b64.part06",
];
const base64 = (await Promise.all(partNames.map((name) => readFile(new URL(name, archive), "utf8")))).join("");
const html = gunzipSync(Buffer.from(base64, "base64"));
await mkdir(targetDir, { recursive: true });
await writeFile(target, html);
console.log(`Master kaynak üretildi: ${target.pathname}`);
