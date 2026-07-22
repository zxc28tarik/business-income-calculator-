import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(ROOT, file), "utf8");
const write = (file, content) => writeFile(path.join(ROOT, file), content, "utf8");

function replaceRequired(content, from, to, file) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) throw new Error(`${file} içinde backup scope geçiş işareti bulunamadı.`);
  return content.replace(from, to);
}

let app = await read("src/app.js");
app = replaceRequired(app,
  `  trackingPrefix: TRACKING_STORAGE_PREFIX,\n  appVersion: "0.22.0",`,
  `  trackingPrefix: TRACKING_STORAGE_PREFIX,\n  backupScope: "platform",\n  appVersion: "0.22.0",`,
  "src/app.js");
await write("src/app.js", app);

let standalone = await read("src/standalone-runtime.js");
standalone = replaceRequired(standalone,
  `    trackingPrefix: trackingStoragePrefix,\n    appVersion: "0.22.0",`,
  `    trackingPrefix: trackingStoragePrefix,\n    backupScope: \`standalone:${"${sector.id}"}\`,\n    appVersion: "0.22.0",`,
  "src/standalone-runtime.js");
await write("src/standalone-runtime.js", standalone);

console.log("v0.22 yedek kapsamı platform ve bağımsız sektörlerde ayrıldı.");
