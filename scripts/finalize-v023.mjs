import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(ROOT, file), "utf8");
const write = (file, content) => writeFile(path.join(ROOT, file), content, "utf8");

function replaceRequired(content, from, to, file) {
  if (content.includes(to)) return content;
  if (!content.includes(from)) throw new Error(`${file} içinde v0.23 işareti bulunamadı: ${from.slice(0, 100)}`);
  return content.replace(from, to);
}

async function patchPortfolioController() {
  const file = "src/portfolio/portfolio-controller.js";
  let content = await read(file);
  content = replaceRequired(
    content,
    `import { escapeHtml, formatValue } from "../ui/formatters.js";\n`,
    `import { escapeHtml, formatValue } from "../ui/formatters.js";\nimport { migrateLegacyTrackingEntries } from "../migrations/storage-migrations.js";\n`,
    file,
  );
  content = replaceRequired(
    content,
    `  let visible = false;\n  let portfolio = loadPortfolio();\n`,
    `  let visible = false;\n  let portfolio = loadPortfolio();\n  const standaloneSectorId = String(backupScope).startsWith("standalone:")\n    ? String(backupScope).slice("standalone:".length)\n    : null;\n  migrateLegacyTrackingEntries({\n    storage: localStorage,\n    trackingPrefix,\n    activeProjectId: portfolio.activeProjectId,\n    knownProjectIds: portfolio.projects.map((project) => project.id),\n    allowedSectorIds: standaloneSectorId ? [standaloneSectorId] : null,\n    scope: backupScope || storageKey,\n  });\n`,
    file,
  );
  await write(file, content);
}

async function patchVersionMarkers() {
  for (const file of ["src/app.js", "src/standalone-runtime.js"]) {
    let content = await read(file);
    content = content.replaceAll(`appVersion: "0.22.0"`, `appVersion: "0.23.0"`);
    await write(file, content);
  }

  const smokeFile = "tests/app-smoke.test.mjs";
  let smoke = await read(smokeFile);
  smoke = smoke.replace(/v0\\\.22\\\.0/g, "v0\\.23\\.0");
  smoke = smoke.replace(/v0\.22\.0/g, "v0.23.0");
  await write(smokeFile, smoke);

  const standaloneTest = "tests/standalone-build.test.mjs";
  let standalone = await read(standaloneTest);
  standalone = replaceRequired(
    standalone,
    `      assert.match(html, /BUSINESS INCOME CALCULATOR · TEK DOSYA/);`,
    `      assert.match(html, /BUSINESS INCOME CALCULATOR · TEK DOSYA · v0\\.23\\.0/);\n      assert.match(html, /class="skip-link"/);\n      assert.match(html, /id="mainContent"/);`,
    standaloneTest,
  );
  await write(standaloneTest, standalone);
}

async function patchBrowserAuditFindings() {
  const file = "styles-advanced.css";
  let content = await read(file);
  const marker = "/* v0.23 gerçek tarayıcı denetimi düzeltmeleri */";
  if (!content.includes(marker)) {
    content += `\n\n${marker}\n.panel-card,.table-scroll,.input-table-scroll{min-width:0;max-width:100%}\n.sector-summary .eyebrow{color:#d7e6dc}\n.kpi-card.negative .label,.kpi-card.negative .note{color:#46524c}\n@media(max-width:680px){.portfolio-panel,.tracking-panel,.results-panel>section{min-width:0;max-width:100%}}\n`;
  }
  await write(file, content);
}

await patchPortfolioController();
await patchVersionMarkers();
await patchBrowserAuditFindings();
console.log("v0.23 release integration applied.");
